"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import PlayerCharacter from "../PlayerCharacter";
import CameraRig from "../CameraRig";
import OceanField from "../OceanField";
import Platform from "./Platform";
import InfoStation from "./InfoStation";
import WelcomeBoard from "./WelcomeBoard";
import Milestone from "./Milestone";
import {
  bandHalfWidth,
  bandXCenter,
  hexBand,
  hexDisc,
  makeBandBounds,
  makeBandOceanExclude,
  makePlatformBounds,
} from "./hexUtils";
import { Building, Cloud, hash01, Prop, WORLD_CLOUDS } from "./sceneBits";
import { CLOUD_PATHS, type IslandDef } from "@/lib/game/islands";
import type { DayWorldDef, PropDef } from "@/lib/game/worlds";

CLOUD_PATHS.forEach((p) => useGLTF.preload(p));

const D = "/models/decoration/";
const TREE_PATHS = [
  D + "trees_A_small.gltf",
  D + "trees_A_medium.gltf",
  D + "trees_B_medium.gltf",
  D + "trees_A_large.gltf",
];

/** Auto-planted forest along a band platform's edges. */
function useEdgeTrees(def: DayWorldDef): PropDef[] {
  return useMemo(() => {
    if (def.platform.kind !== "band" || !def.edgeTrees) return [];
    const band = def.platform.band;
    const avoid: [number, number, number][] = [
      ...def.colliders,
      ...def.stations.map((s) => [s.spot[0], s.spot[1], 2.4] as [number, number, number]),
      ...(def.milestones ?? []).map((m) => [m.spot[0], m.spot[1], 1.6] as [number, number, number]),
      [def.welcome.spot[0], def.welcome.spot[1], 2.4],
      [def.spawn[0], def.spawn[1], 2.4],
    ];
    const out: PropDef[] = [];
    for (let z = band.zMin + 2.0; z <= band.zMax - 2.0; z += 2.6) {
      for (const side of [-1, 1]) {
        const r0 = hash01(z, side);
        if (r0 < 0.4) continue;
        const xc = bandXCenter(band, z);
        const w = bandHalfWidth(band, z);
        const x = xc + side * (w - 1.15) + (hash01(z, side + 10) - 0.5) * 0.9;
        const zz = z + (hash01(z, side + 20) - 0.5) * 1.2;
        let blocked = false;
        for (const [ax, az, ar] of avoid) {
          const dx = x - ax;
          const dz = zz - az;
          if (dx * dx + dz * dz < ar * ar) {
            blocked = true;
            break;
          }
        }
        if (blocked) continue;
        out.push({
          path: TREE_PATHS[Math.floor(hash01(z, side + 30) * TREE_PATHS.length)],
          position: [x, 0, zz],
          rotation: hash01(z, side + 40) * Math.PI * 2,
          scale: 0.8 + hash01(z, side + 50) * 0.35,
        });
      }
    }
    return out;
  }, [def]);
}

export default function DayWorldScene({
  island,
  def,
}: {
  island: IslandDef;
  def: DayWorldDef;
}) {
  const edgeTrees = useEdgeTrees(def);

  const tiles = useMemo(
    () =>
      def.platform.kind === "disc"
        ? hexDisc(def.platform.radius)
        : hexBand(def.platform.band),
    [def]
  );

  const bounds = useMemo(() => {
    const boardColliders: [number, number, number][] = [
      ...def.stations.map(
        (s) => [s.spot[0], s.spot[1], 0.6] as [number, number, number]
      ),
      ...(def.milestones ?? []).map(
        (m) => [m.spot[0], m.spot[1], 0.45] as [number, number, number]
      ),
      ...edgeTrees.map(
        (t) => [t.position[0], t.position[2], 0.7] as [number, number, number]
      ),
      [def.welcome.spot[0], def.welcome.spot[1], 0.8],
    ];
    const all = [...def.colliders, ...boardColliders];
    return def.platform.kind === "disc"
      ? makePlatformBounds(def.platform.radius, all)
      : makeBandBounds(def.platform.band, all);
  }, [def, edgeTrees]);

  const oceanExcludeFn = useMemo(
    () =>
      def.platform.kind === "band"
        ? makeBandOceanExclude(def.platform.band)
        : undefined,
    [def]
  );

  return (
    <>
      {/* Deep water below the hex ocean */}
      <mesh receiveShadow position={[0, -0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1200, 1200]} />
        <meshStandardMaterial color="#0a2c47" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Ocean starts one empty ring beyond the platform — a thin, even
          shadow gap rather than a jagged cutout. */}
      {def.platform.kind === "disc" ? (
        <OceanField excludeHexRadius={def.platform.radius + 1} />
      ) : (
        <OceanField excludeFn={oceanExcludeFn} />
      )}

      <Platform tiles={tiles} />

      {def.buildings.map((b, i) => (
        <Building key={i} def={b} />
      ))}
      {def.props.map((p, i) => (
        <Prop key={i} def={p} />
      ))}
      {edgeTrees.map((p, i) => (
        <Prop key={`t${i}`} def={p} />
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
