"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from "three";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { ISLANDS, islandPosition, PORTRAIT_ASPECT } from "@/lib/game/islands";
import { hexRingDistance } from "./world/hexUtils";

const WATER_PATH = "/models/tiles/hex_water.gltf";
useGLTF.preload(WATER_PATH);

// Hex pitch — must match the island tiles so neighbour positions align.
const HEX_PITCH_X = 1.6;
const HEX_PITCH_Z = 1.6 * 0.866; // sin(60°) — pointy-top vertical spacing

// Half-extent of the tiled ocean grid (in world units). Extends past the
// fog far-distance so the flat deep-water plane only shows up where it's
// already fully fogged out — no visible boundary.
const OCEAN_HALF_X = 260;
const OCEAN_BACK = -110;
const OCEAN_FRONT = 80;

// Minimum distance from any island centre that a water tile must stay clear
// of, so tiles don't z-fight with island base tiles. Checked against both
// layouts so the ocean works in portrait and landscape.
const ISLAND_CLEARANCE = 2.6;

const _matrix = new Matrix4();
const _pos = new Vector3();
const _quat = new Quaternion();
const _scale = new Vector3(1.6, 1.6, 1.6);

type OceanProps = {
  /** Extra colour multiplier — 1 keeps the KayKit royal blue. */
  brightness?: number;
  /**
   * Keep-out circles [x, z, radius]. Defaults to the selector's island
   * positions in the layout that is actually on screen.
   */
  exclude?: [number, number, number][];
  /**
   * World platforms: skip lattice cells within this hex-ring radius of the
   * origin. The ocean and platform share the same hex lattice, so this
   * leaves a clean, uniform gap instead of a jagged circle cutout.
   */
  excludeHexRadius?: number;
  /** Arbitrary keep-out test (band worlds). True = skip this tile. */
  excludeFn?: (x: number, z: number) => boolean;
};

export default function OceanField({
  brightness = 0.62,
  exclude,
  excludeHexRadius,
  excludeFn,
}: OceanProps) {
  const { scene } = useGLTF(WATER_PATH);
  const ref = useRef<InstancedMesh>(null!);
  const { size } = useThree();
  const portrait = size.width / Math.max(1, size.height) < PORTRAIT_ASPECT;

  // Pull the geometry + material out of the loaded gltf once. The ocean is
  // deliberately static — per-tile motion read as glitchy, so depth comes
  // from the fixed height jitter below instead.
  const source = useMemo<{ geometry: BufferGeometry; material: Material } | null>(() => {
    let result: { geometry: BufferGeometry; material: Material } | null = null;
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (mesh.isMesh && !result) {
        const mat = (mesh.material as MeshStandardMaterial).clone();
        mat.color.multiplyScalar(brightness);
        result = { geometry: mesh.geometry, material: mat as Material };
      }
    });
    return result;
  }, [scene, brightness]);

  // Generate hex-grid positions, skipping any tile inside a keep-out zone.
  // Only the on-screen layout's islands are excluded — excluding both
  // layouts left phantom holes in open water.
  const positions = useMemo(() => {
    const out: [number, number, number][] = [];
    const keepOut: [number, number, number][] =
      exclude ??
      (excludeHexRadius !== undefined || excludeFn
        ? []
        : ISLANDS.map((i) => {
            const p = islandPosition(i, portrait);
            return [p[0], p[2], ISLAND_CLEARANCE] as [number, number, number];
          }));
    const Q_RANGE = 180;
    const R_RANGE = 150;
    for (let r = -R_RANGE; r <= R_RANGE; r++) {
      for (let q = -Q_RANGE; q <= Q_RANGE; q++) {
        const x = q * HEX_PITCH_X + r * (HEX_PITCH_X / 2);
        const z = r * HEX_PITCH_Z;
        if (Math.abs(x) > OCEAN_HALF_X) continue;
        if (z < OCEAN_BACK || z > OCEAN_FRONT) continue;
        if (
          excludeHexRadius !== undefined &&
          hexRingDistance(x, z) <= excludeHexRadius
        )
          continue;
        if (excludeFn && excludeFn(x, z)) continue;
        let blocked = false;
        for (const [cx, cz, cr] of keepOut) {
          const dx = cx - x;
          const dz = cz - z;
          if (dx * dx + dz * dz < cr * cr) {
            blocked = true;
            break;
          }
        }
        if (blocked) continue;
        // Slight static height variation so the grid never reads as one sheet.
        const yJitter = Math.sin(x * 7.13 + z * 3.41) * 0.03;
        out.push([x, -0.16 + yJitter, z]);
      }
    }
    return out;
  }, [exclude, excludeHexRadius, excludeFn, portrait]);

  useEffect(() => {
    if (!ref.current) return;
    for (let i = 0; i < positions.length; i++) {
      const [x, y, z] = positions[i];
      _pos.set(x, y, z);
      _matrix.compose(_pos, _quat, _scale);
      ref.current.setMatrixAt(i, _matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  if (!source) return null;

  return (
    <instancedMesh
      ref={ref}
      args={[source.geometry, source.material, positions.length]}
      receiveShadow
      castShadow={false}
    />
  );
}
