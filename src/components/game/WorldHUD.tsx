"use client";

import { useEffect, useState } from "react";
import type { IslandDef } from "@/lib/game/islands";
import type { StationDef } from "@/lib/game/worlds";
import { useGameStore } from "@/lib/game/store";
import {
  ACCENT,
  displayFont,
  INK,
  INK_DIM,
  INK_SOFT,
  monoFont,
  panelStyle,
} from "./chrome/hudTheme";
import Joystick from "./chrome/Joystick";
import StationPanel from "./chrome/StationPanel";

type Props = {
  island: IslandDef;
  stations: StationDef[];
};

export default function WorldHUD({ island, stations }: Props) {
  const setLeavingTo = useGameStore((s) => s.setLeavingTo);
  const nearStationId = useGameStore((s) => s.nearStationId);
  const openStationId = useGameStore((s) => s.openStationId);
  const setOpenStation = useGameStore((s) => s.setOpenStation);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Reset station state when the world unmounts.
  useEffect(() => {
    return () => {
      useGameStore.getState().setNearStation(null);
      useGameStore.getState().setOpenStation(null);
    };
  }, []);

  const near = stations.find((s) => s.id === nearStationId);
  const open = stations.find((s) => s.id === openStationId);

  // Keyboard: Space opens the nearby board, ESC closes it (or exits the world).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        if (useGameStore.getState().openStationId) {
          setOpenStation(null);
        } else {
          setLeavingTo("/");
        }
      }
      if (e.code === "Space") {
        e.preventDefault();
        const state = useGameStore.getState();
        if (!state.openStationId && state.nearStationId) {
          setOpenStation(state.nearStationId);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setLeavingTo, setOpenStation]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 select-none"
      style={{ color: "#e8e6df", ...monoFont }}
    >
      {/* Top-left — back + breadcrumb */}
      <div
        className="absolute flex items-center gap-2 pointer-events-auto px-3 py-2"
        style={{
          ...panelStyle,
          insetInlineStart: 14,
          insetBlockStart: "calc(14px + env(safe-area-inset-top))",
        }}
      >
        <button
          onClick={() => setLeavingTo("/")}
          className="flex items-center gap-2"
          style={{
            color: INK_SOFT,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            ...monoFont,
            fontSize: 11,
            letterSpacing: "0.06em",
            padding: 0,
          }}
        >
          <span style={{ color: ACCENT }}>←</span> map
        </button>
        <span style={{ color: "rgba(255,255,255,0.25)" }}>/</span>
        <span
          style={{
            ...displayFont,
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: "0.01em",
            color: INK,
            textTransform: "uppercase",
          }}
        >
          {island.title}
        </span>
      </div>

      {/* Top-right — world meta (hidden on small screens) */}
      <div
        className="absolute hidden sm:block px-3 py-2"
        style={{
          ...panelStyle,
          insetInlineEnd: 60,
          insetBlockStart: "calc(14px + env(safe-area-inset-top))",
          fontSize: 10,
          letterSpacing: "0.08em",
          color: INK_DIM,
        }}
      >
        <span style={{ color: INK_SOFT }}>{island.org}</span>
        <span className="mx-2" style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
        <span>{island.era}</span>
      </div>

      {/* Bottom-right joystick (touch) or bottom-left controls (desktop) */}
      {touch ? (
        <div
          className="absolute"
          style={{
            insetInlineEnd: 22,
            insetBlockEnd: "calc(30px + env(safe-area-inset-bottom))",
          }}
        >
          <Joystick />
        </div>
      ) : (
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
            <Kbd>W</Kbd>
            <Kbd>A</Kbd>
            <Kbd>S</Kbd>
            <Kbd>D</Kbd>
            <span className="ml-2">move</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Kbd>SPACE</Kbd>
            <span className="ml-2">read a board</span>
            <span className="mx-1" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <Kbd>ESC</Kbd>
            <span className="ml-2">back to map</span>
          </div>
        </div>
      )}

      {/* Read prompt / button when near a board */}
      {near &&
        !open &&
        (touch ? (
          // Left-thumb action button, opposite the joystick.
          <button
            className="absolute pointer-events-auto px-6 py-3.5 rounded-full"
            style={{
              ...monoFont,
              insetInlineStart: 22,
              insetBlockEnd: "calc(56px + env(safe-area-inset-bottom))",
              fontSize: 13,
              letterSpacing: "0.1em",
              fontWeight: 700,
              color: "#0d2030",
              background: ACCENT,
              border: "none",
              boxShadow: "0 4px 18px rgba(4,16,28,0.4)",
              cursor: "pointer",
            }}
            onClick={() => setOpenStation(near.id)}
          >
            READ
          </button>
        ) : (
          <div
            className="absolute flex justify-center"
            style={{ left: 0, right: 0, insetBlockEnd: 92, pointerEvents: "none" }}
          >
            <div
              className="px-4 py-2.5 flex items-center gap-2"
              style={{ ...panelStyle, fontSize: 11, letterSpacing: "0.08em", color: INK_SOFT }}
            >
              <Kbd>SPACE</Kbd>
              <span>
                read <span style={{ color: INK }}>{near.board}</span>
              </span>
            </div>
          </div>
        ))}

      {/* Reading panel */}
      {open && <StationPanel station={open} onClose={() => setOpenStation(null)} />}
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
