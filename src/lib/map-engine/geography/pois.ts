import { PRNG } from '../prng';
import { SEA_LEVEL } from './elevation';
import type { GenerationInput, MountainRange, WorldField } from './types';
import { clamp, distanceTransform, smoothstep } from './util';
import type { PointOfInterest, RoadPath, Settlement } from '../../../types/map';

type PoiType = PointOfInterest['type'];

interface PoiRule {
  type: PoiType;
  /** Relative share of the POI budget. */
  weight: number;
  /** Minimum separation multiplier applied to the base spacing. */
  spacing: number;
  names: string[];
  descriptions: string[];
  /** Returns a desirability score, or -1 if the cell is unsuitable. */
  score: (cell: number, ctx: PoiContext) => number;
}

interface PoiContext {
  field: WorldField;
  settlementDist: Float32Array;
  roadDist: Float32Array;
  borderDist: Float32Array;
  passDist: Float32Array;
  ridgeDist: Float32Array;
  mountainLevel: number;
  highlandLevel: number;
}

const near = (d: number, reach: number) => 1 - smoothstep(0, reach, d);
const far = (d: number, reach: number) => smoothstep(0, reach, d);

/**
 * Placement rules, one per landmark type. Each rule reads only the finished
 * geography, so every landmark ends up somewhere a reader can justify: mines in
 * the mountains, lairs in the wilderness, ruins beside forgotten roads.
 */
const RULES: PoiRule[] = [
  {
    type: 'mine',
    weight: 1.6,
    spacing: 0.8,
    names: ['Deepdelve Mine', 'Mithril Deep', 'The Iron Cut', 'Greyseam Workings', 'Emberlode Mine'],
    descriptions: [
      'Shafts driven deep beneath the range in search of ore.',
      'Tunnels rich in arcane ores, worked in shifts year round.'
    ],
    score: (cell, ctx) => {
      const { biome, elevation } = ctx.field;
      if (biome[cell] !== 'mountains' && biome[cell] !== 'highlands') return -1;
      if (elevation[cell] < ctx.highlandLevel) return -1;
      // Ore is worthless without a way to haul it out.
      return 0.5 + near(ctx.roadDist[cell], 10) * 0.3 + near(ctx.settlementDist[cell], 22) * 0.2;
    }
  },
  {
    type: 'dragon-lair',
    weight: 0.8,
    spacing: 1.9,
    names: ['Obsidian Dragon Lair', 'The Wyrmhold', 'Ashfang Eyrie', 'The Scaled Deep'],
    descriptions: [
      'Lair of an ancient wyrm, shunned by every road and river.',
      'A cavern mouth in the high crags, littered with bones.'
    ],
    score: (cell, ctx) => {
      const { biome, elevation } = ctx.field;
      if (biome[cell] !== 'mountains') return -1;
      if (elevation[cell] < ctx.mountainLevel) return -1;
      // Remoteness is the whole point.
      return far(ctx.settlementDist[cell], 34) * 0.6 + far(ctx.roadDist[cell], 26) * 0.4;
    }
  },
  {
    type: 'ruins',
    weight: 2.0,
    spacing: 0.75,
    names: [
      'Whispering Ruins', 'The Fallen Hold', 'Old Karn', 'Broken Arches',
      'The Sunken Terraces', 'Weatherfall Ruins'
    ],
    descriptions: [
      'Foundations of a settlement abandoned generations ago.',
      'Toppled walls beside a road nobody maintains any more.'
    ],
    score: (cell, ctx) => {
      const { biome, slope, land, lakeId } = ctx.field;
      if (!land[cell] || lakeId[cell] > 0) return -1;
      if (biome[cell] === 'mountains') return -1;
      if (slope[cell] > 0.045) return -1;
      // Ruins sit where people once were: along old routes, outside the towns
      // that outlived them.
      const roadside = near(ctx.roadDist[cell], 8);
      const abandoned = far(ctx.settlementDist[cell], 16);
      return roadside * 0.45 + abandoned * 0.35 + near(ctx.borderDist[cell], 12) * 0.2;
    }
  },
  {
    type: 'castle',
    weight: 1.2,
    spacing: 1.0,
    names: ['Spire of Eternity', 'Wardencrag Keep', 'The Marchhold', 'Blackgate Castle', 'Stonewatch'],
    descriptions: [
      'A keep set to watch the pass and the frontier beyond it.',
      'High fortress commanding the only road through the hills.'
    ],
    score: (cell, ctx) => {
      const { biome, elevation, land, lakeId } = ctx.field;
      if (!land[cell] || lakeId[cell] > 0) return -1;
      if (biome[cell] === 'wetlands' || biome[cell] === 'mountains') return -1;
      if (elevation[cell] < SEA_LEVEL + 0.04) return -1;
      // Castles guard something: a pass, a frontier, or a road.
      return (
        near(ctx.passDist[cell], 9) * 0.4 +
        near(ctx.borderDist[cell], 10) * 0.34 +
        near(ctx.roadDist[cell], 12) * 0.26
      );
    }
  },
  {
    type: 'temple',
    weight: 1.2,
    spacing: 0.85,
    names: ['Temple of the Ninefold Dawn', 'The High Sanctum', 'Hall of Quiet Stars', 'Sunvault Temple'],
    descriptions: [
      'A pilgrimage site tended by an order older than the realm.',
      'Stone halls raised where the faithful could reach them.'
    ],
    score: (cell, ctx) => {
      const { biome, slope, land, lakeId } = ctx.field;
      if (!land[cell] || lakeId[cell] > 0) return -1;
      if (biome[cell] === 'mountains' || slope[cell] > 0.04) return -1;
      // Temples need congregations, so they stay within reach of people.
      return near(ctx.settlementDist[cell], 14) * 0.6 + near(ctx.roadDist[cell], 10) * 0.4;
    }
  },
  {
    type: 'shrine',
    weight: 1.4,
    spacing: 0.7,
    names: ['Forgotten Shrine', 'The Green Cairn', 'Wellspring Shrine', 'Shrine of Still Water'],
    descriptions: [
      'A sacred grove blessed by the spirits of the earth.',
      'A waymarker shrine where travellers leave offerings.'
    ],
    score: (cell, ctx) => {
      const { biome, land, lakeId, riverMask } = ctx.field;
      if (!land[cell] || lakeId[cell] > 0) return -1;
      const wild =
        biome[cell] === 'temperate-forest' ||
        biome[cell] === 'tropical-forest' ||
        biome[cell] === 'taiga' ||
        biome[cell] === 'wetlands';
      if (!wild) return -1;
      const water = riverMask[cell] === 1 ? 0.3 : 0;
      return 0.35 + water + near(ctx.roadDist[cell], 14) * 0.25 + far(ctx.settlementDist[cell], 12) * 0.2;
    }
  },
  {
    type: 'tower',
    weight: 1.0,
    spacing: 1.1,
    names: ['Astral Beacon', 'The Lonely Spire', 'Watchtower of Vaen', 'The Grey Tower'],
    descriptions: [
      'A stargazing spire raised far from any hearth fire.',
      'A signal tower with sightlines over the whole valley.'
    ],
    score: (cell, ctx) => {
      const { biome, elevation, land, lakeId } = ctx.field;
      if (!land[cell] || lakeId[cell] > 0) return -1;
      if (biome[cell] === 'mountains' || biome[cell] === 'wetlands') return -1;
      // Isolated, and high enough to see from.
      const relief = clamp((elevation[cell] - SEA_LEVEL) * 3, 0, 1);
      return relief * 0.45 + far(ctx.settlementDist[cell], 24) * 0.35 + near(ctx.ridgeDist[cell], 14) * 0.2;
    }
  },
  {
    type: 'dungeon',
    weight: 1.2,
    spacing: 1.2,
    names: ['Sunken Citadel', 'The Undervault', 'Barrowdeep', 'The Hollow Stair'],
    descriptions: [
      'Submerged halls filled with forbidden relics.',
      'A stair descending further than any survivor has mapped.'
    ],
    score: (cell, ctx) => {
      const { biome, land, lakeId } = ctx.field;
      if (!land[cell] || lakeId[cell] > 0) return -1;
      if (biome[cell] === 'coast' || biome[cell] === 'grassland') return -1;
      return far(ctx.settlementDist[cell], 26) * 0.5 + near(ctx.ridgeDist[cell], 18) * 0.3 + far(ctx.roadDist[cell], 18) * 0.2;
    }
  },
  {
    type: 'battlefield',
    weight: 0.9,
    spacing: 1.3,
    names: ['The Reddened Field', 'Kingsfall', 'The Broken Line', 'Ravensmeet'],
    descriptions: [
      'Open ground where two realms settled a border in blood.',
      'Grass grown over the graves of an entire generation.'
    ],
    score: (cell, ctx) => {
      const { biome, slope, land, lakeId } = ctx.field;
      if (!land[cell] || lakeId[cell] > 0) return -1;
      if (biome[cell] !== 'grassland' && biome[cell] !== 'savanna' && biome[cell] !== 'coast') return -1;
      if (slope[cell] > 0.02) return -1;
      // Armies met where the frontier was worth crossing.
      return near(ctx.borderDist[cell], 8) * 0.55 + near(ctx.roadDist[cell], 12) * 0.45;
    }
  },
  {
    type: 'magical-site',
    weight: 1.0,
    spacing: 1.3,
    names: ['The Weeping Stones', 'Aetherfall', 'The Verdant Anomaly', 'Starscar Hollow'],
    descriptions: [
      'A place where the land itself refuses to behave.',
      'Ground that never freezes, ringed by stones nobody raised.'
    ],
    score: (cell, ctx) => {
      const { land, lakeId, moisture, temperature, biome } = ctx.field;
      if (!land[cell] || lakeId[cell] > 0) return -1;
      if (biome[cell] === 'ocean') return -1;
      // Anomalies sit where the climate is at odds with itself.
      const oddity = Math.abs(moisture[cell] - 0.5) + Math.abs(temperature[cell] - 0.5);
      return oddity * 0.6 + far(ctx.settlementDist[cell], 20) * 0.4;
    }
  }
];

/**
 * Places landmarks against the finished world. Nothing is scattered: each type
 * has its own terrain rule, and candidates are ranked by how well they satisfy it.
 */
export function buildPointsOfInterest(
  field: WorldField,
  input: GenerationInput,
  ranges: MountainRange[],
  settlements: Settlement[],
  settlementCells: number[],
  roads: RoadPath[]
): PointOfInterest[] {
  const { cols, rows, cellW, cellH, land, elevation, regionId, lakeId } = field;
  const prng = new PRNG(input.seed ^ 0x3ad8f2b1);
  const n = cols * rows;

  const settleMask = new Uint8Array(n);
  for (const cell of settlementCells) settleMask[cell] = 1;
  const settlementDist = distanceTransform(cols, rows, (i) => settleMask[i] === 1);

  const roadMask = new Uint8Array(n);
  for (const road of roads) {
    for (const p of road.points ?? []) {
      const c = clamp(Math.round(p.x / cellW), 0, cols - 1);
      const r = clamp(Math.round(p.y / cellH), 0, rows - 1);
      roadMask[r * cols + c] = 1;
    }
  }
  const roadDist = distanceTransform(cols, rows, (i) => roadMask[i] === 1);

  // A frontier cell is land whose neighbour belongs to a different realm.
  const borderMask = new Uint8Array(n);
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      const i = r * cols + c;
      if (!land[i] || regionId[i] === 0) continue;
      const id = regionId[i];
      if (
        (regionId[i - 1] !== id && regionId[i - 1] !== 0) ||
        (regionId[i + 1] !== id && regionId[i + 1] !== 0) ||
        (regionId[i - cols] !== id && regionId[i - cols] !== 0) ||
        (regionId[i + cols] !== id && regionId[i + cols] !== 0)
      ) {
        borderMask[i] = 1;
      }
    }
  }
  const borderDist = distanceTransform(cols, rows, (i) => borderMask[i] === 1);

  const passMask = new Uint8Array(n);
  const ridgeMask = new Uint8Array(n);
  for (const range of ranges) {
    for (const p of range.passes) {
      const c = clamp(Math.round(p.x / cellW), 0, cols - 1);
      const r = clamp(Math.round(p.y / cellH), 0, rows - 1);
      passMask[r * cols + c] = 1;
    }
    for (const p of range.peaks) {
      const c = clamp(Math.round(p.x / cellW), 0, cols - 1);
      const r = clamp(Math.round(p.y / cellH), 0, rows - 1);
      ridgeMask[r * cols + c] = 1;
    }
  }
  const passDist = distanceTransform(cols, rows, (i) => passMask[i] === 1);
  const ridgeDist = distanceTransform(cols, rows, (i) => ridgeMask[i] === 1);

  const landElevs: number[] = [];
  for (let i = 0; i < n; i++) if (land[i]) landElevs.push(elevation[i]);
  landElevs.sort((a, b) => a - b);
  const quantile = (p: number) =>
    landElevs.length ? landElevs[clamp(Math.floor(landElevs.length * p), 0, landElevs.length - 1)] : SEA_LEVEL;

  const ctx: PoiContext = {
    field,
    settlementDist,
    roadDist,
    borderDist,
    passDist,
    ridgeDist,
    mountainLevel: quantile(0.9),
    highlandLevel: quantile(0.78)
  };

  let landCells = 0;
  for (let i = 0; i < n; i++) if (land[i] && lakeId[i] === 0) landCells++;
  const baseSpacing = Math.sqrt((landCells * cellW * cellH) / 14);

  const budget = clamp(Math.round((input.settlementCount || 10) * 0.85), 5, 15);
  const totalWeight = RULES.reduce((sum, rule) => sum + rule.weight, 0);

  const chosen: { x: number; y: number; radius: number }[] = [];
  const pois: PointOfInterest[] = [];
  const usedNames = new Set<string>();

  // Rules run in a seed-dependent order so no world has the same landmark mix.
  const order = RULES.map((rule, idx) => ({ rule, idx, key: prng.next() }))
    .sort((a, b) => a.key - b.key)
    .map((e) => e.rule);

  for (const rule of order) {
    const want = Math.max(0, Math.round((budget * rule.weight) / totalWeight));
    if (want === 0) continue;
    const radius = baseSpacing * rule.spacing;

    for (let pick = 0; pick < want; pick++) {
      let best = -1;
      let bestScore = 0.12; // ignore weak matches rather than force a placement

      for (let i = 0; i < n; i++) {
        if (!land[i] || lakeId[i] > 0) continue;
        // Never on top of a settlement.
        if (settlementDist[i] < 1.5) continue;
        const s = rule.score(i, ctx);
        if (s <= bestScore) continue;

        const c = i % cols;
        const r = (i - c) / cols;
        const x = (c + 0.5) * cellW;
        const y = (r + 0.5) * cellH;
        let ok = true;
        for (const p of chosen) {
          if (Math.hypot(x - p.x, y - p.y) < (radius + p.radius) * 0.5) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;

        bestScore = s;
        best = i;
      }

      if (best < 0) break;
      const c = best % cols;
      const r = (best - c) / cols;
      const x = (c + 0.5) * cellW;
      const y = (r + 0.5) * cellH;
      chosen.push({ x, y, radius: radius * prng.nextFloat(0.8, 1.25) });

      let name = rule.names[prng.nextInt(0, rule.names.length - 1)];
      if (usedNames.has(name)) {
        const alt = rule.names.find((candidate) => !usedNames.has(candidate));
        if (!alt) continue;
        name = alt;
      }
      usedNames.add(name);

      pois.push({
        id: `poi_${pois.length}_${input.seed}`,
        name,
        type: rule.type,
        x,
        y,
        description: rule.descriptions[prng.nextInt(0, rule.descriptions.length - 1)]
      });
    }
  }

  return pois;
}
