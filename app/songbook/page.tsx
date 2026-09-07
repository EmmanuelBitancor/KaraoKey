"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import { SongbookHeader, SongbookTable } from "@/components/songbook";

type Song = Database["public"]["Tables"]["songs"]["Row"];

export default function Songbook() {
  const [search, setSearch] = useState("");
  const [letterFilter, setLetterFilter] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("code", { ascending: true });

    if (!error && data) {
      setSongs(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Filter songs by search query
  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      search === "" ||
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.artist.toLowerCase().includes(search.toLowerCase()) ||
      song.code.includes(search);

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <SongbookHeader search={search} onSearchChange={setSearch} />

      <SongbookTable
        songs={filteredSongs}
        loading={loading}
        letterFilter={letterFilter}
        setLetterFilter={setLetterFilter}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
      />
    </div>
  );
}
