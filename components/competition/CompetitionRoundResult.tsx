"use client";

import Link from "next/link";

interface PlayerScore {
  name: string;
  song: string;
  score: number | null;
  round: number | null;
}

interface CompetitionRoundResultProps {
  scores: PlayerScore[];
  onRestart: () => void;
  onHome: () => void;
}

export default function CompetitionRoundResult({
  scores,
  onRestart,
  onHome,
}: CompetitionRoundResultProps) {
  const sorted = [...scores]
    .filter((s) => s.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const winner = sorted[0];
  const totalScore = sorted.reduce((sum, s) => sum + (s.score ?? 0), 0);

  return (
    <div className="text-center">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-6xl">🏆</div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Competition <span className="text-[#FF6B00]">Complete!</span>
        </h1>

        {winner && (
          <p className="mt-3 text-lg text-white/70">
            Winner:{" "}
            <span className="font-bold text-[#FF6B00]">{winner.name}</span>{" "}
            with a score of{" "}
            <span className="font-bold text-[#FF6B00]">{winner.score}</span>
          </p>
        )}

        <p className="mt-1 text-sm text-white/40">
          Total combined score: {totalScore}
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 text-left">
          <h2 className="text-lg font-bold text-white mb-4">Final Standings</h2>
          <div className="space-y-2">
            {sorted.map((entry, rank) => (
              <div
                key={entry.name}
                className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5"
              >
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    rank === 0
                      ? "bg-[#FF6B00] text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {rank + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {entry.name}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    {entry.song}
                  </p>
                </div>
                <span className="text-lg font-bold text-[#FF6B00]">
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onRestart}
            className="w-full sm:w-auto rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#e55f00]"
          >
            Play Again
          </button>
          <Link
            href="/explore"
            className="w-full sm:w-auto rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    </div>
  );
}