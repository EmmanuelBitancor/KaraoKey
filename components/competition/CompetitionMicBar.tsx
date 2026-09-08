"use client";

import { useEffect, useRef, useState } from "react";

export default function CompetitionMicBar() {
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<"idle" | "active" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    let mounted = true;

    const startMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        const buffer = new Float32Array(analyser.fftSize);

        const update = () => {
          if (!mounted) return;

          analyser.getFloatTimeDomainData(buffer);

          let sum = 0;
          for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
          }
          const rms = Math.sqrt(sum / buffer.length);
          const normalized = Math.min(1, rms * 5);

          setLevel(normalized);
          setStatus("active");

          animationFrameRef.current = requestAnimationFrame(update);
        };

        update();
        setError(null);
      } catch (err) {
        console.error("Microphone access error:", err);
        if (mounted) {
          setStatus("error");
          setError("Microphone access denied or unavailable");
        }
      }
    };

    startMic();

    return () => {
      mounted = false;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      analyserRef.current = null;
    };
  }, []);

  const barHeight = `${Math.max(8, level * 100)}%`;
  const isDetected = status === "active" && level > 0.02;

  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl border border-white/10 bg-[#1a1a1a] p-3 flex flex-col items-center justify-between">
        <div className="flex flex-col items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className={`h-5 w-5 ${isDetected ? "text-[#FF6B00]" : "text-white/40"}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a9 9 0 0 1-5.79-15.98 9 9 0 0 1 11.58 0A9 9 0 0 1 12 18.75Zm0-3.75a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Z"
            />
          </svg>
          <span className="text-[10px] font-medium text-white/60">MIC</span>
        </div>

    <div className="flex-1 w-full flex items-center justify-center">
      <div className="relative h-full w-3 rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full bg-[#FF6B00] transition-all duration-75"
          style={{ height: barHeight }}
        />
      </div>
    </div>

        <div className="flex flex-col items-center gap-1">
          <span
            className={`text-[10px] font-medium ${
              status === "error"
                ? "text-red-400"
                : isDetected
                ? "text-green-400"
                : "text-white/40"
            }`}
          >
            {status === "error"
              ? "Off"
              : isDetected
              ? "On"
              : "..."}
          </span>
        </div>

        {error && (
          <div className="mt-2 w-full">
            <p className="text-[10px] text-red-300 text-center">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
