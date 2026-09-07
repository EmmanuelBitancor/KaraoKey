"use client";

import type { Song } from "@/lib/database.types";

interface VideoPreviewModalProps {
  song: Song | null;
  onClose: () => void;
}

export default function VideoPreviewModal({ song, onClose }: VideoPreviewModalProps) {
  if (!song) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-lg border border-white/10 w-full max-w-2xl mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Video Preview</h2>
            <p className="text-white/50 text-sm">{song.title} - {song.artist}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            key={song.youtube_id}
            src={`https://www.youtube.com/embed/${song.youtube_id}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="text-white/40 text-xs mt-2 text-center">
          YouTube ID: {song.youtube_id}
        </p>
      </div>
    </div>
  );
}
