"use client";

import Link from "next/link";

interface SingzoneHeaderProps {
  songbookHref?: string;
}

export default function SingzoneHeader({ songbookHref = "/songbook" }: SingzoneHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-[#0D0D0D] border-b border-white/10 px-3 py-2 md:px-4 md:py-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <Link
            href={songbookHref}
            className="flex items-center gap-1 md:gap-2 text-white/70 hover:text-white transition tv-back-btn"
            tabIndex={0}
            role="button"
          >
            <span className="text-lg md:text-xl">←</span>
            <span className="text-xs md:text-sm">Back to Songbook</span>
          </Link>
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold text-white"
            style={{ fontFamily: "'Ayaha', sans-serif" }}
          >
            Karao<span className="text-[#FF6B00]">KEY</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
