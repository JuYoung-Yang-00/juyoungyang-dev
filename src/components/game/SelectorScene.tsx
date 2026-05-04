"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import SelectorIsland from "./SelectorIsland";
import SelectorCamera from "./SelectorCamera";
import OceanField from "./OceanField";
import { CLOUD_PATHS, ISLANDS } from "@/lib/game/islands";

CLOUD_PATHS.forEach((p) => useGLTF.preload(p));

const CLOUDS: { path: string; position: [number, number, number]; scale: number }[] = [
  // Closer foreground clouds — visible above horizon, less fog effect
  { path: CLOUD_PATHS[0], position: [-18, 6, -10], scale: 1.0 },
  { path: CLOUD_PATHS[1], position: [16, 6, -8], scale: 0.85 },
  { path: CLOUD_PATHS[1], position: [-22, 7, 4], scale: 0.9 },
  { path: CLOUD_PATHS[0], position: [22, 6, 2], scale: 0.95 },

  // Mid-distance clouds — slightly faded by fog
  { path: CLOUD_PATHS[1], position: [-12, 8, -22], scale: 0.95 },
  { path: CLOUD_PATHS[0], position: [4, 9, -24], scale: 1.1 },
  { path: CLOUD_PATHS[1], position: [18, 8, -22], scale: 0.95 },
  { path: CLOUD_PATHS[1], position: [-26, 7, -16], scale: 0.9 },
  { path: CLOUD_PATHS[0], position: [26, 8, -16], scale: 1.0 },

  // Far high clouds — significantly fogged, give depth at the horizon
  { path: CLOUD_PATHS[1], position: [-8, 11, -34], scale: 0.85 },
  { path: CLOUD_PATHS[1], position: [12, 11, -36], scale: 0.85 },
  { path: CLOUD_PATHS[1], position: [-30, 9, -26], scale: 0.8 },
  { path: CLOUD_PATHS[1], position: [28, 10, -26], scale: 0.8 },
];

function CloudInstance({
  path,
  position,
  scale,
}: {
  path: string;
  position: [number, number, number];
  scale: number;
}) {
  const { scene } = useGLTF(path);
  const obj = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={obj} position={position} scale={scale} />;
}

function Water() {
  return (
    <>
      {/* Deep ocean backdrop — sits well below the chunky hex water tiles
          so they read as floating-on-water instead of merging into a sheet.
          Darker shade for contrast against the royal-blue hex tiles. */}
      <mesh receiveShadow position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1200, 1200]} />
        <meshStandardMaterial
          color="#061321"
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

    </>
  );
}

export default function SelectorScene() {
  return (
    <>
      <Water />
      <OceanField />

      {ISLANDS.map((island) => (
        <SelectorIsland key={island.id} {...island} />
      ))}

      {CLOUDS.map((c, i) => (
        <CloudInstance key={i} {...c} />
      ))}

      <SelectorCamera />
    </>
  );
}
