"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/game/store";
import { ACCENT, INK, INK_DIM, monoFont, panelStyle } from "./hudTheme";

/** Written once the hidden game has actually been played — the only thing
 *  that retires the hint for good. Dismissing it only clears this visit. */
const STORAGE_KEY = "cloud-egg-played";
/** A short beat so the islands land first — the easter egg is the second note. */
const APPEAR_DELAY_MS = 2000;
const FADE_MS = 500;

/** A small notice under the mute button, nudging the visitor toward the
 *  clouds. Shows on every visit until the hidden game has been played;
 *  dismissing it just clears the current visit. */
export default function CloudHint() {
  const ready = useGameStore((s) => s.ready);
  const leavingTo = useGameStore((s) => s.leavingTo);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    if (localStorage.getItem(STORAGE_KEY) !== "1") setArmed(true);
  }, []);

  useEffect(() => {
    if (!armed || !ready) return;
    const t = setTimeout(() => setShown(true), APPEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, [armed, ready]);

  if (!armed) return null;

  const visible = shown && !dismissed && !leavingTo;

  // Waving the hint off is a "not now", not a "never" — only playing the
  // game retires it, so it comes back on the next visit.
  const dismiss = () => setDismissed(true);

  return (
    <div
      className="cloud-hint-anchor fixed"
      style={{
        insetInlineEnd: 14,
        zIndex: 30,
        maxWidth: "min(232px, calc(100vw - 28px))",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-6px)",
        transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        className="cloud-hint-bob flex items-start gap-2.5 px-3.5 py-3"
        style={{
          ...panelStyle,
          ...monoFont,
          fontSize: 11,
          lineHeight: 1.5,
          letterSpacing: "0.02em",
          color: INK,
        }}
      >
        <span aria-hidden style={{ fontSize: 14, lineHeight: 1.2 }}>
          ☁️
        </span>
        <span>
          psst — have you tried {touch ? "tapping" : "clicking"} a{" "}
          <span style={{ color: ACCENT }}>cloud</span> yet?
        </span>
        <button
          aria-label="Dismiss hint"
          onClick={dismiss}
          className="shrink-0 rounded transition-colors"
          style={{
            marginInlineStart: 2,
            marginBlockStart: -2,
            width: 18,
            height: 18,
            lineHeight: "16px",
            fontSize: 13,
            color: INK_DIM,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
          onMouseLeave={(e) => (e.currentTarget.style.color = INK_DIM)}
        >
          ×
        </button>
      </div>
    </div>
  );
}
