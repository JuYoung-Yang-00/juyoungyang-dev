"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Mesh, Vector3 } from "three";
import CameraRig from "../CameraRig";
import Row from "./Row";
import KnightHopper, { INTRO_DROP_S } from "./KnightHopper";
import StormCloud from "./StormCloud";
import { playerObj } from "@/lib/game/refs";
import {
  createEngine,
  dailySeed,
  rowZ,
  type RowDef,
} from "@/lib/game/crossing/engine";
import {
  hopQueue,
  stormView,
  useCrossingStore,
} from "@/lib/game/crossing/store";
import {
  playBrush,
  playFall,
  playHop,
  playRefused,
  playSquash,
  playThunder,
  playZap,
} from "@/lib/game/sfx";

/** How far the render window reaches around the knight, in rows. */
const BEHIND = 8;
const AHEAD = 18;
/** Rows between the pressure line and the camera anchor it drives — tuned
 *  so the knight is still on screen (near the bottom edge) at the moment
 *  the line catches him. */
const PRESSURE_VIEW_LEAD = 4;
/** Real-time length of the BRUSH slow-motion dip. */
const SLOWMO_MS = 130;
const SLOWMO_SCALE = 0.35;

const _screen = new Vector3();

export default function CrossingScene() {
  const engine = useMemo(() => {
    // Seed the camera anchor before CameraRig mounts — it would otherwise
    // swing in from wherever the previous world left the shared playerObj.
    playerObj.position.set(0, 0, -1.6);
    // A fresh scene starts with clean shared channels — no queued inputs or
    // storm pressure from a previous run or visit.
    hopQueue.length = 0;
    stormView.level = 0;
    const store = () => useCrossingStore.getState();
    return createEngine(dailySeed(new Date()), {
      onScore: (s) => store().setScore(s),
      onDeath: (cause) => {
        if (cause === "car") playSquash();
        if (cause === "fall") playFall();
        if (cause === "storm") playZap();
        store().died(cause);
      },
      onBrush: () => {
        playBrush();
        store().brush();
      },
      onHop: () => playHop(),
      onRefused: () => playRefused(),
      onStormWarn: () => {
        playThunder();
        store().stormWarn();
      },
    });
  }, []);

  const { camera } = useThree();
  const [windowRows, setWindowRows] = useState<RowDef[]>(() =>
    engine.rows.slice(0, AHEAD + 1)
  );
  const rangeRef = useRef<[number, number]>([0, AHEAD]);
  const elapsedRef = useRef(0);
  const introOverRef = useRef(false);
  const slowmoEndRef = useRef(0);
  const voidRef = useRef<Mesh>(null!);

  useFrame((_, rawDelta) => {
    // Same clamped delta the knight's drop animation integrates, so the
    // input gate below opens exactly when the drop lands even under jank.
    elapsedRef.current += Math.min(rawDelta, 0.05);

    // BRUSH slow-mo: the engine raises a flag; we hold the whole scene at
    // one-third speed for a real-time beat.
    if (engine.state.slowmoUntil === -1) {
      engine.state.slowmoUntil = 0;
      slowmoEndRef.current = performance.now() + SLOWMO_MS;
    }
    const slow = performance.now() < slowmoEndRef.current;
    const dt = Math.min(rawDelta, 0.05) * (slow ? SLOWMO_SCALE : 1);

    // Inputs wait for the intro drop. Anything mashed during the loading
    // gate or the drop is discarded once, not banked and replayed.
    if (!introOverRef.current) {
      if (elapsedRef.current < INTRO_DROP_S) {
        hopQueue.length = 0;
      } else {
        introOverRef.current = true;
        hopQueue.length = 0;
      }
    } else {
      while (hopQueue.length > 0) {
        const r = engine.hop(hopQueue[0]);
        if (r === "busy") break;
        hopQueue.shift();
        if (r === "ok") break;
      }
    }

    engine.update(dt);
    stormView.level = engine.state.stormLevel;

    // The engine flips intro→playing on the first hop; mirror it into the
    // store so the HUD fades the title card out.
    if (
      engine.state.phase === "playing" &&
      useCrossingStore.getState().phase === "intro"
    ) {
      useCrossingStore.getState().setPhase("playing");
    }

    // Camera anchor: slightly ahead of the knight so the lanes to read are
    // on screen and the knight rides the lower third, Crossy-style — but
    // never behind the storm's pressure line, so the view creeps forward
    // while the player waits and the knight slides toward the bottom edge.
    const k = engine.knight;
    const pressureAnchorZ =
      rowZ(engine.state.pressureRow + PRESSURE_VIEW_LEAD) - 1.6;
    playerObj.position.set(k.wx, 0, Math.min(k.wz - 1.6, pressureAnchorZ));

    // Falling out of frame IS being caught — project the knight's chest to
    // screen space and end the run as soon as the creeping view has pushed
    // him below the bottom edge, rather than waiting for the line itself.
    // (Works on every aspect/zoom, unlike a fixed row threshold.)
    if (engine.state.phase === "playing") {
      _screen.set(k.wx, k.wy + 1.0, k.wz).project(camera);
      if (_screen.y < -1.02) engine.catchStorm();
    }

    // Keep the void plane under the camera as the field advances.
    const v = voidRef.current;
    if (v) v.position.z = k.wz;

    // Slide the row render window when the knight crosses into a new band.
    const base = Math.max(0, k.row - BEHIND);
    const top = k.row + AHEAD;
    if (base !== rangeRef.current[0] || top !== rangeRef.current[1]) {
      rangeRef.current = [base, top];
      engine.ensureRows(top);
      setWindowRows(engine.rows.slice(base, top + 1));
    }
  });

  return (
    <>
      {/* The night sky under the rifts — falling reads as sky, not floor. */}
      <mesh
        ref={voidRef}
        position={[0, -13, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[300, 160]} />
        <meshBasicMaterial color="#0a1120" />
      </mesh>

      {/* Backfill sidewalk behind the spawn row so the knight doesn't stand
          on the edge of a visible void. */}
      {[1, 2, 3, 4].map((i) => (
        <mesh
          key={`back${i}`}
          position={[0, 0, i * 2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[60, 2]} />
          <meshStandardMaterial color="#475673" roughness={0.9} />
        </mesh>
      ))}

      {windowRows.map((def) => (
        <Row key={def.index} engine={engine} def={def} />
      ))}

      <KnightHopper engine={engine} />
      <StormCloud engine={engine} />
      <CameraRig offset={[0, 11.5, 10.5]} />
    </>
  );
}
