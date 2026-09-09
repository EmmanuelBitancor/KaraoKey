"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface YouTubePlayer {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
}

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

interface UseYouTubePlayerOptions {
  videoId: string | null;
  onVideoEnd?: () => void;
}

export function useYouTubePlayer({ videoId, onVideoEnd }: UseYouTubePlayerOptions) {
  const router = useRouter();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(240);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

  // Initialize YouTube player when videoId changes
  useEffect(() => {
    if (!videoId) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      if (window.YT && containerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            autoplay: 1,
            mute: 0,
            loop: 0,
            playsinline: 1,
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
                  onVideoEnd?.();
                }
              }
            },
            onReady: () => {
              if (playerRef.current) {
                const duration = playerRef.current.getDuration();
                if (duration) setVideoDuration(duration);
                playerRef.current.playVideo();
              }
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (typeof window.YT === "undefined") {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, onVideoEnd]);

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

  const exitToHome = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      router.push("/");
    }, 500);
  }, [router]);

  const play = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === "function") {
      playerRef.current.playVideo();
    }
  }, []);

  return {
    containerRef,
    videoProgress,
    videoDuration,
    isPlaying,
    isExiting,
    formatTime,
    exitToHome,
    play,
  };
}
