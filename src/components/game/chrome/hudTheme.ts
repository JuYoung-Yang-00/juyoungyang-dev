import type { CSSProperties } from "react";

/** Shared HUD design tokens — navy glass panels over the bright 3D scene. */
export const PANEL_BG = "rgba(13, 32, 48, 0.82)";
export const PANEL_BORDER = "1px solid rgba(255,255,255,0.14)";
export const ACCENT = "#e8a846";
export const INK = "#ffffff";
export const INK_SOFT = "#cce4f5";
export const INK_DIM = "#9bbcd6";

export const panelStyle: CSSProperties = {
  background: PANEL_BG,
  border: PANEL_BORDER,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderRadius: 10,
  boxShadow: "0 4px 24px rgba(4, 16, 28, 0.28)",
};

export const displayFont: CSSProperties = {
  fontFamily: "var(--font-display), system-ui, sans-serif",
};

export const monoFont: CSSProperties = {
  fontFamily: "var(--font-mono), ui-monospace, monospace",
};
