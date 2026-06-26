import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import { LibraryProvider, useLibrary } from "./LibraryContext";

function makeTrack(id: string) {
  return { id, title: `Track ${id}`, channel: "CH", thumbnail: "" };
}

function TestComponent() {
  const {
    playlists,
    favorites,
    recentlyPlayed,
    createPlaylist,
    toggleFavorite,
    deletePlaylist,
    renamePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    reorderPlaylist,
    addToRecentlyPlayed,
  } = useLibrary();

  const firstPlaylist = playlists[0];

  return (
    <div>
      <div data-testid="playlists-count">{playlists.length}</div>
      <div data-testid="favorites-count">{favorites.length}</div>
      <div data-testid="recently-played-count">{recentlyPlayed.length}</div>
      <div data-testid="playlist-0-name">{firstPlaylist?.name ?? ""}</div>
      <div data-testid="playlist-0-tracks">
        {firstPlaylist?.trackIds.join(",") ?? ""}
      </div>
      <div data-testid="recently-played-order">
        {recentlyPlayed.map((t) => t.id).join(",")}
      </div>
      <button type="button" onClick={() => createPlaylist("My First Playlist")}>
        Create Playlist
      </button>
      <button
        type="button"
        onClick={() => firstPlaylist && deletePlaylist(firstPlaylist.id)}
      >
        Delete Playlist
      </button>
      <button
        type="button"
        onClick={() => firstPlaylist && renamePlaylist(firstPlaylist.id, "Renamed")}
      >
        Rename Playlist
      </button>
      <button
        type="button"
        onClick={() => firstPlaylist && addToPlaylist(firstPlaylist.id, makeTrack("t1"))}
      >
        Add t1 To Playlist
      </button>
      <button
        type="button"
        onClick={() => firstPlaylist && addToPlaylist(firstPlaylist.id, makeTrack("t2"))}
      >
        Add t2 To Playlist
      </button>
      <button
        type="button"
        onClick={() => firstPlaylist && removeFromPlaylist(firstPlaylist.id, "t1")}
      >
        Remove t1 From Playlist
      </button>
      <button
        type="button"
        onClick={() => firstPlaylist && reorderPlaylist(firstPlaylist.id, 0, 1)}
      >
        Move First Track Down
      </button>
      <button
        type="button"
        onClick={() =>
          toggleFavorite("track-1", { id: "track-1", title: "Track", channel: "CH", thumbnail: "" })
        }
      >
        Toggle Favorite
      </button>
      <button type="button" onClick={() => addToRecentlyPlayed(makeTrack("r1"))}>
        Play r1
      </button>
      <button type="button" onClick={() => addToRecentlyPlayed(makeTrack("r2"))}>
        Play r2
      </button>
    </div>
  );
}

describe("LibraryContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("should initialize with empty library", () => {
    render(
      <LibraryProvider>
        <TestComponent />
      </LibraryProvider>
    );

    expect(screen.getByTestId("playlists-count")).toHaveTextContent("0");
    expect(screen.getByTestId("favorites-count")).toHaveTextContent("0");
  });

  it("should create and delete a playlist", () => {
    render(
      <LibraryProvider>
        <TestComponent />
      </LibraryProvider>
    );

    act(() => {
      screen.getByText("Create Playlist").click();
    });

    expect(screen.getByTestId("playlists-count")).toHaveTextContent("1");

    act(() => {
      screen.getByText("Delete Playlist").click();
    });

    expect(screen.getByTestId("playlists-count")).toHaveTextContent("0");
  });

  it("should toggle favorites", () => {
    render(
      <LibraryProvider>
        <TestComponent />
      </LibraryProvider>
    );

    act(() => {
      screen.getByText("Toggle Favorite").click();
    });

    expect(screen.getByTestId("favorites-count")).toHaveTextContent("1");

    act(() => {
      screen.getByText("Toggle Favorite").click();
    });

    expect(screen.getByTestId("favorites-count")).toHaveTextContent("0");
  });

  it("should rename a playlist", () => {
    render(
      <LibraryProvider>
        <TestComponent />
      </LibraryProvider>,
    );

    act(() => {
      screen.getByText("Create Playlist").click();
    });
    expect(screen.getByTestId("playlist-0-name")).toHaveTextContent("My First Playlist");

    act(() => {
      screen.getByText("Rename Playlist").click();
    });
    expect(screen.getByTestId("playlist-0-name")).toHaveTextContent("Renamed");
  });

  it("should add and remove tracks from a playlist, without duplicates", () => {
    render(
      <LibraryProvider>
        <TestComponent />
      </LibraryProvider>,
    );

    act(() => {
      screen.getByText("Create Playlist").click();
    });

    act(() => {
      screen.getByText("Add t1 To Playlist").click();
    });
    act(() => {
      screen.getByText("Add t2 To Playlist").click();
    });
    expect(screen.getByTestId("playlist-0-tracks")).toHaveTextContent("t1,t2");

    // Aynı şarkıyı tekrar eklemek mükerrer kayıt OLUŞTURMAMALI
    act(() => {
      screen.getByText("Add t1 To Playlist").click();
    });
    expect(screen.getByTestId("playlist-0-tracks")).toHaveTextContent("t1,t2");

    act(() => {
      screen.getByText("Remove t1 From Playlist").click();
    });
    expect(screen.getByTestId("playlist-0-tracks")).toHaveTextContent("t2");
  });

  it("should reorder tracks within a playlist", () => {
    render(
      <LibraryProvider>
        <TestComponent />
      </LibraryProvider>,
    );

    act(() => {
      screen.getByText("Create Playlist").click();
    });
    act(() => {
      screen.getByText("Add t1 To Playlist").click();
    });
    act(() => {
      screen.getByText("Add t2 To Playlist").click();
    });
    expect(screen.getByTestId("playlist-0-tracks")).toHaveTextContent("t1,t2");

    act(() => {
      screen.getByText("Move First Track Down").click();
    });
    expect(screen.getByTestId("playlist-0-tracks")).toHaveTextContent("t2,t1");
  });

  it("should cap recently played at 50 and move a re-played track to the front without duplicating it", () => {
    render(
      <LibraryProvider>
        <TestComponent />
      </LibraryProvider>,
    );

    act(() => {
      screen.getByText("Play r1").click();
    });
    act(() => {
      screen.getByText("Play r2").click();
    });
    // En son çalınan en başta olmalı
    expect(screen.getByTestId("recently-played-order")).toHaveTextContent("r2,r1");

    // r1'i tekrar çal — mükerrer kayıt oluşturmadan başa almalı
    act(() => {
      screen.getByText("Play r1").click();
    });
    expect(screen.getByTestId("recently-played-order")).toHaveTextContent("r1,r2");
    expect(screen.getByTestId("recently-played-count")).toHaveTextContent("2");
  });

  it("should persist playlists/favorites to localStorage and reload them on remount", () => {
    const { unmount } = render(
      <LibraryProvider>
        <TestComponent />
      </LibraryProvider>,
    );

    act(() => {
      screen.getByText("Create Playlist").click();
    });
    act(() => {
      screen.getByText("Toggle Favorite").click();
    });

    expect(screen.getByTestId("playlists-count")).toHaveTextContent("1");
    expect(screen.getByTestId("favorites-count")).toHaveTextContent("1");

    // Gerçek localStorage'a yazıldığını doğrula
    const raw = window.localStorage.getItem("music_library_v2");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.playlists).toHaveLength(1);
    expect(parsed.favorites).toEqual(["track-1"]);

    // Component'i kaldır, YENİ bir provider/component ağacıyla yeniden render et
    // (sayfa yenilemeyi simüle eder) — aynı localStorage'dan okumalı
    unmount();
    cleanup();

    render(
      <LibraryProvider>
        <TestComponent />
      </LibraryProvider>,
    );

    expect(screen.getByTestId("playlists-count")).toHaveTextContent("1");
    expect(screen.getByTestId("favorites-count")).toHaveTextContent("1");
    expect(screen.getByTestId("playlist-0-name")).toHaveTextContent("My First Playlist");
  });
});
