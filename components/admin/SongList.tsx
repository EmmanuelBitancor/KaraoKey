"use client";

import { useEffect, useRef } from "react";
import type { Song } from "@/lib/database.types";
import { isSupabaseConfigured } from "@/lib/supabase";

interface SongListProps {
  songs: Song[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  letterFilter: string | null;
  setLetterFilter: (value: string | null) => void;
  currentPage: number;
  setCurrentPage: (value: number | ((prev: number) => number)) => void;
  itemsPerPage: number;
  deletingCode: string | null;
  onRefresh: () => void;
  onAddSong: () => void;
  onPreview: (song: Song) => void;
  onEdit: (song: Song) => void;
  onDelete: (songCode: string) => void;
  onDismissError: () => void;
}

export default function SongList({
  songs,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  letterFilter,
  setLetterFilter,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  deletingCode,
  onRefresh,
  onAddSong,
  onPreview,
  onEdit,
  onDelete,
  onDismissError,
}: SongListProps) {
  const prevFiltersRef = useRef<{ searchQuery: string; letterFilter: string | null }>({ searchQuery: "", letterFilter: null });

  useEffect(() => {
    if (prevFiltersRef.current.searchQuery !== searchQuery || prevFiltersRef.current.letterFilter !== letterFilter) {
      prevFiltersRef.current = { searchQuery, letterFilter };
      setCurrentPage(1);
    }
  }, [searchQuery, letterFilter, setCurrentPage]);

  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      searchQuery === "" ||
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.code.includes(searchQuery);

    const matchesLetter =
      !letterFilter ||
      song.title.toUpperCase().startsWith(letterFilter);

    return matchesSearch && matchesLetter;
  });

  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSongs = filteredSongs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Configuration warning */}
      {!isSupabaseConfigured() && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
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
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={onDismissError}
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
              onClick={onRefresh}
              disabled={loading}
              className="text-white/70 hover:text-white text-sm transition"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button
              onClick={onAddSong}
              className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              + Add Song
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-white/10">
          <input
            type="text"
            placeholder="Search song or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[#FF6B00]"
          />
        </div>

        {/* Letter Filter */}
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-white/50 text-xs mb-2">Filter by letter:</p>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <button
              onClick={() => setLetterFilter(null)}
              className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded transition ${
                letterFilter === null
                  ? "bg-[#FF6B00] text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              All
            </button>
            {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map((letter) => (
              <button
                key={letter}
                onClick={() => setLetterFilter(letter)}
                className={`flex-shrink-0 w-7 h-7 text-xs font-semibold rounded transition flex items-center justify-center ${
                  letterFilter === letter
                    ? "bg-[#FF6B00] text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Songs Table */}
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
              {paginatedSongs.map((song) => (
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
                      onClick={() => onPreview(song)}
                      className="text-green-400/70 hover:text-green-500 mr-3 text-sm transition"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => onEdit(song)}
                      className="text-blue-400/70 hover:text-blue-500 mr-3 text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(song.code)}
                      disabled={deletingCode === song.code}
                      className="text-red-400/70 hover:text-red-500 disabled:opacity-50 text-sm transition"
                    >
                      {deletingCode === song.code ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <tr>
                  <td colSpan={5} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-white/50 text-sm">
                        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSongs.length)} of {filteredSongs.length} songs
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white/70 hover:text-white rounded transition"
                        >
                          Prev
                        </button>
                        <span className="text-white/50 text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white/70 hover:text-white rounded transition"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
