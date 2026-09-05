"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Song = Database["public"]["Tables"]["songs"]["Row"];

export default function Songbook() {
  const [search, setSearch] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
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

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.artist.toLowerCase().includes(search.toLowerCase()) ||
      song.code.includes(search)
  );

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
              ) : filteredSongs.length > 0 ? (
                filteredSongs.map((song, index) => (
                  <tr
                    key={song.code}
                    onClick={() =>
                      router.push(
                        `/singzone?code=${song.code}&title=${encodeURIComponent(
                          song.title
                        )}&artist=${encodeURIComponent(song.artist)}`
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
      </div>
    </div>
  );
}