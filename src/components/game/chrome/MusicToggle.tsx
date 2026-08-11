"use client";

import { useEffect, useRef, useState } from "react";
import { INK_SOFT, panelStyle } from "./hudTheme";
import { setSfxMuted } from "@/lib/game/sfx";

// Background music — CC0 tracks from OpenGameArt, all in /public/audio:
//   town-theme.mp3    "Town Theme RPG" (cynicmusic)  — default
//   la-citadelle.mp3  "La Citadelle" (Komiku)
//   a-new-town.mp3    "A New Town" (RPG Theme)
const TRACK = "/audio/town-theme.mp3";
const VOLUME = 0.35;
const STORAGE_KEY = "bgm-muted";

/** Global music player + mute button, top-right on every page. Music is on
 *  by default; browsers block autoplay with sound, so if the first play()
 *  is refused it starts on the first interaction instead. */
export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const wantMuted = localStorage.getItem(STORAGE_KEY) === "1";
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = VOLUME;
    setMuted(wantMuted);
    setSfxMuted(wantMuted);
    if (!wantMuted) {
      const tryPlay = () => {
        audio
          .play()
          .then(() => {
            window.removeEventListener("pointerdown", tryPlay);
            window.removeEventListener("keydown", tryPlay);
          })
          .catch(() => {
            // Autoplay refused — arm one-shot listeners for the first
            // interaction, which counts as the required user gesture.
            window.addEventListener("pointerdown", tryPlay, { once: true });
            window.addEventListener("keydown", tryPlay, { once: true });
          });
      };
      tryPlay();
    }
    return () => {
      audio.pause();
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      localStorage.setItem(STORAGE_KEY, "0");
      setMuted(false);
      setSfxMuted(false);
      audio.play().catch(() => {});
    } else {
      localStorage.setItem(STORAGE_KEY, "1");
      setMuted(true);
      setSfxMuted(true);
      audio.pause();
    }
  };

  return (
    <>
      <audio ref={audioRef} src={TRACK} loop preload="auto" />
      <button
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      onClick={toggle}
      className="fixed flex items-center justify-center"
      style={{
        ...panelStyle,
        top: "calc(14px + env(safe-area-inset-top))",
        right: 14,
        zIndex: 40,
        width: 38,
        height: 38,
        color: INK_SOFT,
        cursor: "pointer",
      }}
    >
      {muted ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
      </button>
    </>
  );
}
