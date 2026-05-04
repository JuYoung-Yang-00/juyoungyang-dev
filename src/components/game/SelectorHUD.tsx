"use client";

import { useGameStore } from "@/lib/game/store";
import { ISLANDS } from "@/lib/game/islands";

const PANEL_BG = "rgba(14, 36, 56, 0.78)";
const PANEL_BORDER = "1px solid rgba(255,255,255,0.12)";

export default function SelectorHUD() {
  const hoveredId = useGameStore((s) => s.hoveredIslandId);
  const hovered = ISLANDS.find((i) => i.id === hoveredId);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 select-none"
      style={{
        color: "#e8e6df",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
      }}
    >
      {/* Top-left — title pill */}
      <div
        className="absolute top-4 left-4 px-5 py-3 rounded-md"
        style={{
          background: PANEL_BG,
          border: PANEL_BORDER,
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display), system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 22,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            textTransform: "uppercase",
          }}
        >
          Justin Yang
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
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 32,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              textTransform: "uppercase",
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
