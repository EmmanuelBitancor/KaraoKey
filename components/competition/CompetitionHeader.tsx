"use client";

import Link from "next/link";

interface CompetitionHeaderProps {
  playerCount: number;
  onBack: () => void;
}

export default function CompetitionHeader({
  playerCount,
  onBack,
}: CompetitionHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-[#0D0D0D] border-b border-white/10 px-4 py-4">
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition"
        >
          <span className="text-xl">←</span>
          <span className="text-sm">Back</span>
        </button>
        <Link
          href="/"
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "'Ayaha', sans-serif" }}
        >
          Karao<span className="text-[#FF6B00]">KEY</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50">Players:</span>
          <span className="text-sm font-bold text-[#FF6B00]">{playerCount}</span>
        </div>
      </div>
    </div>
  );
}