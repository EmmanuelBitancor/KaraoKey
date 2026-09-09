"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CompetitionVideoPlayer,
  CompetitionMicBar,
} from "@/components/competition";
import { supabase } from "@/lib/supabase";
import type { Song } from "@/lib/database.types";

export default function RoulettePage() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [rotation, setRotation] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [showMic, setShowMic] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const scoreTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    async function loadSongs() {
      const { data } = await supabase
        .from("songs")
        .select("*")
        .order("code", { ascending: true });
      if (data) setSongs(data);
      setLoading(false);
    }
    loadSongs();
  }, []);

  const drawWheel = useCallback((currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas || songs.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = Math.min(500, window.innerWidth - 32);
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    const sliceAngle = (2 * Math.PI) / songs.length;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);

    const colors = [
      "#FF6B00",
      "#FF8C33",
      "#FFB366",
      "#FFD699",
      "#CC5500",
      "#E67300",
      "#FF9933",
      "#FFAD4D",
    ];

    songs.forEach((_, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.restore();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#FF6B00";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#FF6B00";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [songs]);

  useEffect(() => {
    if (songs.length > 0) {
      drawWheel(rotation);
    }
  }, [rotation, songs.length, drawWheel]);

  const spinWheel = useCallback(() => {
    if (spinning || songs.length === 0) return;

    setSpinning(true);
    setSelectedSong(null);
    setScore(null);

    const startTime = Date.now();
    const startRotation = rotation;
    const totalRotation = Math.PI * 2 * (6 + Math.random() * 6);
    const duration = 16000 + Math.random() * 7000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Wheel-of-fortune feel: fast spin, then very gradual slowdown to a stop
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * eased;

      setRotation(currentRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);

        const sliceAngle = (2 * Math.PI) / songs.length;
        const normalizedAngle = ((2 * Math.PI) - (currentRotation % (2 * Math.PI))) % (2 * Math.PI);
        const selectedIndex = Math.floor(normalizedAngle / sliceAngle);
        const songIndex = selectedIndex % songs.length;

        setSelectedSong(songs[songIndex]);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [spinning, songs.length, rotation, songs]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (scoreTimeoutRef.current) {
        clearTimeout(scoreTimeoutRef.current);
      }
    };
  }, []);

  const resetRoulette = useCallback(() => {
    if (scoreTimeoutRef.current) {
      clearTimeout(scoreTimeoutRef.current);
      scoreTimeoutRef.current = null;
    }
    setSelectedSong(null);
    setScore(null);
  }, []);

  const handleScore = useCallback((value: number) => {
    setScore(value);

    if (scoreTimeoutRef.current) {
      clearTimeout(scoreTimeoutRef.current);
    }

    scoreTimeoutRef.current = window.setTimeout(() => {
      scoreTimeoutRef.current = null;
      resetRoulette();
    }, 4000);
  }, [resetRoulette]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/explore")}
            className="flex items-center gap-2 text-white/70 hover:text-white transition tv-back-btn"
            tabIndex={0}
            role="button"
          >
            <span className="text-xl">←</span>
            <span className="text-sm">Back</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Song <span className="text-[#FF6B00]">Roulette</span>
          </h1>
          <p className="mt-3 text-white/50 text-lg">
            Spin the wheel and let fate decide your next karaoke song.
          </p>
        </div>

        {!selectedSong ? (
          <div className="flex flex-col items-center gap-8">
            {loading ? (
              <p className="text-white/50">Loading songs...</p>
            ) : songs.length === 0 ? (
              <p className="text-white/50">No songs available. Add some songs first.</p>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-[#FF6B00]" />
                  </div>

                  <div className="relative rounded-full overflow-hidden shadow-2xl">
                    <canvas
                      ref={canvasRef}
                      className="block"
                      style={{ width: "min(500px, calc(100vw - 32px))", height: "min(500px, calc(100vw - 32px))" }}
                    />
                  </div>
                </div>

                <button
                  onClick={spinWheel}
                  disabled={spinning || songs.length === 0}
                  className="px-8 py-4 rounded-full bg-[#FF6B00] text-white font-bold text-lg shadow-lg transition hover:bg-[#e55f00] disabled:opacity-50 disabled:cursor-not-allowed tv-card"
                  tabIndex={0}
                  role="button"
                >
                  {spinning ? "Spinning..." : "Spin the Wheel"}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="mb-3 md:mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-white/50">Roulette Mode</p>
                <h2 className="text-xl md:text-3xl font-bold">
                  {selectedSong.title}
                  <span className="text-[#FF6B00]"> — {selectedSong.artist}</span>
                </h2>
                <p className="text-white/60 mt-1 text-xs md:text-sm">{selectedSong.code}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowMic((prev) => !prev)}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-1 md:px-3 md:py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 tv-card"
                  tabIndex={0}
                  role="button"
                >
                  {showMic ? "Hide Mic" : "Show Mic"}
                </button>
                <button
                  onClick={resetRoulette}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-1 md:px-3 md:py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 tv-card"
                  tabIndex={0}
                  role="button"
                >
                  New Spin
                </button>
              </div>
            </div>

            <div className="relative">
              <div className={showMic ? "pr-12 md:pr-16" : ""}>
                <CompetitionVideoPlayer
                  videoId={selectedSong.youtube_id}
                  score={score}
                  onScore={handleScore}
                />
              </div>

              {showMic && (
                <div className="absolute right-0 top-0 bottom-0 w-12 md:w-16">
                  <CompetitionMicBar />
                </div>
              )}
            </div>

            <div className="mt-3 md:mt-4 flex gap-3 justify-center">
              <button
                onClick={resetRoulette}
                className="px-4 py-2 md:px-6 md:py-3 rounded-full bg-[#FF6B00] text-white font-bold text-sm shadow-lg transition hover:bg-[#e55f00] tv-card"
                tabIndex={0}
                role="button"
              >
                New Spin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
