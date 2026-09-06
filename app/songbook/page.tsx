"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Song = Database["public"]["Tables"]["songs"]["Row"];

export default function Songbook() {
  const [search, setSearch] = useState("");
  const [letterFilter, setLetterFilter] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const router = useRouter();

  useEffect(() => {
    async function fetchSongs() {
      setLoading(true);
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("code", { ascending: true });

      if (!error && data) {
        setSongs(data);
      }
      setLoading(false);
    }
    fetchSongs();
  }, []);

  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      search === "" ||
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.artist.toLowerCase().includes(search.toLowerCase()) ||
      song.code.includes(search);

    const matchesLetter =
      !letterFilter ||
      song.title.toUpperCase().startsWith(letterFilter);

    return matchesSearch && matchesLetter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSongs.length / ITEMS_PER_PAGE);
  const paginatedSongs = filteredSongs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, letterFilter]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Header */}
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
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[#FF6B00]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Letter Filter */}
        <div className="mb-4 overflow-x-auto">
          <p className="text-white/50 text-xs mb-2">Filter by letter:</p>
          <div className="flex items-center gap-1">
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

        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full">
            <thead className="bg-[#FF6B00]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  CODE
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  Song Name / Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  Artist
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-white/50">
                    Loading songs...
                  </td>
                </tr>
              ) : paginatedSongs.length > 0 ? (
                paginatedSongs.map((song, index) => (
                  <tr
                    key={song.code}
                    onClick={() =>
                      router.replace(
                        `/singzone?code=${song.code}&title=${encodeURIComponent(
                          song.title
                        )}&artist=${encodeURIComponent(song.artist)}&youtubeId=${encodeURIComponent(song.youtube_id)}`
                      )
                    }
                    className={`${
                      index % 2 === 0 ? "bg-white/5" : "bg-transparent"
                    } hover:bg-[#FF6B00]/20 cursor-pointer transition`}
                  >
                    <td className="px-6 py-4 text-[#FF6B00] font-bold">
                      {song.code}
                    </td>
                    <td className="px-6 py-4 text-white">{song.title}</td>
                    <td className="px-6 py-4 text-white/70">{song.artist}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-white/50">
                    No songs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Prev
            </button>
            <span className="text-white/50 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}