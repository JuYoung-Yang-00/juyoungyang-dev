"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/game/store";
import { ISLANDS } from "@/lib/game/islands";
import {
  ACCENT,
  displayFont,
  INK,
  INK_DIM,
  INK_SOFT,
  monoFont,
  panelStyle,
} from "./chrome/hudTheme";
import { GitHubIcon, LinkedInIcon, ScholarIcon } from "./chrome/Icons";
import CloudHint from "./chrome/CloudHint";

const LINKS = [
  { href: "https://github.com/JuYoung-Yang-00", label: "GitHub", Icon: GitHubIcon },
  { href: "https://linkedin.com/in/juyoung-yang", label: "LinkedIn", Icon: LinkedInIcon },
  { href: "https://scholar.google.com/citations?user=YTJXJj8AAAAJ", label: "Google Scholar", Icon: ScholarIcon },
];

export default function SelectorHUD() {
  const hoveredId = useGameStore((s) => s.hoveredIslandId);
  const selectedId = useGameStore((s) => s.selectedIslandId);
  const setLeavingTo = useGameStore((s) => s.setLeavingTo);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const activeId = hoveredId ?? selectedId;
  const active = ISLANDS.find((i) => i.id === activeId);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 select-none"
      style={{
        color: "#e8e6df",
        ...monoFont,
        padding:
          "calc(14px + env(safe-area-inset-top)) calc(14px + env(safe-area-inset-right)) calc(14px + env(safe-area-inset-bottom)) calc(14px + env(safe-area-inset-left))",
      }}
    >
      <CloudHint />

      {/* Top-left — nameplate */}
      <div
        className="absolute px-4 py-3 sm:px-5"
        style={{ ...panelStyle, insetInlineStart: 14, insetBlockStart: 14 }}
      >
        <div
          style={{
            ...displayFont,
            fontWeight: 900,
            fontSize: "clamp(17px, 2.2vw, 22px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: INK,
            textTransform: "uppercase",
          }}
        >
          Justin Yang
        </div>
        <div
          className="mt-1.5"
          style={{ fontSize: 9, letterSpacing: "0.22em", color: INK_DIM }}
        >
          SOFTWARE ENGINEER
        </div>
      </div>

      {/* Bottom-left — hint */}
      <div
        className="absolute px-3 py-2 hidden sm:block"
        style={{
          ...panelStyle,
          insetInlineStart: 14,
          insetBlockEnd: 14,
          fontSize: 10,
          letterSpacing: "0.06em",
          color: INK_SOFT,
        }}
      >
        {touch ? "tap an island · tap again to enter" : "hover an island · click to enter"}
      </div>

      {/* Bottom-right — links */}
      <div
        className="absolute flex items-center pointer-events-auto"
        style={{
          ...panelStyle,
          insetInlineEnd: 14,
          insetBlockEnd: 14,
          padding: "4px 6px",
          gap: 2,
        }}
      >
        {LINKS.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") || href.endsWith(".pdf") ? "_blank" : undefined}
            rel="noreferrer"
            aria-label={label}
            title={label}
            className="flex items-center justify-center rounded-md transition-colors"
            style={{ width: 34, height: 34, color: INK_SOFT }}
            onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
            onMouseLeave={(e) => (e.currentTarget.style.color = INK_SOFT)}
          >
            <Icon size={16} />
          </a>
        ))}
      </div>

      {/* Bottom-center — active island card */}
      {active && (
        <div
          className="absolute text-center px-7 py-4 sm:px-8 sm:py-5"
          style={{
            ...panelStyle,
            left: "50%",
            transform: "translateX(-50%)",
            insetBlockEnd: 64,
            minWidth: 230,
          }}
        >
          <div
            className="mb-2"
            style={{ fontSize: 10, letterSpacing: "0.14em", color: INK_DIM }}
          >
            {active.org.toUpperCase()} · {active.era}
          </div>
          <div
            style={{
              ...displayFont,
              fontWeight: 800,
              fontSize: "clamp(24px, 3.4vw, 32px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: INK,
              textTransform: "uppercase",
            }}
          >
            {active.title}
          </div>
          {touch ? (
            <button
              className="pointer-events-auto mt-3 px-5 py-2 rounded-md"
              style={{
                ...monoFont,
                fontSize: 11,
                letterSpacing: "0.1em",
                color: "#0d2030",
                background: ACCENT,
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={() => setLeavingTo(`/world/${active.id}`)}
            >
              ENTER →
            </button>
          ) : (
            <div className="mt-2" style={{ fontSize: 11, color: INK_SOFT }}>
              click to enter
            </div>
          )}
        </div>
      )}
    </div>
  );
}
