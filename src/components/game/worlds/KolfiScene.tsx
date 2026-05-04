"use client";

import { useMemo } from "react";
import { Mesh, MeshStandardMaterial, Object3D } from "three";
import { Text, useGLTF } from "@react-three/drei";
import PlayerCharacter from "../PlayerCharacter";
import CameraRig from "../CameraRig";
import type { IslandDef } from "@/lib/game/islands";

const SYNTY = "/models/synty";

const P = {
  // Skyscrapers
  large01: `${SYNTY}/SM_Bld_Large_01.glb`,
  large02: `${SYNTY}/SM_Bld_Large_02.glb`,
  large03: `${SYNTY}/SM_Bld_Large_03.glb`,
  large04: `${SYNTY}/SM_Bld_Large_04.glb`,
  large05: `${SYNTY}/SM_Bld_Large_05.glb`,
  large06: `${SYNTY}/SM_Bld_Large_06.glb`,
  // Mid
  bank: `${SYNTY}/SM_Bld_Bank_01.glb`,
  advanced01: `${SYNTY}/SM_Bld_Advanced_01.glb`,
  advanced02: `${SYNTY}/SM_Bld_Advanced_02.glb`,
  chopshop: `${SYNTY}/SM_Bld_Chopshop_01.glb`,
  foodhole: `${SYNTY}/SM_Bld_FoodHole_01.glb`,
  // Industrial
  industrial01: `${SYNTY}/SM_Bld_Industrial_01.glb`,
  industrial02: `${SYNTY}/SM_Bld_Industrial_02.glb`,
  // Plaza + walls
  landingPad: `${SYNTY}/SM_Bld_LandingPad_01.glb`,
  wall: `${SYNTY}/SM_Bld_City_Wall_01.glb`,
  tower: `${SYNTY}/SM_Bld_City_Wall_Tower_01.glb`,
  // Street life
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

// Window-glow trick: re-use the building's albedo texture as emissive map.
// Bright atlas regions (window-coloured texels in PolygonScifi_01_A.png)
// emit light; dark wall regions barely emit. Net result: city lights up at
// night without per-window placement.
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

function Building({
  path,
  position,
  rotation = 0,
  scale = 0.5,
  glow = 0.55,
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

// ─── City layout constants ──────────────────────────────────────────────
// Square perimeter at ±18 units. Walls + corner towers form the boundary.
// Player spawns south of the gate (+z direction in world space).
const WALL_HALF = 18;

// One canonical north wall section spans ~11 units at scale 1.0; we use
// scale 1.0 walls and place pieces at known distances.
const WALL_SCALE = 1.0;
const TOWER_SCALE = 1.0;

function CityWalls() {
  // Hand-placed perimeter.
  return (
    <>
      {/* Corner towers */}
      <Building path={P.tower} position={[-WALL_HALF, 0, -WALL_HALF]} scale={TOWER_SCALE} glow={0.4} />
      <Building path={P.tower} position={[WALL_HALF, 0, -WALL_HALF]} scale={TOWER_SCALE} glow={0.4} />
      <Building path={P.tower} position={[-WALL_HALF, 0, WALL_HALF]} scale={TOWER_SCALE} glow={0.4} />
      <Building path={P.tower} position={[WALL_HALF, 0, WALL_HALF]} scale={TOWER_SCALE} glow={0.4} />

      {/* North wall (z=-18) — closed line */}
      <Building path={P.wall} position={[-9, 0, -WALL_HALF]} scale={WALL_SCALE} glow={0.35} />
      <Building path={P.wall} position={[3, 0, -WALL_HALF]} scale={WALL_SCALE} glow={0.35} />

      {/* South wall (z=+18) — gate left in the centre, walls flank it */}
      <Building path={P.wall} position={[-12, 0, WALL_HALF]} scale={WALL_SCALE} glow={0.35} />
      <Building path={P.wall} position={[6, 0, WALL_HALF]} scale={WALL_SCALE} glow={0.35} />

      {/* East wall (x=+18) — rotated 90° so length aligns with z */}
      <Building path={P.wall} position={[WALL_HALF, 0, -9]} rotation={Math.PI / 2} scale={WALL_SCALE} glow={0.35} />
      <Building path={P.wall} position={[WALL_HALF, 0, 3]} rotation={Math.PI / 2} scale={WALL_SCALE} glow={0.35} />

      {/* West wall (x=-18) */}
      <Building path={P.wall} position={[-WALL_HALF, 0, -9]} rotation={Math.PI / 2} scale={WALL_SCALE} glow={0.35} />
      <Building path={P.wall} position={[-WALL_HALF, 0, 3]} rotation={Math.PI / 2} scale={WALL_SCALE} glow={0.35} />
    </>
  );
}

function CityFloor() {
  return (
    <>
      {/* Main asphalt slab — extends past the walls */}
      <mesh
        receiveShadow
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#13161c" roughness={0.9} />
      </mesh>

      {/* Glowing road lines forming a + intersection at the plaza centre */}
      {[-0.6, 0, 0.6].map((dx) => null)}
      {/* North-south main avenue */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 36]} />
        <meshBasicMaterial color="#1c2129" />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 28]} />
        <meshBasicMaterial color="#e8a846" transparent opacity={0.55} />
      </mesh>

      {/* East-west cross street */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 1.2]} />
        <meshBasicMaterial color="#1c2129" />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28, 0.08]} />
        <meshBasicMaterial color="#5cb1de" transparent opacity={0.45} />
      </mesh>

      {/* Plaza ring under the landing pad */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.95, 6.05, 64]} />
        <meshBasicMaterial color="#e8a846" transparent opacity={0.5} />
      </mesh>
    </>
  );
}

export default function KolfiScene({ island }: { island: IslandDef }) {
  return (
    <>
      <CityFloor />
      <CityWalls />

      {/* ── Tier 1 — hero skyscraper, dead centre at the back of the city */}
      <Building path={P.large03} position={[0, 0, -11]} scale={0.65} glow={0.6} />

      {/* ── Tier 2 — flanking towers */}
      <Building path={P.large01} position={[-10, 0, -11]} scale={0.55} rotation={Math.PI / 14} glow={0.55} />
      <Building path={P.large04} position={[10, 0, -11]} scale={0.55} rotation={-Math.PI / 14} glow={0.55} />

      {/* ── Tier 3 — distant skyline, behind the north wall */}
      <Building path={P.large05} position={[-13, 0, -26]} scale={0.5} rotation={Math.PI / 8} glow={0.5} />
      <Building path={P.large06} position={[13, 0, -26]} scale={0.5} rotation={-Math.PI / 8} glow={0.5} />
      <Building path={P.large02} position={[0, 0, -32]} scale={0.55} glow={0.45} />

      {/* ── Tier 4 — mid-row commercial */}
      <Building path={P.bank} position={[-11, 0, -3]} scale={0.5} rotation={-Math.PI / 10} />
      <Building path={P.advanced01} position={[11, 0, -3]} scale={0.5} rotation={Math.PI / 10} />

      {/* ── Tier 5 — south of plaza, gritty district */}
      <Building path={P.chopshop} position={[-11, 0, 6]} scale={0.5} rotation={Math.PI / 6} />
      <Building path={P.foodhole} position={[11, 0, 6]} scale={0.5} rotation={-Math.PI / 6} />
      <Building path={P.advanced02} position={[5, 0, 11]} scale={0.5} rotation={Math.PI / 8} />

      {/* ── Tier 6 — industrial wings */}
      <Building path={P.industrial01} position={[-15, 0, -3]} scale={0.55} rotation={Math.PI / 2} />
      <Building path={P.industrial02} position={[15, 0, -3]} scale={0.55} rotation={-Math.PI / 2} />

      {/* ── Plaza centrepiece */}
      <Building path={P.landingPad} position={[0, 0, 0]} scale={1.2} glow={0.45} />

      {/* ── Vehicles parked around the plaza */}
      <Building path={P.vehTaxi} position={[-4, 0, 6]} scale={1.2} rotation={0.5} glow={0.7} />
      <Building path={P.veh1} position={[4, 0, 6]} scale={1.2} rotation={-0.3} glow={0.7} />
      <Building path={P.vehBike} position={[-2, 0, 12]} scale={1.5} rotation={Math.PI / 6} glow={0.7} />
      <Building path={P.veh1} position={[8, 0, -8]} scale={1.0} rotation={Math.PI / 1.5} glow={0.7} />

      {/* ── Street lights bracketing the avenue */}
      <Building path={P.lightBar} position={[-7, 0, 0]} scale={0.6} glow={0.9} />
      <Building path={P.lightBar} position={[7, 0, 0]} scale={0.6} glow={0.9} />
      <Building path={P.marketLights} position={[0, 0, 7]} scale={0.6} glow={0.9} />
      <Building path={P.marketLights} position={[0, 0, -7]} scale={0.6} glow={0.9} />

      {/* ── Title floating above the hero skyscraper */}
      <Text
        position={[0, 24, -11]}
        font="/fonts/Rubik-Black.woff"
        fontSize={1.85}
        color="#e8a846"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.08}
        outlineColor="#0a0a0a"
        letterSpacing={-0.04}
      >
        {island.title.toUpperCase()}
      </Text>
      <Text
        position={[0, 22.2, -11]}
        font="/fonts/Rubik-SemiBold.woff"
        fontSize={0.55}
        color="#cce4f5"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor="#0a0a0a"
        letterSpacing={0.05}
      >
        {island.org.toUpperCase()} · {island.era.toUpperCase()}
      </Text>

      {/* ── Neon point lights — tinted accent illumination at street level */}
      <pointLight position={[0, 14, -8]} intensity={60} color="#e8a846" distance={28} />
      <pointLight position={[-12, 4, -3]} intensity={28} color="#5cb1de" distance={18} />
      <pointLight position={[12, 4, -3]} intensity={28} color="#9b6bd9" distance={18} />
      <pointLight position={[0, 6, 6]} intensity={32} color="#e8a846" distance={20} />
      <pointLight position={[-10, 3, 8]} intensity={22} color="#5cb1de" distance={14} />
      <pointLight position={[10, 3, 8]} intensity={22} color="#e8a846" distance={14} />

      <PlayerCharacter spawn={[0, 0, 14]} />
      <CameraRig offset={[0, 14, 22]} />
    </>
  );
}
