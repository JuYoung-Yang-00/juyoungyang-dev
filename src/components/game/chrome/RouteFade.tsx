"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/game/store";

const OUT_MS = 300;
const IN_MS = 420;

/**
 * Full-screen fade used for route changes. When `leavingTo` is set in the
 * store, fades to the given colour then pushes the route. On mount (arriving
 * at a page), fades back in from that colour.
 */
export default function RouteFade({ color = "#0d2030" }: { color?: string }) {
  const router = useRouter();
  const leavingTo = useGameStore((s) => s.leavingTo);
  const setLeavingTo = useGameStore((s) => s.setLeavingTo);
  const [opaque, setOpaque] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Arrival: covered → fade in.
  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setOpaque(false);
        setMounted(true);
      })
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  // Departure: fade out → navigate.
  useEffect(() => {
    if (!leavingTo) return;
    setOpaque(true);
    const t = setTimeout(() => {
      const to = leavingTo;
      setLeavingTo(null);
      useGameStore.getState().setSelectedIsland(null);
      useGameStore.getState().setHoveredIsland(null);
      document.body.style.cursor = "default";
      router.push(to);
    }, OUT_MS + 40);
    return () => clearTimeout(t);
  }, [leavingTo, router, setLeavingTo]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 55,
        background: color,
        opacity: opaque ? 1 : 0,
        transition: mounted
          ? `opacity ${leavingTo ? OUT_MS : IN_MS}ms ease`
          : "none",
        pointerEvents: opaque ? "auto" : "none",
      }}
    />
  );
}
