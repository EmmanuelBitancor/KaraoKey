"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Song = Database["public"]["Tables"]["songs"]["Row"];

export default function Admin() {
  // Auth state - always start as false to avoid hydration mismatch
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Delete state
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getNextCode = (): string => {
    if (songs.length === 0) return "0001";
    const maxCode = songs.reduce((max, song) => {
      const num = parseInt(song.code, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    return String(maxCode + 1).padStart(4, "0");
  };

  const resetForm = () => {
    setCode("");
    setTitle("");
    setArtist("");
    setYoutubeId("");
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const openAddModal = () => {
    resetForm();
    setCode(getNextCode());
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("code", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setSongs(data || []);
    }
    setLoading(false);
  }, []);

  // Restore auth state from sessionStorage after mount
  useEffect(() => {
    const storedAuth = sessionStorage.getItem("karaokey-admin-auth");
    if (storedAuth === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(true);
      fetchSongs();
    }
    setMounted(true);
  }, [fetchSongs]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "")) {
      setIsAuthenticated(true);
      setAuthError(false);
      setPasswordInput("");
      sessionStorage.setItem("karaokey-admin-auth", "true");
      fetchSongs();
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSongs([]);
    sessionStorage.removeItem("karaokey-admin-auth");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate code is 4 digits
    if (!/^\d{4}$/.test(code)) {
      setSubmitError("Code must be exactly 4 digits (e.g., 0021)");
      setSubmitting(false);
      return;
    }

    if (!title.trim()) {
      setSubmitError("Title is required");
      setSubmitting(false);
      return;
    }

    if (!artist.trim()) {
      setSubmitError("Artist is required");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("songs").insert({
      code,
      title: title.trim(),
      artist: artist.trim(),
      youtube_id: youtubeId.trim() || "UkX9XP4urcM",
    });

    if (error) {
      if (error.code === "23505") {
        setSubmitError(`Song with code "${code}" already exists`);
      } else {
        setSubmitError(error.message);
      }
    } else {
      setSubmitSuccess(true);
      fetchSongs();
      setTimeout(() => {
        closeAddModal();
      }, 1500);
    }

    setSubmitting(false);
  };

  const handleDelete = async (songCode: string) => {
    setDeletingCode(songCode);
    const { error } = await supabase.from("songs").delete().eq("code", songCode);

    if (error) {
      setError(error.message);
    } else {
      setSongs(songs.filter((s) => s.code !== songCode));
    }
    setDeletingCode(null);
  };

  // Show loading until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link
              href="/"
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "'Ayaha', sans-serif" }}
            >
              Karao<span className="text-[#FF6B00]">KEY</span>
            </Link>
            <p className="text-white/50 mt-2">Admin Portal</p>
          </div>

          {!isSupabaseConfigured() && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
              <p className="text-yellow-400 text-sm font-semibold mb-1">Supabase Not Configured</p>
              <p className="text-yellow-400/70 text-xs">
                Please set <code className="bg-yellow-500/20 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="bg-yellow-500/20 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your{" "}
                <code className="bg-yellow-500/20 px-1">.env.local</code> file.
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                className="w-full rounded-lg bg-white/10 px-4 py-3 pr-12 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c3.857 3.857 10.132 3.857 13.99 0A10.495 10.495 0 0 0 20.031 12m-16.053 0a10.477 10.477 0 0 0 2.046-2.777M3.98 15.774a10.477 10.477 0 0 0 2.046 2.777m16.053 0a10.477 10.477 0 0 0-2.046-2.777M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            {authError && (
                <p className="text-red-500 text-sm mt-2">
                  Incorrect password. Try again.
                </p>
              )}

            <button
              type="submit"
              className="w-full bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold py-3 rounded-lg transition"
            >
              Login
            </button>
          </form>

          <p className="text-white/30 text-xs text-center mt-6">
            Contact your administrator for access
          </p>
        </div>
      </div>
    );
  }

  // Main admin page
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0D0D0D] border-b border-white/10 px-4 py-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div /> {/* Spacer */}
            <Link
              href="/"
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Ayaha', sans-serif" }}
            >
              Karao<span className="text-[#FF6B00]">KEY</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-white/70 hover:text-white text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Song Management</h1>

        {/* Configuration warning */}
        {!isSupabaseConfigured() && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 text-sm font-semibold mb-1">Supabase Not Configured</p>
            <p className="text-yellow-400/70 text-xs">
              Please set <code className="bg-yellow-500/20 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="bg-yellow-500/20 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your{" "}
              <code className="bg-yellow-500/20 px-1">.env.local</code> file, then restart the dev server.
            </p>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400/70 hover:text-red-400 text-sm mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Songs List */}
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-bold">Songs ({songs.length})</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchSongs}
                disabled={loading}
                className="text-white/70 hover:text-white text-sm transition"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
              <button
                onClick={openAddModal}
                className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                + Add Song
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-white/50">
              Loading songs...
            </div>
          ) : songs.length === 0 ? (
            <div className="p-8 text-center text-white/50">
              No songs found. Add your first song!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FF6B00]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                      YouTube ID
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {songs.map((song) => (
                    <tr key={song.code} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-[#FF6B00] font-bold">
                        {song.code}
                      </td>
                      <td className="px-4 py-3 text-white">{song.title}</td>
                      <td className="px-4 py-3 text-white/70">{song.artist}</td>
                      <td className="px-4 py-3 text-white/50 text-sm font-mono">
                        {song.youtube_id}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(song.code)}
                          disabled={deletingCode === song.code}
                          className="text-red-400/70 hover:text-red-500 disabled:opacity-50 text-sm transition"
                        >
                          {deletingCode === song.code ? "..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Song Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-[#1a1a1a] rounded-lg border border-white/10 w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Add New Song</h2>
                <button
                  onClick={closeAddModal}
                  className="text-white/50 hover:text-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <p className="text-white/40 text-xs mt-1">Auto-generated</p>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Song title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">
                    Artist *
                  </label>
                  <input
                    type="text"
                    placeholder="Artist name"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">
                    YouTube ID
                  </label>
                  <input
                    type="text"
                    placeholder="UkX9XP4urcM"
                    value={youtubeId}
                    onChange={(e) => setYoutubeId(e.target.value)}
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
                    Song added successfully!
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-[#FF6B00] hover:bg-[#e55f00] disabled:bg-[#FF6B00]/50 text-white font-semibold py-2 rounded-lg transition"
                  >
                    {submitting ? "Adding..." : "Add Song"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}