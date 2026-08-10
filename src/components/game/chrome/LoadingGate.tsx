"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { displayFont, monoFont } from "./hudTheme";

const MIN_SHOW_MS = 700;
const FADE_MS = 550;

type Props = {
  /** Called once assets are loaded and the gate starts fading out. */
  onReady?: () => void;
  /** Skip the gate entirely (assets already cached from a previous visit). */
  skip?: boolean;
  /** Dark variant for night worlds. */
  dark?: boolean;
  /** Label under the wordmark, e.g. "PORTFOLIO WORLDS" or a world name. */
  label?: string;
};

export default function LoadingGate({ onReady, skip, dark, label = "PORTFOLIO WORLDS" }: Props) {
  const { progress, active, total } = useProgress();
  const [phase, setPhase] = useState<"loading" | "fading" | "gone">(
    skip ? "gone" : "loading"
  );
  const mountedAt = useRef<number>(Date.now());
  const readyFired = useRef(false);

  useEffect(() => {
    if (skip && !readyFired.current) {
      readyFired.current = true;
      onReady?.();
    }
  }, [skip, onReady]);

  useEffect(() => {
    if (phase !== "loading") return;
    // Consider the scene loaded when the loader has gone idle. On slow
    // devices the first asset request can register well after mount, and a
    // bare idle check would dismiss the gate onto a half-empty scene — so
    // also wait until at least one asset has been tracked (with a hard
    // fallback so a scene with no tracked assets can't hold the gate).
    const check = () => {
      const elapsed = Date.now() - mountedAt.current;
      if (elapsed < MIN_SHOW_MS) return;
      if (active) return;
      if (total === 0 && elapsed < 4000) return;
      if (!readyFired.current) {
        readyFired.current = true;
        onReady?.();
      }
      setPhase("fading");
      setTimeout(() => setPhase("gone"), FADE_MS);
    };
    const iv = setInterval(check, 120);
    return () => clearInterval(iv);
  }, [phase, active, total, onReady]);

  if (phase === "gone") return null;

  const pct = Math.round(Math.min(100, progress));

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        background: dark ? "#0d1420" : "#a8dcef",
        opacity: phase === "fading" ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
    >
      <div
        style={{
          ...displayFont,
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: dark ? "#e8e6df" : "#0d2030",
        }}
      >
        Justin Yang
      </div>
      <div
        style={{
          ...monoFont,
          fontSize: 10,
          letterSpacing: "0.32em",
          color: dark ? "#8a97ad" : "#33607f",
        }}
      >
        {label}
      </div>
      <div
        style={{
          width: 180,
          height: 4,
          borderRadius: 2,
          overflow: "hidden",
          background: dark ? "rgba(255,255,255,0.12)" : "rgba(13,32,48,0.18)",
        }}
      >
        <div
          style={{
            width: `${Math.max(6, pct)}%`,
            height: "100%",
            borderRadius: 2,
            background: "#e8a846",
            transition: "width 200ms ease",
          }}
        />
      </div>
    </div>
  );
}
