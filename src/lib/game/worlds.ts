import type { BuildingKey } from "./islands";
import type { BandSpec } from "@/components/game/world/hexUtils";

/** A labelled cluster of technologies rendered as icon chips. */
export type SkillGroup = { label: string; skills: string[] };

/** One readable notice board inside a world. */
export type StationDef = {
  id: string;
  /** Short label painted on the board itself. */
  board: string;
  /** Small line above the panel title. */
  eyebrow: string;
  title: string;
  /** Employment range, shown on its own line under the title. */
  dates?: string;
  bullets?: string[];
  /** Photo header shown above the panel body. */
  image?: string;
  /** Icon-chip skill grid, rendered instead of / after bullets. */
  skillGroups?: SkillGroup[];
  /** Sub-entries (one per project) rendered as a scrolling list. */
  sections?: {
    heading: string;
    sub: string;
    bullets: string[];
    links?: { label: string; href: string }[];
  }[];
  links?: { label: string; href: string }[];
  /** Position on the platform, [x, z]. */
  spot: [number, number];
  /** Y rotation of the board (radians) — boards face +z by default. */
  rotY?: number;
};

export type PropDef = {
  path: string;
  position: [number, number, number];
  rotation?: number;
  scale?: number;
};

export type BuildingPlacement = {
  key: BuildingKey;
  position: [number, number, number];
  scale?: number;
  rotY?: number;
};

export type MilestoneDef = {
  text: string;
  spot: [number, number];
  rotY?: number;
};

export type PlatformSpec =
  | { kind: "disc"; radius: number }
  | { kind: "band"; band: BandSpec };

export type DayWorldDef = {
  id: string;
  /** Welcome-board one-liner near spawn. */
  tagline: string;
  platform: PlatformSpec;
  buildings: BuildingPlacement[];
  props: PropDef[];
  stations: StationDef[];
  /** Year markers along the road. */
  milestones?: MilestoneDef[];
  spawn: [number, number];
  welcome: { spot: [number, number]; rotY?: number };
  /** Circle colliders [x, z, radius] for buildings/props. */
  colliders: [number, number, number][];
  /** Auto-plant forest along the band edges. */
  edgeTrees?: boolean;
};

const D = "/models/decoration/";

const SCHOLAR_URL = "https://scholar.google.com/citations?user=YTJXJj8AAAAJ";

// ─────────────────────────────────────────────────────────────────────────
// EDUCATION — three stops on a diagonal road. Spawn on the court in front
// of the Duke castle (Degree), walk up-right past the research tower
// (one RESEARCH board: NeurIPS '22 + AAAI '24 + ColAI Lab), and end at the
// Skills plaza with its own building. No year markers.
// ─────────────────────────────────────────────────────────────────────────

// Phase π keeps the sine monotonic across the whole z range, so the
// centreline drifts steadily from x≈-6 at spawn to x≈+6 at the far end —
// a diagonal road rather than a winding one.
export const EDUCATION_BAND: BandSpec = {
  zMin: -19,
  zMax: 19,
  curveAmp: 6,
  curveFreq: 0.08,
  curvePhase: Math.PI,
  baseHalfWidth: 4.6,
  bulges: [
    { z: 16.5, extra: 2, sigma: 6.5 },
    { z: 1.5, extra: 4.5, sigma: 6 },
    { z: -16, extra: 3, sigma: 6 },
  ],
};

export const DAY_WORLDS: Record<string, DayWorldDef> = {
  education: {
    id: "education",
    tagline: "Duke → Research → Skills",
    platform: { kind: "band", band: EDUCATION_BAND },
    edgeTrees: true,
    buildings: [
      // The main Duke building — first stop down the road, on its own plaza.
      { key: "castle", position: [-8.0, 0, 1.6], scale: 1.9, rotY: -0.7 },
      // The research building — between the castle and the skills plaza.
      { key: "tower_A", position: [5.9, 0, -6.0], scale: 1.4, rotY: -0.9 },
      // Skills building on the far plaza.
      { key: "tavern", position: [1.0, 0, -17.2], scale: 1.55, rotY: 0.8 },
    ],
    props: [
      // Spawn clearing
      { path: D + "trees_A_small.gltf", position: [-9.8, 0, 15.6], scale: 1.0 },
      { path: D + "barrel.gltf", position: [-0.9, 0, 10.6], scale: 0.9 },
      // Castle plaza
      { path: D + "flag_blue.gltf", position: [-9.9, 0, 4.6], scale: 1.2 },
      { path: D + "flag_blue.gltf", position: [-6.9, 0, -1.4], scale: 1.2 },
      // Research yard
      { path: D + "rock_single_B.gltf", position: [0.6, 0, -5.4], scale: 0.9 },
      { path: D + "resource_stone.gltf", position: [0.9, 0, -7.6], scale: 0.8 },
      // Skills training ground on the far plaza
      { path: D + "weaponrack.gltf", position: [8.6, 0, -16.2], rotation: 0.6 },
      { path: D + "crate_A_big.gltf", position: [9.4, 0, -17.4], scale: 0.9 },
      { path: D + "ladder.gltf", position: [7.8, 0, -18.4], rotation: 0.9, scale: 0.9 },
      { path: D + "trees_A_large.gltf", position: [10.8, 0, -18.3], scale: 1.15 },
      { path: D + "trees_A_medium.gltf", position: [10.2, 0, -13.2], scale: 1.1 },
    ],
    stations: [
      {
        id: "degree",
        board: "DUKE",
        eyebrow: "DUKE UNIVERSITY · CLASS OF 2024",
        title: "B.S. Computer Science",
        image: "/images/chapel.jpg",
        bullets: [
          "Graduated December 2023 — Class of 2024.",
          "Coursework: Database Systems, Computer Architecture, Design & Analysis of Algorithms, AI, Server-Side Web Apps, iOS Development.",
        ],
        spot: [-5.0, 4.8],
        rotY: 0.15,
      },
      {
        id: "research",
        board: "RESEARCH",
        eyebrow: "NEURIPS '22 · AAAI '24 · DUKE COLAI LAB",
        title: "Publications & lab work",
        bullets: [
          "ComMU (NeurIPS 2022) — ablation study on Track-Role metadata for combinatorial music generation; ran a study with 100+ professional composers.",
          "MID-FiLD (AAAI 2024) — co-authored a MIDI dataset capturing fine-level dynamics; Transformer-XL hit 80% on valence mood classification.",
          "Duke ColAI Lab (2024) — research assistant on efficient long-context Transformers: RetNet, VQ-VAE, RoPE.",
        ],
        links: [
          {
            label: "Read MID-FiLD",
            href: "https://ojs.aaai.org/index.php/AAAI/article/view/27774",
          },
          { label: "Google Scholar", href: SCHOLAR_URL },
        ],
        spot: [4.8, -3.4],
        rotY: -0.4,
      },
      {
        id: "skills",
        board: "SKILLS",
        eyebrow: "FOUNDATIONS",
        title: "What I build with",
        skillGroups: [
          { label: "Languages", skills: ["TypeScript", "JavaScript", "Python", "Rust", "SQL"] },
          {
            label: "Frontend",
            skills: ["React", "Next.js", "TanStack Query", "Zustand", "Tailwind CSS"],
          },
          { label: "Backend", skills: ["Node.js", "Express", "Fastify", "FastAPI", "Flask"] },
          {
            label: "Data & Streaming",
            skills: ["PostgreSQL", "TimescaleDB", "MySQL", "MongoDB", "Redis"],
          },
          {
            label: "Cloud & Infra",
            skills: [
              "AWS",
              "GCP",
              "Fly.io",
              "Vercel",
              "Docker",
              "GitHub Actions",
              "Cloudflare",
              "Sentry",
              "PostHog",
            ],
          },
        ],
        spot: [3.4, -14.8],
        rotY: 0.3,
      },
    ],
    spawn: [-5.4, 16.2],
    welcome: { spot: [-0.4, 17.6], rotY: -0.55 },
    colliders: [
      [-8.0, 1.6, 2.7], // castle
      [5.9, -6.0, 1.5], // tower_A (research)
      [1.0, -17.2, 2.0], // tavern (skills)
      [-9.8, 15.6, 0.8],
      [-0.9, 10.6, 0.6],
      [-9.9, 4.6, 0.4],
      [-6.9, -1.4, 0.4],
      [0.6, -5.4, 0.8],
      [0.9, -7.6, 0.7],
      [8.6, -16.2, 0.8],
      [9.4, -17.4, 0.8],
      [7.8, -18.4, 0.6],
      [10.8, -18.3, 0.9],
      [10.2, -13.2, 0.9],
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // PROJECTS — one guild hall, one board: every side quest reads from a
  // single scrolling ledger in front of the tavern.
  // ───────────────────────────────────────────────────────────────────────
  projects: {
    id: "projects",
    tagline: "Side quests · one scrolling ledger",
    platform: { kind: "disc", radius: 7 },
    buildings: [{ key: "tavern", position: [0, 0, -2.6], scale: 2.4 }],
    props: [
      { path: D + "flag_green.gltf", position: [-2.3, 0, 0.9], scale: 1.1 },
      { path: D + "flag_green.gltf", position: [2.3, 0, 0.9], scale: 1.1 },
      { path: D + "barrel.gltf", position: [-3.5, 0, -4.5], scale: 1.0 },
      { path: D + "crate_open.gltf", position: [3.5, 0, -4.6], scale: 1.0 },
      { path: D + "rock_single_A.gltf", position: [0.7, 0, -8.6], scale: 0.9 },
      { path: D + "trees_A_medium.gltf", position: [-7.0, 0, 4.6], scale: 1.1 },
      { path: D + "trees_B_medium.gltf", position: [-8.5, 0, -1.4], scale: 1.05 },
      { path: D + "trees_A_medium.gltf", position: [-6.8, 0, -6.4], scale: 1.0 },
      { path: D + "trees_B_medium.gltf", position: [6.8, 0, -6.4], scale: 1.05 },
      { path: D + "trees_A_medium.gltf", position: [8.5, 0, -1.4], scale: 1.1 },
      { path: D + "trees_B_medium.gltf", position: [7.0, 0, 4.6], scale: 1.0 },
      { path: D + "trees_A_medium.gltf", position: [-9.6, 0, 2.4], scale: 1.05 },
      { path: D + "trees_A_medium.gltf", position: [9.6, 0, 2.4], scale: 1.05 },
      { path: D + "trees_A_small.gltf", position: [-4.3, 0, 6.9], scale: 0.95 },
      { path: D + "trees_A_small.gltf", position: [4.3, 0, 6.9], scale: 0.95 },
      { path: D + "trees_B_medium.gltf", position: [-2.0, 0, -9.4], scale: 1.0 },
      { path: D + "trees_A_small.gltf", position: [3.2, 0, -9.2], scale: 0.9 },
    ],
    stations: [
      {
        id: "projects",
        board: "PROJECTS",
        eyebrow: "SIDE QUESTS · 2023 – NOW",
        title: "Personal builds",
        sections: [
          {
            heading: "Notula",
            sub: "AI MEETING COMPANION · IN PROGRESS",
            bullets: [
              "Joins video meetings, captures notes, ships summaries and insights.",
              "Distributed microservices with async workflows over RabbitMQ.",
              "Zoom integrated via GraphQL to cut fetch latency · Next.js, Express, PostgreSQL, GCP.",
            ],
          },
          {
            heading: "Spot — for couples",
            sub: "MOBILE APP · IN PROGRESS",
            bullets: [
              "Find, share, and bookmark favourite places together.",
              "React Native + Expo · FastAPI · Supabase · Prisma · GCP · Docker.",
            ],
          },
          {
            heading: "Eventify Inbox",
            sub: "AI SCHEDULE MANAGER · APR 2024",
            bullets: [
              "LangChain agent that autonomously turns incoming email into calendar meetings and agendas via webhooks.",
              "LangChain, OpenAI, Flask, React, AWS.",
            ],
            links: [
              { label: "View code", href: "https://github.com/JuYoung-Yang-00/EventifyInbox" },
            ],
          },
          {
            heading: "Bulk Buy Buddies",
            sub: "COSTCO MATCHMAKING · DEC 2023",
            bullets: [
              "Matches Costco shoppers who want to split bulk purchases.",
              "React · FastAPI · MongoDB · Firebase · Google Maps.",
            ],
            links: [
              { label: "View code", href: "https://github.com/wgdevworld/bulk-buy-buddies" },
            ],
          },
          {
            heading: "Earth Street Journal",
            sub: "CLIMATE NEWS · NOV 2023",
            bullets: [
              "Scrapes and summarizes environmental news for accessibility.",
              "Fine-tuned GPT for consistent structured summaries · Flask, React, MongoDB.",
            ],
            links: [
              { label: "View code", href: "https://github.com/JuYoung-Yang-00/earthstreetjournal" },
            ],
          },
          {
            heading: "Not Uber",
            sub: "GRAPH SIMULATION · NOV 2023",
            bullets: [
              "Ride-share simulation over a 50,000-node Manhattan graph with 2,000 passengers and 200 drivers.",
              "Event-driven matching with A*, Dijkstra, and Floyd-Warshall — tuned to a linear-time strategy.",
            ],
            links: [
              { label: "View code", href: "https://github.com/JuYoung-Yang-00/case-study-Not-Uber" },
            ],
          },
        ],
        spot: [2.7, 1.9],
        rotY: -0.35,
      },
    ],
    spawn: [0, 6.9],
    welcome: { spot: [3.1, 7.8], rotY: -0.5 },
    colliders: [
      [0, -2.6, 2.9], // tavern
      [-7.0, 4.6, 0.9],
      [-8.5, -1.4, 0.9],
      [-6.8, -6.4, 0.9],
      [6.8, -6.4, 0.9],
      [8.5, -1.4, 0.9],
      [7.0, 4.6, 0.9],
      [-9.6, 2.4, 0.9],
      [9.6, 2.4, 0.9],
      [-4.3, 6.9, 0.8],
      [4.3, 6.9, 0.8],
      [-2.0, -9.4, 0.9],
      [3.2, -9.2, 0.8],
      [-3.5, -4.5, 0.5],
      [3.5, -4.6, 0.5],
      [0.7, -8.6, 0.7],
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────
// WORK — the neon night city. A chronological avenue from the south gate:
// Very Sweet (2024) → OSSA.AI (2024–2025) → KOLfi downtown (2026 – now).
// Layout lives in WorkCityScene; the readable content lives here.
// ─────────────────────────────────────────────────────────────────────────

export const WORK_TAGLINE = "KOLfi → OSSA.AI → Very Sweet";

export const WORK_STATIONS: StationDef[] = [
  {
    id: "kolfi",
    board: "KOLFI",
    eyebrow: "LEAD SOFTWARE ENGINEER · KOLFI LABS",
    title: "Real-time crypto analytics & trading",
    dates: "FEB 2026 – NOW",
    bullets: [
      "Architected a cloud-native, event-driven platform of 30+ microservices tracking 600+ influencers and 19,000+ assets — 200 → 5,000 MAU in four months, shipping weekly.",
      "Built the data pipeline end to end: Rust ingestion at ~1,500 tx/s through 11 protocol-native decoders into 1-second TimescaleDB candles — matched the vendor it replaced to 0.22% median deviation.",
      "Drove trade execution to p50 400 ms / p95 800 ms from click to on-chain confirmation with a zero-I/O hot path and a raw UDP shred-stream receipt predictor.",
      "Owned 440+ Postgres/TimescaleDB migrations and launched the custodial-trading partner REST API powering third-party integrations.",
    ],
    spot: [-6.6, 14],
    rotY: 0.25,
  },
  {
    id: "ossa",
    board: "OSSA.AI",
    eyebrow: "SOFTWARE ENGINEER · OSSA.AI",
    title: "Generative image, video & voice products",
    dates: "JUL 2024 – DEC 2025",
    bullets: [
      "Shipped LoRA image customization, image-to-video generation, and voice sampling + text-to-voice features.",
      "Built Chat-to-Video: Vercel AI + LangChain agents + PostgreSQL parameter management.",
      "Ran four Dockerized microservices on AWS; migrated the LLM stack from Azure OpenAI to AWS Bedrock.",
    ],
    spot: [6.5, -1.5],
    rotY: -0.25,
  },
  {
    id: "verysweet",
    board: "VERY SWEET",
    eyebrow: "SOFTWARE ENGINEER · VERY SWEET INC.",
    title: "Fintech transaction intelligence",
    dates: "MAY – AUG 2024",
    bullets: [
      "Built a system classifying unstructured financial transactions into IRS tax categories — rule-based logic plus a lightweight language model.",
      "Analyzed 3,000+ real anonymized card transactions to automate budgeting recommendations.",
    ],
    spot: [-6.4, -16.5],
    rotY: 0.25,
  },
];
