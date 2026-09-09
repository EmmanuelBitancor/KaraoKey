"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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

export default function SingzoneScoring({ isPlaying, onScore }: { isPlaying: boolean; onScore: (score: number) => void }) {
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [micAllowed, setMicAllowed] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const scoredRef = useRef(false);
  const pitchDataRef = useRef<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scoreTimerRef = useRef<number | null>(null);

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
      onScore(50);
      setScore(50);
      return;
    }

    const totalSamples = pitchDataRef.current.length;
    const activityRatio = pitches.length / Math.max(1, totalSamples);
    const activityScore = Math.min(100, activityRatio * 300);

    const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
    const variance =
      pitches.reduce((sum, p) => sum + (p - avgPitch) ** 2, 0) / Math.max(1, pitches.length);
    const stabilityScore = Math.max(0, 100 - Math.sqrt(variance) / 5);

    const finalScore = Math.round((activityScore + stabilityScore) / 2);
    const result = Math.max(0, Math.min(100, finalScore));
    onScore(result);
    setScore(result);
  }, [onScore]);

  const scheduleScore = useCallback(() => {
    if (scoreTimerRef.current) return;
    scoreTimerRef.current = window.setTimeout(() => {
      scoreTimerRef.current = null;
      calculateScore();
    }, 0);
  }, [calculateScore]);

  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) return;
    if (scoredRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setMicAllowed(true);
      setError(null);

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphoneRef.current = microphone;
      microphone.connect(analyser);

      isRecordingRef.current = true;
      setIsRecording(true);

      const buffer = new Float32Array(analyser.fftSize);
      const processFrame = () => {
        if (!isRecordingRef.current) return;
        analyser.getFloatTimeDomainData(buffer);
        const pitch = autoCorrelate(buffer, audioContext.sampleRate);
        pitchDataRef.current.push(pitch);
        animationFrameRef.current = requestAnimationFrame(processFrame);
      };

      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch {
      setError("Microphone access is required for scoring.");
      setMicAllowed(false);
      setIsRecording(false);
      stopMicrophone();
    }
  }, [stopMicrophone]);

  useEffect(() => {
    if (!isPlaying) {
      if (isRecordingRef.current) {
        stopMicrophone();
        setIsRecording(false);
        if (!scoredRef.current) {
          scoredRef.current = true;
          scheduleScore();
        }
      }
      return;
    }

    if (scoredRef.current) {
      scoredRef.current = false;
      pitchDataRef.current = [];
      window.setTimeout(() => setScore(null), 0);
    }

    let cancelled = false;
    async function maybeStart() {
      if (cancelled) return;
      await startRecording();
    }

    maybeStart();

    return () => {
      cancelled = true;
      stopMicrophone();
      setIsRecording(false);
    };
  }, [isPlaying, stopMicrophone, startRecording, scheduleScore]);

  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, [stopMicrophone]);

  if (!isPlaying && score === null && !error && !isRecording) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {micAllowed === false && (
        <p className="text-white/50 text-xs text-center">
          Microphone access is blocked. Enable it to score your singing.
        </p>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {score !== null && (
        <div className="text-center">
          <p className="text-white/50 text-xs">Score</p>
          <p className="text-4xl font-bold text-[#FF6B00]">{score}</p>
        </div>
      )}
    </div>
  );
}
