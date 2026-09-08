"use client";

import type { Song } from "@/lib/database.types";

interface Player {
  id: string;
  name: string;
  song: Song | null;
}

interface SongAssignmentListProps {
  players: Player[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filteredSongs: Song[];
  onAssign: (playerId: string, song: Song) => void;
  onClear: (playerId: string) => void;
}

export default function SongAssignmentList({
  players,
  searchQuery,
  onSearchChange,
  filteredSongs,
  onAssign,
  onClear,
}: SongAssignmentListProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search songs by title, artist, or code..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#FF6B00] transition"
        />
        {searchQuery && (
          <div className="mt-1 w-full max-h-72 overflow-y-auto rounded-lg bg-[#2a2a2a] border border-white/10 shadow-xl">
            {filteredSongs.length > 0 ? (
              filteredSongs.map((song) => (
                <div
                  key={song.code}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#FF6B00]/20 transition border-b border-white/5 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[#FF6B00] font-bold text-sm">{song.code}</p>
                    <p className="text-white text-sm truncate">{song.title}</p>
                    <p className="text-white/50 text-xs truncate">{song.artist}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {players.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onAssign(p.id, song)}
                        disabled={!p.name.trim()}
                        className="text-[10px] bg-white/10 hover:bg-[#FF6B00] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-2 py-1 rounded transition"
                        title={`Assign to ${p.name || "unnamed player"}`}
                      >
                        → {p.name || "?"}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-white/40 text-sm text-center">
                No songs found for "{searchQuery}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Player song assignments */}
      <div className="space-y-2">
        <p className="text-sm text-white/50 font-medium">Assigned Songs</p>
        {players
          .filter((p) => p.song)
          .map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 py-2"
            >
              <div>
                <span className="text-sm font-semibold text-white">{p.name}</span>
                <span className="text-xs text-white/50 ml-2">
                  {p.song!.code} · {p.song!.title}
                </span>
              </div>
              <button
                onClick={() => onClear(p.id)}
                className="text-white/30 hover:text-red-500 text-xs"
              >
                Clear
              </button>
            </div>
          ))}
        {players.filter((p) => p.song).length === 0 && (
          <p className="text-xs text-white/40 text-center py-3">
            Search above and assign a song to each player.
          </p>
        )}
      </div>
    </div>
  );
}