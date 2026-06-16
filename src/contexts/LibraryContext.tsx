"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { PlayerTrack } from "./PlayerContext";

// ── Types ──────────────────────────────────────────────────────────────────

export type Playlist = {
  id: string;
  name: string;
  trackIds: string[];
};

type LibraryState = {
  playlists: Playlist[];
  /** ID → PlayerTrack haritası — playlist/favori görüntüleme için */
  trackMap: Record<string, PlayerTrack>;
  downloaded: Record<string, PlayerTrack>;
  favorites: string[];
  recentlyPlayed: PlayerTrack[];
};

// ── Actions ────────────────────────────────────────────────────────────────

type LibraryAction =
  | { type: "LOAD"; payload: LibraryState }
  | { type: "CREATE_PLAYLIST"; name: string }
  | { type: "DELETE_PLAYLIST"; playlistId: string }
  | { type: "RENAME_PLAYLIST"; playlistId: string; newName: string }
  | { type: "ADD_TO_PLAYLIST"; playlistId: string; track: PlayerTrack }
  | { type: "REMOVE_FROM_PLAYLIST"; playlistId: string; trackId: string }
  | { type: "REORDER_PLAYLIST"; playlistId: string; fromIndex: number; toIndex: number }
  | { type: "TOGGLE_DOWNLOAD"; track: PlayerTrack }
  | { type: "TOGGLE_FAVORITE"; trackId: string; track?: PlayerTrack }
  | { type: "ADD_TO_RECENTLY_PLAYED"; track: PlayerTrack };

const MAX_RECENTLY_PLAYED = 50;

const initialState: LibraryState = {
  playlists: [],
  trackMap: {},
  downloaded: {},
  favorites: [],
  recentlyPlayed: [],
};

function libraryReducer(state: LibraryState, action: LibraryAction): LibraryState {
  switch (action.type) {
    case "LOAD":
      return action.payload;

    case "CREATE_PLAYLIST":
      return {
        ...state,
        playlists: [
          ...state.playlists,
          {
            id: `pl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: action.name,
            trackIds: [],
          },
        ],
      };

    case "DELETE_PLAYLIST":
      return {
        ...state,
        playlists: state.playlists.filter((pl) => pl.id !== action.playlistId),
      };

    case "RENAME_PLAYLIST":
      return {
        ...state,
        playlists: state.playlists.map((pl) =>
          pl.id === action.playlistId
            ? { ...pl, name: action.newName.trim() }
            : pl,
        ),
      };

    case "ADD_TO_PLAYLIST": {
      const { playlistId, track } = action;
      return {
        ...state,
        trackMap: { ...state.trackMap, [track.id]: track },
        playlists: state.playlists.map((pl) =>
          pl.id === playlistId && !pl.trackIds.includes(track.id)
            ? { ...pl, trackIds: [...pl.trackIds, track.id] }
            : pl,
        ),
      };
    }

    case "REMOVE_FROM_PLAYLIST":
      return {
        ...state,
        playlists: state.playlists.map((pl) =>
          pl.id === action.playlistId
            ? { ...pl, trackIds: pl.trackIds.filter((id) => id !== action.trackId) }
            : pl,
        ),
      };

    case "REORDER_PLAYLIST": {
      const { playlistId, fromIndex, toIndex } = action;
      return {
        ...state,
        playlists: state.playlists.map((pl) => {
          if (pl.id !== playlistId) return pl;
          const ids = [...pl.trackIds];
          const [moved] = ids.splice(fromIndex, 1);
          if (moved === undefined) return pl;
          ids.splice(toIndex, 0, moved);
          return { ...pl, trackIds: ids };
        }),
      };
    }

    case "TOGGLE_DOWNLOAD": {
      const { track } = action;
      const exists = state.downloaded[track.id];
      if (exists) {
        const next = { ...state.downloaded };
        delete next[track.id];
        return { ...state, downloaded: next };
      }
      return {
        ...state,
        trackMap: { ...state.trackMap, [track.id]: track },
        downloaded: { ...state.downloaded, [track.id]: track },
      };
    }

    case "TOGGLE_FAVORITE": {
      const { trackId, track } = action;
      const isFav = state.favorites.includes(trackId);
      return {
        ...state,
        trackMap: track
          ? { ...state.trackMap, [track.id]: track }
          : state.trackMap,
        favorites: isFav
          ? state.favorites.filter((id) => id !== trackId)
          : [...state.favorites, trackId],
      };
    }

    case "ADD_TO_RECENTLY_PLAYED": {
      const { track } = action;
      const filtered = state.recentlyPlayed.filter((t) => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, MAX_RECENTLY_PLAYED);
      return {
        ...state,
        trackMap: { ...state.trackMap, [track.id]: track },
        recentlyPlayed: updated,
      };
    }

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────

type LibraryContextValue = LibraryState & {
  isHydrated: boolean;
  // Playlist
  createPlaylist: (name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
  addToPlaylist: (playlistId: string, track: PlayerTrack) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => void;
  // İndirme
  toggleDownload: (track: PlayerTrack) => void;
  // Favoriler
  toggleFavorite: (trackId: string, track?: PlayerTrack) => void;
  isFavorite: (trackId: string) => boolean;
  // Son dinlenenler
  addToRecentlyPlayed: (track: PlayerTrack) => void;
};

const STORAGE_KEY = "music_library_v2";

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(libraryReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LibraryState>;
        dispatch({
          type: "LOAD",
          payload: {
            playlists: parsed.playlists ?? [],
            trackMap: parsed.trackMap ?? {},
            downloaded: parsed.downloaded ?? {},
            favorites: parsed.favorites ?? [],
            recentlyPlayed: parsed.recentlyPlayed ?? [],
          },
        });
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, isHydrated]);

  const createPlaylist = useCallback(
    (name: string) => dispatch({ type: "CREATE_PLAYLIST", name }),
    [],
  );
  const deletePlaylist = useCallback(
    (playlistId: string) => dispatch({ type: "DELETE_PLAYLIST", playlistId }),
    [],
  );
  const renamePlaylist = useCallback(
    (playlistId: string, newName: string) =>
      dispatch({ type: "RENAME_PLAYLIST", playlistId, newName }),
    [],
  );
  const addToPlaylist = useCallback(
    (playlistId: string, track: PlayerTrack) =>
      dispatch({ type: "ADD_TO_PLAYLIST", playlistId, track }),
    [],
  );
  const removeFromPlaylist = useCallback(
    (playlistId: string, trackId: string) =>
      dispatch({ type: "REMOVE_FROM_PLAYLIST", playlistId, trackId }),
    [],
  );
  const reorderPlaylist = useCallback(
    (playlistId: string, fromIndex: number, toIndex: number) =>
      dispatch({ type: "REORDER_PLAYLIST", playlistId, fromIndex, toIndex }),
    [],
  );
  const toggleDownload = useCallback(
    (track: PlayerTrack) => dispatch({ type: "TOGGLE_DOWNLOAD", track }),
    [],
  );
  const toggleFavorite = useCallback(
    (trackId: string, track?: PlayerTrack) =>
      dispatch({ type: "TOGGLE_FAVORITE", trackId, track }),
    [],
  );
  const isFavorite = useCallback(
    (trackId: string) => state.favorites.includes(trackId),
    [state.favorites],
  );
  const addToRecentlyPlayed = useCallback(
    (track: PlayerTrack) => dispatch({ type: "ADD_TO_RECENTLY_PLAYED", track }),
    [],
  );

  const value: LibraryContextValue = {
    ...state,
    isHydrated,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    reorderPlaylist,
    toggleDownload,
    toggleFavorite,
    isFavorite,
    addToRecentlyPlayed,
  };

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }
  return ctx;
}
