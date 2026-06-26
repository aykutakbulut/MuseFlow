"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

export type PlayerTrack = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
};

// ── State ──────────────────────────────────────────────────────────────────

type PlayerState = {
  current: PlayerTrack | null;
  isPlaying: boolean;
  isLooping: boolean;
  isShuffle: boolean;
  volume: number; // 0-100
  currentTime: number; // saniye
  duration: number; // saniye
  queue: PlayerTrack[];
  queueIndex: number; // -1 = queue dışı (tek şarkı modu)
};

// ── Actions ────────────────────────────────────────────────────────────────

type PlayerAction =
  | { type: "SET_TRACK"; track: PlayerTrack }
  | { type: "SET_PLAYING"; isPlaying: boolean }
  | { type: "SET_LOOPING"; isLooping: boolean }
  | { type: "SET_SHUFFLE"; isShuffle: boolean }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "SET_TIME"; currentTime: number }
  | { type: "SET_DURATION"; duration: number }
  | { type: "ADD_TO_QUEUE"; track: PlayerTrack }
  | { type: "CLEAR_QUEUE" }
  | { type: "PLAY_NEXT" }
  | { type: "PLAY_PREV" }
  | { type: "PLAY_PLAYLIST"; tracks: PlayerTrack[] }
  | { type: "PLAY_AT_INDEX"; index: number };

const initialState: PlayerState = {
  current: null,
  isPlaying: false,
  isLooping: false,
  isShuffle: false,
  volume: 70,
  currentTime: 0,
  duration: 0,
  queue: [],
  queueIndex: -1,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "SET_TRACK":
      // Tek şarkı çalma: önceki bir playlist/queue bağlamından kalan
      // queue'yu temizle — aksi halde şarkı bitince alakasız bir sıradaki
      // şarkıya geçilirdi (eski queue + queueIndex hâlâ aktifmiş gibi).
      return {
        ...state,
        current: action.track,
        isPlaying: true,
        currentTime: 0,
        queue: [],
        queueIndex: -1,
      };

    case "SET_PLAYING":
      return { ...state, isPlaying: action.isPlaying };

    case "SET_LOOPING":
      return { ...state, isLooping: action.isLooping };

    case "SET_SHUFFLE":
      return { ...state, isShuffle: action.isShuffle };

    case "SET_VOLUME":
      return {
        ...state,
        volume: Math.min(100, Math.max(0, action.volume)),
      };

    case "SET_TIME":
      return { ...state, currentTime: Math.max(0, action.currentTime) };

    case "SET_DURATION":
      return { ...state, duration: Math.max(0, action.duration) };

    case "ADD_TO_QUEUE":
      // Zaten queue'da varsa ekleme
      if (state.queue.some((t) => t.id === action.track.id)) return state;
      return { ...state, queue: [...state.queue, action.track] };

    case "CLEAR_QUEUE":
      return { ...state, queue: [], queueIndex: -1 };

    case "PLAY_PLAYLIST": {
      if (action.tracks.length === 0) return state;
      const first = action.tracks[0]!;
      return {
        ...state,
        queue: action.tracks,
        queueIndex: 0,
        current: first,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      };
    }

    case "PLAY_AT_INDEX": {
      const idx = action.index;
      if (idx < 0 || idx >= state.queue.length) return state;
      return {
        ...state,
        queueIndex: idx,
        current: state.queue[idx]!,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      };
    }

    case "PLAY_NEXT": {
      if (state.queue.length === 0) return state;

      let nextIndex: number;
      if (state.isShuffle) {
        // Shuffle: mevcut index dışında rastgele
        const candidates = state.queue
          .map((_, i) => i)
          .filter((i) => i !== state.queueIndex);
        if (candidates.length === 0) return state;
        nextIndex = candidates[Math.floor(Math.random() * candidates.length)]!;
      } else {
        nextIndex = state.queueIndex + 1;
        if (nextIndex >= state.queue.length) {
          // Liste bitti: döngü varsa başa dön, yoksa dur
          if (state.isLooping) {
            nextIndex = 0;
          } else {
            return { ...state, isPlaying: false };
          }
        }
      }

      return {
        ...state,
        queueIndex: nextIndex,
        current: state.queue[nextIndex]!,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      };
    }

    case "PLAY_PREV": {
      // "3 saniyeden fazla çalınmışsa baştan başlat" kararı Player.tsx'te
      // gerçek oynatıcı zamanına göre verilir (handlePlayPrev) — orada
      // "baştan başlat" seçilirse bu action hiç dispatch edilmez. Buraya
      // geldiğinde her zaman gerçekten önceki şarkıya geçilir.
      if (state.queue.length === 0) return state;

      const prevIndex =
        state.queueIndex <= 0
          ? state.queue.length - 1
          : state.queueIndex - 1;

      return {
        ...state,
        queueIndex: prevIndex,
        current: state.queue[prevIndex]!,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      };
    }

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────
//
// currentTime/duration saniyede bir güncellenir; bunları ana context'ten
// AYRI bir context'te tutuyoruz. Aksi halde her saniye değişen bu alanlar
// yüzünden usePlayer() çağıran HER bileşen (Player'ın ana gövdesi, butonlar,
// YouTube iframe sarmalayıcısı dahil) saniyede bir re-render olurdu — bu da
// arka planda çalarken sürekli CPU/pil/ısı tüketiminin başlıca sebeplerinden
// biriydi. Sadece zamana ihtiyaç duyan küçük bileşenler usePlayerTime() kullanır.

type PlayerStateValue = Omit<PlayerState, "currentTime" | "duration"> & {
  // Temel kontroller
  setTrack: (track: PlayerTrack) => void;
  setPlaying: (playing: boolean) => void;
  setLooping: (loop: boolean) => void;
  setShuffle: (shuffle: boolean) => void;
  setVolume: (volume: number) => void;
  setTime: (time: number) => void;
  setDuration: (duration: number) => void;
  // Queue yönetimi
  addToQueue: (track: PlayerTrack) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrev: () => void;
  playPlaylist: (tracks: PlayerTrack[]) => void;
  playAtIndex: (index: number) => void;
};

type PlayerTimeValue = {
  currentTime: number;
  duration: number;
};

const PlayerStateContext = createContext<PlayerStateValue | undefined>(
  undefined,
);
const PlayerTimeContext = createContext<PlayerTimeValue | undefined>(
  undefined,
);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  // useCallback ile stabil fonksiyonlar — gereksiz re-render'ları önler
  const setTrack = useCallback(
    (track: PlayerTrack) => dispatch({ type: "SET_TRACK", track }),
    [],
  );
  const setPlaying = useCallback(
    (isPlaying: boolean) => dispatch({ type: "SET_PLAYING", isPlaying }),
    [],
  );
  const setLooping = useCallback(
    (isLooping: boolean) => dispatch({ type: "SET_LOOPING", isLooping }),
    [],
  );
  const setShuffle = useCallback(
    (isShuffle: boolean) => dispatch({ type: "SET_SHUFFLE", isShuffle }),
    [],
  );
  const setVolume = useCallback(
    (volume: number) => dispatch({ type: "SET_VOLUME", volume }),
    [],
  );
  const setTime = useCallback(
    (currentTime: number) => dispatch({ type: "SET_TIME", currentTime }),
    [],
  );
  const setDuration = useCallback(
    (duration: number) => dispatch({ type: "SET_DURATION", duration }),
    [],
  );
  const addToQueue = useCallback(
    (track: PlayerTrack) => dispatch({ type: "ADD_TO_QUEUE", track }),
    [],
  );
  const clearQueue = useCallback(
    () => dispatch({ type: "CLEAR_QUEUE" }),
    [],
  );
  const playNext = useCallback(() => dispatch({ type: "PLAY_NEXT" }), []);
  const playPrev = useCallback(() => dispatch({ type: "PLAY_PREV" }), []);
  const playPlaylist = useCallback(
    (tracks: PlayerTrack[]) => dispatch({ type: "PLAY_PLAYLIST", tracks }),
    [],
  );
  const playAtIndex = useCallback(
    (index: number) => dispatch({ type: "PLAY_AT_INDEX", index }),
    [],
  );

  // useCallback'ler her render'da stabil olduğu için bağımlılıklar sadece
  // currentTime/duration HARİÇ state alanları — bu sayede her saniye tikleyen
  // zaman, bu context'i (ve onu kullanan Player'ın ana gövdesini) tetiklemez.
  const stateValue: PlayerStateValue = useMemo(
    () => ({
      current: state.current,
      isPlaying: state.isPlaying,
      isLooping: state.isLooping,
      isShuffle: state.isShuffle,
      volume: state.volume,
      queue: state.queue,
      queueIndex: state.queueIndex,
      setTrack,
      setPlaying,
      setLooping,
      setShuffle,
      setVolume,
      setTime,
      setDuration,
      addToQueue,
      clearQueue,
      playNext,
      playPrev,
      playPlaylist,
      playAtIndex,
    }),
    [
      state.current,
      state.isPlaying,
      state.isLooping,
      state.isShuffle,
      state.volume,
      state.queue,
      state.queueIndex,
      setTrack,
      setPlaying,
      setLooping,
      setShuffle,
      setVolume,
      setTime,
      setDuration,
      addToQueue,
      clearQueue,
      playNext,
      playPrev,
      playPlaylist,
      playAtIndex,
    ],
  );

  const timeValue: PlayerTimeValue = useMemo(
    () => ({ currentTime: state.currentTime, duration: state.duration }),
    [state.currentTime, state.duration],
  );

  return (
    <PlayerStateContext.Provider value={stateValue}>
      <PlayerTimeContext.Provider value={timeValue}>
        {children}
      </PlayerTimeContext.Provider>
    </PlayerStateContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerStateContext);
  if (!ctx) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return ctx;
}

/** Sadece oynatma zamanına ihtiyaç duyan bileşenler için (örn. ilerleme çubuğu) — saniyede bir tikleyen bu değerler ana state'ten ayrı tutulur. */
export function usePlayerTime() {
  const ctx = useContext(PlayerTimeContext);
  if (!ctx) {
    throw new Error("usePlayerTime must be used within PlayerProvider");
  }
  return ctx;
}
