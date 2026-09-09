"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Song = Database["public"]["Tables"]["songs"]["Row"];

export default function Hero() {
  const [code, setCode] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const router = useRouter();

  const matchedSong = songs.find((song) => song.code === code);

  const prevLengthRef = useRef(0);
  const femaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const getFemaleVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!window.speechSynthesis) return null;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    // Prioritize high-energy female voices
    const energeticFemaleNames = [
      "samantha",
      "victoria",
      "karen",
      "moira",
      "tessa",
      "veena",
      "zira",
      "eva",
      "lisa",
      "fiona",
      "katherine",
      "kate",
      "alice",
      "amelie",
      "alex",
      "maria",
      "laura",
      "paulina",
      "iveta",
      "yu-shuan",
      "mei-jia",
      "ting-ting",
      "hoda",
      "nora",
      "henry",
      "joanna",
      "salli",
      "michelle",
      "carmen",
      "conchita",
      "lucia",
      "esperanza",
      "krystal",
      "sabina",
    ];

    const femaleVoice = voices.find((v) =>
      energeticFemaleNames.some((name) => v.name.toLowerCase().includes(name))
    );

    if (femaleVoice) return femaleVoice;

    // Fallback: look for female/woman pattern
    const fallbackVoice = voices.find(
      (v) =>
        v.name.toLowerCase().includes("female") ||
        v.voiceURI.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("woman")
    );

    return fallbackVoice || voices[0] || null;
  }, []);

  const speakCode = useCallback((text: string) => {
    if (!text || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // Use female voice if available
    const femaleVoice = getFemaleVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    // High-energy settings: faster rate and higher pitch
    utterance.rate = 2.5;
    utterance.pitch = 2.5;

    // Only cancel if speech is actually in progress to avoid delay
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    window.speechSynthesis.speak(utterance);
  }, [getFemaleVoice]);

  useEffect(() => {
    if (code && code.length > prevLengthRef.current) {
      const lastChar = code.slice(-1);
      speakCode(lastChar);
    }
    prevLengthRef.current = code.length;
  }, [code, speakCode]);

  useEffect(() => {
    // Pre-load voices and select female voice
    if (window.speechSynthesis) {
      const loadVoices = () => {
        femaleVoiceRef.current = getFemaleVoice();
      };

      loadVoices();

      // Handle async voice loading (Chrome)
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [getFemaleVoice]);

  useEffect(() => {
    // Focus the input on mount
    const input = document.getElementById("code-input") as HTMLInputElement;
    if (input) input.focus();
  }, []);

  useEffect(() => {
    async function fetchSongs() {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("code", { ascending: true });

      if (!error && data) {
        setSongs(data);
      }
    }
    fetchSongs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCode(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && matchedSong) {
      router.push(
        `/singzone?code=${matchedSong.code}&title=${encodeURIComponent(matchedSong.title)}&artist=${encodeURIComponent(matchedSong.artist)}&youtubeId=${encodeURIComponent(matchedSong.youtube_id)}`
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

      {/* Floating buttons */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
        <button
          onClick={() => router.push("/review")}
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-white shadow-lg transition hover:bg-white/20 tv-card"
          title="Submit Feedback"
          tabIndex={0}
          role="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 2.17l2.47 4.94 5.46.79-3.98 3.88.94 5.47-4.9-2.57-4.89 2.57.94-5.47-3.98-3.88 5.46-.79 2.47-4.94z" />
          </svg>
          <span className="text-sm font-semibold">Submit Feedback</span>
        </button>
        <button
          onClick={() => router.push("/explore")}
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-white shadow-lg transition hover:bg-white/20 tv-card"
          title="Explore More"
          tabIndex={0}
          role="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7.5-5.2-9.5-10.2a7.5 7.5 0 0 1 14-3.6 7.5 7.5 0 0 1 4 3.6C19.5 15.8 12 21 12 21Zm0-10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          </svg>
          <span className="text-sm font-semibold">Explore More</span>
        </button>
        <button
          onClick={() => router.push("/songbook")}
          className="flex items-center gap-2 rounded-full bg-[#FF6B00] px-4 py-3 text-white shadow-lg transition hover:bg-[#e55f00] tv-card"
          title="Song Book"
          tabIndex={0}
          role="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 0 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <span className="text-sm font-semibold">Song Book</span>
        </button>
      </div>

      {/* Logo and Karaoke code */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-8">
        <Link
          href="/"
          className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl tv-card"
          style={{ fontFamily: "'Ayaha', sans-serif" }}
          tabIndex={0}
          role="link"
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
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-form-type="other"
          data-lpignore="true"
          data-1p-ignore="true"
          className="w-full max-w-2xl text-center text-8xl sm:text-9xl md:text-[12rem] font-bold bg-transparent border-none outline-none text-[#FF6B00] cursor-text tv-card"
          style={{ caretColor: "#FF6B00" }}
          tabIndex={0}
          role="textbox"
          aria-label="Enter song code"
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
