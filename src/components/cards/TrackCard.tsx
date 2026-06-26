"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Heart, Plus } from "lucide-react";
import { usePlayer } from "../../contexts/PlayerContext";
import { useLibrary } from "../../contexts/LibraryContext";
import type { PlayerTrack } from "../../contexts/PlayerContext";
import { cn } from "../../lib/utils";

interface TrackCardProps {
  track: PlayerTrack;
  onAddToPlaylist: (track: PlayerTrack) => void;
}

export const TrackCard = React.memo(function TrackCard({
  track,
  onAddToPlaylist,
}: TrackCardProps) {
  const { setTrack } = usePlayer();
  const { isFavorite, toggleFavorite, addToRecentlyPlayed } = useLibrary();

  const handlePlay = () => {
    setTrack(track);
    addToRecentlyPlayed(track);
  };

  const fav = isFavorite(track.id);

  return (
    <article className="group flex flex-col rounded-2xl bg-surface/40 p-3 border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:bg-surface-hover hover:border-primary/30 hover:shadow-2xl">
      {/* Thumbnail */}
      <Link
        href={`/track/${track.id}`}
        className="relative block aspect-square w-full overflow-hidden rounded-xl bg-surface"
      >
        {track.thumbnail ? (
          <Image
            src={track.thumbnail}
            alt={`${track.title} kapak görseli`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted text-sm">
            Kapak yok
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex items-end justify-end p-2 pointer-events-none">
          <div className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
            DETAY
          </div>
        </div>
      </Link>

      {/* Bilgi */}
      <div className="mt-3 flex flex-1 flex-col gap-0.5 px-1">
        <h3 className="line-clamp-1 text-sm font-bold text-white group-hover:text-primary transition-colors">
          {track.title}
        </h3>
        <p className="line-clamp-1 text-xs text-muted font-medium">{track.channel}</p>
      </div>

      {/* Aksiyon butonları */}
      <div className="mt-4 flex flex-wrap items-center gap-2 px-1">
        <button
          type="button"
          onClick={handlePlay}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-primary-hover shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_20px_rgba(var(--primary),0.5)]"
        >
          <Play className="h-3.5 w-3.5 fill-black" /> Çal
        </button>

        {/* Favori */}
        <button
          type="button"
          onClick={() => toggleFavorite(track.id, track)}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            fav
              ? "bg-primary/20 text-primary"
              : "bg-white/5 text-muted hover:bg-white/10 hover:text-white"
          )}
          title={fav ? "Favorilerden çıkar" : "Favorilere ekle"}
        >
          <Heart className={cn("h-4 w-4", fav && "fill-primary")} />
        </button>

        {/* Listeye ekle */}
        <button
          type="button"
          onClick={() => onAddToPlaylist(track)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted transition-colors hover:bg-white/10 hover:text-white"
          title="Listeye ekle"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
});
