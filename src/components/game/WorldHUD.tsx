"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { IslandDef } from "@/lib/game/islands";

export default function WorldHUD({ island }: { island: IslandDef }) {
  const router = useRouter();

  // ESC → back to map
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 select-none"
      style={{
        color: "#e8e6df",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
      }}
    >
      {/* Top-left — breadcrumb with back link */}
      <div
        className="absolute top-4 left-4 flex items-center gap-2 text-[10px] tracking-[0.06em] pointer-events-auto"
        style={{ color: "#8a8780" }}
      >
        <span
          className="inline-block w-3 h-3"
          style={{ background: "#e8a846", borderRadius: 1 }}
        />
        <button
          onClick={() => router.push("/")}
          className="hover:underline underline-offset-4"
          style={{
            color: "#e8e6df",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "inherit",
            letterSpacing: "inherit",
            padding: 0,
          }}
        >
          ← juyoungyang.dev
        </button>
        <span style={{ color: "#5a5854" }}>/</span>
        <span style={{ color: "#8a8780" }}>worlds</span>
        <span style={{ color: "#5a5854" }}>/</span>
        <span
          style={{
            fontFamily: "var(--font-display), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "-0.005em",
            color: "#e8e6df",
            textTransform: "uppercase",
          }}
        >
          {island.title}
        </span>
      </div>

      {/* Top-right — world meta */}
      <div
        className="absolute top-4 right-4 text-[10px] tracking-[0.06em]"
        style={{ color: "#8a8780" }}
      >
        <span style={{ color: "#e8e6df" }}>{island.org}</span>
        <span className="mx-2" style={{ color: "#5a5854" }}>
          ·
        </span>
        <span>{island.era}</span>
      </div>

      {/* Bottom-left — controls */}
      <div
        className="absolute bottom-4 left-4 text-[10px] tracking-[0.06em]"
        style={{ color: "#8a8780" }}
      >
        <div className="flex items-center gap-1.5">
          <Kbd>W</Kbd>
          <Kbd>A</Kbd>
          <Kbd>S</Kbd>
          <Kbd>D</Kbd>
          <span className="ml-2">move</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Kbd>ESC</Kbd>
          <span className="ml-2">back to map</span>
        </div>
      </div>

      {/* Bottom-right — fallback */}
      <div
        className="absolute bottom-4 right-4 text-[10px] tracking-[0.06em] pointer-events-auto"
        style={{ color: "#8a8780" }}
      >
        <a
          href="#"
          className="hover:underline underline-offset-4"
          style={{ color: "#e8e6df" }}
        >
          ↗ static résumé
        </a>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[10px] rounded-[2px]"
      style={{
        border: "1px solid #1f1f1f",
        background: "#0f0f0f",
        color: "#e8e6df",
        fontFamily: "inherit",
      }}
    >
      {children}
    </kbd>
  );
}
