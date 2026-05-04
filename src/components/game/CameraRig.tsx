"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector3 } from "three";
import { playerObj } from "@/lib/game/refs";

const DEFAULT_OFFSET: [number, number, number] = [0, 9, 12];
const LOOK_OFFSET = new Vector3(0, 1.2, 0);
const SMOOTH = 0.085;

const _desired = new Vector3();
const _look = new Vector3();

export default function CameraRig({
  offset,
}: {
  offset?: [number, number, number];
}) {
  const { camera } = useThree();
  const offsetVec = useMemo(
    () => new Vector3(...(offset ?? DEFAULT_OFFSET)),
    [offset?.[0], offset?.[1], offset?.[2]]
  );

  useFrame(() => {
    _desired.copy(playerObj.position).add(offsetVec);
    camera.position.lerp(_desired, SMOOTH);
    _look.copy(playerObj.position).add(LOOK_OFFSET);
    camera.lookAt(_look);
  });

  return null;
}
