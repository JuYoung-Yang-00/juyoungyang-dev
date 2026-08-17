// Knight Crossing — the hidden game behind the selector clouds. This module
// is the whole rulebook: seeded row generation, hop resolution, traffic
// collision, cloud riding, the storm-cloud idle punisher, and scoring.
// No three.js here — the scene components read this state every frame and
// render it, so the game logic stays testable and the render layer dumb.

export type Dir = "fwd" | "back" | "left" | "right";
export type RowKind = "safe" | "road" | "rift";
export type DeathCause = "car" | "fall" | "storm";
export type Phase = "intro" | "playing" | "dead";

// ─── Grid & feel constants ──────────────────────────────────────────────
export const TILE = 2;
/** Playable columns run -MAX_COL..MAX_COL; row r sits at z = -r · TILE. */
export const MAX_COL = 4;
/** Cars and clouds live on a wrap loop wider than the visible field. */
export const SPAN = 36;
export const HOP_S = 0.16;
export const HOP_H = 0.6;
/** Cars render at this scale; the KayKit car body is 0.94 × 0.42 at scale 1. */
export const CAR_SCALE = 3.0;
export const CAR_HALF = (0.94 * CAR_SCALE) / 2;
/** Rift clouds render at this scale; cloud_small is 2.34 wide at scale 1. */
export const CLOUD_SCALE = 1.15;
export const CLOUD_HALF = (2.34 * CLOUD_SCALE) / 2;
/** Riding a drifting cloud past this |x| slides the knight off the field. */
const RIDE_X_MAX = (MAX_COL + 0.6) * TILE;
/** How many rows behind the best row the knight may retreat. */
const BACK_LIMIT = 3;

// The storm cloud is a pressure line that creeps up the field from behind —
// the camera's trailing edge. Waiting is allowed, but never for long: the
// line starts advancing at its base rate the moment play begins (faster the
// further you've come), banks at most PRESSURE_BANK rows of slack behind
// your best row, and catching the knight is the lightning zap. The scene
// ends the run early — via catchStorm() — the moment the creeping camera
// pushes the knight out of frame, so the engine's own gap-0 catch is only
// the backstop.
const PRESSURE_BASE = 0.35; // rows per second
const PRESSURE_RAMP = 0.008; // extra rows/s per best row reached
const PRESSURE_MAX = 0.9;
/** The bank equals the scene's camera lead, so the line always sits exactly
 *  at the camera handoff point behind your best row — stall anywhere and
 *  the view starts creeping within a second, never after a long free pause. */
const PRESSURE_BANK = 4;
/** Where the line starts relative to spawn — camping the spawn row ends in
 *  roughly 9 seconds (frame exit around a 1-row gap). */
const PRESSURE_START = -4;
/** stormLevel saturates as the gap closes on the typical frame-exit point
 *  (~1 row), ramping across the rows before it. */
const PRESSURE_CATCH_LEAD = 1;
const PRESSURE_WARN_ROWS = 3;
/** Thunder + banner arm/disarm thresholds (hysteresis so an active player
 *  hopping in and out of the warn band doesn't retrigger it constantly). */
const WARN_ON = 0.35;
const WARN_OFF = 0.1;

// Near-miss windows (seconds, game time) tied to a hop: a car sweeping the
// cell you just left, or shaving past the cell you just landed on.
const BRUSH_WINDOW_S = 0.3;
const BRUSH_DIST = 1.0;

// ─── Row definitions ────────────────────────────────────────────────────
export type CarDef = { offset: number; model: number };
export type CloudDef = { offset: number; scale: number };
export type PropDef = { col: number; model: number; rot: number };
export type FlankDef = { side: -1 | 1; model: number; scale: number; off: number };

export type RowDef = {
  index: number;
  kind: RowKind;
  /** road: traffic direction and speed; rift: cloud drift. */
  dir: 1 | -1;
  speed: number;
  cars: CarDef[];
  police: boolean;
  clouds: CloudDef[];
  props: PropDef[];
  /** Streetlamp sides for safe rows (rendered at the field edge). */
  lamps: (-1 | 1)[];
  /** Skyline buildings flanking this row beyond the playfield. */
  flanks: FlankDef[];
};

// ─── Seeded RNG — one city per day, identical on every retry ────────────
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dailySeed(date: Date): number {
  return (
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  );
}

const wrap = (v: number) => {
  const m = ((v + SPAN / 2) % SPAN + SPAN) % SPAN;
  return m - SPAN / 2;
};

/** World x of car i on a road row at game time t. */
export function carX(row: RowDef, i: number, t: number): number {
  return wrap(row.cars[i].offset + row.dir * row.speed * t);
}

/** World x of cloud i on a rift row at game time t. */
export function cloudX(row: RowDef, i: number, t: number): number {
  return wrap(row.clouds[i].offset + row.dir * row.speed * t);
}

export const rowZ = (index: number) => -index * TILE;

// ─── Engine ─────────────────────────────────────────────────────────────
type Hop = {
  fromX: number;
  fromRow: number;
  toX: number;
  toRow: number;
  t0: number;
};

export type Knight = {
  x: number;
  row: number;
  hop: Hop | null;
  /** Cloud currently ridden, as an index into its row's clouds. */
  ride: { row: number; i: number } | null;
  /** World position, refreshed every update for camera + renderer. */
  wx: number;
  wy: number;
  wz: number;
  /** Yaw the model should face (radians, +z forward convention). */
  face: number;
};

type BrushWatch = { row: number; x: number; until: number };
type BrushArrival = { row: number; x: number; until: number };

export type Engine = ReturnType<typeof createEngine>;

export type EngineEvents = {
  onScore: (score: number) => void;
  onDeath: (cause: DeathCause) => void;
  onBrush: () => void;
  onHop: () => void;
  onRefused: () => void;
  onStormWarn: () => void;
};

export function createEngine(seed: number, events: EngineEvents) {
  const rand = mulberry32(seed);
  const rows: RowDef[] = [];

  // Generation cursor state — chunk grammar: runs of safe rows separating
  // runs of roads or rifts, all widths driven by how far the knight has come.
  let lastGen = -1;

  const genSafe = (index: number): RowDef => {
    const props: PropDef[] = [];
    // Spawn plaza stays clear; later safe rows grow up to 3 single-cell
    // blockers, never crowding the three centre columns all at once.
    if (index > 2) {
      const n = Math.floor(rand() * (index > 14 ? 4 : 3));
      const used = new Set<number>();
      for (let k = 0; k < n; k++) {
        const col = Math.floor(rand() * (MAX_COL * 2 + 1)) - MAX_COL;
        if (used.has(col)) continue;
        if ([-1, 0, 1].every((c) => used.has(c) || c === col)) continue;
        used.add(col);
        props.push({
          col,
          model: Math.floor(rand() * 5),
          rot: Math.floor(rand() * 4) * (Math.PI / 2),
        });
      }
    }
    const lamps: (-1 | 1)[] =
      index % 2 === 0 ? [index % 4 === 0 ? -1 : 1] : [];
    return {
      index,
      kind: "safe",
      dir: 1,
      speed: 0,
      cars: [],
      police: false,
      clouds: [],
      props,
      lamps,
      flanks: genFlanks(),
    };
  };

  const genFlanks = (): FlankDef[] => {
    const flanks: FlankDef[] = [];
    for (const side of [-1, 1] as const) {
      if (rand() < 0.62) {
        flanks.push({
          side,
          model: Math.floor(rand() * 9),
          scale: 3.4 + rand() * 2.2,
          off: 13.5 + rand() * 3.5,
        });
      }
    }
    return flanks;
  };

  const genRoad = (index: number): RowDef => {
    const police = index > 16 && rand() < 0.07;
    const base = 2.3 + Math.min(2.6, index * 0.05);
    const speed = base * (0.75 + rand() * 0.5) * (police ? 1.7 : 1);
    const dir = rand() < 0.5 ? -1 : 1;
    const count = police
      ? 1
      : index < 10
        ? 3
        : index < 26
          ? 3 + Math.floor(rand() * 2)
          : 4 + Math.floor(rand() * 2);
    const cars: CarDef[] = [];
    const slot = SPAN / count;
    for (let i = 0; i < count; i++) {
      // Jitter within the slot but keep every inter-car gap hoppable.
      const play = Math.max(0, slot - CAR_HALF * 2 - 3.4);
      // Civilian traffic draws from sedan/hatchback/wagon/taxi — the police
      // model is reserved for the rare siren lane.
      const civilian = [0, 1, 3, 4];
      cars.push({
        offset: wrap(i * slot + rand() * play),
        model: police ? 2 : civilian[Math.floor(rand() * civilian.length)],
      });
    }
    return {
      index,
      kind: "road",
      dir,
      speed,
      cars,
      police,
      clouds: [],
      props: [],
      lamps: [],
      flanks: genFlanks(),
    };
  };

  const genRift = (index: number): RowDef => {
    const speed = 1.1 + Math.min(1.2, index * 0.02) + rand() * 0.4;
    const dir = rand() < 0.5 ? -1 : 1;
    const count = 5;
    const slot = SPAN / count;
    const clouds: CloudDef[] = [];
    for (let i = 0; i < count; i++) {
      clouds.push({
        offset: wrap(i * slot + rand() * Math.max(0, slot - CLOUD_HALF * 2 - 2.5)),
        scale: CLOUD_SCALE * (0.92 + rand() * 0.2),
      });
    }
    return {
      index,
      kind: "rift",
      dir,
      speed,
      cars: [],
      police: false,
      clouds,
      props: [],
      lamps: [],
      // No skyline on rift rows — buildings floating beside a sky hole
      // break the "city torn open" read.
      flanks: [],
    };
  };

  const genChunk = () => {
    const at = lastGen + 1;
    if (at <= 2) {
      // Opening plaza: three clear sidewalks to learn the controls on.
      for (let i = at; i <= 2; i++) rows.push(genSafe(i));
      lastGen = 2;
      return;
    }
    // Hazard run…
    const riftChance = at < 9 ? 0 : Math.min(0.32, 0.12 + at * 0.004);
    if (rand() < riftChance) {
      const len = at > 20 && rand() < 0.35 ? 2 : 1;
      for (let i = 0; i < len; i++) rows.push(genRift(at + i));
      lastGen = at + len - 1;
    } else {
      const maxRun = at < 8 ? 1 : at < 18 ? 2 : at < 30 ? 3 : 4;
      const len = 1 + Math.floor(rand() * maxRun);
      for (let i = 0; i < len; i++) rows.push(genRoad(at + i));
      lastGen = at + len - 1;
    }
    // …then a breather. Late game skips the breather entirely sometimes.
    const skipSafe = lastGen > 24 && rand() < 0.25;
    if (!skipSafe) {
      const safes = rand() < 0.25 ? 2 : 1;
      for (let i = 0; i < safes; i++) rows.push(genSafe(lastGen + 1 + i));
      lastGen += safes;
    }
  };

  const ensureRows = (upTo: number) => {
    while (lastGen < upTo) genChunk();
  };
  ensureRows(24);

  const knight: Knight = {
    x: 0,
    row: 0,
    hop: null,
    ride: null,
    wx: 0,
    wy: 0,
    wz: 0,
    face: Math.PI, // KayKit knight faces +z by default; face -z (forward).
  };

  const state = {
    phase: "intro" as Phase,
    time: 0,
    maxRow: 0,
    brushCount: 0,
    score: 0,
    cause: null as DeathCause | null,
    deathAt: 0,
    /** 0 → calm, ramps 0..1 while the storm closes in, 1 at the zap. */
    stormLevel: 0,
    /** Real-time timestamp until which the scene should run slow-motion. */
    slowmoUntil: 0,
    /**
     * The storm's kill line, in (fractional) row units. The camera never
     * retreats behind it and the knight dies on contact with it.
     */
    pressureRow: PRESSURE_START,
    startedAt: 0,
    stormWarned: false,
  };

  const brushWatches: BrushWatch[] = [];
  let brushArrival: BrushArrival | null = null;

  /**
   * A car counts as a near miss only while it is approaching or overlapping
   * the cell — a car that has already swept past and is receding poses no
   * danger and awards nothing.
   */
  const nearMissAt = (row: RowDef, x: number, t: number): boolean => {
    for (let i = 0; i < row.cars.length; i++) {
      const cx = carX(row, i, t);
      const d = Math.abs(cx - x);
      if (d < CAR_HALF + BRUSH_DIST) {
        if (row.dir === 1 ? cx <= x + CAR_HALF : cx >= x - CAR_HALF) {
          return true;
        }
      }
    }
    return false;
  };

  const rowAt = (index: number): RowDef | undefined => rows[index];

  /** True (and dies) when a car on row r overlaps the knight right now. */
  const hitCarOnRow = (r: number, t: number): boolean => {
    const row = rows[r];
    if (!row || row.kind !== "road") return false;
    if (Math.abs(rowZ(r) - knight.wz) > 0.9) return false;
    for (let i = 0; i < row.cars.length; i++) {
      if (Math.abs(carX(row, i, t) - knight.wx) < CAR_HALF + 0.35) {
        die("car");
        return true;
      }
    }
    return false;
  };

  const propAt = (row: RowDef, col: number) =>
    row.props.some((p) => p.col === col);

  const die = (cause: DeathCause) => {
    if (state.phase === "dead") return;
    state.phase = "dead";
    state.cause = cause;
    state.deathAt = state.time;
    knight.hop = null;
    // The storm pressure (vignette, banner) releases on any non-storm death
    // so the death card isn't framed by a stale warning.
    if (cause !== "storm") state.stormLevel = 0;
    events.onDeath(cause);
  };

  const setScore = () => {
    const s = state.maxRow + state.brushCount * 2;
    if (s !== state.score) {
      state.score = s;
      events.onScore(s);
    }
  };

  const fireBrush = () => {
    state.brushCount += 1;
    state.slowmoUntil = -1; // scene stamps the real-time window
    setScore();
    events.onBrush();
  };

  /**
   * Attempt a hop. "busy" means mid-hop — the caller should retry the same
   * input next frame; "blocked" is a real refusal (edge, prop, back limit)
   * and drops the input.
   */
  const hop = (dir: Dir): "ok" | "busy" | "blocked" => {
    if (state.phase === "dead") return "blocked";
    if (knight.hop) return "busy";
    const fromRow = knight.row;
    const fromX = knight.x;
    let toRow = fromRow;
    let toX = fromX;
    if (dir === "fwd") toRow += 1;
    if (dir === "back") toRow -= 1;
    if (dir === "left") toX -= TILE;
    if (dir === "right") toX += TILE;

    if (toRow < 0 || toRow < state.maxRow - BACK_LIMIT) {
      events.onRefused();
      return "blocked";
    }
    ensureRows(toRow + 20);
    const target = rowAt(toRow)!;
    if (target.kind === "rift") {
      if (Math.abs(toX) > RIDE_X_MAX) {
        events.onRefused();
        return "blocked";
      }
    } else {
      const col = Math.round(toX / TILE);
      if (Math.abs(col) > MAX_COL) {
        events.onRefused();
        return "blocked";
      }
      if (propAt(target, col)) {
        events.onRefused();
        return "blocked";
      }
      toX = col * TILE;
    }

    if (state.phase === "intro") {
      state.phase = "playing";
      state.startedAt = state.time;
    }

    // Any hop ends the arrival near-miss window — it belongs to the cell
    // being left behind, not to wherever the knight is now.
    brushArrival = null;
    knight.ride = null;
    knight.hop = { fromX, fromRow, toX, toRow, t0: state.time };
    knight.face =
      dir === "fwd" ? Math.PI : dir === "back" ? 0 : dir === "left" ? -Math.PI / 2 : Math.PI / 2;

    // Watch the vacated cell for a car sweeping through right behind us.
    const from = rowAt(fromRow);
    if (from?.kind === "road") {
      brushWatches.push({ row: fromRow, x: fromX, until: state.time + BRUSH_WINDOW_S });
    }
    events.onHop();
    return "ok";
  };

  const land = (h: Hop) => {
    knight.hop = null;
    knight.row = h.toRow;
    knight.x = h.toX;
    const row = rowAt(h.toRow)!;
    if (row.kind === "rift") {
      let found = -1;
      for (let i = 0; i < row.clouds.length; i++) {
        // Per-cloud footprint — the generator varies each cloud's scale.
        const half = (2.34 * row.clouds[i].scale) / 2;
        if (Math.abs(cloudX(row, i, state.time) - h.toX) < half + 0.25) {
          found = i;
          break;
        }
      }
      if (found < 0) {
        die("fall");
        return;
      }
      knight.ride = { row: h.toRow, i: found };
    } else if (row.kind === "road") {
      brushArrival = { row: h.toRow, x: h.toX, until: state.time + BRUSH_WINDOW_S };
    }
    if (h.toRow > state.maxRow) {
      state.maxRow = h.toRow;
      setScore();
    }
  };

  const update = (dt: number) => {
    // After death the traffic keeps flowing (cars are analytic in time) but
    // the knight, collisions, and the storm all freeze for the death beat.
    state.time += dt;
    if (state.phase === "dead") return;
    const t = state.time;

    // Resolve the hop tween.
    const h = knight.hop;
    let s = 0;
    if (h) {
      s = Math.min(1, (t - h.t0) / HOP_S);
      knight.wx = h.fromX + (h.toX - h.fromX) * s;
      knight.wz = rowZ(h.fromRow) + (rowZ(h.toRow) - rowZ(h.fromRow)) * s;
      knight.wy = Math.sin(Math.PI * s) * HOP_H;
      if (s >= 1) {
        land(h);
        // A missed rift landing dies inside land(); nothing after (brush
        // scoring especially) may run once best has been recorded. Checked
        // via cause — TS's narrowing of phase can't see through land().
        if (state.cause !== null) return;
      }
    }
    if (!knight.hop) {
      // Ride the cloud (drift), or stand still on the grid.
      if (knight.ride) {
        const row = rowAt(knight.ride.row)!;
        knight.x += row.dir * row.speed * dt;
        if (Math.abs(knight.x) > RIDE_X_MAX) {
          die("fall");
          return;
        }
      }
      knight.wx = knight.x;
      knight.wz = rowZ(knight.row);
      knight.wy = 0;
    }

    // Traffic collision — continuous, so cars hit a standing knight and a
    // knight hopping through a lane alike. Check the two rows the knight's
    // z currently spans (no per-frame array — this is the hot path).
    const zRow = -knight.wz / TILE;
    const r0 = Math.floor(zRow);
    const r1 = Math.ceil(zRow);
    if (hitCarOnRow(r0, t)) return;
    if (r1 !== r0 && hitCarOnRow(r1, t)) return;

    // Near-miss watches. The vacated-cell watch and the arrival window are
    // mutually exclusive per hop moment (one covers the cell left behind,
    // one the cell landed on), and both demand an approaching car.
    for (let w = brushWatches.length - 1; w >= 0; w--) {
      const watch = brushWatches[w];
      if (t > watch.until) {
        brushWatches.splice(w, 1);
        continue;
      }
      if (nearMissAt(rowAt(watch.row)!, watch.x, t)) {
        brushWatches.splice(w, 1);
        fireBrush();
      }
    }
    if (brushArrival) {
      if (t > brushArrival.until) {
        brushArrival = null;
      } else if (
        !knight.hop &&
        nearMissAt(rowAt(brushArrival.row)!, brushArrival.x, t)
      ) {
        brushArrival = null;
        fireBrush();
      }
    }

    // Advance the storm's pressure line — from the very first hop, no
    // grace. Sprinting ahead banks at most PRESSURE_BANK rows of waiting
    // slack; the line never lags further.
    if (state.phase === "playing") {
      const rate = Math.min(
        PRESSURE_MAX,
        PRESSURE_BASE + state.maxRow * PRESSURE_RAMP
      );
      state.pressureRow += rate * dt;
      const floor = state.maxRow - PRESSURE_BANK;
      if (state.pressureRow < floor) state.pressureRow = floor;

      const knightRowF = -knight.wz / TILE;
      state.stormLevel = Math.min(
        1,
        Math.max(
          0,
          1 -
            (knightRowF - state.pressureRow - PRESSURE_CATCH_LEAD) /
              PRESSURE_WARN_ROWS
        )
      );
      if (state.stormLevel > WARN_ON && !state.stormWarned) {
        state.stormWarned = true;
        events.onStormWarn();
      } else if (state.stormLevel < WARN_OFF) {
        state.stormWarned = false;
      }
      if (knightRowF <= state.pressureRow) die("storm");
    }
  };

  return {
    rows,
    rowAt,
    ensureRows,
    knight,
    state,
    hop,
    update,
    /** The scene calls this when the creeping camera has pushed the knight
     *  out of frame — same storm death, just before the line touches him. */
    catchStorm: () => {
      if (state.phase === "playing") die("storm");
    },
  };
}
