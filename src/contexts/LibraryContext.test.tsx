import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LibraryProvider, useLibrary } from "./LibraryContext";

function TestComponent() {
  const { playlists, favorites, createPlaylist, toggleFavorite, deletePlaylist } = useLibrary();

  return (
    <div>
      <div data-testid="playlists-count">{playlists.length}</div>
      <div data-testid="favorites-count">{favorites.length}</div>
      <button
        type="button"
        onClick={() => createPlaylist("My First Playlist")}
      >
        Create Playlist
      </button>
      <button
        type="button"
        onClick={() => deletePlaylist(playlists[0]?.id)}
      >
        Delete Playlist
      </button>
      <button
        type="button"
        onClick={() =>
          toggleFavorite("track-1", { id: "track-1", title: "Track", channel: "CH", thumbnail: "" })
        }
      >
        Toggle Favorite
      </button>
    </div>
  );
}

describe("LibraryContext", () => {
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
});
