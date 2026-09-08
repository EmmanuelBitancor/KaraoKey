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
  const [speakingField, setSpeakingField] = useState<"title" | "artist" | null>(null);

  const speak = useCallback((text: string, field: "title" | "artist") => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setSpeakingField(field);
    utterance.onend = () => setSpeakingField(null);
    utterance.onerror = () => setSpeakingField(null);

    window.speechSynthesis.speak(utterance);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-lg border border-white/10 w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{isEditing ? "Edit Song" : "Add New Song"}</h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition"
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
            <div className="relative">
              <input
                type="text"
                placeholder="Song title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full rounded-lg bg-white/10 pl-4 pr-10 py-2 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
              {title && (
                <button
                  type="button"
                  onClick={() => speak(title, "title")}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 transition ${
                    speakingField === "title"
                      ? "text-[#FF6B00]"
                      : "text-white/50 hover:text-white"
                  }`}
                  title="Listen to title"
                >
                  {speakingField === "title" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M8.25 19.5a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z" />
                      <path fillRule="evenodd" d="M19.5 10.5a.75.75 0 01.75.75v3.75a3 3 0 01-1.693 2.72l-5.678 3.384a.75.75 0 01-.944-1.166l2.03-3.216A1.5 1.5 0 0014.25 12H9.75a.75.75 0 01-.75-.75v-3a.75.75 0 01.75-.75h4.5a.75.75 0 000-1.5H9.75a3 3 0 00-3 3v3a.75.75 0 01-.75.75H4.5a.75.75 0 010-1.5h3.75v-3a4.5 4.5 0 014.5-4.5h4.5a.75.75 0 01.75.75v3.75a3 3 0 01-1.693 2.72l-5.678 3.384a.75.75 0 01-.944-1.166l2.03-3.216A1.5 1.5 0 0014.25 12H9.75a.75.75 0 01-.75-.75v-3a.75.75 0 01.75-.75h4.5a.75.75 0 000-1.5H9.75z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
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
                className="w-full rounded-lg bg-white/10 pl-4 pr-10 py-2 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
              {artist && (
                <button
                  type="button"
                  onClick={() => speak(artist, "artist")}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 transition ${
                    speakingField === "artist"
                      ? "text-[#FF6B00]"
                      : "text-white/50 hover:text-white"
                  }`}
                  title="Listen to artist"
                >
                  {speakingField === "artist" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M8.25 19.5a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z" />
                      <path fillRule="evenodd" d="M19.5 10.5a.75.75 0 01.75.75v3.75a3 3 0 01-1.693 2.72l-5.678 3.384a.75.75 0 01-.944-1.166l2.03-3.216A1.5 1.5 0 0014.25 12H9.75a.75.75 0 01-.75-.75v-3a.75.75 0 01.75-.75h4.5a.75.75 0 000-1.5H9.75a3 3 0 00-3 3v3a.75.75 0 01-.75.75H4.5a.75.75 0 010-1.5h3.75v-3a4.5 4.5 0 014.5-4.5h4.5a.75.75 0 01.75.75v3.75a3 3 0 01-1.693 2.72l-5.678 3.384a.75.75 0 01-.944-1.166l2.03-3.216A1.5 1.5 0 0014.25 12H9.75a.75.75 0 01-.75-.75v-3a.75.75 0 01.75-.75h4.5a.75.75 0 000-1.5H9.75z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  )}
                </button>
              )}
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
              className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[#FF6B00]"
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
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#FF6B00] hover:bg-[#e55f00] disabled:bg-[#FF6B00]/50 text-white font-semibold py-2 rounded-lg transition"
            >
              {submitting ? "Saving..." : (isEditing ? "Update Song" : "Add Song")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
