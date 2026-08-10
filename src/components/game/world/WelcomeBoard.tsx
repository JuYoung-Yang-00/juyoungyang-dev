"use client";

import { Text } from "@react-three/drei";

type Props = {
  title: string;
  tagline: string;
  position?: [number, number, number];
  rotY?: number;
  dark?: boolean;
};

/** Large two-line signpost greeting the player at spawn. */
export default function WelcomeBoard({
  title,
  tagline,
  position = [0, 0, 0],
  rotY = 0,
  dark,
}: Props) {
  const wood = dark ? "#232a36" : "#7a4f25";
  const trim = dark ? "#11151d" : "#3e2a14";

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[-1.05, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.24, 8]} />
        <meshStandardMaterial color={trim} roughness={0.95} />
      </mesh>
      <mesh position={[1.05, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.24, 8]} />
        <meshStandardMaterial color={trim} roughness={0.95} />
      </mesh>

      <group position={[0, 1.42, 0]} rotation={[-0.14, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.1, 1.0, 0.09]} />
          <meshStandardMaterial color={wood} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.53, 0]} castShadow>
          <boxGeometry args={[3.24, 0.1, 0.105]} />
          <meshStandardMaterial color={trim} roughness={0.95} />
        </mesh>
        <mesh position={[0, -0.53, 0]} castShadow>
          <boxGeometry args={[3.24, 0.1, 0.105]} />
          <meshStandardMaterial color={trim} roughness={0.95} />
        </mesh>

        <Text
          position={[0, 0.18, 0.055]}
          font="/fonts/Rubik-Black.woff"
          fontSize={0.4}
          color={dark ? "#7fd4ff" : "#fff5db"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.016}
          outlineColor={dark ? "#04070c" : "#2a1808"}
          letterSpacing={-0.01}
        >
          {title.toUpperCase()}
        </Text>
        <Text
          position={[0, -0.22, 0.055]}
          font="/fonts/Rubik-SemiBold.woff"
          fontSize={0.15}
          color={dark ? "#9db7d6" : "#f0dcae"}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.9}
          textAlign="center"
          letterSpacing={0.02}
        >
          {tagline}
        </Text>
      </group>
    </group>
  );
}
