"use client";

interface QueuePreviewBannerProps {
  queue: {
    code: string;
    title: string;
    artist: string;
    youtubeId: string;
  }[];
  onPlayNext: () => void;
  onOpenPanel: () => void;
}

export default function QueuePreviewBanner({
  queue,
  onPlayNext,
  onOpenPanel,
}: QueuePreviewBannerProps) {
  if (queue.length === 0) return null;

  const next = queue[0];

  return (
    <div
      onClick={onPlayNext}
      className="bg-[#1a1a1a] px-4 py-3 border-b border-white/10 cursor-pointer hover:bg-[#1a1a1a]/80 transition tv-card"
      tabIndex={0}
      role="button"
      aria-label={`Play next song: ${next.title}`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="bg-[#FF6B00] text-white text-xs font-bold px-2 py-1 rounded">
            UP NEXT
          </span>
          <span className="text-[#FF6B00] font-bold text-sm">{next.code}</span>
          <span className="text-white text-sm truncate">{next.title}</span>
          <span className="text-white/50 text-sm truncate">- {next.artist}</span>
          {queue.length > 1 && (
            <span className="text-white/50 text-xs">+{queue.length - 1} more</span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenPanel();
          }}
          className="text-white/50 hover:text-white text-sm tv-card"
          tabIndex={0}
          role="button"
          aria-label="View full queue"
        >
          View All
        </button>
      </div>
    </div>
  );
}
