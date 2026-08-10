"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import DayWorldScene from "./world/DayWorldScene";
import WorkCityScene from "./world/WorkCityScene";
import ValleyScene from "./world/ValleyScene";
import WorldHUD from "./WorldHUD";
import LoadingGate from "./chrome/LoadingGate";
import RouteFade from "./chrome/RouteFade";
import { ISLANDS, type IslandDef } from "@/lib/game/islands";
import { DAY_WORLDS, WORK_STATIONS } from "@/lib/game/worlds";

export default function World({ id }: { id: string }) {
  const island = ISLANDS.find((i) => i.id === id) as IslandDef | undefined;
  if (!island) return null;

  // Work is a neon night city; Education is an enclosed forest valley;
  // Projects is a floating day island.
  const isCity = id === "work";
  const dayDef = DAY_WORLDS[id];
  if (!isCity && !dayDef) return null;
  const isValley = !isCity && dayDef.platform.kind === "band";
  const stations = isCity ? WORK_STATIONS : dayDef.stations;

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 12, 18], fov: 50, near: 0.1, far: 280 }}
        style={{ position: "fixed", inset: 0 }}
      >
        <color attach="background" args={[isCity ? "#101828" : "#a8dcef"]} />
        <fog
          attach="fog"
          args={
            isCity
              ? ["#101828", 42, 135]
              : isValley
                ? ["#a8dcef", 30, 92]
                : ["#a8dcef", 32, 95]
          }
        />

        {isCity ? (
          <>
            {/* Blue-hour city: readable base light, neon does the flavour */}
            <ambientLight intensity={0.85} color="#9fb4d8" />
            <hemisphereLight args={["#6d8cb0", "#242c3c", 0.7]} />
            <directionalLight
              position={[18, 28, 10]}
              intensity={1.0}
              color="#aebad6"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-left={-34}
              shadow-camera-right={34}
              shadow-camera-top={40}
              shadow-camera-bottom={-40}
              shadow-camera-near={0.1}
              shadow-camera-far={90}
              shadow-bias={-0.0005}
            />
          </>
        ) : (
          <>
            <ambientLight intensity={0.6} />
            <hemisphereLight args={["#ffffff", "#1f6da0", 0.55]} />
            <directionalLight
              position={[20, 30, 14]}
              intensity={1.1}
              color="#ffffff"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-left={-28}
              shadow-camera-right={28}
              shadow-camera-top={32}
              shadow-camera-bottom={-32}
              shadow-camera-near={0.1}
              shadow-camera-far={90}
              shadow-bias={-0.0005}
            />
          </>
        )}

        <Suspense fallback={null}>
          {isCity ? (
            <WorkCityScene island={island} />
          ) : dayDef.platform.kind === "band" ? (
            <ValleyScene island={island} def={dayDef} band={dayDef.platform.band} />
          ) : (
            <DayWorldScene island={island} def={dayDef} />
          )}
        </Suspense>
      </Canvas>
      <WorldHUD island={island} stations={stations} />
      <LoadingGate dark={isCity} label={island.title.toUpperCase()} />
      <RouteFade color="#0d2030" />
    </>
  );
}
