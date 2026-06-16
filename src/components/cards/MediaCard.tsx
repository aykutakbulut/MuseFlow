import { Play } from "lucide-react";
import { PlayerTrack } from "../../contexts/PlayerContext";

interface MediaCardProps {
  track: PlayerTrack;
  onClick: (track: PlayerTrack) => void;
}

export function MediaCard({ track, onClick }: MediaCardProps) {
  return (
    <div 
      className="group flex-shrink-0 w-32 md:w-40 flex flex-col gap-3 cursor-pointer"
      onClick={() => onClick(track)}
    >
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-surface-hover shadow-lg">
        <img 
          src={track.thumbnail} 
          alt={track.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="p-3 bg-primary rounded-full text-black transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
            <Play className="h-5 w-5 fill-black ml-0.5" />
          </button>
        </div>
      </div>
      <div className="px-1">
        <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
          {track.title}
        </p>
        <p className="text-xs text-muted truncate mt-0.5">
          {track.channel}
        </p>
      </div>
    </div>
  );
}
