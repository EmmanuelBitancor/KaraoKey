"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import {
  CompetitionHeader,
} from "@/components/competition";
import CompetitionSetupModal from "@/components/competition/CompetitionSetupModal";

type Song = Database["public"]["Tables"]["songs"]["Row"];

interface Player {
  id: string;
  name: string;
  song: Song | null;
}

export default function CompetitionSetupPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const addPlayer = useCallback(() => {
    setPlayers((prev) => [
      ...prev,
      { id: `player-${Date.now()}-${prev.length}`, name: "", song: null },
    ]);
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePlayerName = useCallback((id: string, name: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  }, []);

  const assignSong = useCallback((playerId: string, song: Song) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, song } : p))
    );
  }, []);

  const clearSong = useCallback((playerId: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, song: null } : p))
    );
  }, []);

  const canStart = players.length >= 2 && players.every((p) => p.name.trim() && p.song);

  const startCompetition = useCallback(() => {
    if (!canStart) return;
    const payload = players.map((p) => ({
      name: p.name.trim(),
      code: p.song!.code,
      title: p.song!.title,
      artist: p.song!.artist,
      youtubeId: p.song!.youtube_id,
    }));
    localStorage.setItem("competition-players", JSON.stringify(payload));
    setIsModalOpen(false);
    router.push("/competition/singzone");
  }, [players, canStart, router]);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <CompetitionHeader
        playerCount={players.length}
        onBack={() => router.push("/explore")}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Competition <span className="text-[#FF6B00]">Setup</span>
          </h1>
          <p className="mt-3 text-white/50 text-lg">
            Add players and assign each one a song. Then hit start to enter the
            SingZone.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#e55f00] tv-card"
            tabIndex={0}
            role="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Player
          </button>
        </div>
      </div>

      <CompetitionSetupModal
        isOpen={isModalOpen}
        players={players}
        songs={songs}
        loading={loading}
        canStart={canStart}
        onClose={closeModal}
        onAddPlayer={addPlayer}
        onNameChange={updatePlayerName}
        onRemove={removePlayer}
        onAssign={assignSong}
        onClear={clearSong}
        onStart={startCompetition}
      />
    </div>
  );
}