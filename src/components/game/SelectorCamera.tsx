"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { LAYOUT_RADIUS } from "@/lib/game/islands";

// 30° pitch — more top-down. Wider FOV (56) keeps the horizon in view;
// raised look-at (y=1.5) leaves room for sky above the islands.
const ANGLE_RAD = Math.PI / 6;
const FOV = 56;

const PARALLAX_X = 1.4;
const PARALLAX_Y = 0.3;
const PARALLAX_Z = 0.6;
const SMOOTH = 0.06;

const _target = new Vector3();
const LOOK_AT = new Vector3(0, 1.5, 0);

export default function SelectorCamera() {
  const { camera, size } = useThree();
  const cursor = useRef({ x: 0, y: 0 });

  const basePos = useMemo(() => {
    const vFov = (FOV * Math.PI) / 180;
    const aspect = size.width / Math.max(1, size.height);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const dV = LAYOUT_RADIUS / Math.tan(vFov / 2);
    const dH = LAYOUT_RADIUS / Math.tan(hFov / 2);
    const dist = Math.max(dV, dH) * 1.18;
    return new Vector3(
      0,
      dist * Math.sin(ANGLE_RAD),
      dist * Math.cos(ANGLE_RAD)
    );
  }, [size.width, size.height]);

  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = FOV;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  useEffect(() => {
    camera.position.copy(basePos);
    camera.lookAt(LOOK_AT);
  }, [camera, basePos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cursor.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      cursor.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    _target.set(
      basePos.x + cursor.current.x * PARALLAX_X,
      basePos.y - cursor.current.y * PARALLAX_Y,
      basePos.z + cursor.current.y * PARALLAX_Z
    );
    camera.position.lerp(_target, SMOOTH);
    camera.lookAt(LOOK_AT);
  });

  return null;
}
