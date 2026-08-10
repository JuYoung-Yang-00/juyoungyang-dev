/** Hex grid math shared by world platforms. Pointy-top axial coordinates,
 *  matching the KayKit tile pitch used across the site. */

export const HEX_PITCH_X = 1.6;
export const HEX_PITCH_Z = 1.6 * 0.866;

/** World-space positions of all tiles in a hex disc of the given ring radius. */
export function hexDisc(radius: number): [number, number][] {
  const out: [number, number][] = [];
  for (let q = -radius; q <= radius; q++) {
    const rMin = Math.max(-radius, -q - radius);
    const rMax = Math.min(radius, -q + radius);
    for (let r = rMin; r <= rMax; r++) {
      out.push([HEX_PITCH_X * (q + r / 2), HEX_PITCH_Z * r]);
    }
  }
  return out;
}

/** Hex distance (in rings) from the origin for a world-space point. */
export function hexRingDistance(x: number, z: number): number {
  const r = z / HEX_PITCH_Z;
  const q = x / HEX_PITCH_X - r / 2;
  // Cube-round to the nearest hex.
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;
  else rs = -rq - rr;
  return (Math.abs(rq) + Math.abs(rr) + Math.abs(rs)) / 2;
}

/** World-space centre of the lattice tile containing (x, z). */
export function hexRoundToCenter(x: number, z: number): [number, number] {
  const r = z / HEX_PITCH_Z;
  const q = x / HEX_PITCH_X - r / 2;
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;
  return [HEX_PITCH_X * (rq + rr / 2), HEX_PITCH_Z * rr];
}

// ─── Winding band platforms ─────────────────────────────────────────────
// A band is a road-shaped island: a curving centreline with a width that
// can bulge into plazas. Used by worlds whose content is a chronological
// walk rather than a radial arrangement.

export type BandSpec = {
  zMin: number;
  zMax: number;
  /** Centreline: x = curveAmp * sin(curveFreq * z + curvePhase). */
  curveAmp: number;
  curveFreq: number;
  curvePhase?: number;
  baseHalfWidth: number;
  /** Gaussian width bulges — plazas along the road. */
  bulges?: { z: number; extra: number; sigma: number }[];
};

export function bandXCenter(spec: BandSpec, z: number): number {
  return spec.curveAmp * Math.sin(spec.curveFreq * z + (spec.curvePhase ?? 0));
}

export function bandHalfWidth(spec: BandSpec, z: number): number {
  let w = spec.baseHalfWidth;
  for (const b of spec.bulges ?? []) {
    const t = (z - b.z) / b.sigma;
    w += b.extra * Math.exp(-t * t);
  }
  return w;
}

function tileInBand(spec: BandSpec, tx: number, tz: number): boolean {
  if (tz < spec.zMin || tz > spec.zMax) return false;
  return Math.abs(tx - bandXCenter(spec, tz)) <= bandHalfWidth(spec, tz);
}

/** All lattice tiles inside the band. */
export function hexBand(spec: BandSpec): [number, number][] {
  const out: [number, number][] = [];
  const maxX =
    spec.curveAmp +
    spec.baseHalfWidth +
    Math.max(0, ...(spec.bulges ?? []).map((b) => b.extra)) +
    HEX_PITCH_X;
  const rMin = Math.floor((spec.zMin - 1) / HEX_PITCH_Z);
  const rMax = Math.ceil((spec.zMax + 1) / HEX_PITCH_Z);
  for (let r = rMin; r <= rMax; r++) {
    const z = r * HEX_PITCH_Z;
    const qMin = Math.floor((-maxX - (r * HEX_PITCH_X) / 2) / HEX_PITCH_X);
    const qMax = Math.ceil((maxX - (r * HEX_PITCH_X) / 2) / HEX_PITCH_X);
    for (let q = qMin; q <= qMax; q++) {
      const x = HEX_PITCH_X * (q + r / 2);
      if (tileInBand(spec, x, z)) out.push([x, z]);
    }
  }
  return out;
}

/** Movement bound for a band platform: the containing tile must be in the
 *  band, and the point must clear every collider circle. */
export function makeBandBounds(
  spec: BandSpec,
  colliders: [number, number, number][]
) {
  return (x: number, z: number): boolean => {
    const [tx, tz] = hexRoundToCenter(x, z);
    if (!tileInBand(spec, tx, tz)) return false;
    for (const [cx, cz, cr] of colliders) {
      const dx = x - cx;
      const dz = z - cz;
      if (dx * dx + dz * dz < cr * cr) return false;
    }
    return true;
  };
}

/** Continuous band bound (no tile quantisation) — for valley worlds where
 *  the corridor edge is a treeline rather than a platform cliff. */
export function makeBandBoundsSmooth(
  spec: BandSpec,
  margin: number,
  colliders: [number, number, number][]
) {
  return (x: number, z: number): boolean => {
    if (z < spec.zMin + 0.5 || z > spec.zMax - 0.5) return false;
    if (Math.abs(x - bandXCenter(spec, z)) > bandHalfWidth(spec, z) - margin)
      return false;
    for (const [cx, cz, cr] of colliders) {
      const dx = x - cx;
      const dz = z - cz;
      if (dx * dx + dz * dz < cr * cr) return false;
    }
    return true;
  };
}

/** Ocean keep-out test for a band world: true for tiles inside the band or
 *  its one-ring shore gap. */
export function makeBandOceanExclude(spec: BandSpec) {
  const grown: BandSpec = {
    ...spec,
    zMin: spec.zMin - HEX_PITCH_Z * 1.4,
    zMax: spec.zMax + HEX_PITCH_Z * 1.4,
    baseHalfWidth: spec.baseHalfWidth + HEX_PITCH_X * 1.15,
  };
  return (x: number, z: number): boolean => tileInBand(grown, x, z);
}

/**
 * Movement bound for a hex-disc platform with circle colliders. Returns true
 * when the position is walkable.
 */
export function makePlatformBounds(
  radius: number,
  colliders: [number, number, number][]
) {
  return (x: number, z: number): boolean => {
    if (hexRingDistance(x, z) > radius) return false;
    for (const [cx, cz, cr] of colliders) {
      const dx = x - cx;
      const dz = z - cz;
      if (dx * dx + dz * dz < cr * cr) return false;
    }
    return true;
  };
}

/** Bound for a rectangular city floor with circle colliders. */
export function makeRectBounds(
  xHalf: number,
  zMin: number,
  zMax: number,
  colliders: [number, number, number][]
) {
  return (x: number, z: number): boolean => {
    if (Math.abs(x) > xHalf || z < zMin || z > zMax) return false;
    for (const [cx, cz, cr] of colliders) {
      const dx = x - cx;
      const dz = z - cz;
      if (dx * dx + dz * dz < cr * cr) return false;
    }
    return true;
  };
}
