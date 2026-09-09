"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface CompetitionMicPanelProps {
  youtubeId: string;
  onScore: (score: number) => void;
  isScoring: boolean;
  onScoringChange: (value: boolean) => void;
}

// Simulated vocal-quality scoring: 50-100 range.
// In production this would wire into a Web Speech API /
// pitch-tracking library. Here we generate a deterministic
// pseudo-random score so the UI is fully interactive.
function generateScore(): number {
  const base = 55;
  const variance = Math.floor(Math.random() * 41); // 0-40
  return Math.min(100, base + variance);
}

export default function CompetitionMicPanel({
  youtubeId,
  onScore,
  isScoring,
  onScoringChange,
}: CompetitionMicPanelProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startScoring = useCallback(() => {
    onScoringChange(true);
    setCountdown(3);
    let tick = 3;
    intervalRef.current = setInterval(() => {
      tick -= 1;
      if (tick <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCountdown(null);
        const score = generateScore();
        onScore(score);
      } else {
        setCountdown(tick);
      }
    }, 1000);
  }, [onScore, onScoringChange]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#FF6B00]/15">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-10 h-10 text-[#FF6B00] ${isScoring ? "animate-pulse" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a9 9 0 0 1-5.79-15.98 9 9 0 0 1 11.58 0A9 9 0 0 1 12 18.75Zm0-3.75a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-white">Mic Scoring</h3>
        <p className="text-sm text-white/50 mt-1">
          Sing along to the track, then tap the button to capture your
          performance score.
        </p>

        {countdown !== null && (
          <div className="mt-4 text-5xl font-bold text-[#FF6B00] animate-pulse">
            {countdown}
          </div>
        )}

        <button
          onClick={startScoring}
          disabled={isScoring}
          className="mt-5 w-full max-w-xs rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#e55f00] disabled:opacity-50 disabled:cursor-not-allowed tv-card"
          tabIndex={0}
          role="button"
        >
          {isScoring ? "Scoring..." : "Score My Singing"}
        </button>

        <p className="mt-3 text-xs text-white/40">
          Scores range from 50–100 based on vocal quality.
        </p>
      </div>
    </div>
  );
}