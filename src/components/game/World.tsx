"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import WorldScene from "./WorldScene";
import KolfiScene from "./worlds/KolfiScene";
import WorldHUD from "./WorldHUD";
import { ISLANDS, type IslandDef } from "@/lib/game/islands";

export default function World({ id }: { id: string }) {
  const island = ISLANDS.find((i) => i.id === id) as IslandDef | undefined;
  if (!island) return null;

  // KOLfi gets a dedicated cyberpunk-city scene built from Synty assets;
  // every other world falls back to the generic placeholder for now.
  const isKolfi = island.id === "kolfi";

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 12, 18], fov: 50, near: 0.1, far: 240 }}
        style={{ position: "fixed", inset: 0 }}
      >
        <color attach="background" args={[isKolfi ? "#0d1420" : "#0a0a0a"]} />
        <fog
          attach="fog"
          args={[isKolfi ? "#0d1420" : "#0a0a0a", 60, 200]}
        />

        {/* KOLfi runs darker so the building emissive maps + neon point
            lights carry the scene — proper night-city look */}
        <ambientLight intensity={isKolfi ? 0.18 : 0.32} />
        <hemisphereLight
          args={[
            isKolfi ? "#5e7da0" : "#e8a846",
            isKolfi ? "#0d1420" : "#0a0a0a",
            isKolfi ? 0.25 : 0.18,
          ]}
        />
        <directionalLight
          position={[18, 28, 10]}
          intensity={isKolfi ? 0.45 : 1.05}
          color={isKolfi ? "#7d8aa8" : "#ffffff"}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-camera-near={0.1}
          shadow-camera-far={80}
          shadow-bias={-0.0005}
        />

        <Suspense fallback={null}>
          {isKolfi ? <KolfiScene island={island} /> : <WorldScene island={island} />}
        </Suspense>
      </Canvas>
      <WorldHUD island={island} />
    </>
  );
}
