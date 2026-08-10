"use client";

import { useMemo } from "react";
import { Mesh, MeshStandardMaterial, Object3D } from "three";
import { Text, useGLTF } from "@react-three/drei";
import PlayerCharacter from "../PlayerCharacter";
import CameraRig from "../CameraRig";
import InfoStation from "./InfoStation";
import WelcomeBoard from "./WelcomeBoard";
import { makeRectBounds } from "./hexUtils";
import type { IslandDef } from "@/lib/game/islands";
import { WORK_STATIONS, WORK_TAGLINE } from "@/lib/game/worlds";

const SYNTY = "/models/synty";

const P = {
  large01: `${SYNTY}/SM_Bld_Large_01.glb`,
  large02: `${SYNTY}/SM_Bld_Large_02.glb`,
  large03: `${SYNTY}/SM_Bld_Large_03.glb`,
  large04: `${SYNTY}/SM_Bld_Large_04.glb`,
  large05: `${SYNTY}/SM_Bld_Large_05.glb`,
  large06: `${SYNTY}/SM_Bld_Large_06.glb`,
  advanced01: `${SYNTY}/SM_Bld_Advanced_01.glb`,
  bank: `${SYNTY}/SM_Bld_Bank_01.glb`,
  chopshop: `${SYNTY}/SM_Bld_Chopshop_01.glb`,
  industrial01: `${SYNTY}/SM_Bld_Industrial_01.glb`,
  foodhole: `${SYNTY}/SM_Bld_FoodHole_01.glb`,
  wall: `${SYNTY}/SM_Bld_City_Wall_01.glb`,
  tower: `${SYNTY}/SM_Bld_City_Wall_Tower_01.glb`,
  veh1: `${SYNTY}/SM_Veh_Future_01.glb`,
  vehTaxi: `${SYNTY}/SM_Veh_Future_Taxi_01.glb`,
  vehBike: `${SYNTY}/SM_Veh_Hover_Bike_01.glb`,
  lightBar: `${SYNTY}/SM_Prop_LightBar_01.glb`,
  marketLights: `${SYNTY}/SM_Prop_MarketLights_01.glb`,
} as const;

Object.values(P).forEach((p) => useGLTF.preload(p));

function enableShadows(root: Object3D) {
  root.traverse((obj) => {
    if ((obj as Mesh).isMesh) {
      (obj as Mesh).castShadow = true;
      (obj as Mesh).receiveShadow = true;
    }
  });
}

// Window-glow trick: re-use the building's albedo texture as emissive map so
// bright window texels light up at night without per-window placement.
function applyEmissiveGlow(root: Object3D, intensity = 0.55) {
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as MeshStandardMaterial;
    if (!mat || !mat.map) return;
    mat.emissiveMap = mat.map;
    mat.emissive?.setHex(0xffffff);
    mat.emissiveIntensity = intensity;
    mat.needsUpdate = true;
  });
}

function Bld({
  path,
  position,
  rotation = 0,
  scale = 0.5,
  glow = 0.6,
}: {
  path: string;
  position: [number, number, number];
  rotation?: number;
  scale?: number;
  glow?: number;
}) {
  const { scene } = useGLTF(path);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    enableShadows(c);
    applyEmissiveGlow(c, glow);
    return c;
  }, [scene, glow]);
  return (
    <primitive
      object={obj}
      position={position}
      rotation={[0, rotation, 0]}
      scale={scale}
    />
  );
}

// ─── City geometry ──────────────────────────────────────────────────────
// One straight avenue walked newest → oldest: spawn at the south gate into
// KOLfi downtown, then OSSA mid-city, then Very Sweet at the north end.
// One hero building + one board per company; everything else stays well off
// the |x| < 6 corridor so the walk breathes — the old seven-board layout
// read as clutter next to the education valley.
const WALL_X = 16;
const WALL_S = 27.5;
const WALL_N = -35;
const BOUND_X = 14.6;
const BOUND_S = 25.5;
const BOUND_N = -28.5;

const COLLIDERS: [number, number, number][] = [
  // KOLfi hero tower
  [-13.2, 12, 4.6],
  // OSSA office
  [11.5, -1.5, 3.4],
  // Very Sweet diner
  [-10.5, -16.5, 3.2],
  // District texture
  [14, 16, 2.2],
  [-12.8, -2, 2.4],
  [11.5, -20, 2.4],
  // Street life (kept off the corridor)
  [7.5, 13, 1.7], // taxi
  [-8, -3, 1.7], // veh
  [6.5, -18.5, 1.4], // bike
  [-5.8, 8, 0.7], // light bars
  [5.8, -7, 0.7],
  [-7.4, -19.8, 1.0], // market lights by the diner
  // Boards + welcome
  ...WORK_STATIONS.map(
    (s) => [s.spot[0], s.spot[1], 0.6] as [number, number, number]
  ),
  [3.4, 23.8, 0.8],
];

const workBounds = makeRectBounds(BOUND_X, BOUND_N, BOUND_S, COLLIDERS);

function CityWalls() {
  return (
    <>
      {/* Corner towers */}
      <Bld path={P.tower} position={[-WALL_X, 0, WALL_S]} scale={1} glow={0.4} />
      <Bld path={P.tower} position={[WALL_X, 0, WALL_S]} scale={1} glow={0.4} />
      <Bld path={P.tower} position={[-WALL_X, 0, WALL_N]} scale={1} glow={0.4} />
      <Bld path={P.tower} position={[WALL_X, 0, WALL_N]} scale={1} glow={0.4} />

      {/* South wall — wide central gate the avenue passes through */}
      <Bld path={P.wall} position={[-11.5, 0, WALL_S]} scale={1} glow={0.35} />
      <Bld path={P.wall} position={[11.5, 0, WALL_S]} scale={1} glow={0.35} />

      {/* North wall behind the oldest district */}
      <Bld path={P.wall} position={[-11.5, 0, WALL_N]} scale={1} glow={0.35} />
      <Bld path={P.wall} position={[0.5, 0, WALL_N]} scale={1} glow={0.35} />
      <Bld path={P.wall} position={[11.5, 0, WALL_N]} scale={1} glow={0.35} />

      {/* Side walls */}
      {[21.5, 10, -1.5, -13, -24.5].map((z) => (
        <group key={z}>
          <Bld path={P.wall} position={[-WALL_X, 0, z]} rotation={Math.PI / 2} scale={1} glow={0.35} />
          <Bld path={P.wall} position={[WALL_X, 0, z]} rotation={Math.PI / 2} scale={1} glow={0.35} />
        </group>
      ))}
    </>
  );
}

function CityFloor() {
  return (
    <>
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[110, 130]} />
        <meshStandardMaterial color="#2b3448" roughness={0.9} />
      </mesh>

      {/* The avenue — full length of the timeline, wider than the old 4.4
          so the corridor doesn't pinch between the district plazas. */}
      <mesh position={[0, 0.001, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.6, 58]} />
        <meshBasicMaterial color="#232b3c" />
      </mesh>
      {/* Centre dashes */}
      {Array.from({ length: 14 }, (_, i) => 24 - i * 4).map((z) => (
        <mesh key={z} position={[0, 0.002, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 1.6]} />
          <meshBasicMaterial color="#e8a846" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* District plazas — a pool of light in front of each board */}
      {[
        [-4.8, 15.5],
        [4.6, 1.5],
        [-4.6, -13.5],
      ].map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, 0.003, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.6, 2.72, 48]} />
          <meshBasicMaterial color="#e8a846" transparent opacity={0.4} />
        </mesh>
      ))}
    </>
  );
}

/** Neon era marker painted across the avenue at a district's edge. */
function RoadMarker({ text, z }: { text: string; z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.2, 1.5]} />
        <meshBasicMaterial color="#131a28" transparent opacity={0.85} />
      </mesh>
      <Text
        position={[0, 0.008, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        font="/fonts/Rubik-Black.woff"
        fontSize={0.78}
        color="#7fd4ff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
      >
        {text}
      </Text>
    </group>
  );
}

export default function WorkCityScene({ island }: { island: IslandDef }) {
  return (
    <>
      <CityFloor />
      <CityWalls />

      {/* ── Stop 1 · KOLfi (2026 – now) — hero tower right at the gate */}
      <Bld path={P.large03} position={[-13.2, 0, 12]} scale={0.55} rotation={Math.PI / 16} glow={0.7} />

      {/* ── Stop 2 · OSSA.AI (2024–2025) — mid-city office */}
      <Bld path={P.advanced01} position={[11.5, 0, -1.5]} rotation={-0.35} scale={1.0} glow={0.6} />

      {/* ── Stop 3 · Very Sweet (2024) — diner at the far end */}
      <Bld path={P.foodhole} position={[-10.5, 0, -16.5]} rotation={0.35} scale={1.25} glow={0.65} />

      {/* ── District texture near the walls — mass without crowding the road */}
      <Bld path={P.industrial01} position={[14, 0, 16]} rotation={Math.PI / 2} scale={0.5} glow={0.55} />
      <Bld path={P.bank} position={[-12.8, 0, -2]} rotation={0.3} scale={0.85} glow={0.55} />
      <Bld path={P.chopshop} position={[11.5, 0, -20]} rotation={-0.5} scale={0.9} glow={0.55} />

      {/* ── Distant skyline beyond the north wall — depth without clutter */}
      <Bld path={P.large01} position={[-11, 0, -42]} scale={0.52} rotation={Math.PI / 14} glow={0.6} />
      <Bld path={P.large04} position={[10.5, 0, -43]} scale={0.52} rotation={-Math.PI / 14} glow={0.6} />
      <Bld path={P.large05} position={[-2, 0, -47]} scale={0.55} glow={0.55} />
      <Bld path={P.large06} position={[18, 0, -46]} scale={0.5} rotation={-Math.PI / 8} glow={0.55} />
      <Bld path={P.large02} position={[22, 0, 18]} scale={0.5} rotation={Math.PI / 6} glow={0.5} />

      {/* ── Street life — one vehicle per district, off the road */}
      <Bld path={P.vehTaxi} position={[7.5, 0, 13]} rotation={-0.5} scale={1.1} glow={0.8} />
      <Bld path={P.veh1} position={[-8, 0, -3]} rotation={0.4} scale={1.1} glow={0.8} />
      <Bld path={P.vehBike} position={[6.5, 0, -18.5]} rotation={2.2} scale={1.4} glow={0.8} />
      <Bld path={P.lightBar} position={[-5.8, 0, 8]} scale={0.55} glow={1.0} />
      <Bld path={P.lightBar} position={[5.8, 0, -7]} scale={0.55} glow={1.0} />
      <Bld path={P.marketLights} position={[-7.4, 0, -19.8]} scale={0.6} glow={1.0} />

      {/* ── Chronology painted on the road, newest first */}
      <RoadMarker text="FEB 2026" z={18.5} />
      <RoadMarker text="JUL 2024" z={4.5} />
      <RoadMarker text="MAY 2024" z={-10.5} />

      {/* ── KOLFI neon crown on the hero tower */}
      <Text
        position={[-10.6, 8.2, 15.4]}
        rotation={[0, 0.45, 0]}
        font="/fonts/Rubik-Black.woff"
        fontSize={1.9}
        color="#e8a846"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.08}
        outlineColor="#0a0a0a"
        letterSpacing={-0.02}
      >
        KOLFI
      </Text>

      {/* ── Neon accents, one pool per district */}
      <pointLight position={[-8, 12, 13]} intensity={55} color="#e8a846" distance={26} />
      <pointLight position={[9, 5, 0]} intensity={26} color="#9b6bd9" distance={18} />
      <pointLight position={[-8, 4, -16]} intensity={24} color="#5cb1de" distance={16} />
      <pointLight position={[0, 5, 22]} intensity={18} color="#e8a846" distance={14} />

      <WelcomeBoard
        title={island.title}
        tagline={WORK_TAGLINE}
        position={[3.4, 0, 23.8]}
        rotY={-0.4}
        dark
      />

      {WORK_STATIONS.map((s) => (
        <InfoStation key={s.id} station={s} dark />
      ))}

      <PlayerCharacter spawn={[0, 0, 23]} bounds={workBounds} />
      <CameraRig offset={[0, 11, 13]} />
    </>
  );
}
