"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { playerObj } from "@/lib/game/refs";

const OFFSET = new Vector3(0, 9, 12);
const LOOK_OFFSET = new Vector3(0, 1.2, 0);
const SMOOTH = 0.085;

const _desired = new Vector3();
const _look = new Vector3();

export default function CameraRig() {
  const { camera } = useThree();

  useFrame(() => {
    _desired.copy(playerObj.position).add(OFFSET);
    camera.position.lerp(_desired, SMOOTH);
    _look.copy(playerObj.position).add(LOOK_OFFSET);
    camera.lookAt(_look);
  });

  return null;
}
