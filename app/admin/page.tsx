"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import {
  AdminLogin,
  AdminSidebar,
  DashboardCharts,
  SongList,
  SongModal,
  VideoPreviewModal,
} from "@/components/admin";
import { useAuth } from "@/hooks/useAuth";
import { useSongMutations } from "@/hooks/useSongMutations";

type Song = Database["public"]["Tables"]["songs"]["Row"];
type TabType = "dashboard" | "songs";

export default function Admin() {
  // Songs state
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [letterFilter, setLetterFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Form state
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const isEditing = editingSong !== null;

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Preview state
  const [previewSong, setPreviewSong] = useState<Song | null>(null);

  // Track if we've fetched songs to avoid cascading renders
  const hasFetchedSongs = useRef(false);
  const prevAuthRef = useRef(false);

  // Fetch songs from Supabase
  const fetchSongs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("code", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setSongs(data || []);
    }
    setLoading(false);
  }, []);

  // Auth hook
  const {
    isAuthenticated,
    mounted,
    authError,
    passwordInput,
    showPassword,
    setPasswordInput,
    setShowPassword,
    handleLogin,
    handleLogout,
  } = useAuth({
    onAuthSuccess: fetchSongs,
  });

  // Song mutations hook
  const {
    submitting,
    submitError,
    submitSuccess,
    setSubmitSuccess,
    deletingCode,
    handleSubmit: mutationHandleSubmit,
    handleDelete,
    setSubmitError,
  } = useSongMutations({
    songs,
    onSongsChange: setSongs,
    onError: setError,
    onSuccess: () => {},
  });

  // Compute next available code
  const getNextCode = useCallback((): string => {
    if (songs.length === 0) return "0001";
    const maxCode = songs.reduce((max, song) => {
      const num = parseInt(song.code, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    return String(maxCode + 1).padStart(4, "0");
  }, [songs]);

  // Fetch songs when auth state changes from unauthenticated to authenticated
  useEffect(() => {
    if (isAuthenticated && !hasFetchedSongs.current && prevAuthRef.current !== isAuthenticated) {
      hasFetchedSongs.current = true;
      fetchSongs();
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, fetchSongs]);

  // Form handlers
  const resetForm = () => {
    setCode("");
    setTitle("");
    setArtist("");
    setYoutubeId("");
    setSubmitError(null);
    setSubmitSuccess(false);
    setEditingSong(null);
  };

  const openAddModal = () => {
    resetForm();
    setCode(getNextCode());
    setIsAddModalOpen(true);
  };

  const openEditModal = (song: Song) => {
    setEditingSong(song);
    setCode(song.code);
    setTitle(song.title);
    setArtist(song.artist);
    setYoutubeId(song.youtube_id);
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    mutationHandleSubmit(
      e,
      { code, title, artist, youtubeId },
      isEditing,
      editingSong,
      resetForm,
      closeAddModal
    );
  };

  // Show loading until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <AdminLogin
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        authError={authError}
        onLogin={handleLogin}
      />
    );
  }

  // Main admin page
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />

      <div className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="sticky top-0 z-50 bg-[#0D0D0D] border-b border-white/10 px-6 py-4">
          <h1 className="text-2xl font-bold">
            {activeTab === "dashboard" ? "Dashboard" : "Song Management"}
          </h1>
        </div>

        <div className="p-6">
          {activeTab === "dashboard" ? (
            <DashboardCharts songs={songs} />
          ) : (
            <SongList
              songs={songs}
              loading={loading}
              error={error}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              letterFilter={letterFilter}
              setLetterFilter={setLetterFilter}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              deletingCode={deletingCode}
              onRefresh={fetchSongs}
              onAddSong={openAddModal}
              onPreview={setPreviewSong}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onDismissError={() => setError(null)}
            />
          )}
        </div>
      </div>

      <SongModal
        isOpen={isAddModalOpen}
        isEditing={isEditing}
        code={code}
        title={title}
        artist={artist}
        youtubeId={youtubeId}
        submitting={submitting}
        submitError={submitError}
        submitSuccess={submitSuccess}
        onCodeChange={setCode}
        onTitleChange={setTitle}
        onArtistChange={setArtist}
        onYoutubeIdChange={setYoutubeId}
        onSubmit={handleSubmit}
        onClose={closeAddModal}
      />

      <VideoPreviewModal
        song={previewSong}
        onClose={() => setPreviewSong(null)}
      />
    </div>
  );
}
