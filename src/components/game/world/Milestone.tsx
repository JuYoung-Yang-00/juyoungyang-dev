"use client";

import { Text } from "@react-three/drei";

type Props = {
  text: string;
  position: [number, number, number];
  rotY?: number;
};

/** Small wooden year-marker post along a world's road. Not interactive. */
export default function Milestone({ text, position, rotY = 0 }: Props) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.055, 0.64, 8]} />
        <meshStandardMaterial color="#3e2a14" roughness={0.95} />
      </mesh>
      <group position={[0, 0.72, 0]} rotation={[-0.14, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.98, 0.34, 0.06]} />
          <meshStandardMaterial color="#7a4f25" roughness={0.85} />
        </mesh>
        <Text
          position={[0, 0, 0.04]}
          font="/fonts/Rubik-Black.woff"
          fontSize={0.2}
          color="#ffe6a8"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#2a1808"
        >
          {text}
        </Text>
      </group>
    </group>
  );
}
