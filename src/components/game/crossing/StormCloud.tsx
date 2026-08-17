"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";
import type { Engine } from "@/lib/game/crossing/engine";

const CLOUD_BIG = "/models/decoration/cloud_big.gltf";
useGLTF.preload(CLOUD_BIG);

const CALM = new Color("#8f97ab");
const ANGRY = new Color("#3a4054");
const _target = new Vector3();
const _tint = new Color();

/**
 * The cloud that carried the knight in. It hovers over spawn during the
 * intro, retreats to lurk behind the field once the run starts, darkens and
 * closes in while the player stalls, and delivers the lightning yank when
 * the storm timer runs out.
 */
export default function StormCloud({ engine }: { engine: Engine }) {
  const ref = useRef<Group>(null!);
  const boltRef = useRef<Group>(null!);
  const zapT = useRef(0);

  const { scene } = useGLTF(CLOUD_BIG);
  const { obj, mats } = useMemo(() => {
    const c = scene.clone(true);
    const collected: MeshStandardMaterial[] = [];
    c.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      // Clone materials so the tint never leaks into the selector's clouds.
      const m = (mesh.material as MeshStandardMaterial).clone();
      m.color.copy(CALM);
      mesh.material = m;
      collected.push(m);
    });
    return { obj: c, mats: collected };
  }, [scene]);

  useFrame((frame, rawDelta) => {
    const g = ref.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.05);
    const t = frame.clock.getElapsedTime();
    const k = engine.knight;
    const phase = engine.state.phase;
    const level = engine.state.stormLevel;
    const zapping = phase === "dead" && engine.state.cause === "storm";

    // The pressure line follows the camera, so a cloud parked AT the line
    // would sit behind the camera plane and fill the screen. Instead the
    // cloud vanishes after the drop-off and materializes low behind the
    // knight once real pressure builds — alongside the vignette. The pose
    // stays well below and ahead of the creeping camera (z ≈ knight+3.5 vs
    // camera ≈ knight+2·gap+10) so it reads as a looming cloud, not a blob
    // against the lens.
    const chasing = level > 0.12;
    g.visible = phase === "intro" || zapping || chasing;

    if (phase === "intro") {
      _target.set(0, 6.4, 0);
    } else if (zapping) {
      // High overhead — the frozen death camera sits close behind the
      // knight, so a low cloud would fill the frame and hide the yank.
      _target.set(k.wx, 6.6, k.wz - 0.5);
    } else if (chasing) {
      // Closing in. The creeping camera ends up only ~4 units behind the
      // knight, so a full-size cloud here would press against the lens and
      // black out the frame — instead the storm CONDENSES as it closes:
      // lower, smaller, always behind the knight, never hiding him. The
      // zap snaps it back to full size under the white flash.
      _target.set(
        k.wx - (1 - level) * 2,
        5.2 - level * 2.4,
        k.wz + 3.4 + (1 - level) * 1.0
      );
    } else {
      // Hidden — park at the chase's entry pose so reappearing never
      // streaks across the frame.
      _target.set(k.wx - 2, 4.9, k.wz + 4.4);
    }

    // Condense while chasing (see above); full-size everywhere else.
    const targetScale = chasing && !zapping ? 1 - level * 0.55 : 1;
    g.scale.setScalar(
      zapping ? 1 : g.scale.x + (targetScale - g.scale.x) * Math.min(1, delta * 6)
    );

    // Ease harder the angrier it gets; add a low hover bob and, past the
    // warning line, a nervous tremble.
    const damp = 1 - Math.exp(-(1.2 + level * 2.5) * delta);
    g.position.lerp(_target, zapping || !g.visible ? 1 : damp);
    g.position.y += Math.sin(t * 1.1) * 0.15 * (1 - level);
    if (level > 0 && !zapping) {
      g.position.x += Math.sin(t * 31) * 0.06 * level;
      g.position.z += Math.cos(t * 27) * 0.05 * level;
    }

    // Tint calm→thunderhead with the storm level; flash white on the zap.
    zapT.current = zapping ? zapT.current + delta : 0;
    const flash =
      zapping && zapT.current < 0.3 && Math.floor(zapT.current * 40) % 2 === 0;
    _tint.copy(CALM).lerp(ANGRY, zapping ? 1 : level);
    for (const m of mats) {
      m.color.copy(_tint);
      m.emissive.setHex(flash ? 0xbfd2ff : 0x000000);
      m.emissiveIntensity = flash ? 0.9 : 0;
    }

    // The bolt: a jagged white column between cloud base and the knight,
    // strobing for the first beat of the storm death.
    const bolt = boltRef.current;
    if (bolt) {
      const show = zapping && zapT.current < 0.32;
      bolt.visible = show && Math.floor(zapT.current * 40) % 3 !== 2;
      if (show) {
        bolt.position.set(k.wx, 0, k.wz);
      }
    }
  });

  return (
    <>
      <group ref={ref} position={[0, 6.4, 0]}>
        <primitive object={obj} scale={1.7} />
      </group>
      <group ref={boltRef} visible={false}>
        {[
          { y: 4.4, x: 0.0, h: 1.3, w: 0.16 },
          { y: 3.3, x: 0.35, h: 1.2, w: 0.13 },
          { y: 2.2, x: -0.25, h: 1.3, w: 0.15 },
          { y: 1.1, x: 0.15, h: 1.2, w: 0.11 },
        ].map((seg, i) => (
          <mesh key={i} position={[seg.x, seg.y, 0]} rotation={[0, 0, (i % 2 ? -1 : 1) * 0.3]}>
            <boxGeometry args={[seg.w, seg.h, seg.w]} />
            <meshBasicMaterial color="#eaf2ff" />
          </mesh>
        ))}
      </group>
    </>
  );
}
