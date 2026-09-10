"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import {
  SingzoneHeader,
  SingzoneQueuePanel,
  SingzoneVideoPlayer,
  QueuePreviewBanner,
  SingzoneScoring,
} from "@/components/singzone";
import { useSongQueue } from "@/hooks/useSongQueue";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";

type Song = Database["public"]["Tables"]["songs"]["Row"];

interface CurrentSong {
  code: string;
  title: string;
  artist: string;
  youtubeId: string;
}

interface QueuedSong {
  code: string;
  title: string;
  artist: string;
  youtubeId: string;
}

function SingzoneContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "0000";
  const title = searchParams.get("title") || "Unknown Song";
  const artist = searchParams.get("artist") || "Unknown Artist";
  const youtubeIdParam = searchParams.get("youtubeId") || "";

  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<CurrentSong>({
    code,
    title,
    artist,
    youtubeId: youtubeIdParam,
  });
  const [playerVideoId, setPlayerVideoId] = useState<string | null>(
    youtubeIdParam || null
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const queueRef = useRef<QueuedSong[]>([]);

  // Fetch songs from Supabase on mount
  useEffect(() => {
    async function loadSongs() {
      const { data } = await supabase
        .from("songs")
        .select("*")
        .order("code", { ascending: true });

      if (data) {
        setSongs(data);
      }
    }
    loadSongs();
  }, []);

  // Fetch youtubeId from Supabase if missing from URL params
  useEffect(() => {
    async function fetchYoutubeId() {
      if (!youtubeIdParam && code) {
        const { data } = await supabase
          .from("songs")
          .select("youtube_id")
          .eq("code", code)
          .single();

        if (data?.youtube_id) {
          setPlayerVideoId(data.youtube_id);
          setCurrentSong((prev) => ({
            ...prev,
            youtubeId: data.youtube_id,
          }));
        }
      }
    }
    fetchYoutubeId();
  }, [code, youtubeIdParam]);

  const exitToHomeRef = useRef<(() => void) | null>(null);

  const handleVideoEnd = useCallback(() => {
    const currentQueue = queueRef.current;
    if (currentQueue.length > 0) {
      const next = currentQueue[0];
      setCurrentSong({
        code: next.code,
        title: next.title,
        artist: next.artist,
        youtubeId: next.youtubeId,
      });
      setPlayerVideoId(next.youtubeId);
      queueRef.current = currentQueue.slice(1);
    } else {
      exitToHomeRef.current?.();
    }
  }, []);

  // YouTube player hook
  const {
    containerRef,
    videoProgress,
    videoDuration,
    isPlaying,
    isExiting,
    formatTime,
    exitToHome,
    play,
    error,
  } = useYouTubePlayer({
    videoId: playerVideoId,
    onVideoEnd: handleVideoEnd,
  });

  useEffect(() => {
    exitToHomeRef.current = exitToHome;
  }, [exitToHome]);

  // Song queue hook
  const {
    queue,
    searchQuery,
    letterFilter,
    setSearchQuery,
    setLetterFilter,
    addToQueue,
    removeFromQueue,
    playNow,
  } = useSongQueue({ songs });

  // Keep queueRef in sync
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const handlePlayNextFromBanner = useCallback(() => {
    if (queue.length > 0) {
      const next = queue[0];
      setCurrentSong({
        code: next.code,
        title: next.title,
        artist: next.artist,
        youtubeId: next.youtubeId,
      });
      setPlayerVideoId(next.youtubeId);
      queueRef.current = queue.slice(1);
    }
  }, [queue]);

  const handleScore = useCallback((_score: number) => {
    // score is handled internally by SingzoneScoring
  }, []);

return (
    <div className={`min-h-screen bg-[#0D0D0D] text-white flex flex-col md:flex-row relative transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}>
      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isPanelOpen ? "md:blur-sm opacity-50 pointer-events-none md:pointer-events-auto" : ""
      }`}>
        <SingzoneHeader />

        <QueuePreviewBanner
          queue={queue}
          onPlayNext={handlePlayNextFromBanner}
          onOpenPanel={() => setIsPanelOpen(true)}
        />

        <SingzoneVideoPlayer
          ref={containerRef}
          videoProgress={videoProgress}
          videoDuration={videoDuration}
          formatTime={formatTime}
          isPlaying={isPlaying}
          onPlay={play}
          error={error}
        />

        <div className="w-full max-w-5xl mt-4 px-4">
          <SingzoneScoring isPlaying={isPlaying} onScore={handleScore} />
        </div>
      </div>

      {/* Floating Toggle Button */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#FF6B00] rounded-l-lg py-4 px-2 shadow-lg hover:bg-[#e55f00] transition z-20 tv-card md:block hidden"
          tabIndex={0}
          role="button"
          aria-label="Open queue panel"
        >
          <span className="text-white text-sm rotate-90">«</span>
        </button>
      )}

      {/* Mobile queue toggle - only show when panel is CLOSED */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="md:hidden fixed bottom-4 right-4 bg-[#FF6B00] text-white p-3 rounded-full shadow-lg z-30 tv-card"
          tabIndex={0}
          role="button"
          aria-label="Open queue"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      )}

      {/* Backdrop for mobile - must be sibling to panel for proper z-index */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden bg-black/50"
          onClick={() => setIsPanelOpen(false)}
        />
      )}

      {/* Queue Panel - sidebar on desktop, overlay on mobile */}
      <div
        className={`
          fixed inset-0 z-30 md:relative md:z-auto
          flex flex-col bg-[#1a1a1a] md:bg-transparent
          transition-all duration-300 ease-in-out
          ${isPanelOpen
            ? "translate-x-0 w-full md:w-80"
            : "translate-x-full md:w-0 md:border-0 md:overflow-hidden"}
          ${isPanelOpen ? "md:border-l md:border-white/10" : ""}
        `}
      >
        {/* Mobile close button - must be above content (z-20) */}
        <button
          onClick={() => setIsPanelOpen(false)}
          className="md:hidden absolute top-4 right-4 text-white/50 hover:text-white transition tv-card z-30"
          tabIndex={0}
          role="button"
          aria-label="Close panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto relative z-20">
          <SingzoneQueuePanel
            isPanelOpen={isPanelOpen}
            queue={queue}
            searchQuery={searchQuery}
            letterFilter={letterFilter}
            songs={songs}
            onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
            onSearchChange={setSearchQuery}
            onLetterFilterChange={setLetterFilter}
            onAddToQueue={addToQueue}
            onRemoveFromQueue={removeFromQueue}
            onPlayNow={playNow}
          />
        </div>
      </div>
    </div>
  );
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
