"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "../contexts/PlayerContext";
import { useLibrary } from "../contexts/LibraryContext";
import { PlaylistDetail } from "../components/cards/PlaylistDetail";
import { MainLayout } from "../components/layout/MainLayout";
import { SearchBar } from "../components/ui/SearchBar";

import { MediaCard } from "../components/cards/MediaCard";
import { HorizontalList } from "../components/ui/HorizontalList";
import { MoodHeader } from "../components/ui/MoodHeader";
import { useDebounce } from "../hooks/useDebounce";
import type { PlayerTrack } from "../contexts/PlayerContext";
import type { Tab } from "../components/layout/MobileBottomNav";
import type { YouTubeSearchResponse } from "../types/youtube";
import { Play, Heart, Plus, ChevronRight, Search } from "lucide-react";
import { cn, shuffleArray } from "../lib/utils";
import { useI18n } from "../contexts/I18nContext";

type Track = PlayerTrack;

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; tracks: Track[] };

const MIN_QUERY_LENGTH = 2;

export default function Home() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query.trim(), 500);
  const [searchState, setSearchState] = useState<SearchState>({ status: "idle" });

  // Navigasyon state'i
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // "Listeye Ekle" modal state'i
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);
  const [newPlaylistInput, setNewPlaylistInput] = useState("");

  const { t } = useI18n();

  const { setTrack } = usePlayer();
  const {
    playlists,
    favorites,
    recentlyPlayed,
    trackMap,
    isFavorite,
    createPlaylist,
    addToPlaylist,
    toggleFavorite,
    addToRecentlyPlayed,
    isHydrated,
  } = useLibrary();

  // Arama efekti
  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setSearchState({ status: "idle" });
      return;
    }
    let cancelled = false;
    const search = async () => {
      try {
        setSearchState({ status: "loading" });
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (!res.ok) {
          const err = await res.json().catch(() => null) as { error?: string } | null;
          throw new Error(err?.error ?? t("home.somethingWentWrong"));
        }
        const data = await res.json() as YouTubeSearchResponse;
        if (cancelled) return;
        const tracks: Track[] = (data.items ?? []).map((item) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails?.high?.url ?? "",
        }));
        setSearchState({ status: "success", tracks });
      } catch (error) {
        if (cancelled) return;
        setSearchState({
          status: "error",
          message: (error as Error)?.message ?? t("home.somethingWentWrong"),
        });
      }
    };
    void search();
    return () => { cancelled = true; };
  }, [debouncedQuery, t]);

  const hasResults = searchState.status === "success" && searchState.tracks.length > 0;

  // "Listeye Ekle" modal işleyicileri
  const openAddToPlaylist = (track: Track) => {
    setAddToPlaylistTrack(track);
    setNewPlaylistInput("");
  };

  const handleAddToExistingPlaylist = (playlistId: string) => {
    if (!addToPlaylistTrack) return;
    addToPlaylist(playlistId, addToPlaylistTrack);
    setAddToPlaylistTrack(null);
  };

  const handleCreateAndAdd = () => {
    if (!newPlaylistInput.trim()) return;
    createPlaylist(newPlaylistInput.trim());
    setAddToPlaylistTrack(null);
  };

  // Tab değişince playlist seçimini sıfırla
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab !== "library") setSelectedPlaylistId(null);
  };

  const favoriteTracks = useMemo(
    () => favorites.map((id) => trackMap[id]).filter((t): t is Track => t !== undefined),
    [favorites, trackMap],
  );

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId) ?? null;

  const mockRecommendations = useMemo(() => {
    const unique = [...recentlyPlayed, ...favoriteTracks].filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i,
    );
    return shuffleArray(unique).slice(0, 8);
  }, [recentlyPlayed, favoriteTracks]);

  // ── Mini Track Satırı ─────────────────────
  const TrackRow = ({ track }: { track: Track }) => (
    <div className="group flex items-center gap-3 rounded-2xl bg-surface/50 px-3 py-2.5 transition-colors hover:bg-surface-hover cursor-pointer border border-white/5">
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-surface">
        <Image
          src={track.thumbnail}
          alt={track.title}
          width={48}
          height={48}
          quality={60}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
          <button 
            onClick={(e) => { e.stopPropagation(); setTrack(track); addToRecentlyPlayed(track); }}
            className="p-1.5 rounded-full bg-primary text-black transform translate-y-2 group-hover:translate-y-0 transition-all"
          >
            <Play className="h-4 w-4 fill-black ml-0.5" />
          </button>
        </div>
      </div>
      <div className="min-w-0 flex-1" onClick={() => { setTrack(track); addToRecentlyPlayed(track); }}>
        <p className="truncate text-sm font-semibold text-white">{track.title}</p>
        <p className="truncate text-xs text-muted">{track.channel}</p>
      </div>
      <div className="flex items-center gap-2 pr-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id, track); }}
          className={cn("p-2 rounded-full transition-colors", isFavorite(track.id) ? "text-primary bg-primary/10" : "text-muted hover:text-white hover:bg-white/10")}
        >
          <Heart className={cn("h-4 w-4", isFavorite(track.id) && "fill-primary")} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); openAddToPlaylist(track); }}
          className="p-2 rounded-full text-muted hover:text-white hover:bg-white/10 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // ── Tab İçerikleri ────────────────────────────────────

  const renderHome = () => {
    const handlePlayCard = (track: Track) => {
      setTrack(track);
      addToRecentlyPlayed(track);
    };

    return (
      <div className="space-y-10 pt-4 pb-8">
        <MoodHeader />
        
        <HorizontalList
          title={t("home.recentlyPlayed")}
          onViewAll={() => setActiveTab("library")}
          isLoading={!isHydrated}
          isEmpty={recentlyPlayed.length === 0}
          emptyMessage={t("home.emptyRecentlyPlayed")}
        >
          {recentlyPlayed.map((track) => (
            <MediaCard key={track.id} track={track} onClick={handlePlayCard} />
          ))}
        </HorizontalList>

        <HorizontalList
          title={t("home.madeForYou")}
          isLoading={!isHydrated}
          isEmpty={mockRecommendations.length === 0}
          emptyMessage={t("home.emptyMadeForYou")}
        >
          {mockRecommendations.map((track) => (
            <MediaCard key={track.id} track={track} onClick={handlePlayCard} />
          ))}
        </HorizontalList>

        {/* Hidrasyon tamamlanmadan favoriteTracks her zaman [] olur — bu yüzden
            hidrasyon sürerken bölümü tamamen gizlemek yerine iskelet gösteriyoruz.
            Aksi halde favorisi olan bir kullanıcı için bölüm anlık kaybolup
            tekrar belirir (layout shift). */}
        {(!isHydrated || favoriteTracks.length > 0) && (
          <HorizontalList
            title={t("home.favorites")}
            onViewAll={() => setActiveTab("library")}
            isLoading={!isHydrated}
          >
            {favoriteTracks.map((track) => (
              <MediaCard key={track.id} track={track} onClick={handlePlayCard} />
            ))}
          </HorizontalList>
        )}
      </div>
    );
  };

  const renderExplore = () => (
    <div className="space-y-6 pt-6">
      <SearchBar
        value={query}
        onChange={setQuery}
        minQueryLength={MIN_QUERY_LENGTH}
        status={searchState.status}
        hasResults={hasResults}
      />
      
      {searchState.status === "loading" && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 rounded-2xl bg-surface/50 px-3 py-2.5">
              <div className="h-12 w-12 rounded-xl bg-surface-hover flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 w-1/3 rounded-full bg-surface-hover" />
                <div className="h-2.5 w-1/4 rounded-full bg-surface-hover" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-surface-hover" />
                <div className="h-8 w-8 rounded-full bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {searchState.status === "error" && (
        <div className="rounded-2xl bg-red-950/30 border border-red-500/20 p-6 text-center text-red-200">
          <p className="font-medium text-lg mb-2">{t("home.somethingWentWrong")}</p>
          <p className="text-red-300/80">{searchState.message}</p>
        </div>
      )}
      
      {searchState.status === "success" && !hasResults && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
          <Search className="h-12 w-12 text-muted mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2">{t("home.noResults")}</h2>
          <p className="text-muted">{t("home.noResultsDesc")}</p>
        </div>
      )}
      
      {searchState.status === "success" && hasResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted">
            <span className="font-medium text-white">
              {searchState.tracks.length} {t("home.results")}{query ? ` • "${query}"` : ""}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {searchState.tracks.map((track) => (
              <TrackRow key={track.id} track={track} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderLibrary = () => {
    if (selectedPlaylist) {
      return (
        <div className="pt-6">
          <PlaylistDetail
            playlist={selectedPlaylist}
            onBack={() => setSelectedPlaylistId(null)}
          />
        </div>
      );
    }
    
    return (
      <div className="space-y-10 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{t("home.yourLibrary")}</h1>
          </div>
          <button
            type="button"
            onClick={() => { const name = window.prompt(t("home.promptNewListName")); if (name?.trim()) createPlaylist(name.trim()); }}
            className="flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-bold transition hover:bg-primary/20"
          >
            <Plus className="h-4 w-4" /> {t("home.newList")}
          </button>
        </div>

        {/* Playlists */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">{t("home.playlists")}</h2>
          {!isHydrated ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-surface p-4 h-24" />
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
              <p className="text-muted mb-4">{t("home.noPlaylists")}</p>
              <button
                type="button"
                onClick={() => { const name = window.prompt(t("home.promptNewListName")); if (name?.trim()) createPlaylist(name.trim()); }}
                className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-black transition hover:bg-primary-hover"
              >
                {t("home.createFirstPlaylist")}
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className="group flex items-center gap-4 rounded-2xl bg-surface p-4 text-left border border-white/5 transition-all hover:bg-surface-hover hover:border-primary/30"
                >
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-sky-500/20 text-2xl group-hover:scale-105 transition-transform">
                    ♪
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white text-base mb-1 group-hover:text-primary transition-colors">{pl.name}</p>
                    <p className="truncate text-xs text-muted font-medium">{pl.trackIds.length} {t("home.songs")}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Tüm Favoriler / Son Dinlenenler karma */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" /> {t("home.likedSongs")}
            </h2>
            <div className="space-y-2">
              {!isHydrated ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-surface" />
                ))
              ) : favoriteTracks.length === 0 ? (
                <p className="text-sm text-muted">{t("home.noFavorites")}</p>
              ) : (
                favoriteTracks.map((track) => <TrackRow key={track.id} track={track} />)
              )}
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" /> {t("home.recentlyPlayed")}
            </h2>
            <div className="space-y-2">
              {!isHydrated ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-surface" />
                ))
              ) : recentlyPlayed.length === 0 ? (
                <p className="text-sm text-muted">{t("home.cleanHistory")}</p>
              ) : (
                recentlyPlayed.slice(0, 10).map((track) => <TrackRow key={track.id} track={track} />)
              )}
            </div>
          </div>
        </section>
      </div>
    );
  };

  // ── Ana Render ──────────────────────────────────────────────────────────
  return (
    <MainLayout activeTab={activeTab} onTabChange={handleTabChange} playlistCount={playlists.length}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {activeTab === "home" && renderHome()}
          {activeTab === "explore" && renderExplore()}
          {activeTab === "library" && renderLibrary()}
        </motion.div>
      </AnimatePresence>

      {/* "Listeye Ekle" Modal */}
      {addToPlaylistTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{t("home.addToPlaylist")}</h3>
              <button type="button" onClick={() => setAddToPlaylistTrack(null)} className="p-2 -mr-2 rounded-full text-muted hover:bg-white/10 hover:text-white transition">×</button>
            </div>
            
            <div className="flex items-center gap-4 mb-6 p-3 rounded-2xl bg-white/5 border border-white/5 min-w-0">
              <img src={addToPlaylistTrack.thumbnail} alt="" className="w-12 h-12 flex-shrink-0 rounded-lg object-cover" />
              <p className="truncate text-sm font-semibold text-white flex-1">{addToPlaylistTrack.title}</p>
            </div>

            {playlists.length > 0 && (
              <div className="mb-6 max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => handleAddToExistingPlaylist(pl.id)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-white/10 border border-transparent hover:border-white/5 min-w-0"
                  >
                    <span className="truncate text-sm font-bold text-white flex-1 mr-2">{pl.name}</span>
                    <span className="flex-shrink-0 text-xs text-muted bg-white/5 px-2 py-1 rounded-full">{pl.trackIds.length}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("home.newPlaylistName")}
                value={newPlaylistInput}
                onChange={(e) => setNewPlaylistInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateAndAdd(); }}
                className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none placeholder:text-muted focus:border-primary/50 transition-colors"
              />
              <button
                type="button"
                onClick={handleCreateAndAdd}
                disabled={!newPlaylistInput.trim()}
                className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-black transition hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

