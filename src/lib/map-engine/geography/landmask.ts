import { SimplexNoise2D } from '../noise';
import { PRNG } from '../prng';
import type { GenerationInput } from './types';
import { clamp, pointInRing, smoothstep, unit, type Pt } from './util';

export interface LandMask {
  cols: number;
  rows: number;
  land: Uint8Array;
  /** Raw "landness" scalar retained so the elevation stage can reuse the shape. */
  landness: Float32Array;
  /** Connected land components, largest first. Each is a list of cell indices. */
  components: number[][];
}

/** Fraction of the grid that should end up as land, per map type. */
function targetLandFraction(input: GenerationInput): number {
  const amt = clamp(input.landmassAmount, 1, 14);
  switch (input.mapType) {
    case 'island':
      return 0.17 + amt * 0.005;
    case 'archipelago':
      return 0.2 + amt * 0.004;
    case 'kingdom':
      return 0.56;
    case 'region':
      return 0.64;
    default:
      return 0.44;
  }
}

/** How many separate continental lobes make up the landmass. */
function lobeCount(input: GenerationInput, prng: PRNG): number {
  switch (input.mapType) {
    case 'island':
      return prng.nextInt(2, 3);
    case 'archipelago':
      return prng.nextInt(7, 11);
    case 'kingdom':
      return prng.nextInt(3, 4);
    case 'region':
      return prng.nextInt(2, 4);
    default:
      return prng.nextInt(4, 6);
  }
}

interface Lobe {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot: number;
  weight: number;
}

/**
 * Places overlapping elliptical lobes along a wandering spine. Overlapping lobes
 * are what produce bays, isthmuses and peninsulas -- a single ellipse cannot.
 */
function buildLobes(input: GenerationInput, prng: PRNG, cols: number, rows: number): Lobe[] {
  const n = lobeCount(input, prng);
  const lobes: Lobe[] = [];

  const isScattered = input.mapType === 'archipelago';
  const spanScale = input.mapType === 'island' ? 0.34 : isScattered ? 0.2 : 0.46;

  // The spine runs across the map at a seed-dependent angle so continents are
  // not always horizontally arranged.
  const spineAngle = prng.nextFloat(-0.7, 0.7) + (prng.next() < 0.5 ? 0 : Math.PI);
  const spineLen = Math.min(cols, rows) * (isScattered ? 1.15 : 0.78);
  const midC = cols * 0.5 + prng.nextFloat(-cols * 0.05, cols * 0.05);
  const midR = rows * 0.5 + prng.nextFloat(-rows * 0.05, rows * 0.05);

  let driftC = 0;
  let driftR = 0;

  for (let i = 0; i < n; i++) {
    // Position along the spine, from -0.5 to 0.5.
    const t = n === 1 ? 0 : i / (n - 1) - 0.5;
    // Lobes wander off the spine so the outline is not a smooth sausage.
    driftC += prng.nextFloat(-0.16, 0.16);
    driftR += prng.nextFloat(-0.16, 0.16);

    const along = t * spineLen;
    const off = (driftC + prng.nextFloat(-0.12, 0.12)) * Math.min(cols, rows) * 0.34;

    const cx = midC + Math.cos(spineAngle) * along - Math.sin(spineAngle) * off;
    const cy = midR + Math.sin(spineAngle) * along + Math.cos(spineAngle) * off * 0.8 + driftR * rows * 0.06;

    // Radii vary a lot between lobes: this yields broad regions and narrow necks.
    const base = Math.min(cols, rows) * spanScale * prng.nextFloat(0.5, 1.0);
    const aspect = prng.nextFloat(0.55, 1.7);

    lobes.push({
      cx,
      cy,
      rx: base * aspect,
      ry: base / aspect,
      rot: prng.nextFloat(0, Math.PI),
      weight: prng.nextFloat(0.82, 1.0)
    });
  }

  return lobes;
}

/** Highest lobe membership at a cell, in 0..1. */
function lobeValue(lobes: Lobe[], c: number, r: number): number {
  let best = 0;
  for (const lobe of lobes) {
    const dx = c - lobe.cx;
    const dy = r - lobe.cy;
    const cos = Math.cos(lobe.rot);
    const sin = Math.sin(lobe.rot);
    const lx = (dx * cos + dy * sin) / lobe.rx;
    const ly = (-dx * sin + dy * cos) / lobe.ry;
    const nd = Math.sqrt(lx * lx + ly * ly);
    const v = (1 - smoothstep(0.1, 1.0, nd)) * lobe.weight;
    if (v > best) best = v;
  }
  return best;
}

/**
 * Picks the threshold on `landness` that yields the requested land fraction.
 * Doing this adaptively (rather than using a fixed sea level) keeps every seed
 * usable instead of occasionally producing an empty or fully flooded world.
 */
function thresholdForFraction(landness: Float32Array, fraction: number): number {
  const BINS = 2048;
  const hist = new Int32Array(BINS);
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < landness.length; i++) {
    const v = landness[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (max <= min) return min;
  const scale = (BINS - 1) / (max - min);
  for (let i = 0; i < landness.length; i++) {
    hist[Math.floor((landness[i] - min) * scale)]++;
  }
  const wanted = Math.floor(landness.length * (1 - fraction));
  let cumulative = 0;
  for (let b = 0; b < BINS; b++) {
    cumulative += hist[b];
    if (cumulative >= wanted) return min + b / scale;
  }
  return max;
}

/** 4-connected components of the land mask, largest first. */
function findComponents(land: Uint8Array, cols: number, rows: number): number[][] {
  const seen = new Uint8Array(land.length);
  const components: number[][] = [];
  const queue = new Int32Array(land.length);

  for (let start = 0; start < land.length; start++) {
    if (!land[start] || seen[start]) continue;
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    seen[start] = 1;
    const cells: number[] = [];

    while (head < tail) {
      const i = queue[head++];
      cells.push(i);
      const c = i % cols;
      const r = (i - c) / cols;
      if (c > 0 && land[i - 1] && !seen[i - 1]) { seen[i - 1] = 1; queue[tail++] = i - 1; }
      if (c < cols - 1 && land[i + 1] && !seen[i + 1]) { seen[i + 1] = 1; queue[tail++] = i + 1; }
      if (r > 0 && land[i - cols] && !seen[i - cols]) { seen[i - cols] = 1; queue[tail++] = i - cols; }
      if (r < rows - 1 && land[i + cols] && !seen[i + cols]) { seen[i + cols] = 1; queue[tail++] = i + cols; }
    }
    components.push(cells);
  }

  components.sort((a, b) => b.length - a.length);
  return components;
}

/** Removes single-cell noise in both directions so the coast traces cleanly. */
function despeckle(land: Uint8Array, cols: number, rows: number): void {
  const copy = land.slice();
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      const i = r * cols + c;
      const n =
        copy[i - 1] + copy[i + 1] + copy[i - cols] + copy[i + cols];
      // An isolated cell (or an isolated hole) is a rendering artifact, not geography.
      if (copy[i] === 1 && n === 0) land[i] = 0;
      else if (copy[i] === 0 && n === 4) land[i] = 1;
    }
  }
}

// ----------------------------------------------------------------------------
// Procedural land mask
// ----------------------------------------------------------------------------

export function buildProceduralLandMask(
  input: GenerationInput,
  cols: number,
  rows: number
): LandMask {
  const prng = new PRNG(input.seed ^ 0x9e3779b9);
  const shapeNoise = new SimplexNoise2D(new PRNG(input.seed ^ 0x1a2b3c4d));
  const warpNoise = new SimplexNoise2D(new PRNG(input.seed ^ 0x5f6e7d8c));
  const coastNoise = new SimplexNoise2D(new PRNG(input.seed ^ 0x2c3d4e5f));

  const lobes = buildLobes(input, prng, cols, rows);
  const landness = new Float32Array(cols * rows);

  // Frequencies are expressed relative to the grid so the result is resolution
  // independent -- the same seed gives the same continent at any grid size.
  const baseFreq = 3.1;
  const warpFreq = 1.5;
  const warpAmp = 0.32;
  const coastFreq = 11.0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const u = c / cols;
      const v = r / rows;

      // Domain warping bends the noise so coastlines curve instead of looking
      // like a uniform fractal fringe.
      const wx = warpNoise.noise(u * warpFreq, v * warpFreq) * warpAmp;
      const wy = warpNoise.noise(u * warpFreq + 5.7, v * warpFreq + 3.1) * warpAmp;

      const shape = unit(shapeNoise.fbm((u + wx) * baseFreq, (v + wy) * baseFreq, 5, 0.52, 2.05));
      const mask = lobeValue(lobes, c, r);

      // Extra detail concentrated near the shoreline: inlets and headlands
      // where it matters, smooth terrain inland.
      const coastBand = 1 - Math.abs(mask - 0.45) * 2.2;
      const detail =
        unit(coastNoise.fbm(u * coastFreq, v * coastFreq, 3, 0.5, 2.2)) - 0.5;

      // Keep a water margin so the landmass never runs off the canvas.
      const edge =
        smoothstep(0.0, 0.09, u) *
        smoothstep(1.0, 0.91, u) *
        smoothstep(0.0, 0.09, v) *
        smoothstep(1.0, 0.91, v);

      landness[i] =
        (mask * 0.78 + (shape - 0.5) * 0.62 + detail * clamp(coastBand, 0, 1) * 0.3) * edge;
    }
  }

  const threshold = thresholdForFraction(landness, targetLandFraction(input));
  const land = new Uint8Array(cols * rows);
  for (let i = 0; i < land.length; i++) land[i] = landness[i] > threshold ? 1 : 0;

  despeckle(land, cols, rows);

  // Drop land fragments too small to read as islands.
  const minIslandCells = Math.max(6, Math.round(cols * rows * 0.0008));
  let components = findComponents(land, cols, rows);
  for (const cells of components) {
    if (cells.length < minIslandCells) for (const i of cells) land[i] = 0;
  }
  components = findComponents(land, cols, rows).filter((c) => c.length >= minIslandCells);

  return { cols, rows, land, landness, components };
}

// ----------------------------------------------------------------------------
// Preset (real-world outline) land mask
// ----------------------------------------------------------------------------

/** Converts an SVG arc to sampled points using endpoint parameterization. */
function flattenArc(
  from: Pt,
  rx: number,
  ry: number,
  xRotDeg: number,
  largeArc: boolean,
  sweep: boolean,
  to: Pt,
  out: Pt[]
): void {
  if (rx === 0 || ry === 0) {
    out.push(to);
    return;
  }
  const phi = (xRotDeg * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const dx2 = (from.x - to.x) / 2;
  const dy2 = (from.y - to.y) / 2;
  const x1p = cosPhi * dx2 + sinPhi * dy2;
  const y1p = -sinPhi * dx2 + cosPhi * dy2;

  let rxa = Math.abs(rx);
  let rya = Math.abs(ry);
  const lambda = (x1p * x1p) / (rxa * rxa) + (y1p * y1p) / (rya * rya);
  if (lambda > 1) {
    const s = Math.sqrt(lambda);
    rxa *= s;
    rya *= s;
  }

  const sign = largeArc !== sweep ? 1 : -1;
  const num = rxa * rxa * rya * rya - rxa * rxa * y1p * y1p - rya * rya * x1p * x1p;
  const den = rxa * rxa * y1p * y1p + rya * rya * x1p * x1p;
  const co = den === 0 ? 0 : sign * Math.sqrt(Math.max(0, num / den));
  const cxp = (co * rxa * y1p) / rya;
  const cyp = (-co * rya * x1p) / rxa;
  const cx = cosPhi * cxp - sinPhi * cyp + (from.x + to.x) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (from.y + to.y) / 2;

  const angleOf = (ux: number, uy: number) => Math.atan2(uy, ux);
  const theta1 = angleOf((x1p - cxp) / rxa, (y1p - cyp) / rya);
  let dTheta = angleOf((-x1p - cxp) / rxa, (-y1p - cyp) / rya) - theta1;
  if (!sweep && dTheta > 0) dTheta -= Math.PI * 2;
  else if (sweep && dTheta < 0) dTheta += Math.PI * 2;

  const steps = Math.max(6, Math.ceil(Math.abs(dTheta) / 0.3));
  for (let s = 1; s <= steps; s++) {
    const th = theta1 + (dTheta * s) / steps;
    const ex = Math.cos(th) * rxa;
    const ey = Math.sin(th) * rya;
    out.push({ x: cosPhi * ex - sinPhi * ey + cx, y: sinPhi * ex + cosPhi * ey + cy });
  }
}

/**
 * Flattens an SVG path string into closed rings of points. Supports the
 * subset of commands used by the built-in real-world outlines.
 */
export function flattenSvgPath(d: string): Pt[][] {
  const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
  const rings: Pt[][] = [];
  let ring: Pt[] = [];
  let cur: Pt = { x: 0, y: 0 };
  let start: Pt = { x: 0, y: 0 };
  let prevCtrl: Pt | null = null;
  let cmd = '';
  let i = 0;

  const num = () => parseFloat(tokens[i++]);
  const closeRing = () => {
    if (ring.length > 2) rings.push(ring);
    ring = [];
  };
  const sampleQuad = (p0: Pt, cp: Pt, p1: Pt) => {
    const steps = 10;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const mt = 1 - t;
      ring.push({
        x: mt * mt * p0.x + 2 * mt * t * cp.x + t * t * p1.x,
        y: mt * mt * p0.y + 2 * mt * t * cp.y + t * t * p1.y
      });
    }
  };
  const sampleCubic = (p0: Pt, c1: Pt, c2: Pt, p1: Pt) => {
    const steps = 12;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const mt = 1 - t;
      ring.push({
        x: mt ** 3 * p0.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t ** 3 * p1.x,
        y: mt ** 3 * p0.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t ** 3 * p1.y
      });
    }
  };

  while (i < tokens.length) {
    if (/[MmLlHhVvCcSsQqTtAaZz]/.test(tokens[i])) {
      cmd = tokens[i++];
    }
    const rel = cmd === cmd.toLowerCase();
    const bx = rel ? cur.x : 0;
    const by = rel ? cur.y : 0;

    switch (cmd.toUpperCase()) {
      case 'M': {
        closeRing();
        cur = { x: num() + bx, y: num() + by };
        start = { ...cur };
        ring = [{ ...cur }];
        prevCtrl = null;
        cmd = rel ? 'l' : 'L';
        break;
      }
      case 'L': {
        cur = { x: num() + bx, y: num() + by };
        ring.push({ ...cur });
        prevCtrl = null;
        break;
      }
      case 'H': {
        cur = { x: num() + bx, y: cur.y };
        ring.push({ ...cur });
        prevCtrl = null;
        break;
      }
      case 'V': {
        cur = { x: cur.x, y: num() + by };
        ring.push({ ...cur });
        prevCtrl = null;
        break;
      }
      case 'Q': {
        const cp = { x: num() + bx, y: num() + by };
        const end = { x: num() + bx, y: num() + by };
        sampleQuad(cur, cp, end);
        prevCtrl = cp;
        cur = end;
        break;
      }
      case 'T': {
        const cp: { x: number; y: number } = prevCtrl ? { x: 2 * cur.x - prevCtrl.x, y: 2 * cur.y - prevCtrl.y } : { ...cur };
        const end = { x: num() + bx, y: num() + by };
        sampleQuad(cur, cp, end);
        prevCtrl = cp;
        cur = end;
        break;
      }
      case 'C': {
        const c1 = { x: num() + bx, y: num() + by };
        const c2 = { x: num() + bx, y: num() + by };
        const end = { x: num() + bx, y: num() + by };
        sampleCubic(cur, c1, c2, end);
        prevCtrl = c2;
        cur = end;
        break;
      }
      case 'S': {
        const c1 = prevCtrl ? { x: 2 * cur.x - prevCtrl.x, y: 2 * cur.y - prevCtrl.y } : { ...cur };
        const c2 = { x: num() + bx, y: num() + by };
        const end = { x: num() + bx, y: num() + by };
        sampleCubic(cur, c1, c2, end);
        prevCtrl = c2;
        cur = end;
        break;
      }
      case 'A': {
        const rx = num();
        const ry = num();
        const rot = num();
        const large = num() !== 0;
        const sweep = num() !== 0;
        const end = { x: num() + bx, y: num() + by };
        flattenArc(cur, rx, ry, rot, large, sweep, end, ring);
        prevCtrl = null;
        cur = end;
        break;
      }
      case 'Z': {
        closeRing();
        cur = { ...start };
        prevCtrl = null;
        break;
      }
      default:
        i++;
    }
  }
  closeRing();
  return rings;
}

/**
 * Rasterizes a hand-authored coastline into the grid so the rest of the
 * pipeline (rivers, biomes, cities) operates on the same land the renderer draws.
 */
export function buildPresetLandMask(
  input: GenerationInput,
  cols: number,
  rows: number
): LandMask {
  const rings = flattenSvgPath(input.presetCoastline ?? '');
  const land = new Uint8Array(cols * rows);
  const cellW = input.width / cols;
  const cellH = input.height / rows;

  // Bounding boxes let us skip most ring tests per cell.
  const boxes = rings.map((ring) => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of ring) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    return { minX, minY, maxX, maxY };
  });

  for (let r = 0; r < rows; r++) {
    const y = (r + 0.5) * cellH;
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5) * cellW;
      for (let k = 0; k < rings.length; k++) {
        const b = boxes[k];
        if (x < b.minX || x > b.maxX || y < b.minY || y > b.maxY) continue;
        if (pointInRing(x, y, rings[k])) {
          land[r * cols + c] = 1;
          break;
        }
      }
    }
  }

  const minIslandCells = 3;
  let components = findComponents(land, cols, rows);
  for (const cells of components) {
    if (cells.length < minIslandCells) for (const i of cells) land[i] = 0;
  }
  components = findComponents(land, cols, rows).filter((c) => c.length >= minIslandCells);

  return { cols, rows, land, landness: new Float32Array(cols * rows), components };
}
