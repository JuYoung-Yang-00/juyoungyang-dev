# juyoungyang.dev

My portfolio, built as a small 3D world. You play a knight, sail between islands, and each island is a place I've worked. Walk up to an info station to read about what I built there.

**Live at [juyoungyang.dev](https://juyoungyang.dev)**

There's also a hidden mini game. If you find the storm clouds, you'll find it.

## How it's built

- **Next.js 15** (App Router, static export) with **React 19**
- **react-three-fiber** + **drei** on **three.js** for the 3D scenes
- **Zustand** for UI state, module-level refs for frame-rate state (keeps the render loop out of React re-renders)
- The mini game's rules live in a pure engine module (`src/lib/game/crossing/engine.ts`) with no three.js in it — seeded daily RNG, so everyone gets the same city each day
- Sound effects are synthesized with the Web Audio API — no audio asset files
- Everything in the repo is license-free: CC0 models from [KayKit](https://kaylousberg.itch.io/) and [Kenney](https://kenney.nl/), CC0 music, synthesized sound

## Run it

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Arrow keys or WASD to move, or the on-screen joystick on touch devices.

## Layout

```
src/app/                  routes (island selector, worlds, the mini game)
src/components/game/      3D scenes, HUD, and chrome
src/lib/game/             state, engine, input, and sound
public/models/            CC0 model packs
```
