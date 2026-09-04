"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense, useState, useRef, useEffect, useCallback } from "react";

interface QueuedSong {
  code: string;
  title: string;
  artist: string;
  youtubeId: string;
}

interface YouTubePlayer {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
}

const SAMPLE_YOUTUBE_ID = "UkX9XP4urcM";

function SingzoneContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code") || "0000";
  const title = searchParams.get("title") || "Unknown Song";
  const artist = searchParams.get("artist") || "Unknown Artist";

  const [queue, setQueue] = useState<QueuedSong[]>([]);
  const [currentSong, setCurrentSong] = useState({ code, title, artist });
  const [searchQuery, setSearchQuery] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(240);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window !== "undefined" && !window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const next = queue[0];
      setCurrentSong({ code: next.code, title: next.title, artist: next.artist });
      setQueue(queue.slice(1));
      router.replace(
        `/singzone?code=${next.code}&title=${encodeURIComponent(next.title)}&artist=${encodeURIComponent(next.artist)}`
      );
    } else {
      setIsExiting(true);
      setTimeout(() => {
        router.push("/");
      }, 500);
    }
  }, [queue, router]);

  // Initialize YouTube player
  useEffect(() => {
    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (window.YT && containerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: SAMPLE_YOUTUBE_ID,
          playerVars: {
            autoplay: 1,
            mute: 0,
            loop: 0,
          },
          events: {
            onStateChange: (event: { data: number }) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (
                event.data === window.YT.PlayerState.PAUSED ||
                event.data === window.YT.PlayerState.ENDED
              ) {
                setIsPlaying(false);
                if (event.data === window.YT.PlayerState.ENDED) {
                  playNext();
                }
              }
            },
            onReady: () => {
              if (playerRef.current) {
                const duration = playerRef.current.getDuration();
                if (duration) setVideoDuration(duration);
              }
            },
          },
        });
      }
    };

    if (typeof window !== "undefined" && window.YT) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [currentSong.code, playNext]);

  // Poll player state for progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        const currentTime = playerRef.current.getCurrentTime?.();
        const duration = playerRef.current.getDuration?.();
        if (typeof currentTime === "number") {
          setVideoProgress(currentTime);
        }
        if (typeof duration === "number" && duration > 0) {
          setVideoDuration(duration);
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const progressPercent = videoDuration > 0 ? (videoProgress / videoDuration) * 100 : 0;
  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

  // Song database for searching
  const songDatabase: QueuedSong[] = [
    { code: "0001", title: "Huling El Bimbo", artist: "Eraserheads", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0002", title: "Bohemian Rhapsody", artist: "Queen", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0003", title: "My Way", artist: "Frank Sinatra", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0004", title: "Salamat", artist: "Eraserheads", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0005", title: "Hotel California", artist: "Eagles", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0006", title: "Bitterlang", artist: "Itchyworms", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0007", title: "With You", artist: "Parokya ni Edgar", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0008", title: "Una", artist: "KABANATA", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0009", title: "Dancing Queen", artist: "ABBA", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0010", title: "Take Me Home, Country Roads", artist: "John Denver", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0011", title: "Country Roads", artist: "John Denver", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0012", title: "Lay Me Down", artist: "John Legend", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0013", title: "All of Me", artist: "John Legend", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0014", title: "Perfect", artist: "Ed Sheeran", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0015", title: "Shape of You", artist: "Ed Sheeran", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0016", title: "Too Good at Goodbyes", artist: "Sam Smith", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0017", title: "I'm Not the Only One", artist: "Sam Smith", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0018", title: "Stay", artist: "Rihanna", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0019", title: "Love Yourself", artist: "Justin Bieber", youtubeId: SAMPLE_YOUTUBE_ID },
    { code: "0020", title: "Despacito", artist: "Luis Fonsi", youtubeId: SAMPLE_YOUTUBE_ID },
  ];

  const searchResults = songDatabase.filter(
    (song) =>
      searchQuery === "" ||
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.code.includes(searchQuery)
  );

  const addToQueue = (song: QueuedSong) => {
    if (!queue.find((q) => q.code === song.code)) {
      setQueue([...queue, song]);
    }
    setSearchQuery("");
  };

  const removeFromQueue = (index: number) => {
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    setQueue(newQueue);
  };

  return (
    <div className={`min-h-screen bg-[#0D0D0D] text-white flex relative transition-opacity duration-500 ${isExiting ? "opacity-0" : "opacity-100"}`}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0D0D0D] border-b border-white/10 px-4 py-4">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between">
              <Link
                href="/songbook"
                className="flex items-center gap-2 text-white/70 hover:text-white transition"
              >
                <span className="text-xl">←</span>
                <span className="text-sm">Back to Songbook</span>
              </Link>
              <Link
                href="/"
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "'Ayaha', sans-serif" }}
              >
                Karao<span className="text-[#FF6B00]">KEY</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Queue Preview Banner (when panel is closed) */}
        {!isPanelOpen && queue.length > 0 && (
          <div
            onClick={() => {
              const next = queue[0];
              setCurrentSong({ code: next.code, title: next.title, artist: next.artist });
              setQueue(queue.slice(1));
              router.replace(
                `/singzone?code=${next.code}&title=${encodeURIComponent(next.title)}&artist=${encodeURIComponent(next.artist)}`
              );
            }}
            className="bg-[#1a1a1a] px-4 py-3 border-b border-white/10 cursor-pointer hover:bg-[#1a1a1a]/80 transition"
          >
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="bg-[#FF6B00] text-white text-xs font-bold px-2 py-1 rounded">
                  UP NEXT
                </span>
                <span className="text-[#FF6B00] font-bold text-sm">{queue[0].code}</span>
                <span className="text-white text-sm truncate">{queue[0].title}</span>
                <span className="text-white/50 text-sm truncate">- {queue[0].artist}</span>
                {queue.length > 1 && (
                  <span className="text-white/50 text-xs">+{queue.length - 1} more</span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPanelOpen(true);
                }}
                className="text-white/50 hover:text-white text-sm"
              >
                View All
              </button>
            </div>
          </div>
        )}

        {/* Video Player */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <div ref={containerRef} className="w-full h-full" />
          </div>
          {/* Progress Bar */}
          <div className="w-full max-w-5xl mt-2">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF6B00] transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>{formatTime(videoProgress)}</span>
              <span>{formatTime(videoDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#FF6B00] rounded-l-lg py-4 px-2 shadow-lg hover:bg-[#e55f00] transition z-20"
        >
          <span className="text-white text-sm rotate-90">«</span>
        </button>
      )}

      {/* Side Panel - Queue */}
      <div className={`bg-[#1a1a1a] border-l border-white/10 flex flex-col transition-all duration-300 ${isPanelOpen ? "w-80" : "w-0 border-0 overflow-hidden"}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Song Queue</h2>
            <p className="text-sm text-white/50">{queue.length} song(s) in queue</p>
          </div>
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="text-white/50 hover:text-white transition"
          >
            <span className="text-xl">{isPanelOpen ? "»" : "«"}</span>
          </button>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto p-2">
          {queue.length === 0 ? (
            <p className="text-white/50 text-xs text-center py-4">No songs in queue</p>
          ) : (
            <div className="space-y-1">
              {queue.map((song, index) => (
                <div
                  key={`${song.code}-${index}`}
                  className="bg-white/5 rounded px-2 py-1.5 relative group flex items-center gap-2"
                >
                  <button
                    onClick={() => removeFromQueue(index)}
                    className="text-white/30 hover:text-red-500 transition text-xs"
                  >
                    ×
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-[#FF6B00] font-bold text-xs mr-2">{song.code}</span>
                    <span className="text-white text-xs truncate">{song.title}</span>
                    <span className="text-white/50 text-xs truncate ml-1">- {song.artist}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="p-4 border-t border-white/10">
          <input
            type="text"
            placeholder="Search code, title, or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[#FF6B00]"
          />

          {/* Search Results */}
          {searchQuery && (
            <div className="mt-3 max-h-60 overflow-y-auto rounded-lg bg-[#2a2a2a] border border-white/10">
              {searchResults.length > 0 ? (
                searchResults.map((song) => (
                  <button
                    key={song.code}
                    onClick={() => addToQueue(song)}
                    className="w-full text-left px-4 py-3 hover:bg-[#FF6B00]/20 transition border-b border-white/5 last:border-b-0"
                  >
                    <p className="text-[#FF6B00] font-bold text-sm">{song.code}</p>
                    <p className="text-white text-sm truncate">{song.title}</p>
                    <p className="text-white/50 text-xs truncate">{song.artist}</p>
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-white/50 text-sm text-center">
                  No songs found
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Extend Window interface for YouTube API
interface YouTubePlayerConstructor {
  new (element: HTMLElement, options: {
    videoId: string;
    playerVars?: Record<string, number>;
    events?: {
      onReady?: () => void;
      onStateChange?: (event: { data: number }) => void;
    };
  }): YouTubePlayer;
}

interface YouTubeAPI {
  Player: YouTubePlayerConstructor;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT: YouTubeAPI;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function Singzone() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
          <p className="text-white/70">Loading...</p>
        </div>
      }
    >
      <SingzoneContent />
    </Suspense>
  );
}
