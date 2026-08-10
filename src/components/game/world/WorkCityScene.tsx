"use client";

import { useMemo } from "react";
import { Mesh, MeshStandardMaterial, Object3D } from "three";
import { useGLTF } from "@react-three/drei";
import PlayerCharacter from "../PlayerCharacter";
import CameraRig from "../CameraRig";
import InfoStation from "./InfoStation";
import WelcomeBoard from "./WelcomeBoard";
import { makeRectBounds } from "./hexUtils";
import type { IslandDef } from "@/lib/game/islands";
import { WORK_STATIONS, WORK_TAGLINE } from "@/lib/game/worlds";

// Kenney City Kit (Commercial), CC0 — properly textured low-poly buildings
// that match the KayKit look of the other worlds. The old Synty set rendered
// as untextured silhouettes from this camera.
const K = "/models/kenney";
const KAY = "/models/kaykit-city";

const P = {
  skyA: `${K}/building-skyscraper-a.glb`,
  skyB: `${K}/building-skyscraper-b.glb`,
  skyD: `${K}/building-skyscraper-d.glb`,
  skyE: `${K}/building-skyscraper-e.glb`,
  heroKolfi: `${KAY}/building_H.gltf`,
  heroOssa: `${KAY}/building_D.gltf`,
  heroSweet: `${KAY}/building_E.gltf`,
  lowA: `${K}/low-detail-building-a.glb`,
  lowC: `${K}/low-detail-building-c.glb`,
  lowE: `${K}/low-detail-building-e.glb`,
  lowG: `${K}/low-detail-building-g.glb`,
  lowI: `${K}/low-detail-building-i.glb`,
  lowK: `${K}/low-detail-building-k.glb`,
  lowM: `${K}/low-detail-building-m.glb`,
  lowWideA: `${K}/low-detail-building-wide-a.glb`,
  lowWideB: `${K}/low-detail-building-wide-b.glb`,
  bench: `${KAY}/bench.gltf`,
  bush: `${KAY}/bush.gltf`,
  hydrant: `${KAY}/firehydrant.gltf`,
  dumpster: `${KAY}/dumpster.gltf`,
  trafficLight: `${KAY}/trafficlight_A.gltf`,
  carSedan: `${KAY}/car_sedan.gltf`,
  carHatch: `${KAY}/car_hatchback.gltf`,
  carPolice: `${KAY}/car_police.gltf`,
  carWagon: `${KAY}/car_stationwagon.gltf`,
  carTaxi: `${KAY}/car_taxi.gltf`,
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

// Night-city glow: reuse the albedo texture as emissive map so the building
// keeps its daytime colors after dark instead of collapsing to silhouette.
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
  scale = 1,
  glow = 0.5,
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
// One straight avenue walked newest → oldest: KOLfi's skyscraper block at
// the spawn end, OSSA mid-city, Very Sweet's storefront at the far end.
// Continuous building rows line both sides (they ARE the walls); the
// corridor between them stays clear so the walk breathes.
const BOUND_X = 7.8;
const BOUND_S = 25.5;
const BOUND_N = -28.5;

// Everything is aligned to the street grid: every first-row front sits on the
// same build line (|x| = 8.2), all facades square to the road. Measured model
// dims (h at scale 1): KayKit heroes ~3.0 tall on 2×2 footprints; Kenney
// wide blocks 1×0.5 at h≈1.1; slims 0.5×0.5 at h≈1.6–2.3. Scales below are
// chosen from those numbers so heights land at 4–9 world units under the
// fixed camera — the mistake this replaces was eyeballed scales that put
// 12-unit heroes and 30-unit backdrop towers next to a 1.8-unit knight.
type Slot = { path: string; x: number; z: number; rot: number; scale: number; y?: number };

// Front face at |x| = 8.2 → center = 8.2 + depth/2 · scale.
const HEROES: Slot[] = [
  { path: P.heroKolfi, x: -10.5, z: 14, rot: Math.PI / 2, scale: 2.3 }, // h≈7
  { path: P.heroOssa, x: 10.1, z: -1.5, rot: -Math.PI / 2, scale: 1.9 }, // h≈5.6
  { path: P.heroSweet, x: -9.8, z: -16.5, rot: Math.PI / 2, scale: 1.6 }, // h≈3.8
];

const westRow: Slot[] = [
  { path: P.lowWideA, x: -9.45, z: 21.5, rot: Math.PI / 2, scale: 5 },
  { path: P.lowWideB, x: -9.45, z: 7, rot: Math.PI / 2, scale: 5 },
  { path: P.lowK, x: -9.35, z: 0.5, rot: Math.PI / 2, scale: 4.5 },
  { path: P.lowWideA, x: -9.45, z: -6, rot: Math.PI / 2, scale: 5 },
  { path: P.lowM, x: -9.2, z: -11.5, rot: Math.PI / 2, scale: 4 },
  { path: P.lowWideB, x: -9.45, z: -23, rot: Math.PI / 2, scale: 5 },
  { path: P.lowI, x: -9.35, z: -28.5, rot: Math.PI / 2, scale: 4.5 },
];

const eastRow: Slot[] = [
  { path: P.lowWideB, x: 9.45, z: 19, rot: -Math.PI / 2, scale: 5 },
  { path: P.lowE, x: 9.35, z: 12, rot: -Math.PI / 2, scale: 4.5 },
  { path: P.lowWideA, x: 9.45, z: 6, rot: -Math.PI / 2, scale: 5 },
  { path: P.lowG, x: 9.35, z: -8, rot: -Math.PI / 2, scale: 4.5 },
  { path: P.lowWideB, x: 9.45, z: -14, rot: -Math.PI / 2, scale: 5 },
  { path: P.lowA, x: 9.35, z: -21, rot: -Math.PI / 2, scale: 4.5 },
  { path: P.lowWideA, x: 9.45, z: -27, rot: -Math.PI / 2, scale: 5 },
];

// Second row: taller, grid-aligned, one visible alley behind the street wall.
const secondRow: Slot[] = [
  { path: P.skyA, x: -17.5, z: 17, rot: 0, scale: 4.2 }, // h≈12
  { path: P.lowC, x: -17, z: 3, rot: 0, scale: 5.5 }, // h≈12.4
  { path: P.skyE, x: -17.5, z: -12, rot: 0, scale: 3.2 }, // h≈13
  { path: P.lowM, x: -17, z: -24, rot: 0, scale: 5.5 },
  { path: P.skyB, x: 17.5, z: 10, rot: 0, scale: 2.9 }, // h≈13
  { path: P.lowC, x: 17, z: 17.5, rot: 0, scale: 5.5 },
  { path: P.lowWideB, x: 17.2, z: 23.8, rot: 0, scale: 5 },
  { path: P.lowWideA, x: -17.2, z: 24, rot: 0, scale: 5 },
  { path: P.lowC, x: 17, z: -2, rot: 0, scale: 5 },
  { path: P.skyD, x: 17.5, z: -18, rot: 0, scale: 2.4 }, // h≈13
];

// Distant city fill — a deterministic grid of blocks wrapping the playfield
// out to the fog, the city's version of the valley's endless forest. Same
// stable hash trick the valley uses, so it never changes between visits.
const FILL_MODELS = [
  P.lowWideA,
  P.lowWideB,
  P.lowA,
  P.lowC,
  P.lowE,
  P.lowG,
  P.lowI,
  P.lowK,
  P.lowM,
];
const hash01 = (a: number, b: number) => {
  const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return v - Math.floor(v);
};
// The extended side streets these blocks must keep clear of.
const CROSS_STREETS = [30, 2.5, -19, -33];
const cityFill: Slot[] = [];
for (let gx = -5; gx <= 4; gx++) {
  for (let gz = -5; gz <= 4; gz++) {
    const x = gx * 13 + 6.5;
    const z = gz * 13 - 4;
    const h1 = hash01(gx, gz);
    const h2 = hash01(gz, gx);
    const xj = x + (h2 - 0.5) * 3;
    const zj = z + (h1 - 0.5) * 3;
    // Skip the hand-authored playfield, its building rows, and the spawn
    // camera's backyard — a fill roof at z≈35 once ate the whole frame.
    if (Math.abs(x) < 26 && z > -40 && z < 58) continue;
    // Keep the extended cross streets clear so blocks line them, never sit
    // on them.
    if (CROSS_STREETS.some((sz) => Math.abs(zj - sz) < 4.5)) continue;
    cityFill.push({
      path: FILL_MODELS[Math.floor(h1 * FILL_MODELS.length)] as string,
      x: xj,
      z: zj,
      rot: h2 > 0.5 ? 0 : Math.PI / 2,
      scale: 3.5 + h1 * 3.5,
    });
    // A second building on roughly half the blocks keeps the skyline from
    // reading as one building per block
    const h3 = hash01(gx * 3 + 1, gz * 5 + 2);
    if (h3 > 0.35) {
      const zc2 = zj + (h3 > 0.7 ? 4.6 : -4.6);
      if (
        !CROSS_STREETS.some((sz) => Math.abs(zc2 - sz) < 4.5) &&
        !(Math.abs(x) < 26 && zc2 > -40 && zc2 < 58)
      ) {
        cityFill.push({
          path: FILL_MODELS[Math.floor(h3 * FILL_MODELS.length)] as string,
          x: xj + (h2 - 0.5) * 2,
          z: zc2,
          rot: h3 > 0.6 ? Math.PI / 2 : 0,
          scale: 3 + h3 * 3,
        });
      }
    }
    // Third building beside the first on the fullest blocks, kept off the
    // distant avenues
    if (h1 > 0.72) {
      const xc3 = xj + (h1 > 0.85 ? 4.2 : -4.2);
      if (
        Math.abs(Math.abs(xc3) - 26) >= 3.6 &&
        !(Math.abs(xc3) < 26 && zj > -40 && zj < 58)
      ) {
        cityFill.push({
          path: FILL_MODELS[Math.floor(h2 * FILL_MODELS.length)] as string,
          x: xc3,
          z: zj,
          rot: h2 > 0.5 ? Math.PI / 2 : 0,
          scale: 3 + h2 * 2.5,
        });
      }
    }
  }
}

// Lamps and planters continue down the side streets past the walkable
// corridor — the same rhythm the near verge has, carried out to the fog.
const FAR_LAMPS: [number, number][] = [
  ...CROSS_STREETS.flatMap((z) =>
    [1, -1].flatMap((side) => [
      [side * 12.5, z - 2.2] as [number, number],
      [side * 21, z + 2.2] as [number, number],
      [side * 33, z - 2.2] as [number, number],
      [side * 45, z + 2.2] as [number, number],
      [side * 57, z - 2.2] as [number, number],
    ])
  ),
  // Along the distant avenues, alternating sides between the crossings —
  // ±3.4 clears the 2.8-half-width roadway
  ...[-26, 26].flatMap((x0) =>
    [-68, -62, -55, -48, -40, -26, -14, -8, 5.4, 12, 26, 40, 48].map(
      (z, i) => [x0 + (i % 2 === 0 ? -3.4 : 3.4), z] as [number, number]
    )
  ),
];
const FAR_BUSHES: [number, number][] = [
  ...CROSS_STREETS.flatMap((z) =>
    [1, -1].flatMap((side) => [
      [side * 16, z + 2.4] as [number, number],
      [side * 22, z - 2.4] as [number, number],
      [side * 30.5, z + 2.4] as [number, number],
      [side * 38, z - 2.4] as [number, number],
      [side * 45, z - 2.4] as [number, number],
      [side * 52, z + 2.4] as [number, number],
      [side * 57, z + 2.4] as [number, number],
    ])
  ),
  ...[-26, 26].flatMap((x0) =>
    [-58, -44, -20, 8, 22, 44].map(
      (z, i) => [x0 + (i % 2 === 0 ? 3.6 : -3.6), z] as [number, number]
    )
  ),
];

// Street furniture — the city's underbrush. The valley fills its verges with
// trees and rocks; here benches, bushes, hydrants and dumpsters do the same
// job of making the ground read as a lived-in place instead of empty paint.
// KayKit props are authored at ~0.1–0.7 units, so scale ~3 sits them right
// against the 1.8-unit knight (bench 1.2 long, bush 1.1 tall, hydrant 0.7).
const PROPS: Slot[] = [
  // Traffic lights on the crossing corners — heads face oncoming traffic:
  // northbound (east lane) reads the signal past the crossing, southbound
  // reads the one on the west corner behind it
  { path: P.trafficLight, x: 4.35, z: 4.35, rot: 0, scale: 2.8 },
  { path: P.trafficLight, x: -4.35, z: 0.65, rot: Math.PI, scale: 2.8 },
  { path: P.trafficLight, x: 4.35, z: -17.15, rot: 0, scale: 2.8 },
  { path: P.trafficLight, x: -4.35, z: -20.85, rot: Math.PI, scale: 2.8 },
  // A bench by each company board, back to the buildings
  { path: P.bench, x: -5.05, z: 12.4, rot: Math.PI / 2, scale: 3 },
  { path: P.bench, x: 5.05, z: -3.4, rot: -Math.PI / 2, scale: 3 },
  { path: P.bench, x: -5.05, z: -13.2, rot: Math.PI / 2, scale: 3 },
  // Hydrants mid-block
  { path: P.hydrant, x: 5.1, z: 12.2, rot: 0, scale: 3 },
  { path: P.hydrant, x: -5.1, z: -7.2, rot: 0, scale: 3 },
  // Dumpsters tucked into the side-street mouths against the walls
  { path: P.dumpster, x: 7.6, z: 4.7, rot: Math.PI / 2, scale: 3 },
  { path: P.dumpster, x: -7.6, z: -21.2, rot: Math.PI / 2, scale: 3 },
  // Bushes along the building fronts, varied like the valley's tree line
  { path: P.bush, x: -6.9, z: 21.5, rot: 2.9, scale: 3.0 },
  { path: P.bush, x: -6.9, z: 17.2, rot: 0.7, scale: 3.2 },
  { path: P.bush, x: -6.9, z: 10.8, rot: 2.1, scale: 2.8 },
  { path: P.bush, x: -6.9, z: 6.2, rot: 4.0, scale: 3.0 },
  { path: P.bush, x: -6.9, z: -3.4, rot: 1.3, scale: 2.7 },
  { path: P.bush, x: -6.9, z: -9.0, rot: 5.2, scale: 3.3 },
  { path: P.bush, x: -6.9, z: -13.6, rot: 0.4, scale: 2.8 },
  { path: P.bush, x: -6.9, z: -22.4, rot: 3.1, scale: 3.1 },
  { path: P.bush, x: -6.9, z: -26.2, rot: 1.9, scale: 2.7 },
  { path: P.bush, x: 6.9, z: 19.6, rot: 2.6, scale: 2.9 },
  { path: P.bush, x: 6.9, z: 14.6, rot: 0.9, scale: 3.3 },
  { path: P.bush, x: 6.9, z: 9.6, rot: 4.4, scale: 2.7 },
  { path: P.bush, x: 6.9, z: -6.4, rot: 1.6, scale: 3.1 },
  { path: P.bush, x: 6.9, z: -11.6, rot: 3.8, scale: 2.8 },
  { path: P.bush, x: 6.9, z: -23.6, rot: 0.2, scale: 3.2 },
  { path: P.bush, x: 6.9, z: -27.4, rot: 5.6, scale: 2.8 },
  // Cars parked on the side streets and distant avenues, beyond the
  // walkable bound — every KayKit variant the pack ships
  { path: P.carSedan, x: 10.5, z: 3.2, rot: Math.PI / 2, scale: 3.4, y: 0.24 },
  { path: P.carHatch, x: -10.5, z: -19.7, rot: -Math.PI / 2, scale: 3.4, y: 0.24 },
  { path: P.carPolice, x: 15.5, z: 1.8, rot: -Math.PI / 2, scale: 3.4, y: 0.24 },
  { path: P.carWagon, x: -14.5, z: 30.7, rot: Math.PI / 2, scale: 3.4, y: 0.24 },
  { path: P.carHatch, x: 13.5, z: -33.7, rot: -Math.PI / 2, scale: 3.4, y: 0.24 },
  { path: P.carSedan, x: 24.6, z: 14, rot: 0, scale: 3.4, y: 0.24 },
  { path: P.carPolice, x: 16, z: 30.7, rot: Math.PI / 2, scale: 3.4, y: 0.24 },
  { path: P.carPolice, x: -6.5, z: 30.7, rot: Math.PI / 2, scale: 3.4, y: 0.24 },
  { path: P.carPolice, x: -27.4, z: -24, rot: 0, scale: 3.4, y: 0.24 },
  { path: P.carWagon, x: -38, z: 1.8, rot: -Math.PI / 2, scale: 3.4, y: 0.24 },
  { path: P.carHatch, x: 33, z: -19.7, rot: -Math.PI / 2, scale: 3.4, y: 0.24 },
  { path: P.carSedan, x: -45, z: -33.7, rot: -Math.PI / 2, scale: 3.4, y: 0.24 },
  { path: P.carTaxi, x: 27.4, z: -45, rot: Math.PI, scale: 3.4, y: 0.24 },
  { path: P.carTaxi, x: -24.6, z: 34, rot: Math.PI, scale: 3.4, y: 0.24 },
];

// Streetlamps give the verge the rhythm the valley gets from trees.
// Kept clear of every board: from the south-facing camera a lamp standing
// up to ~5 units south of a board projects straight onto its face.
// |x| = 4.3 keeps every pole and bulb out of the boards' screen column —
// the boards start at |x| ≈ 5.1, and the spawn camera's depth compression
// lets anything sharing their column graze the panels.
const LAMPS: [number, number][] = [
  [-4.3, 20.5], [4.3, 16], [-4.3, 5.2], [4.3, 7],
  [-4.3, -6], [4.3, -6.2], [4.3, -13.8], [-4.3, -23], [4.3, -26],
];

const COLLIDERS: [number, number, number][] = [
  // Vehicles (parked in-lane, right-hand traffic)
  [1.4, 7.6, 1.3],
  [-1.4, -5.2, 1.3],
  // Streetlamps
  ...LAMPS.map(([x, z]) => [x, z, 0.3] as [number, number, number]),
  // Traffic lights, benches, hydrants (reachable street furniture)
  [4.35, 4.35, 0.3], [-4.35, 0.65, 0.3], [4.35, -17.15, 0.3], [-4.35, -20.85, 0.3],
  [-5.05, 12.4, 0.55], [5.05, -3.4, 0.55], [-5.05, -13.2, 0.55],
  [5.1, 12.2, 0.25], [-5.1, -7.2, 0.25],
  // Dumpsters (now inside the walkable bound)
  [7.6, 4.7, 0.6], [-7.6, -21.2, 0.6],
  // Boards + welcome
  ...WORK_STATIONS.map(
    (s) => [s.spot[0], s.spot[1], 0.6] as [number, number, number]
  ),
  [5.0, 23.8, 0.8],
];

const workBounds = makeRectBounds(BOUND_X, BOUND_N, BOUND_S, COLLIDERS);

function CityFloor() {
  return (
    <>
      {/* Endless asphalt base — the city floor runs to the fog like the
          valley's meadow, so no edge is ever visible */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#2b3448" roughness={0.9} />
      </mesh>

      {/* The avenue — full length of the timeline */}
      {/* Avenue ends in a T-junction at both ends — a street reads
          connected when it terminates into another street, not into fog */}
      <mesh position={[0, 0.03, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.6, 65.8]} />
        <meshBasicMaterial color="#232b3c" />
      </mesh>
      {/* Concrete block pads under each building block, split by the side
          streets — the ground reads as city blocks instead of bare void */}
      {[-1, 1].flatMap((side) =>
        [
          { zc: 16.25, len: 24.7 },
          { zc: -8.25, len: 18.7 },
          { zc: -26, len: 11.2 },
        ].map(({ zc, len }) => (
          <mesh
            key={`p${side},${zc}`}
            position={[side * 14.4, 0.005, zc]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[17.6, len]} />
            <meshBasicMaterial color="#313c55" />
          </mesh>
        ))
      )}

      {/* Sidewalks — lighter strips that frame the roadway and shrink the
          dead asphalt between road and street wall */}
      {[-4.2, 4.2].map((x) => (
        <mesh key={x} position={[x, 0.01, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.6, 60.2]} />
          <meshBasicMaterial color="#343f58" />
        </mesh>
      ))}
      {/* Centre dashes */}
      {Array.from({ length: 16 }, (_, i) => 28 - i * 4).map((z) => (
        <mesh key={z} position={[0, 0.045, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 1.6]} />
          <meshBasicMaterial color="#e8a846" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Side streets through the gaps in the street wall — the avenue
          reads as part of a grid, not a corridor */}
      {[
        { z: 30, len: 57.2, cw: false },
        { z: 2.5, len: 57.2, cw: true },
        { z: -19, len: 57.2, cw: true },
        { z: -33, len: 57.2, cw: true },
      ].map(({ z, len, cw }) => (
        <group key={`x${z}`}>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * (2.8 + len / 2), 0.03, z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[len, 2.8]} />
              <meshBasicMaterial color="#232b3c" />
            </mesh>
          ))}
          {/* dashes running down the side street to the fog */}
          {[-1, 1].flatMap((side) =>
            Array.from({ length: 14 }, (_, k) => 4.8 + k * 3.4).map((d) => (
              <mesh
                key={`${side},${d}`}
                position={[side * d, 0.045, z]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[1.4, 0.12]} />
                <meshBasicMaterial color="#e8a846" transparent opacity={0.5} />
              </mesh>
            ))
          )}
          {/* crosswalk across the avenue at the intersection edge */}
          {cw && [-2.1, -1.2, -0.3, 0.6, 1.5].map((sx) => (
            <mesh
              key={`c${sx}`}
              position={[sx + 0.3, 0.05, z + 2.6]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.55, 1.9]} />
              <meshBasicMaterial color="#aebad6" transparent opacity={0.35} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Every background block gets its floor — pads fill the rectangles
          the street grid cuts, so no block sits on bare void */}
      {[
        { zc: 43.2, len: 23.6 },
        { zc: 16.25, len: 24.7 },
        { zc: -8.25, len: 18.7 },
        { zc: -26, len: 11.2 },
        { zc: -52.2, len: 35.6 },
      ].flatMap(({ zc, len }) =>
        [-44.4, 44.4].map((xc) => (
          <mesh
            key={`bg${xc},${zc}`}
            position={[xc, 0.005, zc]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[31.2, len]} />
            <meshBasicMaterial color="#313c55" />
          </mesh>
        ))
      )}
      {[
        { zc: 43.2, len: 23.6 },
        { zc: -52.2, len: 35.6 },
      ].map(({ zc, len }) => (
        <mesh
          key={`bgc${zc}`}
          position={[0, 0.005, zc]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[46.4, len]} />
          <meshBasicMaterial color="#313c55" />
        </mesh>
      ))}

      {/* Distant parallel avenues — the cross streets have somewhere to go,
          so the grid reads endless instead of stopping at the block edge.
          Slightly below the side streets so the crossings never z-fight. */}
      {[-26, 26].map((x) => (
        <group key={`av${x}`}>
          <mesh position={[x, 0.02, -6]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[5.6, 124]} />
            <meshBasicMaterial color="#232b3c" />
          </mesh>
          {Array.from({ length: 20 }, (_, i) => 50 - i * 6).map((z) => (
            <mesh key={z} position={[x, 0.026, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.12, 1.6]} />
              <meshBasicMaterial color="#e8a846" transparent opacity={0.45} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Light rings under each company board */}
      {[
        [-6.6, 14],
        [6.5, -1.5],
        [-6.4, -16.5],
      ].map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, 0.055, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.2, 2.32, 48]} />
          <meshBasicMaterial color="#e8a846" transparent opacity={0.4} />
        </mesh>
      ))}
    </>
  );
}

/** Primitive streetlamp: dark pole, warm self-lit bulb. Cheap rhythm for the
 *  verge — the city's version of the valley's roadside trees. */
function StreetLamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 2.6, 6]} />
        <meshStandardMaterial color="#1c2333" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <sphereGeometry args={[0.22, 12, 10]} />
        <meshBasicMaterial color="#ffd98a" />
      </mesh>
    </group>
  );
}


/** Striped roadwork barricade closing the avenue where the walkable strip
 *  ends — the visual for the invisible bound the player already hits. */
function RoadBarrier({ z }: { z: number }) {
  const SEG = 0.8;
  return (
    <group position={[0, 0, z]}>
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} position={[x, 0.5, 0]} castShadow>
          <boxGeometry args={[0.09, 1.0, 0.09]} />
          <meshStandardMaterial color="#1c2333" roughness={0.8} />
        </mesh>
      ))}
      {[0.92, 0.52].map((y) =>
        Array.from({ length: 7 }, (_, i) => -2.4 + i * SEG).map((x) => (
          <mesh key={`${y},${x}`} position={[x, y, 0]} castShadow>
            <boxGeometry args={[SEG, 0.17, 0.07]} />
            <meshStandardMaterial
              color={(Math.round(x / SEG) + 7) % 2 === 0 ? "#e8863a" : "#e8e6df"}
              emissive={(Math.round(x / SEG) + 7) % 2 === 0 ? "#e8863a" : "#e8e6df"}
              emissiveIntensity={0.25}
              roughness={0.7}
            />
          </mesh>
        ))
      )}
      {[-1.8, 1.8].map((x) => (
        <mesh key={`w${x}`} position={[x, 1.1, 0]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshBasicMaterial color="#ffb05c" />
        </mesh>
      ))}
    </group>
  );
}

/** Traffic cone marking the sidewalk ends beside a barricade. */
function TrafficCone({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.21, z]} castShadow>
      <coneGeometry args={[0.17, 0.42, 12]} />
      <meshStandardMaterial
        color="#e8863a"
        emissive="#e8863a"
        emissiveIntensity={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}

export default function WorkCityScene({ island }: { island: IslandDef }) {
  return (
    <>
      <CityFloor />

      {/* ── Company heroes, alone at the road with their names on them */}
      {HEROES.map((b) => (
        <Bld
          key={`h${b.x},${b.z}`}
          path={b.path}
          position={[b.x, 0, b.z]}
          rotation={b.rot}
          scale={b.scale}
          glow={0.5}
        />
      ))}

      {/* ── Background street wall + far skyline */}
      {[...westRow, ...eastRow].map((b) => (
        <Bld
          key={`r${b.x},${b.z}`}
          path={b.path}
          position={[b.x, 0, b.z]}
          rotation={b.rot}
          scale={b.scale}
          glow={0.32}
        />
      ))}
      {secondRow.map((b) => (
        <Bld
          key={`s${b.x},${b.z}`}
          path={b.path}
          position={[b.x, 0, b.z]}
          rotation={b.rot}
          scale={b.scale}
          glow={0.26}
        />
      ))}
      {cityFill.map((b) => (
        <Bld
          key={`f${b.x.toFixed(1)},${b.z.toFixed(1)}`}
          path={b.path}
          position={[b.x, 0, b.z]}
          rotation={b.rot}
          scale={b.scale}
          glow={0.22}
        />
      ))}
      {/* South wall behind the T-junction so the avenue ends against city,
          not bare floor */}
      <Bld path={P.lowWideB} position={[-11, 0, 34.5]} rotation={Math.PI / 2} scale={5} glow={0.3} />
      <Bld path={P.lowWideA} position={[11, 0, 34.5]} rotation={-Math.PI / 2} scale={5} glow={0.3} />
      <Bld path={P.lowK} position={[-19, 0, 34.5]} rotation={0} scale={4.5} glow={0.28} />
      <Bld path={P.lowI} position={[19, 0, 34.5]} rotation={0} scale={4.5} glow={0.28} />
      <Bld path={P.skyD} position={[-10, 0, -40]} scale={2.6} glow={0.3} />
      <Bld path={P.skyE} position={[0, 0, -44]} scale={3.6} glow={0.3} />
      <Bld path={P.skyB} position={[10, 0, -41]} scale={3.2} glow={0.3} />

      {/* ── Streetlamps pace the walk */}
      {LAMPS.map(([x, z]) => (
        <StreetLamp key={`l${x},${z}`} x={x} z={z} />
      ))}
      {FAR_LAMPS.map(([x, z]) => (
        <StreetLamp key={`fl${x},${z}`} x={x} z={z} />
      ))}
      {FAR_BUSHES.map(([x, z], i) => (
        <Bld
          key={`fb${x},${z}`}
          path={P.bush}
          position={[x, 0, z]}
          rotation={i * 1.7}
          scale={2.8 + (i % 3) * 0.3}
          glow={0.45}
        />
      ))}

      {/* ── Street furniture fills the verges and corners */}
      {PROPS.map((b) => (
        <Bld
          key={`pr${b.x},${b.z}`}
          path={b.path}
          position={[b.x, b.y ?? 0, b.z]}
          rotation={b.rot}
          scale={b.scale}
          glow={0.45}
        />
      ))}

      {/* ── Barricades close the avenue at the walkable bound */}
      <RoadBarrier z={26.3} />
      <RoadBarrier z={-29.3} />
      {[-3.9, 3.9].map((x) => (
        <group key={`cones${x}`}>
          <TrafficCone x={x} z={26.1} />
          <TrafficCone x={x} z={-29.1} />
        </group>
      ))}

      {/* ── Street life — one vehicle per district, off the road */}
      <Bld path={P.carTaxi} position={[1.4, 0.24, 7.6]} rotation={Math.PI} scale={3.4} glow={0.6} />
      <Bld path={P.carHatch} position={[-1.4, 0.24, -5.2]} rotation={0} scale={3.4} glow={0.6} />

      {/* ── Neon accents, one pool per district */}
      <pointLight position={[-9, 10, 14]} intensity={55} color="#e8a846" distance={26} />
      <pointLight position={[10, 5, 0]} intensity={26} color="#9b6bd9" distance={18} />
      <pointLight position={[-9, 4, -16]} intensity={24} color="#5cb1de" distance={16} />
      <pointLight position={[0, 5, 22]} intensity={18} color="#e8a846" distance={14} />

      <WelcomeBoard
        title={island.title}
        tagline={WORK_TAGLINE}
        position={[5.0, 0, 23.8]}
        rotY={0}
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
