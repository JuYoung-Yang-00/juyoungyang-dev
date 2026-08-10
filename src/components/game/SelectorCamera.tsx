"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Fog, PerspectiveCamera, Vector3 } from "three";
import {
  LAYOUT_LANDSCAPE,
  LAYOUT_PORTRAIT,
  PORTRAIT_ASPECT,
} from "@/lib/game/islands";
import { useGameStore } from "@/lib/game/store";

const PARALLAX_X = 1.4;
const PARALLAX_Y = 0.3;
const PARALLAX_Z = 0.6;
const SMOOTH = 0.06;

// Intro fly-in: camera starts pulled back + lifted, eases to base position.
const INTRO_DURATION = 2.2;
const INTRO_PULLBACK = 1.55;
const INTRO_LIFT = 10;

const _target = new Vector3();
const _base = new Vector3();

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function SelectorCamera() {
  const { camera, scene, size } = useThree();
  const cursor = useRef({ x: 0, y: 0 });
  const ready = useGameStore((s) => s.ready);
  const introT0 = useRef<number | null>(null);
  // If the intro already played this session (returning from a world), skip it.
  const skipIntro = useRef(useGameStore.getState().introPlayed);

  const portrait = size.width / Math.max(1, size.height) < PORTRAIT_ASPECT;

  const view = useMemo(() => {
    const aspect = size.width / Math.max(1, size.height);
    const layout = portrait ? LAYOUT_PORTRAIT : LAYOUT_LANDSCAPE;
    const fovDeg = portrait ? 58 : 56;
    const pitch = portrait ? Math.PI / 3.6 : Math.PI / 6; // 50° vs 30°
    const vFov = (fovDeg * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    let dist: number;
    if (portrait) {
      // Portrait: fit width to the narrow layout, and the depth column to
      // the vertical FOV (depth projects onto screen-y scaled by sin(pitch)).
      const dH = (layout.x * 1.12) / Math.tan(hFov / 2);
      const dV = (layout.z * Math.sin(pitch) * 1.38) / Math.tan(vFov / 2);
      dist = Math.max(dH, dV);
    } else {
      // Landscape: treat the layout as a sphere of radius x — the shallow
      // pitch means depth mostly adds perspective rows, not screen height.
      const r = Math.max(layout.x, layout.z);
      const dV = r / Math.tan(vFov / 2);
      const dH = r / Math.tan(hFov / 2);
      dist = Math.max(dV, dH) * 1.16;
    }
    const lookAt = new Vector3(0, portrait ? 0.4 : 1.4, portrait ? 0.8 : 0);
    const basePos = new Vector3(
      lookAt.x,
      lookAt.y + dist * Math.sin(pitch),
      lookAt.z + dist * Math.cos(pitch)
    );
    return { fovDeg, dist, lookAt, basePos };
  }, [size.width, size.height, portrait]);

  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = view.fovDeg;
      camera.updateProjectionMatrix();
    }
  }, [camera, view.fovDeg]);

  // Fog scaled to camera distance so the scene reads identically at every
  // viewport size — islands stay clear, horizon melts into the sky.
  useEffect(() => {
    const fog = scene.fog as Fog | null;
    if (fog) {
      fog.near = view.dist * 0.95;
      fog.far = view.dist * 2.8;
    }
  }, [scene, view.dist]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cursor.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      cursor.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Before assets are ready, park the camera at the intro start pose.
    let intro = 0;
    if (skipIntro.current) {
      intro = 1;
    } else if (ready) {
      if (introT0.current === null) introT0.current = t;
      intro = Math.min(1, (t - introT0.current) / INTRO_DURATION);
      if (intro >= 1) useGameStore.getState().setIntroPlayed(true);
    }
    const e = easeOutCubic(intro);

    const pullback = INTRO_PULLBACK - (INTRO_PULLBACK - 1) * e;
    const lift = INTRO_LIFT * (1 - e);
    _base
      .copy(view.basePos)
      .sub(view.lookAt)
      .multiplyScalar(pullback)
      .add(view.lookAt);
    _base.y += lift;

    const parallax = e; // parallax ramps in with the intro
    _target.set(
      _base.x + cursor.current.x * PARALLAX_X * parallax,
      _base.y - cursor.current.y * PARALLAX_Y * parallax,
      _base.z + cursor.current.y * PARALLAX_Z * parallax
    );
    if (intro < 1) {
      camera.position.copy(_target);
    } else {
      camera.position.lerp(_target, SMOOTH);
    }
    camera.lookAt(view.lookAt);
  });

  return null;
}
