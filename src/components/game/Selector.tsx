"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import SelectorScene from "./SelectorScene";
import SelectorHUD from "./SelectorHUD";
import LoadingGate from "./chrome/LoadingGate";
import RouteFade from "./chrome/RouteFade";
import { useGameStore } from "@/lib/game/store";

export default function Selector() {
  const setReady = useGameStore((s) => s.setReady);
  const introPlayed = useGameStore((s) => s.introPlayed);
  const setIntroPlayed = useGameStore((s) => s.setIntroPlayed);

  // Respect reduced-motion: skip the fly-in and island pop-in entirely.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIntroPlayed(true);
    }
  }, [setIntroPlayed]);

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 10, 26], fov: 42, near: 0.1, far: 320 }}
        style={{ position: "fixed", inset: 0 }}
        onPointerMissed={() => useGameStore.getState().setSelectedIsland(null)}
      >
        {/* Sky background */}
        <color attach="background" args={["#a8dcef"]} />

        {/* Fog matched to sky colour — near/far are retuned per-viewport by
            SelectorCamera so the horizon melts into the sky at every size. */}
        <fog attach="fog" args={["#a8dcef", 24, 70]} />

        {/* Neutral white lighting so KayKit textures render true colors */}
        <ambientLight intensity={0.6} />
        <hemisphereLight args={["#ffffff", "#1f6da0", 0.55]} />
        <directionalLight
          position={[20, 30, 14]}
          intensity={1.1}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
          shadow-camera-near={0.1}
          shadow-camera-far={70}
          shadow-bias={-0.0005}
        />

        <Suspense fallback={null}>
          <SelectorScene />
        </Suspense>
      </Canvas>
      <SelectorHUD />
      <LoadingGate skip={introPlayed} onReady={() => setReady(true)} />
      <RouteFade color="#0d2030" />
    </>
  );
}
