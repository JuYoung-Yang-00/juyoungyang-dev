import type { Metadata } from "next";
import Crossing from "@/components/game/crossing/Crossing";

export const metadata: Metadata = {
  title: "Knight Crossing — Justin Yang",
  description:
    "A hidden minigame. The cloud you clicked drops you into rush hour — hop across.",
  // An easter egg stays an easter egg.
  robots: { index: false },
};

export default function CrossingPage() {
  return <Crossing />;
}
