"use client";

import { useEffect, useRef } from "react";
import { joystick } from "@/lib/game/store";

const SIZE = 112;
const KNOB = 48;
const RADIUS = (SIZE - KNOB) / 2;

/** Left-thumb virtual joystick. Writes into the shared `joystick` vector. */
export default function Joystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);

  useEffect(() => {
    const base = baseRef.current;
    const knob = knobRef.current;
    if (!base || !knob) return;

    const setKnob = (dx: number, dy: number) => {
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const update = (clientX: number, clientY: number) => {
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const len = Math.hypot(dx, dy);
      if (len > RADIUS) {
        dx = (dx / len) * RADIUS;
        dy = (dy / len) * RADIUS;
      }
      setKnob(dx, dy);
      joystick.x = dx / RADIUS;
      joystick.y = dy / RADIUS;
      joystick.active = true;
    };

    const reset = () => {
      pointerId.current = null;
      joystick.x = 0;
      joystick.y = 0;
      joystick.active = false;
      setKnob(0, 0);
    };

    const down = (e: PointerEvent) => {
      pointerId.current = e.pointerId;
      base.setPointerCapture(e.pointerId);
      update(e.clientX, e.clientY);
    };
    const move = (e: PointerEvent) => {
      if (pointerId.current !== e.pointerId) return;
      update(e.clientX, e.clientY);
    };
    const up = (e: PointerEvent) => {
      if (pointerId.current !== e.pointerId) return;
      reset();
    };

    base.addEventListener("pointerdown", down);
    base.addEventListener("pointermove", move);
    base.addEventListener("pointerup", up);
    base.addEventListener("pointercancel", up);
    return () => {
      base.removeEventListener("pointerdown", down);
      base.removeEventListener("pointermove", move);
      base.removeEventListener("pointerup", up);
      base.removeEventListener("pointercancel", up);
      reset();
    };
  }, []);

  return (
    <div
      ref={baseRef}
      className="pointer-events-auto"
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: "50%",
        background: "rgba(13, 32, 48, 0.4)",
        border: "1px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
        position: "relative",
      }}
    >
      {/* Subtle direction hints in the base */}
      {[
        { rot: 0, top: 7, left: "50%", ml: -5 },
        { rot: 180, bottom: 7, left: "50%", ml: -5 },
        { rot: -90, left: 7, top: "50%", mt: -6 },
        { rot: 90, right: 7, top: "50%", mt: -6 },
      ].map((a) => (
        <span
          key={a.rot}
          style={{
            position: "absolute",
            top: a.top,
            bottom: a.bottom,
            left: a.left,
            right: a.right,
            marginLeft: a.ml,
            marginTop: a.mt,
            transform: `rotate(${a.rot}deg)`,
            color: "rgba(255,255,255,0.18)",
            fontSize: 10,
            lineHeight: 1,
            pointerEvents: "none",
          }}
        >
          ▲
        </span>
      ))}
      <div
        ref={knobRef}
        style={{
          width: KNOB,
          height: KNOB,
          borderRadius: "50%",
          background: "rgba(232, 168, 70, 0.9)",
          boxShadow: "0 2px 10px rgba(4,16,28,0.4)",
          transition: "transform 40ms linear",
        }}
      />
    </div>
  );
}
