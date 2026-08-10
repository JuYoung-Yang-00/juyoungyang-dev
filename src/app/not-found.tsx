import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "#a8dcef",
        color: "#0d2030",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display), system-ui, sans-serif",
          fontWeight: 900,
          fontSize: "clamp(40px, 8vw, 72px)",
          lineHeight: 1,
          letterSpacing: "-0.03em",
          textTransform: "uppercase",
        }}
      >
        Open water
      </div>
      <p
        style={{
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: 13,
          maxWidth: 420,
          lineHeight: 1.6,
          color: "#33607f",
        }}
      >
        There&apos;s no island at this address — just ocean in every direction.
      </p>
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "#0d2030",
          background: "#e8a846",
          padding: "12px 22px",
          borderRadius: 8,
          textDecoration: "none",
        }}
      >
        ← BACK TO THE MAP
      </Link>
    </main>
  );
}
