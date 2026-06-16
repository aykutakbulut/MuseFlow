import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { PlayerProvider, usePlayer } from "./PlayerContext";

function TestComponent() {
  const { current, queue, isPlaying, setTrack, playNext, addToQueue } = usePlayer();

  return (
    <div>
      <div data-testid="current-track">{current?.title || "None"}</div>
      <div data-testid="is-playing">{isPlaying ? "Yes" : "No"}</div>
      <div data-testid="queue-length">{queue.length}</div>
      <button
        type="button"
        onClick={() => setTrack({ id: "1", title: "Track 1", channel: "A", thumbnail: "" })}
      >
        Play Track 1
      </button>
      <button
        type="button"
        onClick={() => addToQueue({ id: "2", title: "Track 2", channel: "B", thumbnail: "" })}
      >
        Add Track 2
      </button>
      <button type="button" onClick={playNext}>
        Next
      </button>
    </div>
  );
}

describe("PlayerContext", () => {
  it("should initialize with empty state", () => {
    render(
      <PlayerProvider>
        <TestComponent />
      </PlayerProvider>
    );

    expect(screen.getByTestId("current-track")).toHaveTextContent("None");
    expect(screen.getByTestId("is-playing")).toHaveTextContent("No");
    expect(screen.getByTestId("queue-length")).toHaveTextContent("0");
  });

  it("should update current track and set playing to true", () => {
    render(
      <PlayerProvider>
        <TestComponent />
      </PlayerProvider>
    );

    act(() => {
      screen.getByText("Play Track 1").click();
    });

    expect(screen.getByTestId("current-track")).toHaveTextContent("Track 1");
    expect(screen.getByTestId("is-playing")).toHaveTextContent("Yes");
  });

  it("should add tracks to queue and play next", () => {
    render(
      <PlayerProvider>
        <TestComponent />
      </PlayerProvider>
    );

    act(() => {
      screen.getByText("Play Track 1").click();
    });
    
    act(() => {
      screen.getByText("Add Track 2").click();
    });

    expect(screen.getByTestId("queue-length")).toHaveTextContent("1");

    act(() => {
      screen.getByText("Next").click();
    });

    expect(screen.getByTestId("current-track")).toHaveTextContent("Track 2");
  });
});
