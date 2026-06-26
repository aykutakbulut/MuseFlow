import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { PlayerProvider, usePlayer } from "../../contexts/PlayerContext";
import { LibraryProvider } from "../../contexts/LibraryContext";
import { I18nProvider } from "../../contexts/I18nContext";
import { Player } from "./Player";

// react-youtube'u gerçek iframe açmadan test edilebilir basit bir mock'la
// değiştiriyoruz; onReady/onEnd callback'lerini test'ten tetikleyebilmek için
// son render edilen props'u dışarıda saklıyoruz.
let lastYouTubeProps: {
  onReady?: (e: { target: unknown }) => void;
  onEnd?: () => void;
} = {};

vi.mock("react-youtube", () => ({
  default: (props: { onReady?: (e: { target: unknown }) => void; onEnd?: () => void }) => {
    lastYouTubeProps = props;
    return <div data-testid="yt-mock" />;
  },
}));

const fakeYouTubePlayer = {
  setVolume: vi.fn(),
  getDuration: () => 200,
  getCurrentTime: () => 0,
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  seekTo: vi.fn(),
  setPlaybackQuality: vi.fn(),
};

// Test senaryosunu kuran yardımcı: tek bir şarkıyı (queueIndex=-1) çalar,
// sonra kuyruğa ikinci bir şarkı ekler — bu, asıl bug'ın oluştuğu durum.
function ScenarioSetup() {
  const { setTrack, addToQueue } = usePlayer();
  return (
    <>
      <button
        type="button"
        onClick={() => setTrack({ id: "solo", title: "Solo Track", channel: "X", thumbnail: "" })}
      >
        Play Solo Track
      </button>
      <button
        type="button"
        onClick={() => addToQueue({ id: "queued", title: "Queued Track", channel: "X", thumbnail: "" })}
      >
        Add To Queue
      </button>
    </>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <PlayerProvider>
        <LibraryProvider>{children}</LibraryProvider>
      </PlayerProvider>
    </I18nProvider>
  );
}

describe("Player — handleEnded queue ilerleme bug fix", () => {
  it("advances to a queued track when a standalone track (queueIndex -1) ends", () => {
    render(
      <Wrapper>
        <ScenarioSetup />
        <Player />
      </Wrapper>,
    );

    // Tek bir şarkı çal (queue=[], queueIndex=-1) — Player artık mount edilip
    // YouTube mock'unu render eder.
    act(() => {
      screen.getByText("Play Solo Track").click();
    });

    act(() => {
      lastYouTubeProps.onReady?.({ target: fakeYouTubePlayer });
    });

    // Kuyruğa başka bir şarkı ekle — queueIndex HÂLÂ -1 (bug senaryosu)
    act(() => {
      screen.getByText("Add To Queue").click();
    });

    // Mevcut şarkı bitti — handleEnded tetiklenir
    act(() => {
      lastYouTubeProps.onEnd?.();
    });

    // Düzeltmeden önce: queueIndex===-1 olduğu için kuyruktaki şarkıya
    // geçilmiyor, ekranda hâlâ "Solo Track" görünüyordu.
    // Düzeltmeden sonra: kuyrukta şarkı olduğu için ilerlenmeli.
    // (Başlık hem mini player'da hem tam ekran modalda aynı anda render
    // edildiği için en az bir kopya bulunmasını doğruluyoruz.)
    expect(screen.getAllByText("Queued Track").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Solo Track").length).toBe(0);
  });
});
