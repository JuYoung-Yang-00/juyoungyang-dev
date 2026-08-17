"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import CrossingScene from "./CrossingScene";
import CrossingHUD from "./CrossingHUD";
import LoadingGate from "../chrome/LoadingGate";
import RouteFade from "../chrome/RouteFade";
import { loadBest, useCrossingStore } from "@/lib/game/crossing/store";

export default function Crossing() {
  const run = useCrossingStore((s) => s.run);

  useEffect(() => {
    useCrossingStore.setState({ best: loadBest() });
    // A fresh mount is a fresh run — clear a dead state left over from a
    // previous visit this session (skip on first load to avoid a remount).
    if (useCrossingStore.getState().phase !== "intro") {
      useCrossingStore.getState().reset();
    }
  }, []);

  return (
    <>
      {/* No shadow pass here — the game runs a blob shadow instead so mid
          mobiles hold 60fps with a screen full of traffic. */}
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 11.5, 10.5], fov: 46, near: 0.1, far: 90 }}
        style={{ position: "fixed", inset: 0 }}
      >
        <color attach="background" args={["#101828"]} />
        <fog attach="fog" args={["#101828", 24, 52]} />

        {/* Blue-hour city light, same recipe as the Work world. */}
        <ambientLight intensity={0.85} color="#9fb4d8" />
        <hemisphereLight args={["#6d8cb0", "#242c3c", 0.7]} />
        <directionalLight position={[18, 28, 10]} intensity={1.0} color="#aebad6" />

        <Suspense fallback={null}>
          <CrossingScene key={run} />
        </Suspense>
      </Canvas>
      <CrossingHUD />
      <LoadingGate dark label="KNIGHT CROSSING" />
      <RouteFade color="#0d2030" />
    </>
  );
}
