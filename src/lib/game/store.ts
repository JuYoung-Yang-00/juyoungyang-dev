import { create } from "zustand";

type GameState = {
  /** Island currently under the pointer (desktop hover). */
  hoveredIslandId: string | null;
  setHoveredIsland: (id: string | null) => void;

  /** Island tapped once on touch devices — shows the info card, second tap enters. */
  selectedIslandId: string | null;
  setSelectedIsland: (id: string | null) => void;

  /** Flips true once the selector's assets are loaded and the intro may play. */
  ready: boolean;
  setReady: (v: boolean) => void;

  /** True after the selector intro has played once this session. */
  introPlayed: boolean;
  setIntroPlayed: (v: boolean) => void;

  /** Set when navigation to a world has begun — drives the fade-out overlay. */
  leavingTo: string | null;
  setLeavingTo: (path: string | null) => void;

  /** Info station the player is standing near (world scenes). */
  nearStationId: string | null;
  setNearStation: (id: string | null) => void;

  /** Info station whose reading panel is open. */
  openStationId: string | null;
  setOpenStation: (id: string | null) => void;
};

export const useGameStore = create<GameState>((set) => ({
  hoveredIslandId: null,
  setHoveredIsland: (id) => set({ hoveredIslandId: id }),

  selectedIslandId: null,
  setSelectedIsland: (id) => set({ selectedIslandId: id }),

  ready: false,
  setReady: (v) => set({ ready: v }),

  introPlayed: false,
  setIntroPlayed: (v) => set({ introPlayed: v }),

  leavingTo: null,
  setLeavingTo: (path) => set({ leavingTo: path }),

  nearStationId: null,
  setNearStation: (id) => set({ nearStationId: id }),

  openStationId: null,
  setOpenStation: (id) => set({ openStationId: id }),
}));

/** Virtual joystick vector written by the touch HUD, read by PlayerCharacter. */
export const joystick = { x: 0, y: 0, active: false };
