"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePlayer } from "../../../contexts/PlayerContext";
import { useLibrary } from "../../../contexts/LibraryContext";
import type { PlayerTrack } from "../../../contexts/PlayerContext";
import type { Playlist } from "../../../contexts/LibraryContext";
import Link from "next/link";
import { useI18n } from "../../../contexts/I18nContext";

// ── Helpers ────────────────────────────────────────────────────────────────

function parseDuration(iso: string): string {
  const match = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "—";
  const h = parseInt(match[1] ?? "0");
  const m = parseInt(match[2] ?? "0");
  const s = parseInt(match[3] ?? "0");
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatCount(count: string): string {
  const n = parseInt(count ?? "0");
  if (Number.isNaN(n)) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}Mr`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}B`;
  return n.toLocaleString("tr-TR");
}

// ── Types ──────────────────────────────────────────────────────────────────

interface VideoDetail {
  id: string;
  title: string;
  description: string;
  channel: string;
  publishedAt: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  likeCount: string;
  tags: string[];
}

interface RelatedTrack {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function TrackPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : (params.id?.[0] ?? "");

  const { setTrack, addToQueue } = usePlayer();
  const {
    playlists,
    isFavorite,
    toggleFavorite,
    addToPlaylist,
    addToRecentlyPlayed,
  } = useLibrary();

  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [related, setRelated] = useState<RelatedTrack[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);

  const { t } = useI18n();

  // Video detaylarını çek
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`/api/video/${id}`)
      .then((r) => r.json())
      .then((data: VideoDetail & { error?: string }) => {
        if (data.error) throw new Error(data.error);
        setVideo(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : t("track.videoFailed"));
      })
      .finally(() => setLoading(false));
  }, [id, t]);

  // İlgili videolar: başlıkla arama
  useEffect(() => {
    if (!video?.title) return;
    setRelatedLoading(true);
    const query = video.title.slice(0, 40);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data: { items?: Array<{ id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails?: { high?: { url: string } } } }> }) => {
        const items = (data.items ?? [])
          .filter((item) => item.id.videoId !== id)
          .slice(0, 8)
          .map((item) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.high?.url ?? "",
          }));
        setRelated(items);
      })
      .catch(() => {})
      .finally(() => setRelatedLoading(false));
  }, [video?.title, id]);

  const track: PlayerTrack | null = video
    ? {
        id: video.id,
        title: video.title,
        channel: video.channel,
        thumbnail: video.thumbnail,
      }
    : null;

  const handlePlay = () => {
    if (!track) return;
    setTrack(track);
    addToRecentlyPlayed(track);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (!track) return;
    addToPlaylist(playlistId, track);
    setShowPlaylistPicker(false);
  };



  // ── Loading / Error ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen text-slate-50">
        <div className="mx-auto max-w-4xl px-4 pb-48 pt-8 sm:px-6">
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-300 transition hover:border-slate-500"
            >
              ←
            </button>
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-800/80" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <div className="aspect-video w-full animate-pulse rounded-2xl bg-slate-800/80" />
              <div className="h-6 w-3/4 animate-pulse rounded-full bg-slate-800/80" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-800/60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen text-slate-50">
        <div className="mx-auto max-w-4xl px-4 pb-48 pt-8 sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
          >
            ← {t("track.back")}
          </button>
          <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-6 text-center">
            <p className="text-base font-medium text-red-300">
              {t("track.videoFailed")}
            </p>
            <p className="mt-1 text-sm text-red-400/80">
              {error ?? t("track.unknownError")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fav = isFavorite(id);

  return (
    <div className="min-h-screen text-slate-50">
      <div className="mx-auto max-w-5xl px-4 pb-48 pt-8 sm:px-6">
        {/* Geri */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {t("track.back")}
        </button>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Sol: Ana içerik */}
          <div className="space-y-5">
            {/* Thumbnail büyük */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full object-cover"
              />
              {/* Büyük oynat butonu overlay */}
              <button
                type="button"
                onClick={handlePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition hover:opacity-100"
                aria-label="Çal"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/90 shadow-lg shadow-emerald-500/40 backdrop-blur">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-7 w-7 translate-x-[2px] text-slate-950"
                  >
                    <path d="M6 4.5v15l12-7.5-12-7.5z" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Başlık & meta */}
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold leading-snug text-slate-50 sm:text-2xl">
                {video.title}
              </h1>
              <p className="text-sm text-slate-400">{video.channel}</p>
              <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                {video.duration && (
                  <span>⏱ {parseDuration(video.duration)}</span>
                )}
                {video.viewCount && video.viewCount !== "0" && (
                  <span>👁 {formatCount(video.viewCount)} {t("track.views")}</span>
                )}
                {video.likeCount && video.likeCount !== "0" && (
                  <span>👍 {formatCount(video.likeCount)} {t("track.likes")}</span>
                )}
              </div>
            </div>

            {/* Eylem butonları */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePlay}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 transition hover:bg-emerald-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M6 4.5v15l12-7.5-12-7.5z" />
                </svg>
                {t("track.play")}
              </button>

              <button
                type="button"
                onClick={() => track && addToQueue(track)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
              >
                {t("track.addToQueue")}
              </button>

              <button
                type="button"
                onClick={() => track && toggleFavorite(id, track)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  fav
                    ? "border-pink-500/50 bg-pink-950/30 text-pink-400"
                    : "border-slate-700/80 bg-slate-900/80 text-slate-200 hover:border-pink-500/40"
                }`}
              >
                ♥ {fav ? t("track.inFavorites") : t("track.addToFavorites")}
              </button>

              <button
                type="button"
                onClick={() => setShowPlaylistPicker(true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400/50"
              >
                ♪ {t("track.addToList")}
              </button>
            </div>

            {/* Açıklama */}
            {video.description && (
              <div className="rounded-2xl bg-slate-950/80 p-4 ring-1 ring-slate-800/90">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {t("track.description")}
                </p>
                <p className="line-clamp-4 text-[12px] leading-relaxed text-slate-400">
                  {video.description}
                </p>
              </div>
            )}
          </div>

          {/* Sağ: İlgili videolar */}
          <aside className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {t("track.relatedSongs")}
            </p>
            {relatedLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex animate-pulse gap-3 rounded-xl bg-slate-950/80 p-2.5 ring-1 ring-slate-800/90"
                >
                  <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-slate-800/80" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 rounded-full bg-slate-800/80" />
                    <div className="h-2.5 w-2/3 rounded-full bg-slate-800/60" />
                  </div>
                </div>
              ))
            ) : related.length === 0 ? (
              <p className="text-[11px] text-slate-600">{t("track.noRelatedSongs")}</p>
            ) : (
              related.map((r) => (
                <Link
                  key={r.id}
                  href={`/track/${r.id}`}
                  className="group flex gap-3 rounded-xl bg-slate-950/80 p-2.5 ring-1 ring-slate-800/90 transition hover:bg-slate-900/80 hover:ring-emerald-500/40"
                >
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.thumbnail}
                      alt={r.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[11px] font-medium leading-tight text-slate-50">
                      {r.title}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {r.channel}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </aside>
        </div>
      </div>

      {/* Playlist picker modal */}
      {showPlaylistPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-slate-700/80 bg-slate-900 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-50">
                {t("track.addToList")}
              </h3>
              <button
                type="button"
                onClick={() => setShowPlaylistPicker(false)}
                className="text-slate-400 transition hover:text-slate-200"
              >
                ×
              </button>
            </div>

            {playlists.length === 0 ? (
              <p className="mb-4 text-sm text-slate-400">
                {t("track.noPlaylistYet")}
              </p>
            ) : (
              <ul className="mb-4 max-h-60 space-y-1.5 overflow-y-auto">
                {playlists.map((pl: Playlist) => (
                  <li key={pl.id}>
                    <button
                      type="button"
                      onClick={() => handleAddToPlaylist(pl.id)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-slate-800/80"
                    >
                      <span className="font-medium text-slate-100">
                        {pl.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {pl.trackIds.length} {t("home.songs")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => setShowPlaylistPicker(false)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              {t("track.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
