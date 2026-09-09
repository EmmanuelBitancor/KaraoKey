"use client";

import { forwardRef, useState, useEffect } from "react";

interface SingzoneVideoPlayerProps {
  videoProgress: number;
  videoDuration: number;
  formatTime: (seconds: number) => string;
  isPlaying?: boolean;
  onPlay?: () => void;
  error?: string | null;
}

const SingzoneVideoPlayer = forwardRef<HTMLDivElement, SingzoneVideoPlayerProps>(
  ({ videoProgress, videoDuration, formatTime, isPlaying, onPlay, error }, ref) => {
    const progressPercent = videoDuration > 0 ? (videoProgress / videoDuration) * 100 : 0;
    const [showPlayOverlay, setShowPlayOverlay] = useState(false);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
      if (isMobile && !isPlaying) {
        setShowPlayOverlay(true);
      } else {
        setShowPlayOverlay(false);
      }
    }, [isPlaying]);

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-4">
        <div className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl relative">
          <div ref={ref} className="w-full h-full" />
          {showPlayOverlay && !error && (
            <button
              onClick={onPlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40"
              aria-label="Play video"
            >
              <span className="text-white text-4xl">▶</span>
            </button>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center px-4">
                <p className="text-red-400 font-semibold text-sm md:text-base">Playback Unavailable</p>
                <p className="text-white/70 text-xs md:text-sm mt-2 max-w-md">{error}</p>
              </div>
            </div>
          )}
        </div>
        {/* Progress Bar */}
        <div className="w-full max-w-5xl mt-2">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF6B00] transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/50 mt-1">
            <span>{formatTime(videoProgress)}</span>
            <span>{formatTime(videoDuration)}</span>
          </div>
        </div>
      </div>
    );
  }
);

SingzoneVideoPlayer.displayName = "SingzoneVideoPlayer";

export default SingzoneVideoPlayer;
