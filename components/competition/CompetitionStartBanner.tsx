"use client";

interface CompetitionStartBannerProps {
  canStart: boolean;
  playerCount: number;
  onStart: () => void;
}

export default function CompetitionStartBanner({
  canStart,
  playerCount,
  onStart,
}: CompetitionStartBannerProps) {
  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-[#1a1a1a] p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">
            Ready to start the competition?
          </h3>
          <p className="text-sm text-white/50">
            {canStart
              ? `${playerCount} players with songs assigned.`
              : `Need at least 2 players, each with a name and a song.`}
          </p>
        </div>
        <button
          onClick={onStart}
          disabled={!canStart}
          className="flex items-center gap-2 rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#e55f00] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#FF6B00]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.252 12.273a.5.5 0 0 1 .748-.426l11.99 6.99a.5.5 0 0 1 0 .852l-11.99 6.99a.5.5 0 0 1-.748-.426L3.789 12.273a.5.5 0 0 1 .463-.8Z" />
          </svg>
          Enter SingZone
        </button>
      </div>
    </div>
  );
}