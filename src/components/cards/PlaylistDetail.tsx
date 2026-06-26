"use client";

import { useState } from "react";
import { useLibrary } from "../../contexts/LibraryContext";
import { usePlayer } from "../../contexts/PlayerContext";
import type { Playlist } from "../../contexts/LibraryContext";
import type { PlayerTrack } from "../../contexts/PlayerContext";
import { useI18n } from "../../contexts/I18nContext";
import { shuffleArray } from "../../lib/utils";

interface PlaylistDetailProps {
  playlist: Playlist;
  onBack: () => void;
}

export function PlaylistDetail({ playlist, onBack }: PlaylistDetailProps) {
  const {
    trackMap,
    removeFromPlaylist,
    reorderPlaylist,
    deletePlaylist,
    renamePlaylist,
    isFavorite,
    toggleFavorite,
  } = useLibrary();
  const { playPlaylist, setTrack, addToQueue } = usePlayer();
  const { t } = useI18n();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(playlist.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Playlist'teki şarkıları tam obje olarak çözümle
  const tracks: PlayerTrack[] = playlist.trackIds
    .map((id) => trackMap[id])
    .filter((t): t is PlayerTrack => t !== undefined);

  const handleRenameSubmit = () => {
    if (nameValue.trim() && nameValue.trim() !== playlist.name) {
      renamePlaylist(playlist.id, nameValue.trim());
    }
    setEditingName(false);
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) playPlaylist(tracks);
  };

  const handleShufflePlay = () => {
    if (tracks.length === 0) return;
    const shuffled = shuffleArray(tracks);
    playPlaylist(shuffled);
  };

  const handleDelete = () => {
    deletePlaylist(playlist.id);
    onBack();
  };

  return (
    <div className="space-y-5">
      {/* Başlık & geri */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-300 transition hover:border-slate-500 hover:text-slate-50"
          aria-label="Geri"
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
        </button>

        {/* Playlist adı — inline düzenleme */}
        {editingName ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRenameSubmit();
            }}
            className="flex flex-1 items-center gap-2"
          >
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              className="flex-1 rounded-xl border border-emerald-400/60 bg-slate-900/80 px-3 py-1.5 text-sm font-semibold text-slate-50 outline-none focus:ring-1 focus:ring-emerald-400/50"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-300"
            >
              {t("playlist.save")}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setNameValue(playlist.name);
              setEditingName(true);
            }}
            className="group flex flex-1 items-center gap-2 text-left"
          >
            <h2 className="truncate text-lg font-semibold text-slate-50">
              {playlist.name}
            </h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-3.5 w-3.5 text-slate-500 opacity-0 transition group-hover:opacity-100"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}

        {/* Silme butonu */}
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-500/40 bg-red-950/30 text-red-400 transition hover:bg-red-950/60"
          aria-label={t("playlist.deleteList")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-3.5 w-3.5"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>

      {/* Bilgi satırı & eylem butonları */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-slate-400 ring-1 ring-slate-800/80">
          {tracks.length} {t("home.songs")}
        </span>
        {tracks.length > 0 && (
          <>
            <button
              type="button"
              onClick={handlePlayAll}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/30 transition hover:bg-emerald-500/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3 w-3"
              >
                <path d="M6 4.5v15l12-7.5-12-7.5z" />
              </svg>
              {t("playlist.playAll")}
            </button>
            <button
              type="button"
              onClick={handleShufflePlay}
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-1 text-[11px] font-medium text-sky-300 ring-1 ring-sky-500/30 transition hover:bg-sky-500/30"
            >
              ⇄ {t("playlist.shufflePlay")}
            </button>
          </>
        )}
      </div>

      {/* Şarkı listesi */}
      {tracks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/60 py-12 text-center">
          <p className="text-sm text-slate-400">{t("playlist.emptyPlaylist")}</p>
          <p className="text-[11px] text-slate-500">
            {t("playlist.addSongsFromExplore")}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tracks.map((track, idx) => (
            <li
              key={track.id}
              className="group flex items-center gap-3 rounded-2xl bg-slate-950/80 px-3 py-2 ring-1 ring-slate-800/90 transition hover:bg-slate-900/80"
            >
              {/* Sıra numarası */}
              <span className="w-5 text-center text-[10px] tabular-nums text-slate-500">
                {idx + 1}
              </span>

              {/* Thumbnail */}
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Bilgi */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-slate-50">
                  {track.title}
                </p>
                <p className="truncate text-[10px] text-slate-400">
                  {track.channel}
                </p>
              </div>

              {/* Aksiyon butonları */}
              <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                {/* Yukarı */}
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => reorderPlaylist(playlist.id, idx, idx - 1)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800/80 hover:text-slate-50 disabled:opacity-20"
                  aria-label="Yukarı taşı"
                >
                  ↑
                </button>
                {/* Aşağı */}
                <button
                  type="button"
                  disabled={idx === tracks.length - 1}
                  onClick={() => reorderPlaylist(playlist.id, idx, idx + 1)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800/80 hover:text-slate-50 disabled:opacity-20"
                  aria-label="Aşağı taşı"
                >
                  ↓
                </button>
                {/* Çal */}
                <button
                  type="button"
                  onClick={() => setTrack(track)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-emerald-400 transition hover:bg-emerald-500/10"
                  aria-label="Çal"
                >
                  ▶
                </button>
                {/* Favoriye ekle */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(track.id, track)}
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-lg transition ${
                    isFavorite(track.id)
                      ? "text-pink-400"
                      : "text-slate-500 hover:text-pink-400"
                  }`}
                  aria-label={isFavorite(track.id) ? "Favorilerden çıkar" : "Favorilere ekle"}
                >
                  ♥
                </button>
                {/* Sıraya ekle */}
                <button
                  type="button"
                  onClick={() => addToQueue(track)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800/80 hover:text-slate-50"
                  aria-label="Sıraya ekle"
                  title="Sıraya ekle"
                >
                  +
                </button>
                {/* Kaldır */}
                <button
                  type="button"
                  onClick={() => removeFromPlaylist(playlist.id, track.id)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-red-400/70 transition hover:bg-red-950/40 hover:text-red-400"
                  aria-label={t("playlist.remove")}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Silme onay dialog'u */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-slate-700/80 bg-slate-900 p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-50">
              {t("playlist.deleteList")}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              <span className="font-medium text-slate-200">
                &ldquo;{playlist.name}&rdquo;
              </span>{" "}
              {t("playlist.deleteWarning")}
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                {t("playlist.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
              >
                {t("playlist.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
