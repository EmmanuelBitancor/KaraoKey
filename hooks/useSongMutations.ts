"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Song = Database["public"]["Tables"]["songs"]["Row"];

interface UseSongMutationsOptions {
  songs: Song[];
  onSongsChange: (songs: Song[]) => void;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export function useSongMutations({
  songs,
  onSongsChange,
  onError,
  onSuccess,
}: UseSongMutationsOptions) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const handleSubmit = useCallback(async (
    e: React.FormEvent,
    formData: { code: string; title: string; artist: string; youtubeId: string },
    isEditing: boolean,
    editingSong: Song | null,
    onResetForm: () => void,
    onClose: () => void
  ) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const { code, title, artist, youtubeId } = formData;

    if (!/^\d{4}$/.test(code)) {
      setSubmitError("Code must be exactly 4 digits (e.g., 0021)");
      setSubmitting(false);
      return;
    }

    if (!title.trim()) {
      setSubmitError("Title is required");
      setSubmitting(false);
      return;
    }

    if (!artist.trim()) {
      setSubmitError("Artist is required");
      setSubmitting(false);
      return;
    }

    const youtubeIdValue = youtubeId.trim() || "UkX9XP4urcM";

    if (isEditing && editingSong) {
      const { error } = await supabase
        .from("songs")
        .update({
          title: title.trim(),
          artist: artist.trim(),
          youtube_id: youtubeIdValue,
        })
        .eq("code", editingSong.code);

      if (error) {
        setSubmitError(error.message);
      } else {
        setSubmitSuccess(true);
        onSuccess("Song updated successfully!");
        // Refresh songs list
        const { data } = await supabase
          .from("songs")
          .select("*")
          .order("code", { ascending: true });
        if (data) onSongsChange(data);
        setTimeout(() => {
          onResetForm();
          onClose();
        }, 1500);
      }
    } else {
      const { error } = await supabase.from("songs").insert({
        code,
        title: title.trim(),
        artist: artist.trim(),
        youtube_id: youtubeIdValue,
      });

      if (error) {
        if (error.code === "23505") {
          setSubmitError(`Song with code "${code}" already exists`);
        } else {
          setSubmitError(error.message);
        }
      } else {
        setSubmitSuccess(true);
        onSuccess("Song added successfully!");
        // Refresh songs list
        const { data } = await supabase
          .from("songs")
          .select("*")
          .order("code", { ascending: true });
        if (data) onSongsChange(data);
        setTimeout(() => {
          onResetForm();
          onClose();
        }, 1500);
      }
    }

    setSubmitting(false);
  }, [onSongsChange, onSuccess]);

  const handleDelete = useCallback(async (songCode: string) => {
    setDeletingCode(songCode);
    const { error } = await supabase.from("songs").delete().eq("code", songCode);

    if (error) {
      onError(error.message);
    } else {
      onSongsChange(songs.filter((s) => s.code !== songCode));
    }
    setDeletingCode(null);
  }, [songs, onSongsChange, onError]);

  return {
    submitting,
    submitError,
    submitSuccess,
    setSubmitSuccess,
    deletingCode,
    handleSubmit,
    handleDelete,
    setSubmitError,
  };
}
