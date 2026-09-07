"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Song } from "@/lib/database.types";

interface QueuedSong {
  code: string;
  title: string;
  artist: string;
  youtubeId: string;
}

interface UseSongQueueOptions {
  songs: Song[];
}

export function useSongQueue({ songs }: UseSongQueueOptions) {
  const router = useRouter();
  const [queue, setQueue] = useState<QueuedSong[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [letterFilter, setLetterFilter] = useState<string | null>(null);
  const queueRef = useRef<QueuedSong[]>([]);

  // Keep queueRef in sync
  const syncQueueRef = useCallback((newQueue: QueuedSong[]) => {
    queueRef.current = newQueue;
    setQueue(newQueue);
  }, []);

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

  const addToQueue = useCallback((song: Song) => {
    const queuedSong: QueuedSong = {
      code: song.code,
      title: song.title,
      artist: song.artist,
      youtubeId: song.youtube_id,
    };

    if (!queueRef.current.find((q) => q.code === song.code)) {
      const newQueue = [...queueRef.current, queuedSong];
      syncQueueRef(newQueue);
    }
    setSearchQuery("");
  }, [syncQueueRef]);

  const removeFromQueue = useCallback((index: number) => {
    const newQueue = [...queueRef.current];
    newQueue.splice(index, 1);
    syncQueueRef(newQueue);
  }, [syncQueueRef]);

  const playNow = useCallback((index: number) => {
    const song = queueRef.current[index];
    const newQueue = queueRef.current.slice(index + 1);
    syncQueueRef(newQueue);
    router.replace(
      `/singzone?code=${song.code}&title=${encodeURIComponent(
        song.title
      )}&artist=${encodeURIComponent(song.artist)}&youtubeId=${encodeURIComponent(
        song.youtubeId
      )}`
    );
    return { ...song };
  }, [router, syncQueueRef]);

  const playNext = useCallback(() => {
    const currentQueue = queueRef.current;
    if (currentQueue.length > 0) {
      const next = currentQueue[0];
      const newQueue = currentQueue.slice(1);
      syncQueueRef(newQueue);
      router.replace(
        `/singzone?code=${next.code}&title=${encodeURIComponent(
          next.title
        )}&artist=${encodeURIComponent(next.artist)}&youtubeId=${encodeURIComponent(
          next.youtubeId
        )}`
      );
      return { ...next };
    }
    return null;
  }, [router, syncQueueRef]);

  return {
    queue,
    searchQuery,
    letterFilter,
    searchResults,
    setSearchQuery,
    setLetterFilter,
    addToQueue,
    removeFromQueue,
    playNow,
    playNext,
  };
}
