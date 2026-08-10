"use client";

import type { StationDef } from "@/lib/game/worlds";
import {
  ACCENT,
  displayFont,
  INK,
  INK_DIM,
  INK_SOFT,
  monoFont,
  panelStyle,
} from "./hudTheme";
import { SKILL_ICONS } from "./skillIcons";

type Props = {
  station: StationDef;
  onClose: () => void;
};

/** Reading panel opened at an info station. */
export default function StationPanel({ station, onClose }: Props) {
  return (
    <div
      className="pointer-events-auto fixed inset-0 z-30 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(6, 18, 30, 0.45)" }}
      onClick={onClose}
    >
      <div
        className="relative w-auto min-w-0 sm:min-w-[380px] px-6 py-6 sm:px-8 sm:py-7 mx-3 mb-4 sm:m-4"
        style={{
          ...panelStyle,
          maxWidth: station.skillGroups ? 520 : 460,
          maxHeight: "72vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 flex items-center justify-center rounded-md"
          style={{
            ...monoFont,
            width: 28,
            height: 28,
            fontSize: 12,
            color: INK_SOFT,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div
          style={{
            ...monoFont,
            fontSize: 10,
            letterSpacing: "0.16em",
            color: INK_DIM,
          }}
        >
          {station.eyebrow}
        </div>

        <div
          className="mt-2 mb-4"
          style={{
            ...displayFont,
            fontWeight: 800,
            fontSize: "clamp(20px, 3vw, 26px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: INK,
          }}
        >
          {station.title}
        </div>

        {station.image && (
          // eslint-disable-next-line @next/next/no-img-element -- static asset, panel-sized
          <img
            src={station.image}
            alt=""
            className="w-full object-cover rounded-lg mb-4"
            style={{ height: 148, border: "1px solid rgba(255,255,255,0.14)" }}
          />
        )}

        {station.bullets && station.bullets.length > 0 && (
          <ul className="space-y-2.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {station.bullets.map((b, i) => (
              <li
                key={i}
                className="flex gap-2.5"
                style={{
                  ...monoFont,
                  fontSize: 12,
                  lineHeight: 1.55,
                  color: INK_SOFT,
                }}
              >
                <span style={{ color: ACCENT, flexShrink: 0 }}>▸</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {station.skillGroups && (
          <div className="space-y-4">
            {station.skillGroups.map((group) => (
              <div key={group.label}>
                <div
                  style={{
                    ...monoFont,
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    color: INK_DIM,
                    textTransform: "uppercase",
                  }}
                >
                  {group.label}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {group.skills.map((name) => {
                    const entry = SKILL_ICONS[name];
                    const Icon = entry?.Icon;
                    return (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md"
                        style={{
                          ...monoFont,
                          fontSize: 11,
                          color: INK_SOFT,
                          border: "1px solid rgba(255,255,255,0.14)",
                          background: "rgba(255,255,255,0.06)",
                        }}
                      >
                        {entry?.emoji ? (
                          <span style={{ fontSize: 12, lineHeight: 1 }}>{entry.emoji}</span>
                        ) : Icon ? (
                          <Icon size={13} color={entry.color} />
                        ) : null}
                        {name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {station.links && station.links.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {station.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-md"
                style={{
                  ...monoFont,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  fontWeight: 700,
                  color: "#0d2030",
                  background: ACCENT,
                  textDecoration: "none",
                }}
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
