"use client";

import { useState, useCallback } from "react";
import type { Song } from "@/lib/database.types";

interface SongModalProps {
  isOpen: boolean;
  isEditing: boolean;
  code: string;
  title: string;
  artist: string;
  youtubeId: string;
  submitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  onCodeChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onArtistChange: (value: string) => void;
  onYoutubeIdChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function SongModal({
  isOpen,
  isEditing,
  code,
  title,
  artist,
  youtubeId,
  submitting,
  submitError,
  submitSuccess,
  onCodeChange,
  onTitleChange,
  onArtistChange,
  onYoutubeIdChange,
  onSubmit,
  onClose,
}: SongModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-lg border border-white/10 w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{isEditing ? "Edit Song" : "Add New Song"}</h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition tv-card"
            tabIndex={0}
            role="button"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">
              Song Code
            </label>
            <input
              type="text"
              placeholder="0001"
              value={code}
              readOnly
              className="w-full rounded-lg bg-white/5 px-4 py-2 text-[#FF6B00] font-bold cursor-not-allowed outline-none"
              maxLength={4}
            />
            {isEditing ? null : (
              <p className="text-white/40 text-xs mt-1">Auto-generated</p>
            )}
          </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">
                Title *
              </label>
              <input
                  type="text"
                  placeholder="Song title"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="w-full rounded-lg bg-white/10 pl-4 pr-10 py-2 text-white placeholder-white/50"
                  tabIndex={0}
                />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">
                Artist *
              </label>
              <div className="relative">
              <input
                  type="text"
                  placeholder="Artist name"
                  value={artist}
                  onChange={(e) => onArtistChange(e.target.value)}
                  className="w-full rounded-lg bg-white/10 pl-4 pr-10 py-2 text-white placeholder-white/50"
                  tabIndex={0}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">
                YouTube ID
              </label>
              <input
                type="text"
                placeholder="UkX9XP4urcM"
                value={youtubeId}
                onChange={(e) => onYoutubeIdChange(e.target.value)}
                className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/50"
                tabIndex={0}
              />
              <p className="text-white/40 text-xs mt-1">
                Video ID from YouTube URL
              </p>
            </div>

            {submitError && (
              <p className="text-red-400 text-sm">{submitError}</p>
            )}

            {submitSuccess && (
              <p className="text-green-400 text-sm">
                {isEditing ? "Song updated successfully!" : "Song added successfully!"}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg transition tv-card"
                tabIndex={0}
                role="button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#FF6B00] hover:bg-[#e55f00] disabled:bg-[#FF6B00]/50 text-white font-semibold py-2 rounded-lg transition tv-card"
                tabIndex={0}
                role="button"
              >
                {submitting ? "Saving..." : (isEditing ? "Update Song" : "Add Song")}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
}
