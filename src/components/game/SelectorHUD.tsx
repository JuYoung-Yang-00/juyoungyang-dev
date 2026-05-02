"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/game/store";
import { ISLANDS } from "@/lib/game/islands";

const PANEL_BG = "rgba(14, 36, 56, 0.78)";
const PANEL_BORDER = "1px solid rgba(255,255,255,0.12)";

export default function SelectorHUD() {
  const hoveredId = useGameStore((s) => s.hoveredIslandId);
  const [time, setTime] = useState(() => fmtTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(fmtTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  const hovered = ISLANDS.find((i) => i.id === hoveredId);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 select-none"
      style={{
        color: "#e8e6df",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
      }}
    >
      {/* Top-left — breadcrumb pill */}
      <div
        className="absolute top-4 left-4 flex items-center gap-2 text-[10px] tracking-[0.06em] px-3 py-2 rounded-md"
        style={{
          color: "#cce4f5",
          background: PANEL_BG,
          border: PANEL_BORDER,
          backdropFilter: "blur(8px)",
        }}
      >
        <span
          className="inline-block w-3 h-3"
          style={{ background: "#e8a846", borderRadius: 1 }}
        />
        <span style={{ color: "#ffffff" }}>juyoungyang.dev</span>
        <span style={{ color: "#5d8aae" }}>/</span>
        <span
          style={{
            fontFamily: "var(--font-serif), serif",
            fontStyle: "italic",
            fontSize: 14,
            letterSpacing: "-0.01em",
          }}
        >
          select a destination
        </span>
      </div>

      {/* Top-right — clock pill */}
      <div
        className="absolute top-4 right-4 flex items-center gap-2 text-[10px] tracking-[0.06em] px-3 py-2 rounded-md"
        style={{
          color: "#cce4f5",
          background: PANEL_BG,
          border: PANEL_BORDER,
          backdropFilter: "blur(8px)",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontVariantNumeric: "tabular-nums slashed-zero",
          }}
        >
          {time}
        </span>
        <span style={{ color: "#5d8aae" }}>·</span>
        <span>CDT · CHI</span>
      </div>

      {/* Title block — Justin */}
      <div
        className="absolute top-1/2 left-10 -translate-y-1/2 px-7 py-6 rounded-lg max-w-[440px]"
        style={{
          background: PANEL_BG,
          border: PANEL_BORDER,
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="text-[10px] tracking-[0.14em] mb-3"
          style={{ color: "#9bbcd6" }}
        >
          PORTFOLIO · 2026
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif), serif",
            fontStyle: "italic",
            fontSize: 56,
            lineHeight: 0.96,
            letterSpacing: "-0.025em",
            color: "#ffffff",
          }}
        >
          Ju Young
          <br />
          (Justin) Yang
        </div>
        <div
          className="mt-4 text-[12px] leading-[1.7]"
          style={{ color: "#cce4f5" }}
        >
          Software engineer. Pick a destination to explore — each island is a
          chapter of work I&rsquo;ve shipped.
        </div>
      </div>

      {/* Bottom-left — controls */}
      <div
        className="absolute bottom-4 left-4 flex items-center gap-2 text-[10px] tracking-[0.06em] px-3 py-2 rounded-md"
        style={{
          color: "#cce4f5",
          background: PANEL_BG,
          border: PANEL_BORDER,
          backdropFilter: "blur(8px)",
        }}
      >
        <span>hover an island · click to enter</span>
      </div>

      {/* Bottom-right — fallback */}
      <div
        className="absolute bottom-4 right-4 text-[10px] tracking-[0.06em] pointer-events-auto px-3 py-2 rounded-md"
        style={{
          color: "#cce4f5",
          background: PANEL_BG,
          border: PANEL_BORDER,
          backdropFilter: "blur(8px)",
        }}
      >
        <a
          href="#"
          className="hover:underline underline-offset-4"
          style={{ color: "#ffffff" }}
        >
          ↗ static résumé
        </a>
      </div>

      {/* Center bottom — hovered island readout */}
      {hovered && (
        <div
          className="absolute left-1/2 bottom-20 -translate-x-1/2 text-center px-8 py-5 rounded-lg"
          style={{
            background: PANEL_BG,
            border: PANEL_BORDER,
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            className="text-[10px] tracking-[0.14em] mb-2"
            style={{ color: "#9bbcd6" }}
          >
            {hovered.org.toUpperCase()} · {hovered.era}
          </div>
          <div
            className="mb-2"
            style={{
              fontFamily: "var(--font-serif), serif",
              fontStyle: "italic",
              fontSize: 36,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            {hovered.title}
          </div>
          <div className="text-[11px]" style={{ color: "#cce4f5" }}>
            click to enter
          </div>
        </div>
      )}
    </div>
  );
}

function fmtTime(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
