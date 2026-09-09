"use client";

import { useCallback } from "react";
import type { Song } from "@/lib/database.types";
import {
  PlayerEntryList,
} from "@/components/competition";

interface Player {
  id: string;
  name: string;
  song: Song | null;
}

interface CompetitionSetupModalProps {
  isOpen: boolean;
  players: Player[];
  songs: Song[];
  loading: boolean;
  canStart: boolean;
  onClose: () => void;
  onAddPlayer: () => void;
  onNameChange: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onAssign: (playerId: string, song: Song) => void;
  onClear: (playerId: string) => void;
  onStart: () => void;
}

export default function CompetitionSetupModal({
  isOpen,
  players,
  songs,
  loading,
  canStart,
  onClose,
  onAddPlayer,
  onNameChange,
  onRemove,
  onAssign,
  onClear,
  onStart,
}: CompetitionSetupModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
<div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
           <div>
             <h2 className="text-xl font-bold text-white">Set Up Competition</h2>
             <p className="text-sm text-white/50">{players.length} player(s) added</p>
           </div>
           <button
             onClick={onClose}
             className="text-white/50 hover:text-white transition text-2xl leading-none tv-card"
             tabIndex={0}
             role="button"
             aria-label="Close"
           >
             &times;
           </button>
         </div>

         <div className="max-h-[calc(90vh-13rem)] overflow-y-auto px-6 py-4">
           <div className="mb-4 flex items-center justify-between">
             <h3 className="text-lg font-bold text-white">Players</h3>
             <button
               onClick={onAddPlayer}
               className="flex items-center gap-1.5 rounded-full bg-[#FF6B00] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#e55f00] transition tv-card"
               tabIndex={0}
               role="button"
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
               </svg>
               Add
             </button>
           </div>

          {players.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
              <p className="text-white/40 text-sm">No players yet. Click &quot;Add&quot; to get started.</p>
            </div>
          ) : (
            <PlayerEntryList
              players={players}
              songs={songs}
              onNameChange={onNameChange}
              onRemove={onRemove}
              onAssign={onAssign}
              onClear={onClear}
            />
          )}
        </div>

<div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
           <p
             className={`text-sm ${
               canStart ? "text-green-400" : "text-white/40"
             }`}
           >
             {canStart
               ? `${players.length} players ready to go!`
               : `Need at least 2 players, each with a name and a song.`}
           </p>
           <div className="flex items-center gap-3">
             <button
               onClick={onClose}
               className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 tv-card"
               tabIndex={0}
               role="button"
             >
               Cancel
             </button>
             <button
               onClick={onStart}
               disabled={!canStart}
               className="flex items-center gap-2 rounded-full bg-[#FF6B00] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#e55f00] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#FF6B00] tv-card"
               tabIndex={0}
               role="button"
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M5.252 12.273a.5.5 0 0 1 .748-.426l11.99 6.99a.5.5 0 0 1 0 .852l-11.99 6.99a.5.5 0 0 1-.748-.426L3.789 12.273a.5.5 0 0 1 .463-.8Z" />
               </svg>
               Enter SingZone
             </button>
           </div>
         </div>
      </div>
    </div>
  );
}