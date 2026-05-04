export type BuildingKey =
  | "castle"
  | "home_A"
  | "tower_A"
  | "tower_B"
  | "market"
  | "barracks"
  | "tavern";

export type DecorationDef = {
  path: string;
  position: [number, number, number];
  rotation?: number;
  scale?: number;
};

export type IslandDef = {
  id: string;
  title: string;
  org: string;
  era: string;
  position: [number, number, number];
  building: BuildingKey;
  buildingScale?: number;
  buildingOffset?: [number, number, number];
  tiles?: [number, number][];
  decorations: DecorationDef[];
  /**
   * Position of the wooden signpost relative to the island centre.
   * [x, z] in world units. Defaults to [0, 1.6] (front-centre).
   */
  signOffset?: [number, number];
};

export const BUILDING_PATH: Record<BuildingKey, string> = {
  castle: "/models/buildings/building_castle_blue.gltf",
  home_A: "/models/buildings/building_home_A_blue.gltf",
  tower_A: "/models/buildings/building_tower_A_blue.gltf",
  tower_B: "/models/buildings/building_tower_B_blue.gltf",
  market: "/models/buildings/building_market_blue.gltf",
  barracks: "/models/buildings/building_barracks_blue.gltf",
  tavern: "/models/buildings/building_tavern_blue.gltf",
};

export const TILE_PATH = "/models/tiles/hex_grass.gltf";

const D = "/models/decoration/";

const HEX = 1.6;
const E: [number, number] = [HEX, 0];
const W: [number, number] = [-HEX, 0];
const NE: [number, number] = [HEX * 0.5, -HEX * 0.866];
const NW: [number, number] = [-HEX * 0.5, -HEX * 0.866];
const SE: [number, number] = [HEX * 0.5, HEX * 0.866];
const SW: [number, number] = [-HEX * 0.5, HEX * 0.866];

// Layout — every island center has at least 7 units of clearance to its
// nearest neighbour, and Duke/Army are no longer stacked at the same X.
// Approximate visual radius of an island (centre tile + neighbour tiles) is
// ~2.5 units, so 7 units centre-to-centre leaves a comfortable gap.
export const ISLANDS: IslandDef[] = [
  {
    id: "kolfi",
    title: "KOLfi",
    org: "Lead SE · Chicago",
    era: "2025–now",
    position: [-5, 0.6, 8],
    building: "tower_B",
    buildingScale: 1.0,
    tiles: [E, W, NE, SW],
    signOffset: [-1.2, 1.6],
    decorations: [
      { path: D + "flag_red.gltf", position: [0.55, 0, -0.4], rotation: 0.3 },
      { path: D + "flag_yellow.gltf", position: [-0.5, 0, -0.4], rotation: -0.2 },
      { path: D + "crate_A_big.gltf", position: [E[0], 0, E[1] + 0.2], scale: 0.85 },
      { path: D + "crate_open.gltf", position: [W[0] - 0.1, 0, W[1] + 0.3], rotation: 0.4 },
      { path: D + "trees_A_small.gltf", position: [NE[0] - 0.1, 0, NE[1] + 0.2], scale: 0.7 },
    ],
  },
  {
    id: "duke",
    title: "Duke",
    org: "B.S. CS",
    era: "2019–2023",
    position: [0, 0.5, 0],
    building: "castle",
    tiles: [E, SW, SE],
    signOffset: [1.3, 2.0],
    decorations: [
      { path: D + "trees_A_large.gltf", position: [E[0] + 0.2, 0, E[1] - 0.1], scale: 0.85 },
      { path: D + "trees_A_medium.gltf", position: [SW[0] - 0.2, 0, SW[1]], rotation: 1.2 },
      { path: D + "flag_blue.gltf", position: [0.55, 0, 0.55] },
      { path: D + "rock_single_A.gltf", position: [-0.6, 0, 0.5], scale: 0.7 },
    ],
  },
  {
    id: "pozalabs",
    title: "POZAlabs",
    org: "Music ML · Seoul",
    era: "2022–2023",
    position: [3, 0.7, -8],
    building: "home_A",
    tiles: [E],
    decorations: [
      { path: D + "trees_A_small.gltf", position: [E[0] + 0.1, 0, E[1] + 0.3] },
      { path: D + "trees_B_medium.gltf", position: [E[0] - 0.2, 0, E[1] - 0.3], rotation: 0.6 },
      { path: D + "flag_yellow.gltf", position: [0.5, 0, 0.55], rotation: -0.3 },
    ],
  },
  {
    id: "colai",
    title: "ColAI Lab",
    org: "Long-context · Duke",
    era: "2024",
    position: [8, 0.5, -3],
    building: "tower_A",
    tiles: [W],
    signOffset: [-1.8, 1.2],
    decorations: [
      { path: D + "rock_single_C.gltf", position: [W[0] + 0.2, 0, W[1] + 0.3] },
      { path: D + "rock_single_B.gltf", position: [W[0] - 0.1, 0, W[1] - 0.3], scale: 0.8 },
      { path: D + "flag_blue.gltf", position: [0.6, 0, 0.5], rotation: 0.4 },
    ],
  },
  {
    id: "army",
    title: "ROK Army",
    org: "Comms · Seoul",
    era: "2020–2021",
    position: [-6, 0.6, -7],
    building: "barracks",
    tiles: [SE, SW],
    signOffset: [0, 2.6],
    decorations: [
      { path: D + "tent.gltf", position: [SE[0], 0, SE[1] + 0.1], scale: 0.85 },
      { path: D + "weaponrack.gltf", position: [SW[0], 0, SW[1]], rotation: 0.5 },
      { path: D + "flag_red.gltf", position: [0.5, 0, -0.5] },
      { path: D + "ladder.gltf", position: [-0.5, 0, -0.5], rotation: 1.1 },
    ],
  },
  {
    id: "ossa",
    title: "OSSA.AI",
    org: "Full-stack",
    era: "2024",
    position: [8, 0.6, 6],
    building: "market",
    tiles: [NW, SW],
    signOffset: [-1.0, 2.5],
    decorations: [
      { path: D + "crate_open.gltf", position: [NW[0], 0, NW[1] + 0.1] },
      { path: D + "sack.gltf", position: [SW[0], 0, SW[1]], scale: 0.85 },
      { path: D + "resource_lumber.gltf", position: [-0.55, 0, 0.55], scale: 0.8 },
      { path: D + "flag_yellow.gltf", position: [0.55, 0, -0.5] },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    org: "Spot · Notula · …",
    era: "side",
    position: [-9, 0.7, 1],
    building: "tavern",
    tiles: [E, NW],
    signOffset: [2.2, 0.4],
    decorations: [
      { path: D + "barrel.gltf", position: [E[0], 0, E[1]] },
      { path: D + "trees_A_small.gltf", position: [NW[0], 0, NW[1] - 0.1], rotation: 0.5 },
      { path: D + "flag_green.gltf", position: [0.5, 0, 0.55] },
      { path: D + "resource_stone.gltf", position: [-0.5, 0, 0.55], scale: 0.8 },
    ],
  },
];

export const DECORATION_PATHS: string[] = Array.from(
  new Set(ISLANDS.flatMap((i) => i.decorations.map((d) => d.path)))
);

export const CLOUD_PATHS = [D + "cloud_big.gltf", D + "cloud_small.gltf"];

export const LAYOUT_RADIUS = 11;
