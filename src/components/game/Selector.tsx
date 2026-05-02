"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import SelectorScene from "./SelectorScene";
import SelectorHUD from "./SelectorHUD";

export default function Selector() {
  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 10, 26], fov: 42, near: 0.1, far: 320 }}
        style={{ position: "fixed", inset: 0 }}
      >
        {/* Sky background */}
        <color attach="background" args={["#a8dcef"]} />

        {/* Fog matched to sky color — fades the distant water + clouds into the
            sky, eliminating the hard horizon edge. The visible horizon now
            emerges as a soft gradient where water depth → atmospheric haze. */}
        <fog attach="fog" args={["#a8dcef", 25, 80]} />

        {/* Neutral white lighting so KayKit textures render true colors */}
        <ambientLight intensity={0.6} />
        <hemisphereLight args={["#ffffff", "#1f6da0", 0.55]} />
        <directionalLight
          position={[20, 30, 14]}
          intensity={1.1}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
          shadow-camera-near={0.1}
          shadow-camera-far={70}
          shadow-bias={-0.0005}
        />

        <Suspense fallback={null}>
          <SelectorScene />
        </Suspense>
      </Canvas>
      <SelectorHUD />
    </>
  );
}
