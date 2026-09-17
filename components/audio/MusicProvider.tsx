"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { wedding } from "@/lib/wedding-data";
import FallingLeaves from "@/components/invitation/FallingLeaves";

type MusicContextValue = {
  playing: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

function SoundIcon({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10v4h4l5 4V6L8 10H4Z" fill="currentColor" />
      {playing ? (
        <>
          <path d="M16 9.2c1.25 1.55 1.25 4.05 0 5.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M18.7 6.8c2.45 2.85 2.45 7.55 0 10.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <path d="m17 9 5 6m0-6-5 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.42;
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) play();
    else pause();
  }, [pause, play]);

  useEffect(() => {
    if (isAdminRoute) {
      pause();
      return;
    }

    play();

    const unlock = () => {
      const audio = audioRef.current;
      if (audio && audio.paused) play();
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [isAdminRoute, pause, play]);

  const value = useMemo(() => ({ playing, play, pause, toggle }), [playing, play, pause, toggle]);

  return (
    <MusicContext.Provider value={value}>
      <audio ref={audioRef} src={wedding.music.src} loop preload="metadata" autoPlay />
      {!isAdminRoute && <FallingLeaves />}
      {children}
      {!isAdminRoute && <button
        type="button"
        className="global-music-toggle"
        onClick={toggle}
        aria-label={playing ? "Pause background music" : "Play background music"}
        title={playing ? "Pause music" : "Play music"}
      >
        <SoundIcon playing={playing} />
        <span>{playing ? "Music on" : "Music off"}</span>
      </button>}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const value = useContext(MusicContext);
  if (!value) throw new Error("useMusic must be used within MusicProvider");
  return value;
}
