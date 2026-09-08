"use client";

import { useState } from "react";
import type { Song } from "@/lib/database.types";

interface Player {
  id: string;
  name: string;
  song: Song | null;
}

interface PlayerEntryListProps {
  players: Player[];
  songs: Song[];
  onNameChange: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onAssign: (playerId: string, song: Song) => void;
  onClear: (playerId: string) => void;
}

export default function PlayerEntryList({
  players,
  songs,
  onNameChange,
  onRemove,
  onAssign,
  onClear,
}: PlayerEntryListProps) {
  return (
    <div className="space-y-3">
      {players.map((player, index) => (
        <div
          key={player.id}
          className="rounded-xl bg-[#1a1a1a] border border-white/10 p-3 space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B00]/15 text-[#FF6B00] font-bold text-sm">
              {index + 1}
            </div>
            <input
              type="text"
              value={player.name}
              onChange={(e) => onNameChange(player.id, e.target.value)}
              placeholder="Player name"
              className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-[#FF6B00] transition"
            />
            {player.song && (
              <span className="flex-shrink-0 text-xs text-[#FF6B00] truncate max-w-[160px]">
                {player.song.code} · {player.song.title}
              </span>
            )}
            <button
              onClick={() => onClear(player.id)}
              className={`flex-shrink-0 text-xs transition ${
                player.song
                  ? "text-white/30 hover:text-red-500"
                  : "invisible"
              }`}
              title="Clear song"
            >
              Clear
            </button>
            <button
              onClick={() => onRemove(player.id)}
              className="flex-shrink-0 text-white/30 hover:text-red-500 transition text-lg leading-none"
              title="Remove player"
            >
              ×
            </button>
          </div>

          {!player.song && (
            <PlayerSongSearch
              player={player}
              songs={songs}
              onAssign={onAssign}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function PlayerSongSearch({
  player,
  songs,
  onAssign,
}: {
  player: Player;
  songs: Song[];
  onAssign: (playerId: string, song: Song) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = songs.filter((song) => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return (
      song.title.toLowerCase().includes(q) ||
      song.artist.toLowerCase().includes(q) ||
      song.code.includes(q)
    );
  });

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search and assign a song..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#FF6B00] transition"
      />
      {query && (
        <div className="mt-1 w-full max-h-48 overflow-y-auto rounded-lg bg-[#2a2a2a] border border-white/10 shadow-xl z-10">
          {filtered.length > 0 ? (
            filtered.map((song) => (
              <div
                key={song.code}
                className="flex items-center justify-between px-3 py-2 hover:bg-[#FF6B00]/20 transition border-b border-white/5 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[#FF6B00] font-bold text-xs">{song.code}</p>
                  <p className="text-white text-sm truncate">{song.title}</p>
                  <p className="text-white/50 text-xs truncate">{song.artist}</p>
                </div>
                <button
                  onClick={() => {
                    onAssign(player.id, song);
                    setQuery("");
                  }}
                  className="text-[10px] bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-2 py-1 rounded transition ml-2"
                >
                  Assign
                </button>
              </div>
            ))
          ) : (
            <p className="px-3 py-3 text-white/40 text-xs text-center">
              No songs found for &quot;{query}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
