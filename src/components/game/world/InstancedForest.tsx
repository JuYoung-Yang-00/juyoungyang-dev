"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  Quaternion,
  Vector3,
} from "three";
import { useGLTF } from "@react-three/drei";

export type ForestInstance = {
  x: number;
  z: number;
  rotY: number;
  scale: number;
};

const _matrix = new Matrix4();
const _pos = new Vector3();
const _quat = new Quaternion();
const _scale = new Vector3();
const _axis = new Vector3(0, 1, 0);

/** All submeshes of one tree model, instanced across many placements. */
function ForestLayer({
  path,
  instances,
}: {
  path: string;
  instances: ForestInstance[];
}) {
  const { scene } = useGLTF(path);

  const subMeshes = useMemo(() => {
    const out: { geometry: BufferGeometry; material: Material }[] = [];
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (mesh.isMesh) {
        out.push({
          geometry: mesh.geometry,
          material: mesh.material as Material,
        });
      }
    });
    return out;
  }, [scene]);

  return (
    <>
      {subMeshes.map((sm, i) => (
        <ForestSubMesh key={i} sub={sm} instances={instances} />
      ))}
    </>
  );
}

function ForestSubMesh({
  sub,
  instances,
}: {
  sub: { geometry: BufferGeometry; material: Material };
  instances: ForestInstance[];
}) {
  const ref = useRef<InstancedMesh>(null!);

  useEffect(() => {
    if (!ref.current) return;
    for (let i = 0; i < instances.length; i++) {
      const t = instances[i];
      _pos.set(t.x, 0, t.z);
      _quat.setFromAxisAngle(_axis, t.rotY);
      const s = 1.6 * t.scale;
      _scale.set(s, s, s);
      _matrix.compose(_pos, _quat, _scale);
      ref.current.setMatrixAt(i, _matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [instances]);

  return (
    // frustumCulled must be off: three culls an InstancedMesh by the source
    // geometry's bounding sphere (one tree at the origin), not the instance
    // matrices — walking away from the origin made whole forest layers vanish.
    <instancedMesh
      ref={ref}
      args={[sub.geometry, sub.material, instances.length]}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}

/** Dense forest rendered as a few instanced meshes. `byType` maps a tree
 *  model path to its placements. */
export default function InstancedForest({
  byType,
}: {
  byType: Record<string, ForestInstance[]>;
}) {
  return (
    <>
      {Object.entries(byType).map(([path, instances]) =>
        instances.length > 0 ? (
          <ForestLayer key={path} path={path} instances={instances} />
        ) : null
      )}
    </>
  );
}
