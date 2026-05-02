"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import WorldScene from "./WorldScene";
import WorldHUD from "./WorldHUD";
import { ISLANDS, type IslandDef } from "@/lib/game/islands";

export default function World({ id }: { id: string }) {
  const island = ISLANDS.find((i) => i.id === id) as IslandDef | undefined;
  if (!island) return null;

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 12, 18], fov: 50, near: 0.1, far: 200 }}
        style={{ position: "fixed", inset: 0 }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <fog attach="fog" args={["#0a0a0a", 35, 95]} />

        <ambientLight intensity={0.32} />
        <hemisphereLight args={["#e8a846", "#0a0a0a", 0.18]} />
        <directionalLight
          position={[18, 28, 10]}
          intensity={1.05}
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
          <WorldScene island={island} />
        </Suspense>
      </Canvas>
      <WorldHUD island={island} />
    </>
  );
}
