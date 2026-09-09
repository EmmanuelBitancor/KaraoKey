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
  const [isPanelOpen, setIsPanelOpen] = useState(true);
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
    <div
      className={`min-h-screen bg-[#0D0D0D] text-white flex relative transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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
        />

        <div className="w-full max-w-5xl mt-4">
          <SingzoneScoring isPlaying={isPlaying} onScore={handleScore} />
        </div>
      </div>

      {/* Floating Toggle Button */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#FF6B00] rounded-l-lg py-4 px-2 shadow-lg hover:bg-[#e55f00] transition z-20 tv-card"
          tabIndex={0}
          role="button"
          aria-label="Open queue panel"
        >
          <span className="text-white text-sm rotate-90">«</span>
        </button>
      )}

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
