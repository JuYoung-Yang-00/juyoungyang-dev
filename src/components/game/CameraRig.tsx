"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";
import { playerObj } from "@/lib/game/refs";

const DEFAULT_OFFSET: [number, number, number] = [0, 9, 12];
const LOOK_OFFSET = new Vector3(0, 1.2, 0);
// Per-second damping, applied as 1 - e^(-λ·dt) so the follow feel is the
// same at 60Hz and 120Hz. Position trails looser than the look target;
// both MUST be smoothed — snapping lookAt to the player every frame while
// the position lerps makes the whole scene judder during movement.
const POS_DAMP = 5.5;
const LOOK_DAMP = 9;

const _desired = new Vector3();
const _look = new Vector3();

export default function CameraRig({
  offset,
}: {
  offset?: [number, number, number];
}) {
  const { camera, size } = useThree();
  const lookRef = useRef(new Vector3());

  // Narrow viewports get a pulled-back camera so the scene still fits.
  const zoom = useMemo(() => {
    const aspect = size.width / Math.max(1, size.height);
    if (aspect < 0.7) return 1.45;
    if (aspect < 0.9) return 1.3;
    if (aspect < 1.2) return 1.15;
    return 1;
  }, [size.width, size.height]);

  const offsetVec = useMemo(() => {
    const [x, y, z] = offset ?? DEFAULT_OFFSET;
    return new Vector3(x * zoom, y * zoom, z * zoom);
  }, [offset, zoom]);

  // Seed the look target at the spawn position so the first frames don't
  // swing the camera in from a stale world's target.
  useEffect(() => {
    lookRef.current.copy(playerObj.position).add(LOOK_OFFSET);
  }, []);

  useFrame((_, delta) => {
    const posT = 1 - Math.exp(-POS_DAMP * delta);
    _desired.copy(playerObj.position).add(offsetVec);
    camera.position.lerp(_desired, posT);

    const lookT = 1 - Math.exp(-LOOK_DAMP * delta);
    _look.copy(playerObj.position).add(LOOK_OFFSET);
    lookRef.current.lerp(_look, lookT);
    camera.lookAt(lookRef.current);
  });

  return null;
}
