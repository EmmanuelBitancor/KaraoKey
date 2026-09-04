"use client";

import { useState, useEffect } from "react";
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

export default function Hero() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const matchedSong = SONGS.find((song) => song.code === code);

  useEffect(() => {
    // Focus the input on mount
    const input = document.getElementById("code-input") as HTMLInputElement;
    if (input) input.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCode(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && matchedSong) {
      router.push(
        `/singzone?code=${matchedSong.code}&title=${encodeURIComponent(matchedSong.title)}&artist=${encodeURIComponent(matchedSong.artist)}`
      );
    }
  };

  return (
    <section
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      {/* Black overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Floating Song Book button */}
      <button
        onClick={() => router.push("/songbook")}
        className="absolute bottom-8 right-8 z-20 rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#e55f00] sm:px-8 sm:py-4 sm:text-base"
      >
        Song Book Here
      </button>

      {/* Logo and Karaoke code */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-8">
        <Link
          href="/"
          className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ fontFamily: "'Ayaha', sans-serif" }}
        >
          Karao<span className="text-[#FF6B00]">KEY</span>
        </Link>

        {/* Code Input */}
        <input
          id="code-input"
          type="tel"
          inputMode="numeric"
          maxLength={4}
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="0000"
          autoFocus
          className="w-full max-w-2xl text-center text-8xl sm:text-9xl md:text-[12rem] font-bold bg-transparent border-none outline-none text-[#FF6B00] cursor-text"
          style={{ caretColor: "#FF6B00" }}
        />

        {/* Matched Song Display */}
        {matchedSong && (
          <div className="text-center">
            <p className="text-xl sm:text-2xl text-white font-semibold">
              {matchedSong.title}
            </p>
            <p className="text-sm sm:text-base text-white/60">
              {matchedSong.artist}
            </p>
            <p className="text-xs text-[#FF6B00] mt-2 animate-pulse">Press Enter to sing</p>
          </div>
        )}

        {/* No Match Message */}
        {code.length === 4 && !matchedSong && (
          <p className="text-sm text-white/40">No song found for code {code}</p>
        )}

        {/* Instruction */}
        {!code && (
          <p className="text-sm text-white/40">Type a song code to get started</p>
        )}
      </div>
    </section>
  );
}
