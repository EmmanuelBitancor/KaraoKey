"use client";

import { useState, useEffect, useCallback, useRef, startTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CompetitionHeader,
  CompetitionScoreboard,
  CompetitionRoundResult,
  CompetitionVideoPlayer,
  CompetitionMicBar,
} from "@/components/competition";

interface CompetitionPlayer {
  name: string;
  code: string;
  title: string;
  artist: string;
  youtubeId: string;
}

interface PlayerScore {
  name: string;
  song: string;
  score: number | null;
  round: number | null;
}

export default function CompetitionSingzonePage() {
  const router = useRouter();
  const [players, setPlayers] = useState<CompetitionPlayer[]>([]);
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [ready, setReady] = useState(false);
  const advanceTimerRef = useRef<number | null>(null);
  const [showMicBar, setShowMicBar] = useState(true);

  // Load players from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const raw = localStorage.getItem("competition-players");
    if (!raw) {
      startTransition(() => setReady(true));
      return;
    }
    try {
      const saved = JSON.parse(raw) as CompetitionPlayer[];
      startTransition(() => {
        setPlayers(saved);
        setScores(
          saved.map((p) => ({
            name: p.name,
            song: `${p.code} · ${p.title}`,
            score: null,
            round: null,
          }))
        );
      });
    } catch {
      // ignore parse errors
    } finally {
      startTransition(() => setReady(true));
    }
  }, []);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  // Redirect to setup if no players loaded
  useEffect(() => {
    if (ready && players.length === 0) {
      clearAdvanceTimer();
      router.push("/competition");
    }
  }, [ready, players.length, router, clearAdvanceTimer]);

  const currentPlayer = players[currentPlayerIndex];

  const handleScore = useCallback(
    (score: number) => {
      if (!currentPlayer) return;
      setScores((prev) =>
        prev.map((s, i) =>
          i === currentPlayerIndex
            ? { ...s, score, round: currentRound }
            : s
        )
      );

      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
      advanceTimerRef.current = window.setTimeout(() => {
        advanceTimerRef.current = null;
        if (currentPlayerIndex < players.length - 1) {
          setCurrentPlayerIndex((prev) => prev + 1);
          setCurrentRound((prev) => prev + 1);
        } else {
          setGameOver(true);
        }
      }, 3000);
    },
    [currentPlayer, currentRound, currentPlayerIndex, players.length]
  );

  const restart = useCallback(() => {
    clearAdvanceTimer();
    setScores(
      players.map((p) => ({
        name: p.name,
        song: `${p.code} · ${p.title}`,
        score: null,
        round: null,
      }))
    );
    setCurrentRound(1);
    setCurrentPlayerIndex(0);
    setGameOver(false);
  }, [players, clearAdvanceTimer]);

  if (!ready || (!currentPlayer && !gameOver)) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <p className="text-white/50">Loading competition...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <CompetitionHeader
        playerCount={players.length}
        onBack={() => router.push("/competition")}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {gameOver ? (
          <CompetitionRoundResult
            scores={scores}
            onRestart={restart}
            onHome={() => router.push("/explore")}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Video + Mic */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-white/50">
                    Round {currentRound} of {players.length}
                  </p>
                  <h2 className="text-3xl font-bold">
                    {currentPlayer?.name}
                    <span className="text-[#FF6B00]"> is up!</span>
                  </h2>
                  <p className="text-white/60 mt-1">
                    Sing: {currentPlayer?.code} · {currentPlayer?.title} — {currentPlayer?.artist}
                  </p>
                </div>

                <button
                  onClick={() => setShowMicBar((prev) => !prev)}
                  className="flex-shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                  title={showMicBar ? "Hide microphone" : "Show microphone"}
                >
                  {showMicBar ? "Hide Mic" : "Show Mic"}
                </button>
              </div>

              <div className="relative">
                <div className={showMicBar ? "pr-16" : ""}>
                  <CompetitionVideoPlayer
                    videoId={currentPlayer.youtubeId}
                    score={scores[currentPlayerIndex]?.score ?? null}
                    onScore={handleScore}
                  />
                </div>

                {showMicBar && (
                  <div className="absolute right-0 top-0 bottom-0 w-16">
                    <CompetitionMicBar />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Leaderboard */}
            <div>
              <CompetitionScoreboard scores={scores} highlightIndex={currentPlayerIndex} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}