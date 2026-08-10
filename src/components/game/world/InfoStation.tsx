"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MeshBasicMaterial } from "three";
import { Billboard, Text } from "@react-three/drei";
import type { StationDef } from "@/lib/game/worlds";
import { playerObj } from "@/lib/game/refs";
import { useGameStore } from "@/lib/game/store";

export const STATION_RANGE = 2.3;

type Props = {
  station: StationDef;
  /** Wood tones — day worlds use warm brown, kolfi uses charcoal + neon. */
  dark?: boolean;
};

export default function InfoStation({ station, dark }: Props) {
  const markerRef = useRef<Group>(null!);
  const ringRef = useRef<Mesh>(null!);
  const wasNear = useRef(false);
  const [x, z] = station.spot;

  const wood = dark ? "#232a36" : "#7a4f25";
  const trim = dark ? "#11151d" : "#3e2a14";
  const text = dark ? "#7fd4ff" : "#fff5db";
  const accent = "#e8a846";

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const dx = playerObj.position.x - x;
    const dz = playerObj.position.z - z;
    const near = dx * dx + dz * dz < STATION_RANGE * STATION_RANGE;

    if (near !== wasNear.current) {
      wasNear.current = near;
      const store = useGameStore.getState();
      if (near) store.setNearStation(station.id);
      else if (store.nearStationId === station.id) store.setNearStation(null);
    }

    // Quest marker bob + spin-lite
    const m = markerRef.current;
    if (m) {
      m.position.y = 2.35 + Math.sin(t * 2.4 + x) * 0.12;
    }
    const ring = ringRef.current;
    if (ring) {
      const mat = ring.material as MeshBasicMaterial;
      const target = near ? 0.9 : 0.28;
      mat.opacity += (target - mat.opacity) * 0.12;
      const pulse = near ? 1 + Math.sin(t * 3.4) * 0.05 : 1;
      ring.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <group position={[x, 0, z]} rotation={[0, station.rotY ?? 0, 0]}>
      {/* Ground ring */}
      <mesh ref={ringRef} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.16, 40]} />
        <meshBasicMaterial color={accent} transparent opacity={0.28} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.62, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.9, 8]} />
        <meshStandardMaterial color={trim} roughness={0.95} />
      </mesh>
      <mesh position={[0.62, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.9, 8]} />
        <meshStandardMaterial color={trim} roughness={0.95} />
      </mesh>

      {/* Board */}
      <group position={[0, 1.05, 0]} rotation={[-0.16, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.9, 0.6, 0.08]} />
          <meshStandardMaterial color={wood} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.33, 0]} castShadow>
          <boxGeometry args={[2.02, 0.09, 0.095]} />
          <meshStandardMaterial color={trim} roughness={0.95} />
        </mesh>
        <mesh position={[0, -0.33, 0]} castShadow>
          <boxGeometry args={[2.02, 0.09, 0.095]} />
          <meshStandardMaterial color={trim} roughness={0.95} />
        </mesh>
        <Text
          position={[0, 0, 0.05]}
          font="/fonts/Rubik-Black.woff"
          fontSize={0.26}
          color={text}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor={dark ? "#04070c" : "#2a1808"}
          letterSpacing={-0.01}
        >
          {station.board}
        </Text>
      </group>

      {/* Quest marker */}
      <Billboard ref={markerRef} position={[0, 2.35, 0]}>
        <Text
          font="/fonts/Rubik-Black.woff"
          fontSize={0.52}
          color={accent}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor={dark ? "#04070c" : "#2a1808"}
        >
          !
        </Text>
      </Billboard>
    </group>
  );
}
