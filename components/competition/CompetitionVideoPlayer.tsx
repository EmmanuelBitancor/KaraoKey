"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface CompetitionVideoPlayerProps {
  videoId: string;
  score: number | null;
  onScore?: (score: number) => void;
}

function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);

  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    rms += buf[i] * buf[i];
  }
  rms = Math.sqrt(rms / SIZE);

  if (rms < 0.01) return -1;

  let bestOffset = -1;
  let bestCorrelation = 0;
  let lastCorrelation = 1;

  for (let offset = 0; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;
    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(buf[i] - buf[i + offset]);
    }
    correlation = 1 - correlation / MAX_SAMPLES;

    if (correlation > 0.9 && correlation > lastCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
    lastCorrelation = correlation;
  }

  if (bestCorrelation > 0.01 && bestOffset > 0) {
    return sampleRate / bestOffset;
  }
  return -1;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function CompetitionVideoPlayer({
  videoId,
  score,
  onScore,
}: CompetitionVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [apiReady, setApiReady] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const onScoreRef = useRef(onScore);
  onScoreRef.current = onScore;

  const scoredRef = useRef(false);
  const pitchDataRef = useRef<number[]>([]);
  const isRecordingRef = useRef(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const stopMicrophone = useCallback(() => {
    isRecordingRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (microphoneRef.current) {
      try {
        microphoneRef.current.disconnect();
      } catch {
        // ignore
      }
      microphoneRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
  }, []);

  const calculateScore = useCallback(() => {
    const pitches = pitchDataRef.current.filter((p) => p > 0);

    if (pitches.length === 0) {
      onScoreRef.current?.(50);
      return;
    }

    const totalSamples = pitchDataRef.current.length;
    const activityRatio = pitches.length / Math.max(1, totalSamples);
    const activityScore = Math.min(100, activityRatio * 300);

    const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
    const variance =
      pitches.reduce((a, b) => a + Math.pow(b - avgPitch, 2), 0) /
      pitches.length;
    const stabilityScore = Math.max(0, 100 - Math.sqrt(variance) / 5);

    const uniquePitches = new Set(
      pitches.map((p) => Math.round(p / 10) * 10)
    ).size;
    const varietyScore = Math.min(100, uniquePitches * 5);

    const finalScore = Math.round(
      activityScore * 0.4 + stabilityScore * 0.3 + varietyScore * 0.3
    );

    onScoreRef.current?.(Math.min(100, Math.max(50, finalScore)));
  }, []);

  const startMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphoneRef.current = microphone;
      microphone.connect(analyser);

      isRecordingRef.current = true;
      pitchDataRef.current = [];

      const buffer = new Float32Array(analyser.fftSize);

      const analyze = () => {
        if (!isRecordingRef.current) return;

        analyser.getFloatTimeDomainData(buffer);
        const pitch = autoCorrelate(buffer, audioContext.sampleRate);

        if (pitch > 80 && pitch < 1200) {
          pitchDataRef.current.push(pitch);
        }

        animationFrameRef.current = requestAnimationFrame(analyze);
      };

      analyze();
      setMicError(null);
    } catch (err) {
      console.error("Microphone access error:", err);
      setMicError("Microphone access denied or unavailable");
    }
  }, [calculateScore]);

  useEffect(() => {
    scoredRef.current = false;
    pitchDataRef.current = [];
    stopMicrophone();
  }, [videoId, stopMicrophone]);

  useEffect(() => {
    const initApi = () => {
      if (window.YT && window.YT.Player) {
        setApiReady(true);
        return;
      }

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => setApiReady(true);
    };

    initApi();

    return () => {
      window.onYouTubeIframeAPIReady = () => {};
      stopMicrophone();
    };
  }, [stopMicrophone]);

  useEffect(() => {
    if (!apiReady || !containerRef.current) return;

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        // ignore destroy errors
      }
      playerRef.current = null;
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: "100%",
      width: "100%",
      videoId,
      playerVars: {
        autoplay: 1,
        mute: 0,
        controls: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          try {
            event.target.playVideo();
          } catch {
            // ignore play errors
          }
          startMicrophone();
        },
        onStateChange: (event: any) => {
          if (event.data === 0 && onScoreRef.current && !scoredRef.current) {
            stopMicrophone();
            if (pitchDataRef.current.length === 0 && !micError) {
              setTimeout(() => {
                if (!scoredRef.current) {
                  scoredRef.current = true;
                  onScoreRef.current?.(65);
                }
              }, 1000);
            } else {
              calculateScore();
            }
          }
        },
      },
    });

    return () => {
      stopMicrophone();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore destroy errors
        }
        playerRef.current = null;
      }
    };
  }, [
    apiReady,
    videoId,
    startMicrophone,
    stopMicrophone,
    calculateScore,
    micError,
  ]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {micError && (
        <div className="mt-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-center">
          <p className="text-sm text-yellow-200">{micError}</p>
          <p className="text-xs text-white/50 mt-1">
            Using simulated scoring as fallback.
          </p>
        </div>
      )}

      {score !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
          <div className="text-center">
            <p className="text-white/80 text-lg mb-2">Your Score</p>
            <p className="text-7xl font-bold text-[#FF6B00]">{score}</p>
          </div>
        </div>
      )}
    </div>
  );
}
