"use client";

import { useMemo, useRef, useState } from "react";
import { Group } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/game/store";
import SelectorIsland from "./SelectorIsland";
import SelectorCamera from "./SelectorCamera";
import OceanField from "./OceanField";
import {
  CLOUD_PATHS,
  ISLANDS,
  islandPosition,
  PORTRAIT_ASPECT,
} from "@/lib/game/islands";

CLOUD_PATHS.forEach((p) => useGLTF.preload(p));

type CloudDef = {
  path: string;
  position: [number, number, number];
  scale: number;
  speed: number;
};

const CLOUDS: CloudDef[] = [
  // Closer foreground clouds — visible above horizon, less fog effect
  { path: CLOUD_PATHS[0], position: [-18, 6, -10], scale: 1.0, speed: 0.32 },
  { path: CLOUD_PATHS[1], position: [16, 6, -8], scale: 0.85, speed: 0.24 },
  { path: CLOUD_PATHS[1], position: [-22, 7, 4], scale: 0.9, speed: 0.28 },
  { path: CLOUD_PATHS[0], position: [22, 6, 2], scale: 0.95, speed: 0.22 },

  // Mid-distance clouds — slightly faded by fog
  { path: CLOUD_PATHS[1], position: [-12, 8, -22], scale: 0.95, speed: 0.2 },
  { path: CLOUD_PATHS[0], position: [4, 9, -24], scale: 1.1, speed: 0.16 },
  { path: CLOUD_PATHS[1], position: [18, 8, -22], scale: 0.95, speed: 0.19 },
  { path: CLOUD_PATHS[1], position: [-26, 7, -16], scale: 0.9, speed: 0.23 },
  { path: CLOUD_PATHS[0], position: [26, 8, -16], scale: 1.0, speed: 0.18 },

  // Far high clouds — significantly fogged, give depth at the horizon
  { path: CLOUD_PATHS[1], position: [-8, 11, -34], scale: 0.85, speed: 0.14 },
  { path: CLOUD_PATHS[1], position: [12, 11, -36], scale: 0.85, speed: 0.12 },
  { path: CLOUD_PATHS[1], position: [-30, 9, -26], scale: 0.8, speed: 0.15 },
  { path: CLOUD_PATHS[0], position: [28, 10, -26], scale: 0.8, speed: 0.13 },
];

// Clouds drift east and wrap around once they leave the stage.
const CLOUD_WRAP = 44;

// Every drifting cloud is a door to the hidden game. Hover gives only a
// gentle swell and a pointer cursor — an easter egg should whisper.
function CloudInstance({ def }: { def: CloudDef }) {
  const { scene } = useGLTF(def.path);
  const ref = useRef<Group>(null!);
  const scaleRef = useRef<Group>(null!);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const obj = useMemo(() => scene.clone(true), [scene]);

  const unhover = () => {
    setHovered(false);
    document.body.style.cursor = "default";
  };
  const hoverX = useRef(0);

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    g.position.x += def.speed * delta;
    if (g.position.x > CLOUD_WRAP) {
      g.position.x = -CLOUD_WRAP;
      // The wrap teleports the cloud out from under a stationary cursor;
      // no pointerout will fire, so release the hover here.
      if (hovered) unhover();
    } else if (hovered && Math.abs(g.position.x - hoverX.current) > 2.2) {
      // Same stale-hover problem in slow motion: the cloud drifts out from
      // under a cursor that never moves again.
      unhover();
    }
    const s = scaleRef.current;
    if (s) {
      const target = hovered ? 1.09 : 1;
      const k = s.scale.x + (target - s.scale.x) * Math.min(1, delta * 10);
      s.scale.set(k, k, k);
    }
  });

  // stopPropagation keeps a cloud drifting across an island's sightline
  // from handing the same pointer event to the island behind it.
  const onOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
    hoverX.current = ref.current?.position.x ?? 0;
    document.body.style.cursor = "pointer";
    router.prefetch("/crossing");
  };
  const onOut = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    unhover();
  };
  const onClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const store = useGameStore.getState();
    if (store.leavingTo) return;
    store.setLeavingTo("/crossing");
  };

  return (
    <group ref={ref} position={def.position}>
      <group
        ref={scaleRef}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      >
        <primitive object={obj} scale={def.scale} />
      </group>
    </group>
  );
}

function DeepWater() {
  return (
    <mesh receiveShadow position={[0, -0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1200, 1200]} />
      <meshStandardMaterial color="#0a2c47" roughness={0.6} metalness={0.05} />
    </mesh>
  );
}

export default function SelectorScene() {
  const { size } = useThree();
  const portrait = size.width / Math.max(1, size.height) < PORTRAIT_ASPECT;

  return (
    <>
      <DeepWater />
      <OceanField />

      {ISLANDS.map((island, i) => (
        <SelectorIsland
          key={island.id}
          island={island}
          position={islandPosition(island, portrait)}
          introDelay={0.25 + i * 0.12}
        />
      ))}

      {CLOUDS.map((c, i) => (
        <CloudInstance key={i} def={c} />
      ))}

      <SelectorCamera />
    </>
  );
}
