import { SimplexNoise2D } from '../noise';
import { PRNG } from '../prng';
import { SEA_LEVEL } from './elevation';
import type { GenerationInput, MountainRange, RiverSegment, WorldField } from './types';
import { buildAccessibility } from './travel';
import { clamp, distanceTransform, smoothstep, unit } from './util';
import type { BiomeType } from '../../../types/mapGeography';
import type { Settlement } from '../../../types/map';
import { createNamer, type SettleFlavour } from './names';

/** How well each biome supports agriculture, and therefore population. */
const FERTILITY: Record<BiomeType, number> = {
  ocean: 0,
  coast: 0.9,
  grassland: 1.0,
  savanna: 0.66,
  'temperate-forest': 0.74,
  'tropical-forest': 0.5,
  taiga: 0.34,
  tundra: 0.12,
  desert: 0.08,
  wetlands: 0.42,
  highlands: 0.24,
  mountains: 0.04
};

export interface SiteContext {
  /** Land cell adjacent to open sea. */
  isCoast: Uint8Array;
  /** Coastal cell in a sheltered bay or inlet -- somewhere a ship can anchor. */
  isHarbor: Uint8Array;
  riverDist: Float32Array;
  lakeDist: Float32Array;
  confluenceDist: Float32Array;
  passDist: Float32Array;
  access: Float32Array;
  fertility: Float32Array;
  /** Local relief: how much higher the surrounding terrain is. */
  defensibility: Float32Array;
  mountainLevel: number;
}

/**
 * Derives every geographic property a settlement site is judged on. All of it
 * comes from layers already generated, so a city can only be "well placed" for
 * reasons that are actually visible on the finished map.
 */
export function buildSiteContext(
  field: WorldField,
  ranges: MountainRange[],
  rivers: RiverSegment[]
): SiteContext {
  const { cols, rows, cellW, cellH, land, elevation, slope, biome, lakeId, riverMask, moisture } = field;
  const n = cols * rows;

  const isCoast = new Uint8Array(n);
  const isHarbor = new Uint8Array(n);

  // Open sea excludes lakes, so lakeside towns never get called ports.
  const isSea = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (!land[i] && lakeId[i] === 0) isSea[i] = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (!land[i] || lakeId[i] > 0) continue;
      const touches =
        (c > 0 && isSea[i - 1]) ||
        (c < cols - 1 && isSea[i + 1]) ||
        (r > 0 && isSea[i - cols]) ||
        (r < rows - 1 && isSea[i + cols]);
      if (!touches) continue;
      isCoast[i] = 1;

      // Shelter test: on an exposed headland most of the neighbourhood is open
      // water; in a bay or estuary the surrounding land still wraps around.
      let sea = 0;
      let total = 0;
      const rad = 4;
      for (let dr = -rad; dr <= rad; dr++) {
        const rr = r + dr;
        if (rr < 0 || rr >= rows) continue;
        for (let dc = -rad; dc <= rad; dc++) {
          const cc = c + dc;
          if (cc < 0 || cc >= cols) continue;
          if (dc * dc + dr * dr > rad * rad) continue;
          total++;
          if (isSea[rr * cols + cc]) sea++;
        }
      }
      const frac = sea / Math.max(1, total);
      // Needs real water access but not full exposure to the open ocean.
      if (frac > 0.16 && frac < 0.52) isHarbor[i] = 1;
    }
  }

  const riverDist = distanceTransform(cols, rows, (i) => riverMask[i] === 1);
  const lakeDist = distanceTransform(cols, rows, (i) => lakeId[i] > 0);

  // Confluences: where the hydrology stage recorded a tributary joining a trunk.
  const confluence = new Uint8Array(n);
  for (const seg of rivers) {
    if (seg.joinsAt !== undefined && seg.joinsAt >= 0 && seg.joinsAt < n) confluence[seg.joinsAt] = 1;
    // A river mouth is a natural port site too.
    if (seg.mouth === 'ocean' && seg.points.length > 0) {
      const p = seg.points[seg.points.length - 1];
      const cc = clamp(Math.round(p.x / cellW), 0, cols - 1);
      const rr = clamp(Math.round(p.y / cellH), 0, rows - 1);
      confluence[rr * cols + cc] = 1;
    }
  }
  const confluenceDist = distanceTransform(cols, rows, (i) => confluence[i] === 1);

  // Mountain passes are the only cheap way through a range.
  const passMask = new Uint8Array(n);
  for (const range of ranges) {
    for (const p of range.passes) {
      const cc = clamp(Math.round(p.x / cellW), 0, cols - 1);
      const rr = clamp(Math.round(p.y / cellH), 0, rows - 1);
      passMask[rr * cols + cc] = 1;
    }
  }
  const passDist = distanceTransform(cols, rows, (i) => passMask[i] === 1);

  const access = buildAccessibility(field);

  const fertility = new Float32Array(n);
  const defensibility = new Float32Array(n);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (!land[i] || lakeId[i] > 0) continue;

      // Crops want water but not a bog, and flat ground rather than a hillside.
      const wet = 1 - Math.abs(moisture[i] - 0.58) * 1.7;
      const flat = 1 - smoothstep(0.004, 0.03, slope[i]);
      fertility[i] = clamp(FERTILITY[biome[i]] * clamp(wet, 0.15, 1) * clamp(flat, 0.2, 1), 0, 1);

      let highest = elevation[i];
      for (let dr = -2; dr <= 2; dr++) {
        const rr = r + dr;
        if (rr < 0 || rr >= rows) continue;
        for (let dc = -2; dc <= 2; dc++) {
          const cc = c + dc;
          if (cc < 0 || cc >= cols) continue;
          const v = elevation[rr * cols + cc];
          if (v > highest) highest = v;
        }
      }
      // A site that overlooks its surroundings, without being buried in them.
      defensibility[i] = clamp(slope[i] * 22 + (elevation[i] - SEA_LEVEL) * 1.1 - (highest - elevation[i]) * 2.4, 0, 1);
    }
  }

  // The level above which nobody founds a city.
  const landElevs: number[] = [];
  for (let i = 0; i < n; i++) if (land[i]) landElevs.push(elevation[i]);
  landElevs.sort((a, b) => a - b);
  const mountainLevel = landElevs.length
    ? landElevs[Math.floor(landElevs.length * 0.9)]
    : SEA_LEVEL + 0.4;

  return {
    isCoast,
    isHarbor,
    riverDist,
    lakeDist,
    confluenceDist,
    passDist,
    access,
    fertility,
    defensibility,
    mountainLevel
  };
}

/**
 * Scores every land cell as a place to found a settlement. Negative means
 * unusable -- open water, lake bed, or high mountain, which is why no city ever
 * lands on a peak.
 */
export function scoreSites(field: WorldField, ctx: SiteContext, seed: number): Float32Array {
  const { cols, rows, land, elevation, slope, biome, lakeId } = field;
  const scores = new Float32Array(cols * rows).fill(-1);
  const varyNoise = new SimplexNoise2D(new PRNG(seed ^ 0x39c1d6ff));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (!land[i] || lakeId[i] > 0) continue;
      // Hard exclusions: nobody builds a town on a summit or a cliff face.
      if (biome[i] === 'mountains') continue;
      if (elevation[i] > ctx.mountainLevel) continue;
      if (slope[i] > 0.055) continue;

      const river = 1 - smoothstep(0, 2.6, ctx.riverDist[i]);
      const lake = 1 - smoothstep(0, 2.4, ctx.lakeDist[i]);
      const conf = 1 - smoothstep(0, 3.0, ctx.confluenceDist[i]);
      const pass = 1 - smoothstep(1.5, 6.0, ctx.passDist[i]);
      const coast = ctx.isHarbor[i] ? 1 : ctx.isCoast[i] ? 0.55 : 0;

      let score =
        ctx.fertility[i] * 0.28 +
        ctx.access[i] * 0.18 +
        river * 0.19 +
        coast * 0.15 +
        conf * 0.08 +
        lake * 0.06 +
        pass * 0.05 +
        ctx.defensibility[i] * 0.04;

      // Extreme climates support people, just far fewer of them.
      if (biome[i] === 'desert' || biome[i] === 'tundra') score *= 0.4;
      if (biome[i] === 'highlands' || biome[i] === 'taiga') score *= 0.7;
      if (biome[i] === 'wetlands') score *= 0.65;

      // Broad, low-frequency variation so the population map has regional
      // heartlands and genuine backcountry instead of even coverage.
      const regional = unit(varyNoise.fbm((c / cols) * 3.2, (r / rows) * 3.2, 3, 0.5, 2));
      score *= 0.62 + regional * 0.62;

      scores[i] = score;
    }
  }
  return scores;
}

interface Placed {
  cell: number;
  x: number;
  y: number;
  radius: number;
}

/** Greedy farthest-first selection with a per-tier spacing rule. */
function pickSites(
  field: WorldField,
  scores: Float32Array,
  candidates: number[],
  count: number,
  radius: number,
  placed: Placed[],
  prng: PRNG,
  clusterTo: Placed[] | null
): number[] {
  const { cols, cellW, cellH } = field;
  const chosen: number[] = [];
  const taken = new Set(placed.map((p) => p.cell));

  for (let pick = 0; pick < count; pick++) {
    let best = -1;
    let bestValue = -Infinity;

    for (const i of candidates) {
      if (taken.has(i)) continue;
      const c = i % cols;
      const r = (i - c) / cols;
      const x = (c + 0.5) * cellW;
      const y = (r + 0.5) * cellH;

      let ok = true;
      let nearest = Infinity;
      for (const p of placed) {
        const d = Math.hypot(x - p.x, y - p.y);
        if (d < (radius + p.radius) * 0.5) {
          ok = false;
          break;
        }
        if (d < nearest) nearest = d;
      }
      if (!ok) continue;

      let value = scores[i];
      // Smaller places grow in the shadow of larger ones, which is what makes
      // villages cluster into populated districts instead of dusting the map.
      if (clusterTo && clusterTo.length > 0) {
        let nearestHub = Infinity;
        for (const p of clusterTo) {
          const d = Math.hypot(x - p.x, y - p.y);
          if (d < nearestHub) nearestHub = d;
        }
        value += (1 - smoothstep(radius * 0.8, radius * 4.5, nearestHub)) * 0.22;
      }

      if (value > bestValue) {
        bestValue = value;
        best = i;
      }
    }

    if (best < 0) break;
    const c = best % cols;
    const r = (best - c) / cols;
    // Jittered radius keeps spacing from reading as a grid.
    placed.push({
      cell: best,
      x: (c + 0.5) * cellW,
      y: (r + 0.5) * cellH,
      radius: radius * prng.nextFloat(0.78, 1.26)
    });
    taken.add(best);
    chosen.push(best);
  }

  return chosen;
}

export interface SettlementResult {
  settlements: Settlement[];
  /** Grid cell of each settlement, index-aligned with `settlements`. */
  cells: number[];
  /** Cells chosen as regional seats, in the order regions should be grown. */
  seatCells: number[];
  scores: Float32Array;
  context: SiteContext;
}

function flavourOf(field: WorldField, ctx: SiteContext, cell: number): SettleFlavour {
  if (ctx.isHarbor[cell] || ctx.isCoast[cell]) return 'port';
  if (ctx.riverDist[cell] <= 1.6) return 'river';
  if (field.biome[cell] === 'highlands' || ctx.passDist[cell] < 3) return 'highland';
  return 'plain';
}

/**
 * Places the settlement hierarchy: a few regional seats, a limited number of
 * cities, more towns, and villages filling in around them.
 */
export function placeSettlements(
  field: WorldField,
  input: GenerationInput,
  ranges: MountainRange[],
  rivers: RiverSegment[]
): SettlementResult {
  const namer = createNamer(input.seed);
  const prng = namer.prng;
  const ctx = buildSiteContext(field, ranges, rivers);
  const scores = scoreSites(field, ctx, input.seed);
  const { cols, cellW, cellH, land, lakeId } = field;

  let candidates: number[] = [];
  for (let i = 0; i < scores.length; i++) if (scores[i] > 0) candidates.push(i);
  candidates.sort((a, b) => scores[b] - scores[a]);
  // Bound the search: the weakest sites would never be chosen anyway.
  if (candidates.length > 9000) candidates = candidates.slice(0, 9000);

  if (candidates.length === 0) {
    return { settlements: [], cells: [], seatCells: [], scores, context: ctx };
  }

  let landCells = 0;
  for (let i = 0; i < land.length; i++) if (land[i] && lakeId[i] === 0) landCells++;
  const landArea = landCells * cellW * cellH;

  const total = clamp(Math.round((input.settlementCount || 10) * 2.6), 8, 60);
  const capitalCount = clamp(input.kingdomCount || 4, 1, 8);
  const cityCount = clamp(Math.round(total * 0.16), 1, 10);
  const townCount = clamp(Math.round(total * 0.28), 2, 18);
  const villageCount = Math.max(2, total - capitalCount - cityCount - townCount);

  // Spacing derived from how much land there is, so a small island does not get
  // continent-sized gaps between its towns.
  const baseSep = Math.sqrt(landArea / Math.max(6, total));
  const placed: Placed[] = [];

  const seatCells = pickSites(field, scores, candidates, capitalCount, baseSep * 2.0, placed, prng, null);
  const cityCells = pickSites(field, scores, candidates, cityCount, baseSep * 1.15, placed, prng, null);
  const majorPlaced = placed.slice();

  const townCells = pickSites(field, scores, candidates, townCount, baseSep * 0.66, placed, prng, majorPlaced);
  const townPlaced = placed.slice();

  const villageCells = pickSites(field, scores, candidates, villageCount, baseSep * 0.42, placed, prng, townPlaced);

  // A couple of fortresses guard the routes rather than the farmland.
  const strategic: number[] = [];
  for (const i of candidates) {
    if (ctx.passDist[i] < 4 || ctx.defensibility[i] > 0.55) strategic.push(i);
  }
  strategic.sort((a, b) => (ctx.defensibility[b] - ctx.defensibility[a]));
  const fortressCount = clamp(Math.round(capitalCount * 0.6), 1, 4);
  const fortressCells = pickSites(
    field,
    scores,
    strategic,
    fortressCount,
    baseSep * 0.9,
    placed,
    prng,
    null
  );

  const settlements: Settlement[] = [];
  const cells: number[] = [];
  const push = (cell: number, tier: Settlement['type'], popRange: [number, number]) => {
    const c = cell % cols;
    const r = (cell - c) / cols;
    const flavour = flavourOf(field, ctx, cell);
    // A coastal major settlement is a port; nothing inland ever is.
    const type: Settlement['type'] =
      tier === 'city' && ctx.isHarbor[cell] ? 'port' : tier;
    settlements.push({
      id: `set_${settlements.length}_${input.seed}`,
      name: namer.settlement(flavour),
      type,
      x: (c + 0.5) * cellW,
      y: (r + 0.5) * cellH,
      population: Math.round(prng.nextFloat(popRange[0], popRange[1]))
    });
    cells.push(cell);
  };

  for (const cell of seatCells) push(cell, 'capital', [38000, 140000]);
  for (const cell of cityCells) push(cell, 'city', [11000, 46000]);
  for (const cell of townCells) push(cell, 'town', [1800, 9000]);
  for (const cell of villageCells) push(cell, 'village', [140, 1500]);
  for (const cell of fortressCells) push(cell, 'fortress', [300, 2200]);

  return { settlements, cells, seatCells, scores, context: ctx };
}
