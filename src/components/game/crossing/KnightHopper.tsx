"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Group, Mesh } from "three";
import { HOP_S, type Engine } from "@/lib/game/crossing/engine";

const CHARACTER_PATH = "/models/character/Knight.glb";
const MOVE_ANIMS = "/models/animations/Rig_Medium_MovementBasic.glb";
const GENERAL_ANIMS = "/models/animations/Rig_Medium_General.glb";

useGLTF.preload(CHARACTER_PATH);
useGLTF.preload(MOVE_ANIMS);
useGLTF.preload(GENERAL_ANIMS);

/** The opening beat: the cloud drops the knight onto the first sidewalk.
 *  The scene gates input on the same constant so you can't hop mid-air. */
export const INTRO_DROP_S = 0.9;
const DROP_FROM_Y = 6.2;
const FADE = 0.07;

export default function KnightHopper({ engine }: { engine: Engine }) {
  const rootRef = useRef<Group>(null!);
  const innerRef = useRef<Group>(null!);
  const shadowRef = useRef<Mesh>(null!);

  const { scene } = useGLTF(CHARACTER_PATH);
  const move = useGLTF(MOVE_ANIMS);
  const general = useGLTF(GENERAL_ANIMS);
  const clips = useMemo(
    () => [...move.animations, ...general.animations],
    [move.animations, general.animations]
  );
  const { actions } = useAnimations(clips, rootRef);

  // Resolve names from the clip list, NOT from `actions[...]` — drei's
  // action properties are lazy getters that return undefined until the group
  // ref is attached (i.e. after first render), which would silently turn
  // every lookup here into the fallback.
  const names = useMemo(() => {
    const clipNames = new Set(clips.map((c) => c.name));
    const has = (n: string) => (clipNames.has(n) ? n : null);
    return {
      idle: has("Idle_A") ?? clips[0]?.name,
      air: has("Jump_Idle") ?? has("Idle_A") ?? clips[0]?.name,
      spawn: has("Spawn_Air"),
      hit: has("Hit_A"),
    };
  }, [clips]);

  const currentRef = useRef<string | null>(null);
  const fadeTo = (name: string | null, fade = FADE) => {
    if (!name || currentRef.current === name) return;
    const next = actions[name];
    if (!next) return;
    if (currentRef.current) actions[currentRef.current]?.fadeOut(fade);
    next.reset().fadeIn(fade).play();
    currentRef.current = name;
  };

  // Timeline refs — local clocks, so the death beats and the intro drop
  // play out even while the engine's own time is frozen.
  const introT = useRef(0);
  const deathT = useRef(0);
  const landAt = useRef(-1);
  const wasHopping = useRef(false);
  const fallY = useRef(0);
  const fallV = useRef(0);

  useEffect(() => {
    fadeTo(names.spawn ?? names.air, 0.01);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, rawDelta) => {
    const g = rootRef.current;
    const inner = innerRef.current;
    if (!g || !inner) return;
    const delta = Math.min(rawDelta, 0.05);
    const k = engine.knight;
    const phase = engine.state.phase;
    const cause = engine.state.cause;

    const x = k.wx;
    const z = k.wz;
    let y = k.wy;

    if (phase === "intro") {
      // Gravity-shaped drop from the cloud onto the spawn tile.
      introT.current += delta;
      const t = Math.min(1, introT.current / INTRO_DROP_S);
      y = DROP_FROM_Y * (1 - t * t);
      if (t >= 1 && currentRef.current !== names.idle) {
        fadeTo(names.idle, 0.12);
        landAt.current = performance.now();
      }
    } else if (phase === "playing") {
      const hopping = !!k.hop;
      if (hopping && !wasHopping.current) fadeTo(names.air);
      if (!hopping && wasHopping.current) {
        fadeTo(names.idle);
        landAt.current = performance.now();
      }
      wasHopping.current = hopping;
    } else if (phase === "dead") {
      deathT.current += delta;
      const t = deathT.current;
      if (cause === "car") {
        // Comic pancake: flatten fast, stay flat.
        const s = Math.min(1, t / 0.12);
        inner.scale.set(1 + 0.7 * s, Math.max(0.1, 1 - 0.92 * s), 1 + 0.7 * s);
      } else if (cause === "fall") {
        fallV.current += 22 * delta;
        fallY.current -= fallV.current * delta;
        y = fallY.current;
        g.rotation.y += 5 * delta;
        fadeTo(names.air, 0.05);
      } else if (cause === "storm") {
        // Held by the bolt for a beat, then yanked skyward, spinning.
        fadeTo(names.hit ?? names.air, 0.05);
        if (t > 0.35) {
          const rise = t - 0.35;
          y = k.wy + rise * rise * 26;
          g.rotation.y += 11 * delta;
        }
      }
    }

    g.position.set(x, y, z);

    // Face the last hop direction (shortest arc).
    if (phase !== "dead") {
      let diff = k.face - g.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      g.rotation.y += diff * Math.min(1, delta * 18);
    }

    // Squash & stretch — the hop's whole body language.
    if (phase !== "dead") {
      let sy = 1;
      let sxz = 1;
      if (k.hop) {
        const s = Math.min(1, (engine.state.time - k.hop.t0) / HOP_S);
        const arc = Math.sin(Math.PI * s);
        sy = 1 + 0.22 * arc;
        sxz = 1 - 0.08 * arc;
      } else if (landAt.current > 0) {
        const lt = (performance.now() - landAt.current) / 1000;
        const rec = Math.min(1, lt / 0.13);
        sy = 0.84 + 0.16 * rec;
        sxz = 1.12 - 0.12 * rec;
        if (rec >= 1) landAt.current = -1;
      }
      inner.scale.set(sxz, sy, sxz);
    }

    // Blob shadow — no real shadow pass in this scene, so the disc does the
    // grounding. It hides once the knight leaves the ground for good.
    const sh = shadowRef.current;
    if (sh) {
      sh.position.set(x, 0.02, z);
      const gone =
        (phase === "dead" && (cause === "fall" || cause === "storm")) ||
        engine.rowAt(k.row)?.kind === "rift" && phase === "dead";
      const sc = Math.max(0.35, 1 - y * 0.55);
      sh.scale.set(sc, sc, 1);
      sh.visible = !gone && y > -0.2;
    }
  });

  return (
    <>
      <group ref={rootRef}>
        <group ref={innerRef}>
          <primitive object={scene} />
        </group>
      </group>
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.32} />
      </mesh>
    </>
  );
}
