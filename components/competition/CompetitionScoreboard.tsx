"use client";

interface PlayerScore {
  name: string;
  song: string;
  score: number | null;
  round: number | null;
}

interface CompetitionScoreboardProps {
  scores: PlayerScore[];
  highlightIndex: number | null;
}

export default function CompetitionScoreboard({
  scores,
  highlightIndex,
}: CompetitionScoreboardProps) {
  const sorted = [...scores]
    .map((s, i) => ({ ...s, originalIndex: i }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5">
      <h3 className="text-lg font-bold text-white mb-4">Leaderboard</h3>

      <div className="space-y-2">
        {sorted.map((entry, rank) => {
          const isHighlighted =
            highlightIndex !== null && entry.originalIndex === highlightIndex;
          return (
<div
                key={entry.name + entry.round}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition tv-row ${
                  isHighlighted
                    ? "bg-[#FF6B00]/20 border border-[#FF6B00]/40"
                    : entry.score !== null
                    ? "bg-white/5"
                    : "bg-white/[0.02]"
                }`}
                tabIndex={0}
                role="row"
              >
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  rank === 0
                    ? "bg-[#FF6B00] text-white"
                    : rank === 1
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {rank + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold truncate ${
                    isHighlighted ? "text-[#FF6B00]" : "text-white"
                  }`}
                >
                  {entry.name}
                </p>
                <p className="text-xs text-white/40 truncate">{entry.song}</p>
              </div>

              <div className="flex-shrink-0 text-right">
                {entry.score !== null ? (
                  <span className="text-lg font-bold text-[#FF6B00]">
                    {entry.score}
                  </span>
                ) : (
                  <span className="text-xs text-white/30">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {scores.every((s) => s.score === null) && (
        <p className="text-xs text-white/40 text-center py-4">
          Scores will appear here as each player sings.
        </p>
      )}
    </div>
  );
}