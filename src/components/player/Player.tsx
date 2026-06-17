"use client";

import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { useEffect, useRef, useState, useCallback } from "react";
import { usePlayer } from "../../contexts/PlayerContext";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, ChevronDown, MonitorPlay, Music, Heart, ListPlus } from "lucide-react";
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

export function Player() {
  const {
    current,
    isPlaying,
    isLooping,
    isShuffle,
    volume,
    currentTime,
    duration,
    queue,
    queueIndex,
    setPlaying,
    setLooping,
    setShuffle,
    setVolume,
    setTime,
    setDuration,
    playNext,
    playPrev,
  } = usePlayer();

  const { isFavorite, toggleFavorite } = useLibrary();
  const { t } = useI18n();

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<YouTubePlayer | null>(null);
  const [seeking, setSeeking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const seekingRef = useRef(seeking);
  const isVideoModeRef = useRef(isVideoMode);

  useEffect(() => {
    seekingRef.current = seeking;
  }, [seeking]);

  useEffect(() => {
    isVideoModeRef.current = isVideoMode;
  }, [isVideoMode]);

  // ── Native Audio: Ses modunda arka planda çalma ────────────────

  // Audio element src güncelleme
  useEffect(() => {
    if (!current) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (!isVideoMode) {
      const newSrc = `/api/audio/${current.id}`;
      // Sadece farklı bir şarkıysa yeniden yükle
      if (!audio.src.endsWith(newSrc)) {
        audio.src = newSrc;
        audio.load();
        setAudioError(false);
        if (isPlaying) {
          audio.play().catch(() => setAudioError(true));
        }
      }
    }
  }, [current, isVideoMode, isPlaying]);

  // Play/Pause senkronizasyonu (ses modu)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isVideoMode) return;

    if (isPlaying) {
      audio.play().catch(() => setAudioError(true));
    } else {
      audio.pause();
    }
  }, [isPlaying, isVideoMode]);

  // Ses seviyesi senkronizasyonu
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
    if (ytPlayerRef.current) {
      void ytPlayerRef.current.setVolume(volume);
    }
  }, [volume]);

  // Native audio event listener'ları
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!seekingRef.current && !isVideoModeRef.current) {
        setTime(audio.currentTime);
      }
    };

    const onDurationChange = () => {
      if (!isVideoModeRef.current && audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      if (isVideoModeRef.current) return;
      if (queue.length > 0 && queueIndex >= 0) {
        playNext();
      } else if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        setPlaying(false);
      }
    };

    const onPlay = () => {
      if (!isVideoModeRef.current) setPlaying(true);
    };

    const onPause = () => {
      // Sadece kullanıcı gerçekten durdurduysa (arka planda değilse)
      if (!isVideoModeRef.current && !document.hidden) {
        setPlaying(false);
      }
    };

    const onError = () => {
      if (!isVideoModeRef.current) {
        console.error("[Player] Audio yükleme hatası:", audio.error);
        setAudioError(true);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, [setTime, setDuration, setPlaying, playNext, queue, queueIndex, isLooping]);

  // ── Media Session API (Bildirim çubuğu kontrolleri) ────────────

  useEffect(() => {
    if (!current) return;
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.channel,
      artwork: [
        { src: current.thumbnail, sizes: "512x512", type: "image/jpeg" },
      ],
    });

    navigator.mediaSession.setActionHandler("play", () => {
      setPlaying(true);
      if (!isVideoMode) audioRef.current?.play().catch(() => {});
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      setPlaying(false);
      if (!isVideoMode) audioRef.current?.pause();
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => playPrev());
    navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null && audioRef.current) {
        audioRef.current.currentTime = details.seekTime;
        setTime(details.seekTime);
      }
    });
  }, [current, isVideoMode, setPlaying, playPrev, playNext, setTime]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  // ── Video Modu: YouTube iframe (arka planda çalışmaz) ──────────

  // Video modu geçişleri
  const switchToVideoMode = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setIsVideoMode(true);
  }, []);

  const switchToAudioMode = useCallback(() => {
    if (ytPlayerRef.current) {
      void ytPlayerRef.current.pauseVideo();
    }
    setIsVideoMode(false);
    // Audio element yeniden yüklenecek (useEffect ile)
  }, []);

  // YouTube iframe event handlers
  const handleYTReady = (event: YouTubeEvent<number>) => {
    ytPlayerRef.current = event.target;
    void event.target.setVolume(volume);
    if (isVideoMode) {
      const d = (event.target.getDuration?.() as number) ?? 0;
      if (d) setDuration(d);
      if (isPlaying) void event.target.playVideo();
    }
  };

  const handleYTStateChange = (event: YouTubeEvent<number>) => {
    if (!isVideoMode) return;
    const ytState = event.data;
    if (ytState === 1) {
      setPlaying(true);
      const d = (event.target.getDuration?.() as number) ?? 0;
      if (d) setDuration(d);
    } else if (ytState === 2) {
      setPlaying(false);
    }
  };

  const handleYTEnded = () => {
    if (!isVideoMode) return;
    if (queue.length > 0 && queueIndex >= 0) {
      playNext();
    } else if (isLooping && ytPlayerRef.current) {
      void ytPlayerRef.current.seekTo(0, true);
      void ytPlayerRef.current.playVideo();
    } else {
      setPlaying(false);
    }
  };

  // Video modunda play/pause senkronizasyonu
  useEffect(() => {
    if (!isVideoMode || !ytPlayerRef.current) return;
    if (isPlaying) {
      void ytPlayerRef.current.playVideo();
    } else {
      void ytPlayerRef.current.pauseVideo();
    }
  }, [isPlaying, isVideoMode]);

  // Video modunda zaman takibi
  useEffect(() => {
    if (!isVideoMode) return;
    const id = window.setInterval(() => {
      if (!ytPlayerRef.current || seekingRef.current) return;
      const t = ytPlayerRef.current.getCurrentTime?.() ?? 0;
      const d = ytPlayerRef.current.getDuration?.() ?? 0;
      setTime(t);
      if (d && isFinite(d)) setDuration(d);
    }, 250);
    return () => window.clearInterval(id);
  }, [isVideoMode, setTime, setDuration]);

  // ── Kullanıcı etkileşim handler'ları ───────────────────────────

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPlaying(!isPlaying);
  };
  const toggleLoop = () => setLooping(!isLooping);
  const toggleShuffle = () => setShuffle(!isShuffle);

  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeeking(true);
    const nextTime = (Number(e.target.value) / 100) * (duration || 0);
    setTime(nextTime);
  };

  const handleSeekCommit = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const value = Number((e.target as HTMLInputElement).value);
    const nextTime = (value / 100) * (duration || 0);
    setSeeking(false);

    if (isVideoMode) {
      if (ytPlayerRef.current && duration) {
        void ytPlayerRef.current.seekTo(nextTime, true);
        if (isPlaying) void ytPlayerRef.current.playVideo();
      }
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = nextTime;
      }
    }
  };

  if (!current) return null;

  const hasQueue = queue.length > 0;
  const fav = isFavorite(current.id);

  return (
    <>
      {/* Native Audio Element — arka planda çalma için */}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        className="hidden"
      />

      {/* Mini Player */}
      <div 
        className={cn(
          "fixed left-2 right-2 md:left-4 md:right-4 z-40 transition-all duration-500 ease-in-out cursor-pointer",
          isExpanded ? "opacity-0 translate-y-10 pointer-events-none" : "opacity-100 translate-y-0",
          "bottom-20 md:bottom-4"
        )}
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface/90 px-3 py-2 shadow-2xl backdrop-blur-xl">
          {/* Progress bar (top edge) */}
          <div className="absolute top-0 left-2 right-2 h-[2px] bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
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
          "fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-3xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isExpanded ? "translate-y-0" : "translate-y-full"
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
          
          {/* Audio / Video Toggle */}
          <div className="flex bg-white/10 p-1 rounded-full backdrop-blur-md">
            <button
              onClick={switchToAudioMode}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-colors",
                !isVideoMode ? "bg-white/20 text-white" : "text-muted hover:text-white"
              )}
            >
              <Music className="h-4 w-4" /> {t("player.audio")}
            </button>
            <button
              onClick={switchToVideoMode}
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
          )}>
            {/* YouTube Player — sadece video modunda aktif */}
            <div className={cn(
              "absolute inset-0 w-full h-full",
              isVideoMode ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 -z-10 pointer-events-none"
            )}>
              <YouTube
                videoId={current.id}
                opts={{
                  height: "100%",
                  width: "100%",
                  playerVars: { autoplay: isVideoMode ? 1 : 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0, playsinline: 1 },
                }}
                onReady={handleYTReady}
                onEnd={handleYTEnded}
                onStateChange={handleYTStateChange}
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
              {/* Audio hata göstergesi */}
              {audioError && !isVideoMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <p className="text-sm text-muted text-center px-4">
                    Ses akışı yüklenemedi. Video moduna geçmeyi dene.
                  </p>
                </div>
              )}
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

          {/* Scrub Bar */}
          <div className="mb-6">
            <div className="relative w-full h-2 group">
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={handleSeekChange}
                onMouseUp={handleSeekCommit}
                onTouchEnd={handleSeekCommit}
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

          {/* Main Controls */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={toggleShuffle} className={cn("p-3 transition-colors", isShuffle ? "text-primary" : "text-muted hover:text-white")}>
              <Shuffle className="h-6 w-6" />
            </button>
            <button onClick={playPrev} disabled={!hasQueue} className="p-3 text-white hover:text-primary transition-colors disabled:opacity-50">
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
