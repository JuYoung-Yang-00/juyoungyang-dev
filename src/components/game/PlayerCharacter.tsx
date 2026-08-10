"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Group, Mesh, Vector3 } from "three";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useKeyboard } from "@/lib/game/useKeyboard";
import { playerObj } from "@/lib/game/refs";
import { joystick, useGameStore } from "@/lib/game/store";

const CHARACTER_PATH = "/models/character/Knight.glb";
const MOVEMENT_ANIM_PATH = "/models/animations/Rig_Medium_MovementBasic.glb";

useGLTF.preload(CHARACTER_PATH);
useGLTF.preload(MOVEMENT_ANIM_PATH);

const SPEED = 5.5;
// Holding any movement input breaks into a run: walking is for reading the
// space, running is for crossing it.
const RUN_SPEED = 8.8;
const RUN_AFTER_S = 1;
const RUN_ANIM_SCALE = 1.35;
const ROT_SMOOTH = 12;
const FADE = 0.18;

const _dir = new Vector3();

type Props = {
  spawn?: [number, number, number];
  /** Returns true when a position is walkable. Undefined = unbounded. */
  bounds?: (x: number, z: number) => boolean;
};

export default function PlayerCharacter({ spawn = [0, 0, 0], bounds }: Props) {
  const groupRef = useRef<Group>(null!);
  const keys = useKeyboard();
  const lastMovingRef = useRef(false);
  const movingTimeRef = useRef(0);
  const speedRef = useRef(SPEED);

  const { scene } = useGLTF(CHARACTER_PATH);
  const { animations } = useGLTF(MOVEMENT_ANIM_PATH);
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as Mesh).isMesh) {
        (obj as Mesh).castShadow = true;
        (obj as Mesh).receiveShadow = true;
      }
    });
  }, [scene]);

  // Seed the shared ref immediately so the camera doesn't lerp from the
  // previous world's position.
  useEffect(() => {
    playerObj.position.set(spawn[0], spawn[1], spawn[2]);
  }, [spawn]);

  const clipNames = useMemo(() => {
    const idle =
      Object.keys(actions).find((n) => /idle/i.test(n)) ?? Object.keys(actions)[0];
    const move =
      Object.keys(actions).find((n) => /^run|running/i.test(n)) ??
      Object.keys(actions).find((n) => /walk/i.test(n)) ??
      idle;
    return { idle, move };
  }, [actions]);

  useEffect(() => {
    if (!actions || !clipNames.idle) return;
    actions[clipNames.idle]?.reset().fadeIn(FADE).play();
    return () => {
      Object.values(actions).forEach((a) => a?.fadeOut(FADE));
    };
  }, [actions, clipNames.idle]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    // Freeze movement while a reading panel is open.
    const reading = useGameStore.getState().openStationId !== null;

    _dir.set(0, 0, 0);
    if (!reading) {
      if (keys.current.forward) _dir.z -= 1;
      if (keys.current.backward) _dir.z += 1;
      if (keys.current.left) _dir.x -= 1;
      if (keys.current.right) _dir.x += 1;
      if (joystick.active) {
        _dir.x += joystick.x;
        _dir.z += joystick.y;
      }
    }

    const isMoving = _dir.lengthSq() > 0.001;
    movingTimeRef.current = isMoving ? movingTimeRef.current + delta : 0;
    const running = movingTimeRef.current >= RUN_AFTER_S;

    // Ease into the run rather than stepping the velocity — an instant
    // speed jump reads as a camera hitch with the damped follow rig.
    const targetSpeed = running ? RUN_SPEED : SPEED;
    speedRef.current += (targetSpeed - speedRef.current) * Math.min(1, delta * 8);

    if (isMoving) {
      if (_dir.lengthSq() > 1) _dir.normalize();
      _dir.multiplyScalar(speedRef.current * delta);

      // Move with axis-separated collision so the knight slides along
      // walls and platform edges instead of sticking. When a boundary
      // narrows ahead (curving corridors), a plain axis split wedges the
      // character — so as a last resort, advance on one axis while nudging
      // the other inward until a walkable spot is found.
      const nx = g.position.x + _dir.x;
      const nz = g.position.z + _dir.z;
      if (!bounds || bounds(nx, nz)) {
        g.position.x = nx;
        g.position.z = nz;
      } else if (bounds(nx, g.position.z)) {
        g.position.x = nx;
      } else if (bounds(g.position.x, nz)) {
        g.position.z = nz;
      } else {
        const NUDGE = 0.14;
        for (const s of [1, -1]) {
          if (Math.abs(_dir.z) > 0.0001 && bounds(g.position.x + s * NUDGE, nz)) {
            g.position.x += s * NUDGE;
            g.position.z = nz;
            break;
          }
          if (Math.abs(_dir.x) > 0.0001 && bounds(nx, g.position.z + s * NUDGE)) {
            g.position.x = nx;
            g.position.z += s * NUDGE;
            break;
          }
        }
      }

      // KayKit Knight defaults to +Z facing (toward the camera at spawn).
      // atan2(dx, dz) gives the yaw needed to align that default with motion.
      const target = Math.atan2(_dir.x, _dir.z);
      let diff = target - g.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      g.rotation.y += diff * Math.min(1, delta * ROT_SMOOTH);
    }

    playerObj.position.copy(g.position);

    // The movement clip doubles for walk and run; play it faster once the
    // hold breaks into a run so the feet keep up with the ground speed.
    const moveAction = actions?.[clipNames.move];
    if (moveAction) {
      moveAction.timeScale = running ? RUN_ANIM_SCALE : 1;
    }

    if (isMoving !== lastMovingRef.current && actions) {
      const next = isMoving ? clipNames.move : clipNames.idle;
      const prev = isMoving ? clipNames.idle : clipNames.move;
      if (next && next !== prev) {
        actions[next]?.reset().fadeIn(FADE).play();
        if (prev) actions[prev]?.fadeOut(FADE);
      }
      lastMovingRef.current = isMoving;
    }
  });

  return (
    <group ref={groupRef} position={spawn} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}
