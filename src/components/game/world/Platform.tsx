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
  Texture,
  Vector3,
} from "three";
import { useGLTF } from "@react-three/drei";
import { TILE_PATH } from "@/lib/game/islands";

// Same UV shift as the selector islands — emerald instead of olive.
const TILE_UV_SHIFT_X = 0.125;
const patched = new WeakSet<Texture>();

const _matrix = new Matrix4();
const _pos = new Vector3();
const _quat = new Quaternion();
const _scale = new Vector3(1.6, 1.6, 1.6);

/** Instanced hex-tile plateau forming a world's walkable ground. */
export default function Platform({ tiles }: { tiles: [number, number][] }) {
  const { scene } = useGLTF(TILE_PATH);
  const ref = useRef<InstancedMesh>(null!);

  const source = useMemo<{ geometry: BufferGeometry; material: Material } | null>(() => {
    let result: { geometry: BufferGeometry; material: Material } | null = null;
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (mesh.isMesh && !result) {
        const mat = (mesh.material as MeshStandardMaterial).clone();
        if (mat.map && !patched.has(mat.map)) {
          mat.map = mat.map.clone();
          mat.map.offset.set(TILE_UV_SHIFT_X, 0);
          mat.map.needsUpdate = true;
          patched.add(mat.map);
        }
        result = { geometry: mesh.geometry, material: mat as Material };
      }
    });
    return result;
  }, [scene]);

  const positions = tiles;

  useEffect(() => {
    if (!ref.current) return;
    for (let i = 0; i < positions.length; i++) {
      const [x, z] = positions[i];
      _pos.set(x, 0, z);
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
      castShadow
    />
  );
}
