"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Texture,
} from "three";
import { Text, useGLTF } from "@react-three/drei";
import { useRouter } from "next/navigation";
import {
  BUILDING_PATH,
  DECORATION_PATHS,
  TILE_PATH,
  type DecorationDef,
  type ExtraBuildingDef,
  type IslandDef,
} from "@/lib/game/islands";
import { useGameStore } from "@/lib/game/store";

useGLTF.preload(TILE_PATH);
Object.values(BUILDING_PATH).forEach((p) => useGLTF.preload(p));
DECORATION_PATHS.forEach((p) => useGLTF.preload(p));

// KayKit's hexagons_medieval.png is an 8×4 atlas. The hex_grass tile's UVs
// land at column 0, row 3 — which is olive-mustard. Shift right one column
// (0.125 in U) to sample emerald-green at column 1, row 3.
const TILE_UV_SHIFT_X = 0.125;
const tilePatchedTextures = new WeakSet<Texture>();

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

function patchTileTexture(root: Object3D) {
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as MeshStandardMaterial | MeshStandardMaterial[];
    const apply = (m: MeshStandardMaterial) => {
      if (!m?.map) return;
      if (tilePatchedTextures.has(m.map)) return;
      m.map.offset.set(TILE_UV_SHIFT_X, 0);
      m.map.needsUpdate = true;
      tilePatchedTextures.add(m.map);
    };
    if (Array.isArray(mat)) mat.forEach(apply);
    else apply(mat);
  });
}

function enableShadows(root: Object3D) {
  root.traverse((obj) => {
    if ((obj as Mesh).isMesh) {
      (obj as Mesh).castShadow = true;
      (obj as Mesh).receiveShadow = true;
    }
  });
}

function setEmissive(root: Object3D, hex: string, intensity: number) {
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as MeshStandardMaterial | MeshStandardMaterial[];
    const apply = (m: MeshStandardMaterial) => {
      if (!m || !("emissive" in m)) return;
      m.emissive?.set(hex);
      m.emissiveIntensity = intensity;
      m.needsUpdate = true;
    };
    if (Array.isArray(mat)) mat.forEach(apply);
    else apply(mat);
  });
}

export function ExtraTile({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF(TILE_PATH);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    enableShadows(c);
    patchTileTexture(c);
    return c;
  }, [scene]);
  return <primitive object={obj} scale={1.6} position={position} />;
}

function ExtraBuilding({ def, active }: { def: ExtraBuildingDef; active: boolean }) {
  const { scene } = useGLTF(BUILDING_PATH[def.key]);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    enableShadows(c);
    return c;
  }, [scene]);
  useEffect(() => {
    setEmissive(obj, active ? "#e8a846" : "#000000", active ? 0.16 : 0);
  }, [active, obj]);
  return (
    <primitive
      object={obj}
      position={def.position}
      rotation={[0, def.rotY ?? 0, 0]}
      scale={1.6 * (def.scale ?? 1)}
    />
  );
}

function Decoration({ def }: { def: DecorationDef }) {
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

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

type Props = {
  island: IslandDef;
  position: [number, number, number];
  introDelay: number;
};

export default function SelectorIsland({ island, position, introDelay }: Props) {
  const {
    id,
    title,
    building,
    buildingScale = 1,
    buildingOffset = [0, 0, 0],
    extraBuildings = [],
    tiles = [],
    decorations,
    signOffset,
    ringRadius = 2.0,
  } = island;
  const groupRef = useRef<Group>(null!);
  const scaleRef = useRef<Group>(null!);
  const ringRef = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const setHoveredIsland = useGameStore((s) => s.setHoveredIsland);
  const selectedIslandId = useGameStore((s) => s.selectedIslandId);
  const setSelectedIsland = useGameStore((s) => s.setSelectedIsland);
  const setLeavingTo = useGameStore((s) => s.setLeavingTo);
  const leavingTo = useGameStore((s) => s.leavingTo);
  const ready = useGameStore((s) => s.ready);
  const router = useRouter();
  const introT0 = useRef<number | null>(null);
  const skipIntro = useRef(useGameStore.getState().introPlayed);

  const { scene: tileSrc } = useGLTF(TILE_PATH);
  const { scene: buildingSrc } = useGLTF(BUILDING_PATH[building]);

  const centreTile = useMemo(() => tileSrc.clone(true), [tileSrc]);
  const buildingObj = useMemo(() => buildingSrc.clone(true), [buildingSrc]);

  const active = hovered || selectedIslandId === id;

  useEffect(() => {
    enableShadows(centreTile);
    enableShadows(buildingObj);
    patchTileTexture(centreTile);
  }, [centreTile, buildingObj]);

  // Subtle warm rim on the building — enough to read as "lit", not enough
  // to wash out the KayKit textures.
  useEffect(() => {
    setEmissive(buildingObj, active ? "#e8a846" : "#000000", active ? 0.16 : 0);
  }, [active, buildingObj]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = "pointer";
      return () => {
        document.body.style.cursor = "default";
      };
    }
  }, [hovered]);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    const s = scaleRef.current;
    if (!g || !s) return;
    const t = clock.getElapsedTime();

    // Pop-in intro: scale 0 → 1 with a back-out overshoot, staggered.
    let intro = 1;
    if (skipIntro.current) {
      intro = 1;
    } else if (!ready) {
      intro = 0;
    } else {
      if (introT0.current === null) introT0.current = t;
      intro = Math.min(1, Math.max(0, (t - introT0.current - introDelay) / 0.6));
    }
    const pop = intro <= 0 ? 0 : intro >= 1 ? 1 : easeOutBack(intro);

    g.position.y = position[1] + Math.sin(t * 0.5 + position[0] * 0.3) * 0.12;
    const target = active ? 1.05 : 1.0;
    const sx = s.scale.x + (target - s.scale.x) * 0.12;
    const k = Math.max(0.0001, pop * sx);
    s.scale.set(k, k, k);

    // Selection ring: gentle radial pulse while active.
    const ring = ringRef.current;
    if (ring) {
      const pulse = active ? 1 + Math.sin(t * 3.2) * 0.04 : 1;
      ring.scale.set(pulse, pulse, 1);
      const mat = ring.material as MeshBasicMaterial;
      const targetOpacity = active ? 0.85 : 0;
      mat.opacity += (targetOpacity - mat.opacity) * 0.15;
    }
  });

  const enter = () => {
    if (leavingTo) return;
    setLeavingTo(`/world/${id}`);
  };

  const onOver = () => {
    setHovered(true);
    setHoveredIsland(id);
    router.prefetch(`/world/${id}`);
  };
  const onOut = () => {
    setHovered(false);
    setHoveredIsland(null);
  };
  const onClick = () => {
    if (isTouchDevice() && selectedIslandId !== id) {
      // First tap on touch: select + show the info card. Second tap enters.
      setSelectedIsland(id);
      router.prefetch(`/world/${id}`);
      return;
    }
    enter();
  };

  // Wooden signpost — per-island position, default front-centre
  const [signX, signZ] = signOffset ?? [0, 1.6];

  return (
    <group position={position} ref={groupRef}>
      <group
        ref={scaleRef}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      >
        <primitive object={centreTile} scale={1.6} />
        <primitive
          object={buildingObj}
          scale={1.6 * buildingScale}
          position={buildingOffset}
        />

        {tiles.map(([x, z], i) => (
          <ExtraTile key={i} position={[x, 0, z]} />
        ))}

        {extraBuildings.map((b, i) => (
          <ExtraBuilding key={`${id}-b-${i}`} def={b} active={active} />
        ))}

        {decorations.map((d, i) => (
          <Decoration key={`${id}-${i}`} def={d} />
        ))}

        <mesh ref={ringRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ringRadius - 0.3, ringRadius, 48]} />
          <meshBasicMaterial color="#e8a846" transparent opacity={0} />
        </mesh>

        {/* Wooden signpost: two thin legs + a smaller tilted plank */}
        <group position={[signX, 0.05, signZ]}>
          {/* Left leg */}
          <mesh position={[-0.55, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
            <meshStandardMaterial color="#3e2a14" roughness={0.95} />
          </mesh>
          {/* Right leg */}
          <mesh position={[0.55, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
            <meshStandardMaterial color="#3e2a14" roughness={0.95} />
          </mesh>

          {/* Sign plank, tilted back to face the 30° camera */}
          <group position={[0, 0.7, 0]} rotation={[-Math.PI / 6.5, 0, 0]}>
            {/* Main plank */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.7, 0.5, 0.07]} />
              <meshStandardMaterial
                color={active ? "#9a6232" : "#7a4f25"}
                roughness={0.85}
              />
            </mesh>
            {/* Top trim */}
            <mesh position={[0, 0.27, 0]} castShadow>
              <boxGeometry args={[1.82, 0.08, 0.085]} />
              <meshStandardMaterial color="#3e2a14" roughness={0.95} />
            </mesh>
            {/* Bottom trim */}
            <mesh position={[0, -0.27, 0]} castShadow>
              <boxGeometry args={[1.82, 0.08, 0.085]} />
              <meshStandardMaterial color="#3e2a14" roughness={0.95} />
            </mesh>

            {/* Painted island name */}
            <Text
              position={[0, 0, 0.045]}
              font="/fonts/Rubik-Black.woff"
              fontSize={0.24}
              color={active ? "#ffe6a8" : "#fff5db"}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="#2a1808"
              letterSpacing={-0.02}
            >
              {title.toUpperCase()}
            </Text>
          </group>
        </group>
      </group>
    </group>
  );
}
