"use client";

import { useMemo } from "react";
import PlayerCharacter from "../PlayerCharacter";
import CameraRig from "../CameraRig";
import InfoStation from "./InfoStation";
import WelcomeBoard from "./WelcomeBoard";
import Milestone from "./Milestone";
import InstancedForest, { type ForestInstance } from "./InstancedForest";
import {
  bandHalfWidth,
  bandXCenter,
  makeBandBoundsSmooth,
  type BandSpec,
} from "./hexUtils";
import {
  Building,
  Cloud,
  hash01,
  Prop,
  WORLD_CLOUDS,
} from "./sceneBits";
import type { IslandDef } from "@/lib/game/islands";
import type { DayWorldDef } from "@/lib/game/worlds";

const D = "/models/decoration/";
const TREE_PATHS = [
  D + "trees_A_small.gltf",
  D + "trees_A_medium.gltf",
  D + "trees_B_medium.gltf",
  D + "trees_A_large.gltf",
  D + "trees_B_large.gltf",
];
const MOUNTAIN = D + "mountain_A_grass_trees.gltf";
const HILLS = D + "hills_A_trees.gltf";

// Backdrop peaks rising out of the forest, half-swallowed by fog. Sunk
// below grade so their hex bases never peek through the treeline.
const MOUNTAINS: { position: [number, number, number]; scale: number; rotY: number }[] = [
  { position: [-18, -2.1, -46], scale: 4.0, rotY: 0.4 },
  { position: [10, -2.1, -50], scale: 4.6, rotY: 2.2 },
  { position: [36, -2.1, -32], scale: 3.6, rotY: 1.1 },
  { position: [-40, -2.1, -20], scale: 3.8, rotY: 2.8 },
  { position: [44, -2.1, 0], scale: 3.4, rotY: 0.9 },
  { position: [-44, -2.1, 10], scale: 3.7, rotY: 1.9 },
  { position: [36, -2.1, 26], scale: 3.4, rotY: 0.2 },
  { position: [-32, -2.1, 36], scale: 3.6, rotY: 2.5 },
  { position: [12, -2.1, 44], scale: 4.0, rotY: 1.4 },
];

const HILL_SPOTS: { position: [number, number, number]; scale: number; rotY: number }[] = [
  { position: [-16, -0.7, -33], scale: 2.0, rotY: 0.7 },
  { position: [20, -0.7, -35], scale: 2.2, rotY: 2.0 },
  { position: [27, -0.7, -12], scale: 1.9, rotY: 1.2 },
  { position: [-28, -0.7, 0], scale: 2.0, rotY: 0.3 },
  { position: [29, -0.7, 12], scale: 1.9, rotY: 2.6 },
  { position: [-24, -0.7, 22], scale: 2.0, rotY: 1.6 },
];

/** Road surface following the band centreline. */
function ValleyRoad({ band }: { band: BandSpec }) {
  const segments = useMemo(() => {
    const out: { x: number; z: number; rotY: number }[] = [];
    for (let z = band.zMax - 1.5; z >= band.zMin + 2.0; z -= 1.1) {
      const x = bandXCenter(band, z);
      const dx = bandXCenter(band, z - 0.5) - bandXCenter(band, z + 0.5);
      out.push({ x, z, rotY: Math.atan2(dx, -1) + Math.PI });
    }
    return out;
  }, [band]);

  return (
    <>
      {segments.map((s, i) => (
        <mesh
          key={i}
          position={[s.x, 0.012 + (i % 2) * 0.001, s.z]}
          rotation={[-Math.PI / 2, 0, s.rotY]}
          receiveShadow
        >
          <planeGeometry args={[2.5, 1.7]} />
          <meshStandardMaterial color="#c9a76a" roughness={0.95} />
        </mesh>
      ))}
      {/* Spawn court — the player loads in standing at its centre */}
      <mesh position={[-5.4, 0.011, 16.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.0, 40]} />
        <meshStandardMaterial color="#c9a76a" roughness={0.95} />
      </mesh>
    </>
  );
}

export default function ValleyScene({
  island,
  def,
  band,
}: {
  island: IslandDef;
  def: DayWorldDef;
  band: BandSpec;
}) {
  const bounds = useMemo(() => {
    const boardColliders: [number, number, number][] = [
      ...def.stations.map(
        (s) => [s.spot[0], s.spot[1], 0.6] as [number, number, number]
      ),
      ...(def.milestones ?? []).map(
        (m) => [m.spot[0], m.spot[1], 0.45] as [number, number, number]
      ),
      [def.welcome.spot[0], def.welcome.spot[1], 0.8],
    ];
    return makeBandBoundsSmooth(band, 0.7, [...def.colliders, ...boardColliders]);
  }, [def, band]);

  // Forest walls: fill everything outside the corridor, out to the fog.
  const forest = useMemo(() => {
    const byType: Record<string, ForestInstance[]> = {};
    TREE_PATHS.forEach((p) => (byType[p] = []));
    const STEP = 2.3;
    for (let gx = -14; gx <= 14; gx++) {
      for (let gz = -17; gz <= 15; gz++) {
        const r0 = hash01(gx, gz);
        if (r0 < 0.3) continue; // breathing room in the woods
        const x = gx * STEP + (hash01(gx + 40, gz) - 0.5) * 1.9;
        const z = gz * STEP + (hash01(gx, gz + 40) - 0.5) * 1.9;
        // Keep the walkable corridor + a grass verge clear.
        if (
          z > band.zMin - 2.5 &&
          z < band.zMax + 2.5 &&
          Math.abs(x - bandXCenter(band, z)) <
            bandHalfWidth(band, z) + 1.0
        )
          continue;
        const type =
          TREE_PATHS[Math.floor(hash01(gx + 80, gz) * TREE_PATHS.length)];
        byType[type].push({
          x,
          z,
          rotY: hash01(gx, gz + 80) * Math.PI * 2,
          scale: 0.85 + hash01(gx + 120, gz) * 0.5,
        });
      }
    }
    return byType;
  }, [band]);

  // Sparse rocks on the grass verge inside the corridor.
  const vergeRocks = useMemo(() => {
    const rocks: { path: string; position: [number, number, number]; rotation: number; scale: number }[] = [];
    const ROCK_PATHS = [
      D + "rock_single_A.gltf",
      D + "rock_single_B.gltf",
      D + "rock_single_C.gltf",
    ];
    for (let z = band.zMin + 4; z <= band.zMax - 3; z += 4.6) {
      const side = hash01(z, 7) > 0.5 ? 1 : -1;
      if (hash01(z, 13) < 0.45) continue;
      const xc = bandXCenter(band, z);
      const w = bandHalfWidth(band, z);
      const x = xc + side * (w - 1.6);
      // Skip if close to any authored content.
      const near = [...def.colliders, ...def.stations.map((s) => [s.spot[0], s.spot[1], 2.0] as [number, number, number])].some(
        ([ax, az, ar]) => (x - ax) ** 2 + (z - az) ** 2 < (ar + 1.2) ** 2
      );
      if (near) continue;
      rocks.push({
        path: ROCK_PATHS[Math.floor(hash01(z, 21) * ROCK_PATHS.length)],
        position: [x, 0, z],
        rotation: hash01(z, 33) * Math.PI * 2,
        scale: 0.6 + hash01(z, 44) * 0.4,
      });
    }
    return rocks;
  }, [band, def]);

  return (
    <>
      {/* Endless meadow floor — the world, not an island */}
      <mesh receiveShadow position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#3f9e50" roughness={0.95} />
      </mesh>

      <ValleyRoad band={band} />

      <InstancedForest byType={forest} />

      {MOUNTAINS.map((m, i) => (
        <Prop
          key={`m${i}`}
          def={{ path: MOUNTAIN, position: m.position, rotation: m.rotY, scale: m.scale }}
        />
      ))}
      {HILL_SPOTS.map((h, i) => (
        <Prop
          key={`h${i}`}
          def={{ path: HILLS, position: h.position, rotation: h.rotY, scale: h.scale }}
        />
      ))}

      {def.buildings.map((b, i) => (
        <Building key={i} def={b} />
      ))}
      {def.props.map((p, i) => (
        <Prop key={i} def={p} />
      ))}
      {vergeRocks.map((p, i) => (
        <Prop key={`r${i}`} def={p} />
      ))}

      {WORLD_CLOUDS.map((c, i) => (
        <Cloud key={i} def={c} />
      ))}

      {(def.milestones ?? []).map((m) => (
        <Milestone
          key={m.text + m.spot.join()}
          text={m.text}
          position={[m.spot[0], 0, m.spot[1]]}
          rotY={m.rotY}
        />
      ))}

      <WelcomeBoard
        title={island.title}
        tagline={def.tagline}
        position={[def.welcome.spot[0], 0, def.welcome.spot[1]]}
        rotY={def.welcome.rotY ?? -0.5}
      />

      {def.stations.map((s) => (
        <InfoStation key={s.id} station={s} />
      ))}

      <PlayerCharacter spawn={[def.spawn[0], 0, def.spawn[1]]} bounds={bounds} />
      <CameraRig offset={[0, 10.5, 13]} />
    </>
  );
}
