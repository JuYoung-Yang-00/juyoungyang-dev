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
import { useGLTF } from "@react-three/drei";
import { ISLANDS } from "@/lib/game/islands";

const WATER_PATH = "/models/tiles/hex_water.gltf";
useGLTF.preload(WATER_PATH);

// Hex pitch — must match the island tiles so neighbour positions align.
const HEX_PITCH_X = 1.6;
const HEX_PITCH_Z = 1.6 * 0.866; // sin(60°) — pointy-top vertical spacing

// Half-extent of the tiled ocean grid (in world units). Extends past the
// fog far-distance so the flat deep-water plane only shows up where it's
// already fully fogged out — no visible boundary.
const OCEAN_HALF_X = 260;
const OCEAN_BACK = -90;
const OCEAN_FRONT = 60;

// Minimum distance from any island centre that a water tile must stay clear
// of, so tiles don't z-fight with island base tiles.
const ISLAND_CLEARANCE = 2.6;

const _matrix = new Matrix4();
const _pos = new Vector3();
const _quat = new Quaternion();
const _scale = new Vector3(1.6, 1.6, 1.6);

export default function OceanField() {
  const { scene } = useGLTF(WATER_PATH);
  const ref = useRef<InstancedMesh>(null!);

  // Pull the geometry + material out of the loaded gltf once. Tint the
  // material a touch darker so the hex tiles sit closer in tone to the deep
  // ocean plane underneath (less stark a transition).
  const source = useMemo(() => {
    let result: { geometry: BufferGeometry; material: Material } | null = null;
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (mesh.isMesh && !result) {
        const tinted = (mesh.material as MeshStandardMaterial).clone();
        tinted.color.multiplyScalar(0.2);
        result = {
          geometry: mesh.geometry,
          material: tinted as Material,
        };
      }
    });
    return result;
  }, [scene]);

  // Generate hex-grid positions, skipping any tile that would overlap an
  // island.
  const positions = useMemo(() => {
    const out: [number, number, number][] = [];
    // q is column, r is row in pointy-top axial coords. Iterate a generous
    // range and clip by world bounds + island distance.
    const Q_RANGE = 160;
    const R_RANGE = 130;
    for (let r = -R_RANGE; r <= R_RANGE; r++) {
      for (let q = -Q_RANGE; q <= Q_RANGE; q++) {
        const x = q * HEX_PITCH_X + r * (HEX_PITCH_X / 2);
        const z = r * HEX_PITCH_Z;
        if (Math.abs(x) > OCEAN_HALF_X) continue;
        if (z < OCEAN_BACK || z > OCEAN_FRONT) continue;
        let blocked = false;
        for (const island of ISLANDS) {
          const dx = island.position[0] - x;
          const dz = island.position[2] - z;
          if (dx * dx + dz * dz < ISLAND_CLEARANCE * ISLAND_CLEARANCE) {
            blocked = true;
            break;
          }
        }
        if (blocked) continue;
        // Slight per-tile y variation breaks the flat plane look so the
        // chunky hex shapes read as ocean rather than a single sheet.
        const yJitter = (Math.sin(x * 7.13 + z * 3.41) * 0.5) * 0.08;
        out.push([x, -0.18 + yJitter, z]);
      }
    }
    return out;
  }, []);

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
