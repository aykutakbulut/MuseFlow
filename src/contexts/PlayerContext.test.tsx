import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { PlayerProvider, usePlayer, usePlayerTime } from "./PlayerContext";

function TestComponent() {
  const { current, queue, queueIndex, isPlaying, setTrack, playNext, addToQueue, playPlaylist } =
    usePlayer();

  return (
    <div>
      <div data-testid="current-track">{current?.title || "None"}</div>
      <div data-testid="is-playing">{isPlaying ? "Yes" : "No"}</div>
      <div data-testid="queue-length">{queue.length}</div>
      <div data-testid="queue-index">{queueIndex}</div>
      <button
        type="button"
        onClick={() => setTrack({ id: "1", title: "Track 1", channel: "A", thumbnail: "" })}
      >
        Play Track 1
      </button>
      <button
        type="button"
        onClick={() => setTrack({ id: "3", title: "Track 3", channel: "C", thumbnail: "" })}
      >
        Play Track 3
      </button>
      <button
        type="button"
        onClick={() => addToQueue({ id: "2", title: "Track 2", channel: "B", thumbnail: "" })}
      >
        Add Track 2
      </button>
      <button
        type="button"
        onClick={() =>
          playPlaylist([
            { id: "10", title: "Playlist A", channel: "X", thumbnail: "" },
            { id: "11", title: "Playlist B", channel: "X", thumbnail: "" },
          ])
        }
      >
        Play Playlist
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

  it("should clear the stale queue when playing a single track after a playlist", () => {
    render(
      <PlayerProvider>
        <TestComponent />
      </PlayerProvider>
    );

    // Bir playlist çal: queue 2 şarkıyla dolar
    act(() => {
      screen.getByText("Play Playlist").click();
    });
    expect(screen.getByTestId("queue-length")).toHaveTextContent("2");
    expect(screen.getByTestId("current-track")).toHaveTextContent("Playlist A");

    // Sonra bağımsız tek bir şarkıya geç (örn. playlist dışından bir tıklama)
    act(() => {
      screen.getByText("Play Track 3").click();
    });

    // Eski queue tamamen temizlenmiş olmalı — yoksa şarkı bitince
    // alakasız bir "sıradaki" şarkıya atlanır (asıl bug)
    expect(screen.getByTestId("current-track")).toHaveTextContent("Track 3");
    expect(screen.getByTestId("queue-length")).toHaveTextContent("0");
    expect(screen.getByTestId("queue-index")).toHaveTextContent("-1");

    // playNext artık hiçbir şeye atlamamalı (queue boş)
    act(() => {
      screen.getByText("Next").click();
    });
    expect(screen.getByTestId("current-track")).toHaveTextContent("Track 3");
  });
});

describe("PlayerContext — currentTime/duration izolasyonu", () => {
  // Player'ın ana gövdesi (usePlayer) saniyede tikleyen zaman yüzünden
  // re-render OLMAMALI; sadece zamana abone olan bileşenler (usePlayerTime)
  // re-render olmalı. Bu, ısınma/perf düzeltmesinin temel iddiasıdır.
  function StateConsumer({ onRender }: { onRender: () => void }) {
    onRender();
    const { isPlaying, setTime } = usePlayer();
    return (
      <div>
        <div data-testid="state-is-playing">{isPlaying ? "Yes" : "No"}</div>
        <button type="button" onClick={() => setTime(42)}>
          Dispatch Time
        </button>
      </div>
    );
  }

  function TimeConsumer({ onRender }: { onRender: () => void }) {
    onRender();
    const { currentTime } = usePlayerTime();
    return <div data-testid="time-current">{currentTime}</div>;
  }

  it("re-renders only the usePlayerTime() consumer when currentTime changes, not the usePlayer() consumer", () => {
    let stateCalls = 0;
    let timeCalls = 0;

    function Probe() {
      return (
        <div>
          <StateConsumer onRender={() => (stateCalls += 1)} />
          <TimeConsumer onRender={() => (timeCalls += 1)} />
        </div>
      );
    }

    render(
      <PlayerProvider>
        <Probe />
      </PlayerProvider>,
    );

    const stateCallsAfterMount = stateCalls;
    const timeCallsAfterMount = timeCalls;

    act(() => {
      screen.getByText("Dispatch Time").click();
    });
    act(() => {
      screen.getByText("Dispatch Time").click();
    });
    act(() => {
      screen.getByText("Dispatch Time").click();
    });

    // TimeConsumer her dispatch'te yeniden render olur (currentTime context'i değişiyor)
    expect(timeCalls).toBeGreaterThan(timeCallsAfterMount);
    // StateConsumer hiç yeniden render OLMAMALI — usePlayer() currentTime içermiyor
    expect(stateCalls).toBe(stateCallsAfterMount);
  });
});
