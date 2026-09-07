"use client";

import type { Song } from "@/lib/database.types";

interface QueuedSong {
  code: string;
  title: string;
  artist: string;
  youtubeId: string;
}

interface SingzoneQueuePanelProps {
  isPanelOpen: boolean;
  queue: QueuedSong[];
  searchQuery: string;
  letterFilter: string | null;
  songs: Song[];
  onTogglePanel: () => void;
  onSearchChange: (value: string) => void;
  onLetterFilterChange: (value: string | null) => void;
  onAddToQueue: (song: Song) => void;
  onRemoveFromQueue: (index: number) => void;
  onPlayNow: (index: number) => void;
}

export default function SingzoneQueuePanel({
  isPanelOpen,
  queue,
  searchQuery,
  letterFilter,
  songs,
  onTogglePanel,
  onSearchChange,
  onLetterFilterChange,
  onAddToQueue,
  onRemoveFromQueue,
  onPlayNow,
}: SingzoneQueuePanelProps) {
  const searchResults = songs.filter((song) => {
    const matchesSearch =
      searchQuery === "" ||
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.code.includes(searchQuery);

    const matchesLetter =
      !letterFilter || song.title.toUpperCase().startsWith(letterFilter);

    return matchesSearch && matchesLetter;
  });

  return (
    <div
      className={`bg-[#1a1a1a] border-l border-white/10 flex flex-col transition-all duration-300 ${
        isPanelOpen ? "w-80" : "w-0 border-0 overflow-hidden"
      }`}
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Song Queue</h2>
          <p className="text-sm text-white/50">{queue.length} song(s) in queue</p>
        </div>
        <button
          onClick={onTogglePanel}
          className="text-white/50 hover:text-white transition"
        >
          <span className="text-xl">{isPanelOpen ? "»" : "«"}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-white/10">
        {/* Letter Filter */}
        <p className="text-white/50 text-xs mb-2">Filter by letter:</p>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <button
            onClick={() => onLetterFilterChange(null)}
            className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded transition ${
              letterFilter === null
                ? "bg-[#FF6B00] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            All
          </button>
          {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map((letter) => (
            <button
              key={letter}
              onClick={() => onLetterFilterChange(letter)}
              className={`flex-shrink-0 w-6 h-6 text-xs font-semibold rounded transition flex items-center justify-center ${
                letterFilter === letter
                  ? "bg-[#FF6B00] text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search code, title, or artist..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[#FF6B00]"
        />

        {/* Search Results */}
        {(searchQuery || letterFilter) && (
          <div className="mt-3 max-h-60 overflow-y-auto rounded-lg bg-[#2a2a2a] border border-white/10">
            {searchResults.length > 0 ? (
              searchResults.map((song) => (
                <div
                  key={song.code}
                  className="flex items-center gap-2 px-4 py-3 hover:bg-[#FF6B00]/20 transition border-b border-white/5 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[#FF6B00] font-bold text-sm">{song.code}</p>
                    <p className="text-white text-sm truncate">{song.title}</p>
                    <p className="text-white/50 text-xs truncate">{song.artist}</p>
                  </div>
                  <button
                    onClick={() => onAddToQueue(song)}
                    className="flex-shrink-0 bg-[#FF6B00] hover:bg-[#e55f00] text-white text-xs font-semibold px-3 py-1.5 rounded transition"
                  >
                    Reserve
                  </button>
                </div>
              ))
            ) : (
              <p className="px-4 py-3 text-white/50 text-sm text-center">
                No songs found
              </p>
            )}
          </div>
        )}
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-2">
        {queue.length === 0 ? (
          <p className="text-white/50 text-xs text-center py-4">
            No songs in queue
          </p>
        ) : (
          <div className="space-y-1">
            {queue.map((song, index) => (
              <div
                key={`${song.code}-${index}`}
                className="bg-white/5 rounded px-2 py-1.5 relative group flex items-center gap-2"
              >
                <button
                  onClick={() => onRemoveFromQueue(index)}
                  className="text-white/30 hover:text-red-500 transition text-xs"
                >
                  ×
                </button>
                <div className="flex-1 min-w-0">
                  <span className="text-[#FF6B00] font-bold text-xs mr-2">
                    {song.code}
                  </span>
                  <span className="text-white text-xs truncate">{song.title}</span>
                  <span className="text-white/50 text-xs truncate ml-1">
                    - {song.artist}
                  </span>
                </div>
                <button
                  onClick={() => onPlayNow(index)}
                  className="flex-shrink-0 text-[10px] bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-2 py-1 rounded transition opacity-0 group-hover:opacity-100"
                >
                  Play Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
