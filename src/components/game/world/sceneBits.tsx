"use client";

import { useMemo, useRef } from "react";
import { Group, Mesh, MeshStandardMaterial, Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { BUILDING_PATH, CLOUD_PATHS } from "@/lib/game/islands";
import type { BuildingPlacement, PropDef } from "@/lib/game/worlds";

export function enableShadows(root: Object3D) {
  root.traverse((obj) => {
    if ((obj as Mesh).isMesh) {
      (obj as Mesh).castShadow = true;
      (obj as Mesh).receiveShadow = true;
      const mat = (obj as Mesh).material as MeshStandardMaterial;
      if (mat && "emissive" in mat) {
        mat.emissive?.set("#000000");
        mat.emissiveIntensity = 0;
      }
    }
  });
}

export function Building({ def }: { def: BuildingPlacement }) {
  const { scene } = useGLTF(BUILDING_PATH[def.key]);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    enableShadows(c);
    return c;
  }, [scene]);
  return (
    <primitive
      object={obj}
      position={def.position}
      rotation={[0, def.rotY ?? 0, 0]}
      scale={1.6 * (def.scale ?? 1)}
    />
  );
}

export function Prop({ def }: { def: PropDef }) {
  const { scene } = useGLTF(def.path);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    enableShadows(c);
    return c;
  }, [scene]);
  return (
    <primitive
      object={obj}
      position={def.position}
      rotation={[0, def.rotation ?? 0, 0]}
      scale={1.6 * (def.scale ?? 1)}
    />
  );
}

export type CloudDef = {
  position: [number, number, number];
  scale: number;
  speed: number;
  big?: boolean;
};

export const WORLD_CLOUDS: CloudDef[] = [
  { position: [-16, 7, -16], scale: 1.0, speed: 0.25, big: true },
  { position: [14, 8, -20], scale: 0.9, speed: 0.2 },
  { position: [-20, 9, 2], scale: 0.85, speed: 0.22 },
  { position: [18, 7, 8], scale: 0.9, speed: 0.18, big: true },
  { position: [2, 10, -28], scale: 1.1, speed: 0.15, big: true },
  { position: [-10, 11, -32], scale: 0.8, speed: 0.13 },
  { position: [24, 10, -10], scale: 0.85, speed: 0.16 },
  { position: [-24, 8, 14], scale: 0.9, speed: 0.2 },
  { position: [10, 9, 22], scale: 0.85, speed: 0.17, big: true },
];

export function Cloud({ def }: { def: CloudDef }) {
  const { scene } = useGLTF(def.big ? CLOUD_PATHS[0] : CLOUD_PATHS[1]);
  const ref = useRef<Group>(null!);
  const obj = useMemo(() => scene.clone(true), [scene]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.position.x += def.speed * delta;
    if (ref.current.position.x > 34) ref.current.position.x = -34;
  });
  return (
    <group ref={ref} position={def.position}>
      <primitive object={obj} scale={def.scale} />
    </group>
  );
}

/** Deterministic pseudo-random in [0, 1) — stable across renders and builds. */
export function hash01(a: number, b: number) {
  const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return s - Math.floor(s);
}
