"use client";

import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  BufferGeometry,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  carX,
  cloudX,
  rowZ,
  CAR_SCALE,
  TILE,
  type Engine,
  type RowDef,
} from "@/lib/game/crossing/engine";

const KAY = "/models/kaykit-city";
const K = "/models/kenney";

/** Safe-row blockers, indexed by the engine's prop.model. */
const PROP_PATHS = [
  `${KAY}/bench.gltf`,
  `${KAY}/firehydrant.gltf`,
  `${KAY}/dumpster.gltf`,
  `${KAY}/trafficlight_A.gltf`,
  `${KAY}/bush.gltf`,
];
const PROP_SCALES = [3, 3, 3, 2.8, 3];

/** Traffic, indexed by the engine's car.model (2 = police). */
const CAR_PATHS = [
  `${KAY}/car_sedan.gltf`,
  `${KAY}/car_hatchback.gltf`,
  `${KAY}/car_police.gltf`,
  `${KAY}/car_stationwagon.gltf`,
  `${KAY}/car_taxi.gltf`,
];

/** Flanking skyline, indexed by the engine's flank.model. */
const FLANK_PATHS = [
  `${K}/low-detail-building-wide-a.glb`,
  `${K}/low-detail-building-wide-b.glb`,
  `${K}/low-detail-building-a.glb`,
  `${K}/low-detail-building-c.glb`,
  `${K}/low-detail-building-e.glb`,
  `${K}/low-detail-building-g.glb`,
  `${K}/low-detail-building-i.glb`,
  `${K}/low-detail-building-k.glb`,
  `${K}/low-detail-building-m.glb`,
];

const CLOUD_PATH = "/models/decoration/cloud_small.gltf";

[...PROP_PATHS, ...CAR_PATHS, ...FLANK_PATHS, CLOUD_PATH].forEach((p) =>
  useGLTF.preload(p)
);

/** Cars sit slightly above their origin; measured at scale 1 the body
 *  bottoms out at y = -0.07. */
const CAR_Y = 0.07 * CAR_SCALE;
/** cloud_small tops out at y ≈ +0.93·scale; sink it so the puff's crown
 *  reads as the standing surface. */
const CLOUD_Y = -0.95;
const STRIP_W = 60;

// Same night-city trick as WorkCityScene: reuse the albedo as emissive so
// models keep their colors after dark instead of going silhouette.
// scene.clone(true) shares materials with the useGLTF cache, so this runs
// against shared state — the WeakSet keeps repeated mounts from re-flagging
// needsUpdate (a shader-program re-evaluation) on every window slide.
const glowApplied = new WeakSet<MeshStandardMaterial>();
function applyGlow(root: Object3D, intensity: number) {
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as MeshStandardMaterial;
    if (!mat || !mat.map) return;
    mat.emissiveMap = mat.map;
    mat.emissive?.setHex(0xffffff);
    mat.emissiveIntensity = intensity;
    if (!glowApplied.has(mat)) {
      glowApplied.add(mat);
      mat.needsUpdate = true;
    }
  });
}

// A KayKit car is ~5 meshes sharing one atlas material. Flattening each
// model once into a single merged geometry turns every car on screen from
// ~5 draw calls into 1 — cars dominate the scene's draw count — and lets
// all cars of a model share one GPU geometry (no per-mount uploads).
const carMergeCache = new Map<
  string,
  { geometry: BufferGeometry; material: Material } | null
>();

function useMergedCar(path: string) {
  const { scene } = useGLTF(path);
  return useMemo(() => {
    let entry = carMergeCache.get(path);
    if (entry === undefined) {
      const geoms: BufferGeometry[] = [];
      let material: Material | null = null;
      scene.updateMatrixWorld(true);
      scene.traverse((o) => {
        const m = o as Mesh;
        if (!m.isMesh) return;
        const g = m.geometry.clone();
        g.applyMatrix4(m.matrixWorld);
        geoms.push(g);
        if (!material) material = m.material as Material;
      });
      const merged = geoms.length ? mergeGeometries(geoms, false) : null;
      geoms.forEach((g) => g.dispose());
      entry = merged && material ? { geometry: merged, material } : null;
      carMergeCache.set(path, entry);
      if (entry) applyGlow(scene, 0.6);
    }
    return entry;
  }, [path, scene]);
}

function Clone({
  path,
  glow = 0.5,
  position,
  rotation = 0,
  scale = 1,
}: {
  path: string;
  glow?: number;
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  const { scene } = useGLTF(path);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    applyGlow(c, glow);
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

/** Streetlamp — same primitive the Work city uses: dark pole, lit bulb. */
function Lamp({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 1.3, 0]}>
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

function Car({
  engine,
  row,
  i,
}: {
  engine: Engine;
  row: RowDef;
  i: number;
}) {
  const ref = useRef<Group>(null!);
  const flasherRef = useRef<Group>(null!);
  const path = CAR_PATHS[row.cars[i].model];
  const merged = useMergedCar(path);
  const { scene } = useGLTF(path);
  // Fallback for a model whose primitives refuse to merge (mismatched
  // attributes) — the plain clone path, one draw per primitive.
  const fallback = useMemo(() => {
    if (merged) return null;
    const c = scene.clone(true);
    applyGlow(c, 0.6);
    return c;
  }, [merged, scene]);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    g.position.x = carX(row, i, engine.state.time);
    const f = flasherRef.current;
    if (f) f.visible = Math.floor(engine.state.time * 5) % 2 === 0;
  });

  // KayKit cars are modelled nose down +z; rotate that onto the travel axis.
  const rot = row.dir === 1 ? Math.PI / 2 : -Math.PI / 2;
  return (
    <group ref={ref} position={[0, CAR_Y, 0]}>
      {merged ? (
        <mesh
          geometry={merged.geometry}
          material={merged.material}
          rotation={[0, rot, 0]}
          scale={CAR_SCALE}
        />
      ) : (
        fallback && (
          <primitive object={fallback} rotation={[0, rot, 0]} scale={CAR_SCALE} />
        )
      )}
      {row.police && (
        <group ref={flasherRef} position={[0, 1.34, 0]}>
          <mesh position={[row.dir * 0.18, 0, 0]}>
            <boxGeometry args={[0.16, 0.08, 0.12]} />
            <meshBasicMaterial color="#ff5a4e" />
          </mesh>
          <mesh position={[-row.dir * 0.18, 0, 0]}>
            <boxGeometry args={[0.16, 0.08, 0.12]} />
            <meshBasicMaterial color="#5cb1ff" />
          </mesh>
        </group>
      )}
    </group>
  );
}

function RiftCloud({
  engine,
  row,
  i,
}: {
  engine: Engine;
  row: RowDef;
  i: number;
}) {
  const ref = useRef<Group>(null!);
  const { scene } = useGLTF(CLOUD_PATH);
  const obj = useMemo(() => scene.clone(true), [scene]);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = engine.state.time;
    g.position.x = cloudX(row, i, t);
    g.position.y = CLOUD_Y + Math.sin(t * 1.3 + i * 2.1) * 0.05;
  });

  return (
    <group ref={ref} position={[0, CLOUD_Y, 0]}>
      <primitive object={obj} scale={row.clouds[i].scale} />
    </group>
  );
}

function RowImpl({ engine, def }: { engine: Engine; def: RowDef }) {
  return (
    <group position={[0, 0, rowZ(def.index)]}>
      {/* Ground strip — rifts get none: the void below IS the hazard. The
          sidewalk sits clearly lighter than the tarmac so a player can read
          "safe / not safe" lanes at a glance. */}
      {def.kind !== "rift" && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[STRIP_W, TILE]} />
          <meshStandardMaterial
            color={def.kind === "road" ? "#1f2736" : "#475673"}
            roughness={0.9}
          />
        </mesh>
      )}
      {/* Kerb lines frame the sidewalks; roads get a faint lane edge. */}
      {def.kind === "safe" &&
        [-1, 1].map((edge) => (
          <mesh
            key={edge}
            position={[0, 0.01, edge * (TILE / 2 - 0.06)]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[STRIP_W, 0.09]} />
            <meshBasicMaterial color="#5a6a8e" />
          </mesh>
        ))}
      {def.kind === "road" && (
        <mesh position={[0, 0.01, -TILE / 2 + 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[STRIP_W, 0.06]} />
          <meshBasicMaterial color="#394563" transparent opacity={0.55} />
        </mesh>
      )}

      {def.props.map((p) => (
        <Clone
          key={`p${p.col}`}
          path={PROP_PATHS[p.model]}
          glow={0.45}
          position={[p.col * TILE, 0, 0]}
          rotation={p.rot}
          scale={PROP_SCALES[p.model]}
        />
      ))}

      {def.lamps.map((side) => (
        <Lamp key={`l${side}`} x={side * 10.6} />
      ))}

      {def.flanks.map((f) => (
        <Clone
          key={`f${f.side}`}
          path={FLANK_PATHS[f.model]}
          glow={0.28}
          position={[f.side * f.off, 0, 0]}
          rotation={f.side === -1 ? Math.PI / 2 : -Math.PI / 2}
          scale={f.scale}
        />
      ))}

      {def.kind === "road" &&
        def.cars.map((_, i) => <Car key={i} engine={engine} row={def} i={i} />)}

      {def.kind === "rift" &&
        def.clouds.map((_, i) => (
          <RiftCloud key={i} engine={engine} row={def} i={i} />
        ))}
    </group>
  );
}

/** Rows re-render only when their definition object changes — per-frame
 *  motion happens through refs inside Car/RiftCloud. */
const Row = memo(RowImpl, (a, b) => a.def === b.def && a.engine === b.engine);
export default Row;
