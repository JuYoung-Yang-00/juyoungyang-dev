"use client";

import { useEffect } from "react";
import { useGameStore } from "@/lib/game/store";
import { playBoardClose, playBoardOpen, playEnterWorld } from "@/lib/game/sfx";

/** Invisible driver for one-shot UI sounds. Watches the store rather than the
 *  interaction components, so every entry path into a world (island click,
 *  Enter button, mobile double-tap) and every board open/close path (button,
 *  Space, ESC) is voiced from one place. */
export default function SoundFX() {
  useEffect(() => {
    return useGameStore.subscribe((state, prev) => {
      if (
        state.leavingTo &&
        !prev.leavingTo &&
        (state.leavingTo.startsWith("/world/") ||
          state.leavingTo === "/crossing")
      ) {
        playEnterWorld();
      }
      if (state.openStationId && !prev.openStationId) {
        playBoardOpen();
      }
      // The world resets station state while navigating away; a close blip
      // over the exit fade reads as a stray, so only voice real closes.
      if (!state.openStationId && prev.openStationId && !state.leavingTo) {
        playBoardClose();
      }
    });
  }, []);

  return null;
}
