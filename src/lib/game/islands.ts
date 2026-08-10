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

export type ExtraBuildingDef = {
  key: BuildingKey;
  position: [number, number, number];
  scale?: number;
  rotY?: number;
};

export type IslandDef = {
  id: string;
  title: string;
  org: string;
  era: string;
  position: [number, number, number];
  /**
   * Alternative position used on narrow (portrait) viewports, where the
   * landscape spread would force the camera too far back. Arranged as a
   * tall column so the map fills a phone screen.
   */
  portraitPosition?: [number, number, number];
  building: BuildingKey;
  buildingScale?: number;
  buildingOffset?: [number, number, number];
  /** Additional buildings so an island can read as a small settlement. */
  extraBuildings?: ExtraBuildingDef[];
  tiles?: [number, number][];
  decorations: DecorationDef[];
  /**
   * Position of the wooden signpost relative to the island centre.
   * [x, z] in world units. Defaults to [0, 1.6] (front-centre).
   */
  signOffset?: [number, number];
  /** Radius of the hover/selection ring — larger islands need larger rings. */
  ringRadius?: number;
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

// Three chapters, three islands: Education (Duke + research), Work (KOLfi ·
// OSSA.AI · Very Sweet), Projects (side quests). Each is a small settlement
// rather than a single building, since each world below carries much more
// content than the old one-employer islands did.
export const ISLANDS: IslandDef[] = [
  {
    id: "education",
    title: "Education",
    org: "Duke · B.S. Computer Science",
    era: "2018–2024",
    position: [-7.6, 0.5, -1.8],
    portraitPosition: [-1.1, 0.5, 6.2],
    building: "castle",
    extraBuildings: [
      { key: "tower_A", position: [E[0] + 0.15, 0, E[1] - 0.35], scale: 0.72, rotY: 0.5 },
    ],
    tiles: [E, W, NE, SW, SE],
    signOffset: [-1.1, 1.9],
    ringRadius: 2.75,
    decorations: [
      { path: D + "trees_A_large.gltf", position: [W[0] - 0.2, 0, W[1] - 0.2], scale: 0.85 },
      { path: D + "trees_A_medium.gltf", position: [NE[0] + 0.2, 0, NE[1] - 0.2], rotation: 1.2, scale: 0.9 },
      { path: D + "trees_A_small.gltf", position: [SE[0] + 0.3, 0, SE[1] + 0.25], scale: 0.8 },
      { path: D + "flag_blue.gltf", position: [-0.6, 0, 0.6] },
      { path: D + "rock_single_A.gltf", position: [SW[0] - 0.2, 0, SW[1] + 0.2], scale: 0.7 },
    ],
  },
  {
    id: "work",
    title: "Work",
    org: "KOLfi · OSSA.AI · Very Sweet",
    era: "2024–now",
    position: [0.9, 0.62, 4.4],
    portraitPosition: [2.6, 0.62, 0.0],
    building: "tower_B",
    extraBuildings: [
      { key: "market", position: [W[0] - 0.2, 0, W[1] + 0.1], scale: 0.8, rotY: 0.45 },
      { key: "home_A", position: [NE[0] + 0.25, 0, NE[1] - 0.25], scale: 0.8, rotY: -0.4 },
    ],
    tiles: [E, W, NE, NW, SE, SW],
    signOffset: [0.4, 2.3],
    ringRadius: 2.75,
    decorations: [
      { path: D + "flag_red.gltf", position: [0.55, 0, -0.45], rotation: 0.3 },
      { path: D + "flag_yellow.gltf", position: [-0.5, 0, -0.45], rotation: -0.2 },
      { path: D + "crate_A_big.gltf", position: [E[0] + 0.2, 0, E[1] - 0.4], scale: 0.85 },
      { path: D + "crate_open.gltf", position: [SW[0] - 0.1, 0, SW[1] + 0.2], rotation: 0.4, scale: 0.9 },
      { path: D + "sack.gltf", position: [NW[0] - 0.25, 0, NW[1] + 0.1], scale: 0.85 },
      { path: D + "trees_A_small.gltf", position: [SE[0] + 0.25, 0, SE[1] + 0.2], scale: 0.75 },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    org: "Notula · Eventify · Spot · more",
    era: "side quests",
    position: [8.2, 0.7, -1.2],
    portraitPosition: [-2.4, 0.7, -7.8],
    building: "tavern",
    tiles: [E, NW, SW],
    signOffset: [2.2, 0.5],
    ringRadius: 2.5,
    decorations: [
      { path: D + "barrel.gltf", position: [E[0], 0, E[1] + 0.1] },
      { path: D + "trees_A_small.gltf", position: [NW[0], 0, NW[1] - 0.1], rotation: 0.5 },
      { path: D + "trees_B_medium.gltf", position: [NW[0] - 0.5, 0, NW[1] + 0.5], scale: 0.8 },
      { path: D + "flag_green.gltf", position: [0.5, 0, 0.55] },
      { path: D + "resource_stone.gltf", position: [SW[0], 0, SW[1] + 0.2], scale: 0.8 },
    ],
  },
];

export const DECORATION_PATHS: string[] = Array.from(
  new Set(ISLANDS.flatMap((i) => i.decorations.map((d) => d.path)))
);

export const CLOUD_PATHS = [D + "cloud_big.gltf", D + "cloud_small.gltf"];

export const LAYOUT_RADIUS = 11;

/** Horizontal / depth half-extents of the two island layouts (incl. tiles). */
export const LAYOUT_LANDSCAPE = { x: 10.8, z: 7.2 };
export const LAYOUT_PORTRAIT = { x: 4.6, z: 12.6 };

/** Aspect ratio below which the portrait layout + camera framing kick in. */
export const PORTRAIT_ASPECT = 0.9;

export function islandPosition(island: IslandDef, portrait: boolean): [number, number, number] {
  return portrait && island.portraitPosition ? island.portraitPosition : island.position;
}
