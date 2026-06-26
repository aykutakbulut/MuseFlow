"use client";

import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { useEffect, useRef, useState } from "react";
import { usePlayer, usePlayerTime } from "../../contexts/PlayerContext";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, ChevronDown, MonitorPlay, Music, Heart } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLibrary } from "../../contexts/LibraryContext";
import { useI18n } from "../../contexts/I18nContext";

function formatTime(seconds: number) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// Mini player'ın üstündeki ince ilerleme çubuğu — saniyede bir güncellenen
// zamanı sadece bu küçük bileşen tüketir, Player'ın ana gövdesi tetiklenmez.
function MiniProgressBar() {
  const { currentTime, duration } = usePlayerTime();
  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="absolute top-0 left-2 right-2 h-[2px] bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Tam ekran modaldaki kaydırma çubuğu + süre etiketleri — aynı izolasyon
// mantığı. Seek hesaplamasını burada yapıp sonucu (saniye) yukarı bildirir.
function ScrubBar({
  onSeekStart,
  onSeekChange,
  onSeekCommit,
}: {
  onSeekStart: () => void;
  onSeekChange: (time: number) => void;
  onSeekCommit: (time: number) => void;
}) {
  const { currentTime, duration } = usePlayerTime();
  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeekStart();
    const nextTime = (Number(e.target.value) / 100) * (duration || 0);
    onSeekChange(nextTime);
  };

  const handleCommit = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const value = Number((e.target as HTMLInputElement).value);
    const nextTime = (value / 100) * (duration || 0);
    onSeekCommit(nextTime);
  };

  return (
    <div className="mb-6">
      <div className="relative w-full h-2 group">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={handleChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="absolute inset-y-0 left-0 right-0 bg-white/10 rounded-full overflow-hidden pointer-events-none">
          <div
            className="h-full bg-white group-hover:bg-primary transition-colors"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted font-medium mt-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

export function Player() {
  const {
    current,
    isPlaying,
    isLooping,
    isShuffle,
    volume,
    queue,
    setPlaying,
    setLooping,
    setShuffle,
    setTime,
    setDuration,
    playNext,
    playPrev,
  } = usePlayer();

  const { isFavorite, toggleFavorite } = useLibrary();
  const { t } = useI18n();

  const playerRef = useRef<YouTubePlayer | null>(null);
  const [seeking, setSeeking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);

  const seekingRef = useRef(seeking);
  // Son context'e yazdığımız zaman/süre — polling'in context'i okumasına
  // gerek kalmadan (yani Player'ı zaman context'ine bağlamadan) gereksiz
  // setTime/setDuration çağrılarını engellemek için.
  const lastDispatchedTimeRef = useRef(0);
  const lastDispatchedDurationRef = useRef(0);

  useEffect(() => {
    seekingRef.current = seeking;
  }, [seeking]);

  useEffect(() => {
    if (!playerRef.current) return;
    void playerRef.current.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      void playerRef.current.playVideo();
    } else {
      void playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  // Sadece çalarken polling yap — duraklatıldığında interval tamamen
  // durur (boşuna CPU/pil harcamaz). 1sn aralık, ilerleme çubuğu için
  // yeterince akıcı, ama 250ms'e göre 4x daha az re-render üretir.
  useEffect(() => {
    if (!isPlaying) return;

    const id = window.setInterval(() => {
      if (!playerRef.current || seekingRef.current) return;
      const t = playerRef.current.getCurrentTime?.() ?? 0;
      const d = playerRef.current.getDuration?.() ?? 0;
      if (Math.abs(t - lastDispatchedTimeRef.current) > 0.4) {
        lastDispatchedTimeRef.current = t;
        setTime(t);
      }
      if (d && Math.abs(d - lastDispatchedDurationRef.current) > 0.1) {
        lastDispatchedDurationRef.current = d;
        setDuration(d);
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [isPlaying, setTime, setDuration]);

  // Ses modunda video görünmez olsa da arkada decode edilmeye devam eder.
  // Kaliteyi en düşüğe sabitlemek pil/ısı yükünü büyük ölçüde azaltır.
  const applyLowQuality = (player: YouTubePlayer) => {
    try {
      void player.setPlaybackQuality?.("tiny");
    } catch {
      // Bazı tarayıcılarda desteklenmeyebilir, sorun değil
    }
  };

  const handleReady = (event: YouTubeEvent<number>) => {
    playerRef.current = event.target;
    void event.target.setVolume(volume);
    const d = (event.target.getDuration?.() as number) ?? 0;
    if (d) {
      lastDispatchedDurationRef.current = d;
      setDuration(d);
    }
    if (!isVideoMode) applyLowQuality(event.target);
    if (isPlaying) void event.target.playVideo();
  };

  const handleStateChange = (event: YouTubeEvent<number>) => {
    const ytState = event.data;
    if (ytState === 1) {
      setPlaying(true);
      const d = (event.target.getDuration?.() as number) ?? 0;
      if (d) {
        lastDispatchedDurationRef.current = d;
        setDuration(d);
      }
      // YouTube oynatma başladığında kaliteyi otomatik yükseltebilir,
      // ses modundaysak tekrar düşür.
      if (!isVideoMode) applyLowQuality(event.target);
    } else if (ytState === 2) {
      setPlaying(false);
    }
  };

  // Video modundan ses moduna geçişte kaliteyi anında düşür (çalma sürerken geçilirse de)
  useEffect(() => {
    if (!playerRef.current || isVideoMode) return;
    applyLowQuality(playerRef.current);
  }, [isVideoMode]);

  const handleEnded = () => {
    // queueIndex -1 olabilir (örn. tek şarkı çalarken kuyruğa şarkı eklendiğinde) —
    // bu durumda da kuyrukta ilerlenecek şarkı varsa devam edilmeli.
    if (queue.length > 0) {
      playNext();
    } else if (isLooping && playerRef.current) {
      void playerRef.current.seekTo(0, true);
      void playerRef.current.playVideo();
    } else {
      setPlaying(false);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPlaying(!isPlaying);
  };
  const toggleLoop = () => setLooping(!isLooping);
  const toggleShuffle = () => setShuffle(!isShuffle);

  // "Önceki" butonu: 3 saniyeden fazla çalınmışsa şarkıyı baştan başlat,
  // değilse gerçekten önceki şarkıya geç. Kararı GERÇEK oynatıcı zamanına
  // göre veriyoruz (context state 1sn'de bir güncellenip gecikmeli olabilir).
  const handlePlayPrev = () => {
    const t = playerRef.current?.getCurrentTime?.() ?? 0;
    if (playerRef.current && t > 3) {
      void playerRef.current.seekTo(0, true);
      lastDispatchedTimeRef.current = 0;
      setTime(0);
      return;
    }
    playPrev();
  };

  const handleSeekStart = () => setSeeking(true);

  const handleSeekChange = (time: number) => {
    lastDispatchedTimeRef.current = time;
    setTime(time);
  };

  const handleSeekCommit = (time: number) => {
    setSeeking(false);
    lastDispatchedTimeRef.current = time;
    if (playerRef.current) {
      void playerRef.current.seekTo(time, true);
      if (isPlaying) void playerRef.current.playVideo();
    }
  };

  if (!current) return null;

  const hasQueue = queue.length > 0;
  const fav = isFavorite(current.id);

  return (
    <>
      {/* Mini Player */}
      <div
        className={cn(
          "fixed left-2 right-2 md:left-4 md:right-4 z-40 transition-all duration-500 ease-in-out cursor-pointer",
          isExpanded ? "opacity-0 translate-y-10 pointer-events-none" : "opacity-100 translate-y-0",
          "bottom-20 md:bottom-4" // Mobil Nav'ın üstünde, masaüstünde en altta
        )}
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface/90 px-3 py-2 shadow-2xl backdrop-blur-xl">
          <MiniProgressBar />

          <img src={current.thumbnail} alt={current.title} className="h-10 w-10 rounded-md object-cover" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-white">{current.title}</p>
            <p className="truncate text-xs text-muted">{current.channel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(current.id, current); }}
              className="p-2 text-muted hover:text-white transition-colors"
            >
              <Heart className={cn("h-5 w-5", fav && "fill-primary text-primary")} />
            </button>
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:text-primary transition-colors"
            >
              {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Full Player Modal */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-background/95 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isExpanded ? "translate-y-0 backdrop-blur-3xl" : "translate-y-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6">
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 text-muted hover:text-white transition-colors"
          >
            <ChevronDown className="h-7 w-7" />
          </button>

          {/* Audio / Video Toggle (YouTube Music Style) */}
          <div className="flex bg-white/10 p-1 rounded-full backdrop-blur-md">
            <button
              onClick={() => setIsVideoMode(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-colors",
                !isVideoMode ? "bg-white/20 text-white" : "text-muted hover:text-white"
              )}
            >
              <Music className="h-4 w-4" /> {t("player.audio")}
            </button>
            <button
              onClick={() => setIsVideoMode(true)}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-colors",
                isVideoMode ? "bg-white/20 text-white" : "text-muted hover:text-white"
              )}
            >
              <MonitorPlay className="h-4 w-4" /> {t("player.video")}
            </button>
          </div>

          <div className="w-11" /> {/* Spacer for centering */}
        </div>

        {/* Content (Artwork or Video) */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 max-w-4xl mx-auto w-full">
          <div className={cn(
            "w-full max-w-[400px] mx-auto aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 relative bg-black",
            isVideoMode ? "opacity-100 scale-100" : "opacity-100"
          )}>
            {/* Tek bir YouTube Oynatıcı (Müzik kesilmesin diye unmount edilmez) */}
            <div className={cn(
              "absolute inset-0 w-full h-full pointer-events-none",
              isVideoMode ? "opacity-100 z-10" : "opacity-0 -z-10"
            )}>
              <YouTube
                videoId={current.id}
                opts={{
                  height: "100%",
                  width: "100%",
                  playerVars: {
                    autoplay: 1,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    modestbranding: 1,
                    rel: 0,
                    playsinline: 1,
                    iv_load_policy: 3,
                  },
                }}
                onReady={handleReady}
                onEnd={handleEnded}
                onStateChange={handleStateChange}
                className="w-full h-full"
                iframeClassName="w-full h-full"
              />
            </div>

            {/* Sadece Ses Modu (Artwork) */}
            <div className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-500",
              !isVideoMode ? "opacity-100 z-10" : "opacity-0 -z-10"
            )}>
              <img
                src={current.thumbnail}
                alt={current.title}
                className="w-full h-full object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 mb-6 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-4">
              <h2 className="text-2xl font-bold text-white truncate">{current.title}</h2>
              <p className="text-lg text-muted truncate mt-1">{current.channel}</p>
            </div>
            <button
              onClick={() => toggleFavorite(current.id, current)}
              className="p-3 text-muted hover:text-white transition-colors"
            >
              <Heart className={cn("h-7 w-7", fav && "fill-primary text-primary")} />
            </button>
          </div>

          <ScrubBar
            onSeekStart={handleSeekStart}
            onSeekChange={handleSeekChange}
            onSeekCommit={handleSeekCommit}
          />

          {/* Main Controls */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={toggleShuffle} className={cn("p-3 transition-colors", isShuffle ? "text-primary" : "text-muted hover:text-white")}>
              <Shuffle className="h-6 w-6" />
            </button>
            <button onClick={handlePlayPrev} disabled={!hasQueue} className="p-3 text-white hover:text-primary transition-colors disabled:opacity-50">
              <SkipBack className="h-10 w-10 fill-current" />
            </button>
            <button onClick={() => togglePlay()} className="p-5 bg-white text-black rounded-full hover:scale-105 transition-transform">
              {isPlaying ? <Pause className="h-10 w-10 fill-black" /> : <Play className="h-10 w-10 fill-black ml-1" />}
            </button>
            <button onClick={playNext} disabled={!hasQueue} className="p-3 text-white hover:text-primary transition-colors disabled:opacity-50">
              <SkipForward className="h-10 w-10 fill-current" />
            </button>
            <button onClick={toggleLoop} className={cn("p-3 transition-colors", isLooping ? "text-primary" : "text-muted hover:text-white")}>
              <Repeat className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
