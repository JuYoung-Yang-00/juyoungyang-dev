"use client";

import type { CSSProperties, ComponentType } from "react";
import { Database } from "lucide-react";
import { FaAws } from "react-icons/fa";
import {
  SiCloudflare,
  SiDocker,
  SiExpress,
  SiFastapi,
  SiFastify,
  SiFlask,
  SiFlydotio,
  SiGithubactions,
  SiGooglecloud,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPosthog,
  SiPostgresql,
  SiPython,
  SiReact,
  SiReactquery,
  SiRedis,
  SiRust,
  SiSentry,
  SiTailwindcss,
  SiTimescale,
  SiTypescript,
  SiVercel,
} from "react-icons/si";

type IconComponent = ComponentType<{
  size?: number | string;
  color?: string;
  style?: CSSProperties;
}>;

export type SkillIconEntry = {
  Icon?: IconComponent;
  /** Zustand has no official mark — its de-facto logo is the bear. */
  emoji?: string;
  color: string;
};

// Brand colors, lightened where the official mark is black-on-white
// (Next.js, Rust, Vercel, Express…) so every glyph reads on the dark panel.
const LIGHT = "#e8e6df";

export const SKILL_ICONS: Record<string, SkillIconEntry> = {
  TypeScript: { Icon: SiTypescript, color: "#3178C6" },
  JavaScript: { Icon: SiJavascript, color: "#F7DF1E" },
  Python: { Icon: SiPython, color: "#4B8BBE" },
  Rust: { Icon: SiRust, color: LIGHT },
  SQL: { Icon: Database, color: LIGHT },
  React: { Icon: SiReact, color: "#61DAFB" },
  "Next.js": { Icon: SiNextdotjs, color: LIGHT },
  "TanStack Query": { Icon: SiReactquery, color: "#FF4154" },
  Zustand: { emoji: "🐻", color: LIGHT },
  "Tailwind CSS": { Icon: SiTailwindcss, color: "#38BDF8" },
  "Node.js": { Icon: SiNodedotjs, color: "#5FA04E" },
  Express: { Icon: SiExpress, color: LIGHT },
  Fastify: { Icon: SiFastify, color: LIGHT },
  FastAPI: { Icon: SiFastapi, color: "#12A99D" },
  Flask: { Icon: SiFlask, color: LIGHT },
  PostgreSQL: { Icon: SiPostgresql, color: "#5B84D6" },
  TimescaleDB: { Icon: SiTimescale, color: "#FDB515" },
  MySQL: { Icon: SiMysql, color: "#4479A1" },
  MongoDB: { Icon: SiMongodb, color: "#47A248" },
  Redis: { Icon: SiRedis, color: "#FF4438" },
  AWS: { Icon: FaAws, color: "#FF9900" },
  GCP: { Icon: SiGooglecloud, color: "#4285F4" },
  "Fly.io": { Icon: SiFlydotio, color: "#A78BFA" },
  Vercel: { Icon: SiVercel, color: LIGHT },
  Docker: { Icon: SiDocker, color: "#2496ED" },
  "GitHub Actions": { Icon: SiGithubactions, color: "#2088FF" },
  Cloudflare: { Icon: SiCloudflare, color: "#F38020" },
  Sentry: { Icon: SiSentry, color: "#A793F6" },
  PostHog: { Icon: SiPosthog, color: "#F9BD2B" },
};
