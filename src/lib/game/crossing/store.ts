import { create } from "zustand";
import type { DeathCause, Dir, Phase } from "./engine";

const BEST_KEY = "crossing-best";

type CrossingState = {
  phase: Phase;
  score: number;
  best: number;
  newBest: boolean;
  cause: DeathCause | null;
  /** Bumped on every near-miss so the HUD can pop a "BRUSH +2" toast. */
  brushPulse: number;
  /** Bumped on storm warnings so the HUD can flash the sky. */
  stormPulse: number;
  /** Bumped by reset() — components key their run-local state off this. */
  run: number;

  setPhase: (p: Phase) => void;
  setScore: (s: number) => void;
  died: (cause: DeathCause) => void;
  brush: () => void;
  stormWarn: () => void;
  reset: () => void;
};

export const useCrossingStore = create<CrossingState>((set, get) => ({
  phase: "intro",
  score: 0,
  best: 0,
  newBest: false,
  cause: null,
  brushPulse: 0,
  stormPulse: 0,
  run: 0,

  setPhase: (p) => set({ phase: p }),
  setScore: (s) => set({ score: s }),
  died: (cause) => {
    const { score, best } = get();
    const newBest = score > best;
    if (newBest) {
      try {
        localStorage.setItem(BEST_KEY, String(score));
      } catch {
        // Storage can be unavailable (private mode) — the run still ends.
      }
    }
    set({ phase: "dead", cause, newBest, best: newBest ? score : best });
  },
  brush: () => set((s) => ({ brushPulse: s.brushPulse + 1 })),
  stormWarn: () => set((s) => ({ stormPulse: s.stormPulse + 1 })),
  reset: () => {
    // Frantic end-of-run inputs and storm pressure must not leak into the
    // fresh run.
    hopQueue.length = 0;
    stormView.level = 0;
    set((s) => ({
      phase: "intro",
      score: 0,
      newBest: false,
      cause: null,
      run: s.run + 1,
    }));
  },
}));

export function loadBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

/**
 * Input funnel shared by the DOM layer (taps, swipes, keys) and the scene,
 * following the joystick precedent: module-level mutable state, no renders.
 * The scene drains it each frame; "busy" hops stay queued for one landing.
 */
export const hopQueue: Dir[] = [];

export function pushHop(dir: Dir) {
  // Two queued hops max — a held-down key shouldn't bank a stack of moves.
  if (hopQueue.length < 2) hopQueue.push(dir);
}

/** Continuous storm pressure (0..1), written by the scene every frame and
 *  read by the HUD's vignette via rAF — same no-render channel as joystick. */
export const stormView = { level: 0 };
