import { create } from "zustand";

type GameState = {
  hoveredIslandId: string | null;
  setHoveredIsland: (id: string | null) => void;
};

export const useGameStore = create<GameState>((set) => ({
  hoveredIslandId: null,
  setHoveredIsland: (id) => set({ hoveredIslandId: id }),
}));
