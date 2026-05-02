"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Group, Mesh, Vector3 } from "three";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useKeyboard } from "@/lib/game/useKeyboard";
import { playerObj } from "@/lib/game/refs";

const CHARACTER_PATH = "/models/character/Knight.glb";
const MOVEMENT_ANIM_PATH = "/models/animations/Rig_Medium_MovementBasic.glb";

useGLTF.preload(CHARACTER_PATH);
useGLTF.preload(MOVEMENT_ANIM_PATH);

const SPEED = 5.5;
const ROT_SMOOTH = 12;
const FADE = 0.18;

const _dir = new Vector3();

type Props = {
  spawn?: [number, number, number];
};

export default function PlayerCharacter({ spawn = [0, 0, 0] }: Props) {
  const groupRef = useRef<Group>(null!);
  const keys = useKeyboard();
  const lastMovingRef = useRef(false);

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

    _dir.set(0, 0, 0);
    if (keys.current.forward) _dir.z -= 1;
    if (keys.current.backward) _dir.z += 1;
    if (keys.current.left) _dir.x -= 1;
    if (keys.current.right) _dir.x += 1;

    const isMoving = _dir.lengthSq() > 0;

    if (isMoving) {
      _dir.normalize().multiplyScalar(SPEED * delta);
      g.position.add(_dir);

      // KayKit Knight defaults to +Z facing (toward the camera at spawn).
      // atan2(dx, dz) gives the yaw needed to align that default with motion.
      const target = Math.atan2(_dir.x, _dir.z);
      let diff = target - g.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      g.rotation.y += diff * Math.min(1, delta * ROT_SMOOTH);
    }

    playerObj.position.copy(g.position);

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
