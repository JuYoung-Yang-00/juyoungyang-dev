"use client";

import { useEffect, useMemo } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import { Text, useGLTF } from "@react-three/drei";
import PlayerCharacter from "./PlayerCharacter";
import CameraRig from "./CameraRig";
import { BUILDING_PATH, TILE_PATH, type IslandDef } from "@/lib/game/islands";

export default function WorldScene({ island }: { island: IslandDef }) {
  const { scene: tileSrc } = useGLTF(TILE_PATH);
  const { scene: buildingSrc } = useGLTF(BUILDING_PATH[island.building]);

  const buildingObj = useMemo(() => buildingSrc.clone(true), [buildingSrc]);
  const tile = useMemo(() => tileSrc.clone(true), [tileSrc]);

  useEffect(() => {
    [tile, buildingObj].forEach((root) => {
      root.traverse((obj) => {
        const mesh = obj as Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Reset any emissive carry-over from the selector
        const mat = mesh.material as MeshStandardMaterial;
        if (mat && "emissive" in mat) {
          mat.emissive?.set("#000000");
          mat.emissiveIntensity = 0;
        }
      });
    });
  }, [tile, buildingObj]);

  return (
    <>
      {/* World floor */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[36, 64]} />
        <meshStandardMaterial color="#16140f" roughness={0.95} />
      </mesh>

      {/* Subtle outer ring */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[18, 18.05, 64]} />
        <meshBasicMaterial color="#5a5854" transparent opacity={0.35} />
      </mesh>

      {/* Featured building far ahead of spawn */}
      <group position={[0, 0, -10]}>
        <primitive object={tile} scale={3} />
        <primitive object={buildingObj} scale={3} />
      </group>

      {/* World title floating above the building */}
      <Text
        position={[0, 9, -10]}
        font="/fonts/Rubik-Black.woff"
        fontSize={1.4}
        color="#e8e6df"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#0a0a0a"
        letterSpacing={-0.04}
      >
        {island.title.toUpperCase()}
      </Text>

      <Text
        position={[0, 7.6, -10]}
        font="/fonts/Rubik-SemiBold.woff"
        fontSize={0.45}
        color="#8a8780"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
      >
        {island.org.toUpperCase()} · {island.era.toUpperCase()}
      </Text>

      {/* Coming-soon plaque, replaceable per-world later */}
      <Text
        position={[0, 0.8, -2.5]}
        font="/fonts/Rubik-SemiBold.woff"
        fontSize={0.32}
        color="#5a5854"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 6, 0, 0]}
      >
        v0 · placeholder scene
      </Text>

      <PlayerCharacter spawn={[0, 0, 6]} />
      <CameraRig />
    </>
  );
}
