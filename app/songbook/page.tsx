"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SONGS = [
  { code: "0001", title: "Huling El Bimbo", artist: "Eraserheads" },
  { code: "0002", title: "Bohemian Rhapsody", artist: "Queen" },
  { code: "0003", title: "My Way", artist: "Frank Sinatra" },
  { code: "0004", title: "Salamat", artist: "Eraserheads" },
  { code: "0005", title: "Hotel California", artist: "Eagles" },
  { code: "0006", title: "Bitterlang", artist: "Itchyworms" },
  { code: "0007", title: "With You", artist: "Parokya ni Edgar" },
  { code: "0008", title: "Una", artist: "KABANATA" },
  { code: "0009", title: "Dancing Queen", artist: "ABBA" },
  { code: "0010", title: "Take Me Home, Country Roads", artist: "John Denver" },
  { code: "0011", title: "Country Roads", artist: "John Denver" },
  { code: "0012", title: "Lay Me Down", artist: "John Legend" },
  { code: "0013", title: "All of Me", artist: "John Legend" },
  { code: "0014", title: "Perfect", artist: "Ed Sheeran" },
  { code: "0015", title: "Shape of You", artist: "Ed Sheeran" },
  { code: "0016", title: "Too Good at Goodbyes", artist: "Sam Smith" },
  { code: "0017", title: "I'm Not the Only One", artist: "Sam Smith" },
  { code: "0018", title: "Stay", artist: "Rihanna" },
  { code: "0019", title: "Love Yourself", artist: "Justin Bieber" },
  { code: "0020", title: "Despacito", artist: "Luis Fonsi" },
];

export default function Songbook() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredSongs = SONGS.filter(
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
              {filteredSongs.length > 0 ? (
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
