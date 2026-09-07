"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface SongbookHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function SongbookHeader({ search, onSearchChange }: SongbookHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-50 bg-[#0D0D0D] border-b border-white/10 px-4 py-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push("/")}
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
        </div>
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search song or artist..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[#FF6B00]"
        />
      </div>
    </div>
  );
}
