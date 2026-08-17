"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACCENT,
  displayFont,
  INK,
  INK_DIM,
  INK_SOFT,
  monoFont,
  panelStyle,
} from "../chrome/hudTheme";
import { useGameStore } from "@/lib/game/store";
import {
  pushHop,
  stormView,
  useCrossingStore,
} from "@/lib/game/crossing/store";
import { playNewBest } from "@/lib/game/sfx";
import type { Dir } from "@/lib/game/crossing/engine";

const KEY_DIRS: Record<string, Dir> = {
  ArrowUp: "fwd",
  KeyW: "fwd",
  Space: "fwd",
  ArrowDown: "back",
  KeyS: "back",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};

/** Grace period after death before a tap/space restarts. Longer than the
 *  card delay (850ms) + its entrance, so the player always sees their score
 *  before a restart can fire. */
const RETRY_GUARD_MS = 1250;

const CAUSE_LINES = {
  car: ["FLATTENED AT RUSH HOUR", "The taxi had somewhere to be."],
  fall: ["THE SKY RIFT WON", "Clouds are a lease, not a floor."],
  storm: ["RECLAIMED BY YOUR CLOUD", "Never keep a cumulonimbus waiting."],
} as const;

export default function CrossingHUD() {
  const phase = useCrossingStore((s) => s.phase);
  const score = useCrossingStore((s) => s.score);
  const best = useCrossingStore((s) => s.best);
  const cause = useCrossingStore((s) => s.cause);
  const newBest = useCrossingStore((s) => s.newBest);
  const brushPulse = useCrossingStore((s) => s.brushPulse);
  const setLeavingTo = useGameStore((s) => s.setLeavingTo);

  const [touch, setTouch] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [brushToast, setBrushToast] = useState(0);
  const deadAtRef = useRef(0);
  const swipeRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setTouch(mq.matches);
    // Hybrids (convertibles, iPad + keyboard) can flip at runtime.
    const onChange = (e: MediaQueryListEvent) => setTouch(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Death card appears after the death animation has had its beat.
  useEffect(() => {
    if (phase !== "dead") {
      setShowCard(false);
      return;
    }
    deadAtRef.current = Date.now();
    const t = setTimeout(() => setShowCard(true), 850);
    return () => clearTimeout(t);
  }, [phase]);

  // The new-best jingle belongs to the card reveal — tying it here (instead
  // of a loose setTimeout at death) means a fast retry or page exit
  // cancels it naturally.
  useEffect(() => {
    if (phase === "dead" && showCard && newBest) playNewBest();
  }, [phase, showCard, newBest]);

  // BRUSH toast — re-keyed per pulse so the pop animation restarts.
  useEffect(() => {
    if (brushPulse === 0) return;
    setBrushToast(brushPulse);
    const t = setTimeout(() => setBrushToast(0), 850);
    return () => clearTimeout(t);
  }, [brushPulse]);

  // Storm pressure drives a vignette + warning banner without re-renders.
  // The banner only nags while actually playing — never over the death card.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const level = stormView.level;
      const playing = useCrossingStore.getState().phase === "playing";
      if (vignetteRef.current) {
        vignetteRef.current.style.opacity = String(level * 0.55);
      }
      if (bannerRef.current) {
        // Matches the engine's thunder threshold — the vignette hints first,
        // the banner joins when the storm actually warns, so brief waits at
        // a busy lane don't flicker it.
        bannerRef.current.style.opacity = playing && level > 0.32 ? "1" : "0";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keyboard: hop, retry, escape. Key repeat is allowed on purpose for
  // hopping — a held arrow key hops on every landing, which is exactly the
  // Crossy feel — but a HELD key must never restart a run (the player is
  // usually still holding the key that killed them), so the dead branch
  // takes fresh presses only. Enter is excluded: it would also activate a
  // focused button (the mute toggle, the RETRY button) natively.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Once the exit fade is running, the game is over — no hops, no
      // restarts, no double navigation.
      if (useGameStore.getState().leavingTo) return;
      if (e.code === "Escape") {
        setLeavingTo("/");
        return;
      }
      if (e.code.startsWith("Arrow") || e.code === "Space") e.preventDefault();
      const st = useCrossingStore.getState();
      if (st.phase === "dead") {
        if (
          (e.code === "Space" || e.code === "KeyR") &&
          !e.repeat &&
          Date.now() - deadAtRef.current > RETRY_GUARD_MS
        ) {
          st.reset();
        }
        return;
      }
      const dir = KEY_DIRS[e.code];
      if (dir) pushHop(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setLeavingTo]);

  // One pointer owns the swipe — a second thumb's overlapping tap becomes
  // its own forward hop, never half of a phantom swipe.
  const onPointerDown = (e: React.PointerEvent) => {
    // Capture so a swipe that leaves the window still delivers its up event.
    e.currentTarget.setPointerCapture(e.pointerId);
    if (!swipeRef.current) {
      swipeRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    }
  };
  const onPointerCancel = (e: React.PointerEvent) => {
    if (swipeRef.current?.id === e.pointerId) swipeRef.current = null;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = swipeRef.current;
    const owns = start?.id === e.pointerId;
    if (owns) swipeRef.current = null;
    if (useGameStore.getState().leavingTo) return;
    const st = useCrossingStore.getState();
    if (st.phase === "dead") {
      if (Date.now() - deadAtRef.current > RETRY_GUARD_MS) st.reset();
      return;
    }
    if (!owns || !start) {
      pushHop("fwd");
      return;
    }
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.hypot(dx, dy) < 16) pushHop("fwd");
    else if (Math.abs(dx) > Math.abs(dy)) pushHop(dx > 0 ? "right" : "left");
    else pushHop(dy > 0 ? "back" : "fwd");
  };

  const causeLine = cause ? CAUSE_LINES[cause] : null;

  return (
    <div
      className="fixed inset-0 z-10 select-none"
      style={{ color: "#e8e6df", ...monoFont, pointerEvents: "none" }}
    >
      <style>{`
        @keyframes crossingBrushPop {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          18% { transform: translate(-50%, -50%) scale(1.18); opacity: 1; }
          55% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -62%) scale(1); opacity: 0; }
        }
        @keyframes crossingZapFlash {
          0% { opacity: 0.85; } 100% { opacity: 0; }
        }
        @keyframes crossingCardIn {
          0% { transform: translate(-50%, -46%); opacity: 0; }
          100% { transform: translate(-50%, -50%); opacity: 1; }
        }
        @keyframes crossingPulse {
          0%, 100% { opacity: 0.65; } 50% { opacity: 1; }
        }
      `}</style>

      {/* Tap / swipe layer — beneath every panel, above the canvas. */}
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "auto",
          touchAction: "none",
        }}
      />

      {/* Storm vignette + zap flash */}
      <div
        ref={vignetteRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(18, 14, 42, 0.95) 100%)",
          transition: "opacity 120ms linear",
        }}
      />
      {phase === "dead" && cause === "storm" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#dfe9ff",
            animation: "crossingZapFlash 0.45s ease-out forwards",
          }}
        />
      )}

      {/* Score */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{ insetBlockStart: "calc(16px + env(safe-area-inset-top))" }}
      >
        <div
          style={{
            ...displayFont,
            fontWeight: 900,
            fontSize: 44,
            lineHeight: 1,
            color: INK,
            textShadow: "0 3px 14px rgba(4,16,28,0.65)",
          }}
        >
          {score}
        </div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.28em",
            color: INK_DIM,
            marginTop: 4,
            textShadow: "0 2px 8px rgba(4,16,28,0.65)",
          }}
        >
          BEST {best}
        </div>
      </div>

      {/* Storm warning banner — the pulse lives on the inner span because a
          CSS animation on the outer div would override its rAF-driven
          opacity and pin the banner visible. */}
      <div
        ref={bannerRef}
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          ...panelStyle,
          insetBlockStart: "calc(86px + env(safe-area-inset-top))",
          padding: "8px 14px",
          fontSize: 11,
          letterSpacing: "0.12em",
          color: "#ffd98a",
          opacity: 0,
          transition: "opacity 200ms ease",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ animation: "crossingPulse 0.9s ease-in-out infinite" }}>
          ⚡ YOUR CLOUD WANTS YOU BACK — MOVE!
        </span>
      </div>

      {/* BRUSH toast */}
      {brushToast > 0 && (
        <div
          key={brushToast}
          className="absolute left-1/2 top-1/2"
          style={{
            ...displayFont,
            fontWeight: 900,
            fontSize: 30,
            letterSpacing: "0.04em",
            color: ACCENT,
            textShadow: "0 3px 16px rgba(4,16,28,0.7)",
            animation: "crossingBrushPop 0.85s ease-out forwards",
            whiteSpace: "nowrap",
          }}
        >
          BRUSH +2
        </div>
      )}

      {/* Intro overlay — sits below the knight so the title never covers him. */}
      <div
        className="absolute inset-x-0 flex flex-col items-center gap-3 text-center px-6"
        style={{
          insetBlockEnd: "8%",
          opacity: phase === "intro" ? 1 : 0,
          transition: "opacity 400ms ease",
        }}
      >
        <div
          style={{
            ...displayFont,
            fontWeight: 900,
            fontSize: 34,
            letterSpacing: "-0.01em",
            color: INK,
            textShadow: "0 4px 18px rgba(4,16,28,0.7)",
            textTransform: "uppercase",
          }}
        >
          Knight Crossing
        </div>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.06em",
            color: INK_SOFT,
            maxWidth: 340,
            textShadow: "0 2px 10px rgba(4,16,28,0.7)",
          }}
        >
          Your cloud got tired of carrying you. Rush hour. Get across.
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            color: ACCENT,
            marginTop: 6,
            animation: "crossingPulse 1.4s ease-in-out infinite",
            textShadow: "0 2px 10px rgba(4,16,28,0.7)",
          }}
        >
          {touch ? "TAP TO HOP · SWIPE TO DODGE" : "PRESS ↑ TO HOP"}
        </div>
      </div>

      {/* Desktop controls chip */}
      {!touch && phase !== "dead" && (
        <div
          className="absolute px-3 py-2.5"
          style={{
            ...panelStyle,
            insetInlineStart: 14,
            insetBlockEnd: 14,
            fontSize: 10,
            letterSpacing: "0.06em",
            color: INK_DIM,
          }}
        >
          <div className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <Kbd>←</Kbd>
            <Kbd>→</Kbd>
            <span className="ml-2">hop</span>
            <span className="mx-1" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <Kbd>ESC</Kbd>
            <span className="ml-2">back to map</span>
          </div>
        </div>
      )}

      {/* Death card */}
      {phase === "dead" && showCard && causeLine && (
        <div
          className="absolute left-1/2 top-1/2 text-center"
          style={{
            ...panelStyle,
            transform: "translate(-50%, -50%)",
            padding: "26px 34px 22px",
            minWidth: 280,
            animation: "crossingCardIn 0.35s ease-out forwards",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.26em",
              color: ACCENT,
            }}
          >
            {causeLine[0]}
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.04em",
              color: INK_DIM,
              marginTop: 6,
            }}
          >
            {causeLine[1]}
          </div>
          <div
            style={{
              ...displayFont,
              fontWeight: 900,
              fontSize: 56,
              lineHeight: 1.1,
              color: INK,
              marginTop: 10,
            }}
          >
            {score}
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.24em",
              color: newBest ? ACCENT : INK_DIM,
              marginTop: 4,
            }}
          >
            {newBest ? "★ NEW BEST" : `BEST ${best}`}
          </div>
          <button
            onClick={() => useCrossingStore.getState().reset()}
            style={{
              ...monoFont,
              display: "block",
              width: "100%",
              marginTop: 18,
              padding: "12px 0",
              borderRadius: 999,
              fontSize: 13,
              letterSpacing: "0.14em",
              fontWeight: 700,
              color: "#0d2030",
              background: ACCENT,
              border: "none",
              cursor: "pointer",
            }}
          >
            RETRY
          </button>
          <button
            onClick={() => setLeavingTo("/")}
            style={{
              ...monoFont,
              marginTop: 12,
              fontSize: 11,
              letterSpacing: "0.08em",
              color: INK_SOFT,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span style={{ color: ACCENT }}>←</span> back to the map
          </button>
        </div>
      )}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[10px] rounded-[3px]"
      style={{
        border: "1px solid rgba(255,255,255,0.22)",
        background: "rgba(255,255,255,0.08)",
        color: "#ffffff",
        fontFamily: "inherit",
      }}
    >
      {children}
    </kbd>
  );
}
