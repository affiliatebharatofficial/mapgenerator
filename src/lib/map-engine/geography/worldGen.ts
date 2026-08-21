import type {
  FantasyMap,
  ForestCluster,
  LakePath,
  MapKingdom,
  MapLabel,
  Position,
  RiverPath
} from '../../../types/map';
import type { BiomeType } from '../../../types/mapGeography';
import { PRNG } from '../prng';
import { buildBiomes, buildClimate, extractForestClusters, pickWind } from './climate';
import { extractCoastlines } from './contour';
import { buildBaseElevation, buildMountainSystem, SEA_LEVEL } from './elevation';
import { buildWaterSystem } from './hydrology';
import { buildPresetLandMask, buildProceduralLandMask } from './landmask';
import { REALM_PREFIXES, REALM_TITLES, SEA_NAMES } from './names';
import { buildPointsOfInterest } from './pois';
import { buildRegions } from './regions';
import { buildRoads } from './roads';
import { placeSettlements } from './settlements';
import { buildTravelCost } from './travel';
import type { GenerationInput, MountainRange, WorldField } from './types';
import { clamp, distanceTransform } from './util';

/** Grid resolution: fine enough for hydrology, coarse enough to stay instant. */
function gridSize(width: number, height: number): { cols: number; rows: number } {
  const target = 5.2;
  return {
    cols: clamp(Math.round(width / target), 80, 260),
    rows: clamp(Math.round(height / target), 60, 200)
  };
}

function createField(input: GenerationInput, cols: number, rows: number, land: Uint8Array): WorldField {
  const n = cols * rows;
  return {
    cols,
    rows,
    cellW: input.width / cols,
    cellH: input.height / rows,
    width: input.width,
    height: input.height,
    seaLevel: SEA_LEVEL,
    land,
    elevation: new Float32Array(n),
    slope: new Float32Array(n),
    coastDist: new Float32Array(n),
    temperature: new Float32Array(n),
    moisture: new Float32Array(n),
    flowAccum: new Float32Array(n),
    flowTo: new Int32Array(n).fill(-1),
    lakeId: new Uint16Array(n),
    riverMask: new Uint8Array(n),
    biome: new Array<BiomeType>(n).fill('ocean'),
    regionId: new Uint8Array(n),
    travelCost: new Float32Array(n)
  };
}

export interface WorldResult {
  field: WorldField;
  coastline: string;
  islandPaths: string[];
  mountains: Position[];
  ranges: MountainRange[];
  forests: ForestCluster[];
  rivers: RiverPath[];
  lakes: LakePath[];
  roads: FantasyMap['roads'];
  cities: FantasyMap['cities'];
  kingdoms: MapKingdom[];
  pointsOfInterest: FantasyMap['pointsOfInterest'];
  labels: MapLabel[];
  realmName: string;
  seaName: string;
}

/**
 * Runs the full geography-first pipeline.
 *
 * Order matters and is deliberate: coastline, elevation, mountains, water,
 * climate, biomes, realms, settlements, roads, landmarks. Every stage reads the
 * shared field the earlier stages wrote, so nothing is placed independently of
 * the land it sits on.
 */
export function generateWorld(input: GenerationInput): WorldResult {
  const { cols, rows } = gridSize(input.width, input.height);

  // --- 1. COASTLINE (land mask first, outline traced from it) ---
  const mask = input.presetCoastline
    ? buildPresetLandMask(input, cols, rows)
    : buildProceduralLandMask(input, cols, rows);

  const field = createField(input, cols, rows, mask.land);
  const coast = extractCoastlines(mask.components, cols, rows, field.cellW, field.cellH);

  // --- 2. ELEVATION ---
  buildBaseElevation(field, input);

  // --- 3. MOUNTAIN SYSTEM ---
  const ranges = buildMountainSystem(field, input);

  // --- 4. WATER SYSTEM ---
  const water = buildWaterSystem(field, input);

  // --- 5. CLIMATE ---
  const wind = pickWind(input.seed);
  buildClimate(field, input, wind);

  // --- 6. BIOMES ---
  buildBiomes(field);
  const forestClusters = extractForestClusters(field, input);

  // Terrain cost surface: shared by settlement accessibility and road routing.
  buildTravelCost(field);

  // --- 7 + 8. SETTLEMENTS, then REALMS grown around their seats ---
  const settled = placeSettlements(field, input, ranges, water.rivers);
  const regions = buildRegions(field, input, settled.seatCells);

  const kingdoms: MapKingdom[] = regions.map((region) => ({
    id: region.id,
    name: region.name,
    color: region.color,
    ruler: region.ruler,
    center: { x: region.center.x, y: region.center.y },
    borderPath: region.borderPath
  }));

  // Every settlement belongs to whichever realm holds its ground.
  const cities = settled.settlements.map((settlement, idx) => {
    const id = field.regionId[settled.cells[idx]];
    return id > 0 && regions[id - 1]
      ? { ...settlement, kingdomId: regions[id - 1].id }
      : settlement;
  });

  // --- 9. ROADS ---
  const roads = buildRoads(field, input, cities, settled.cells);

  // --- 10. LANDMARKS ---
  const pointsOfInterest = buildPointsOfInterest(
    field,
    input,
    ranges,
    cities,
    settled.cells,
    roads
  );

  // --- Renderable geometry ---
  const mountains: Position[] = [];
  const glyphPrng = new PRNG(input.seed ^ 0x1f83d9ab);
  ranges.forEach((range) => {
    range.peaks.forEach((peak, k) => {
      // Taller glyphs for the more prominent summits; the renderer adds a snow
      // cap above height 20, so the highest peaks pick it up automatically.
      const h = 17 + peak.prominence * 13 + glyphPrng.nextFloat(-1.6, 1.6);
      mountains.push({
        id: `${range.id}_p${k}`,
        rangeId: range.id,
        x: peak.x,
        y: peak.y,
        height: Math.round(clamp(h, 14, 32)),
        size: 16
      });
    });
    range.foothills.forEach((hill, k) => {
      mountains.push({
        id: `${range.id}_f${k}`,
        rangeId: range.id,
        x: hill.x,
        y: hill.y,
        height: Math.round(glyphPrng.nextFloat(9, 14)),
        size: 11
      });
    });
  });

  const maxDischarge = water.rivers.reduce((m, r) => Math.max(m, r.discharge), 1);
  const rivers: RiverPath[] = water.rivers.map((seg) => ({
    id: seg.id,
    name: seg.name,
    // Width tracks discharge, so trunks read as bigger than their tributaries.
    width: clamp(1.3 + Math.sqrt(seg.discharge / maxDischarge) * 3.1, 1.2, 4.4),
    points: seg.points.map((p) => ({ x: p.x, y: p.y }))
  }));

  const lakes: LakePath[] = water.lakes
    .filter((lake) => lake.ring.length >= 4)
    .map((lake) => ({ id: lake.id, points: lake.ring.map((p) => ({ x: p.x, y: p.y })) }));

  const forests: ForestCluster[] = forestClusters.map((cluster, idx) => ({
    id: `f_${idx}_${input.seed}`,
    x: cluster.x,
    y: cluster.y,
    radius: cluster.radius,
    count: cluster.count
  }));

  // --- 11. LABELS ---
  const namePrng = new PRNG(input.seed ^ 0x2b1c8f77);
  const seaName = SEA_NAMES[namePrng.nextInt(0, SEA_NAMES.length - 1)];
  const realmName = `${REALM_TITLES[namePrng.nextInt(0, REALM_TITLES.length - 1)]} ${
    REALM_PREFIXES[namePrng.nextInt(0, REALM_PREFIXES.length - 1)]
  }`.toUpperCase();

  const labels = buildLabels(field, input, ranges, water, seaName, realmName);

  return {
    field,
    coastline: coast.mainlandPaths.join(' '),
    islandPaths: coast.islandPaths,
    mountains,
    ranges,
    forests,
    rivers,
    lakes,
    roads,
    cities,
    kingdoms,
    pointsOfInterest,
    labels,
    realmName,
    seaName
  };
}

/** Biomes worth naming on the map, and the wording each one takes. */
const BIOME_LABELS: Partial<Record<BiomeType, string[]>> = {
  desert: ['THE %s WASTES', 'THE %s DESERT', 'THE BURNING %s'],
  'temperate-forest': ['%s WOOD', 'THE %s FOREST', '%s WILDS'],
  'tropical-forest': ['THE %s JUNGLE', 'THE %s CANOPY'],
  taiga: ['THE %s PINES', '%s TAIGA'],
  tundra: ['THE %s BARRENS', 'THE FROZEN %s'],
  wetlands: ['THE %s MARSHES', '%s FENS'],
  savanna: ['THE %s PLAINS', 'THE %s SAVANNA'],
  grassland: ['THE %s DOWNS', 'THE %s VALE']
};

const PLACE_WORDS = [
  'ELDWOOD', 'SABLE', 'GRIMFELL', 'HOLLOW', 'VERDANT', 'ASHEN', 'MOURN',
  'THORNE', 'GLIMMER', 'DUSKEN', 'BARROW', 'WYRM'
];

/**
 * Names the features a reader would expect labelled: the ocean, the realm, the
 * mountain ranges, the largest lakes, and the dominant wildernesses. Each label
 * is positioned from the feature's own geometry rather than a fixed offset.
 */
function buildLabels(
  field: WorldField,
  input: GenerationInput,
  ranges: MountainRange[],
  water: { lakes: { name: string; ring: { x: number; y: number }[] }[] },
  seaName: string,
  realmName: string
): MapLabel[] {
  const { cols, rows, cellW, cellH, land, lakeId, biome } = field;
  const labels: MapLabel[] = [];
  const prng = new PRNG(input.seed ^ 0x6a09e667);

  // Ocean label goes in the most open stretch of water on the map.
  const openness = distanceTransform(cols, rows, (i) => land[i] === 1);
  let bestWater = -1;
  let bestOpen = 0;
  for (let i = 0; i < openness.length; i++) {
    if (land[i] || lakeId[i] > 0) continue;
    if (openness[i] > bestOpen) {
      bestOpen = openness[i];
      bestWater = i;
    }
  }
  if (bestWater >= 0) {
    const c = bestWater % cols;
    const r = (bestWater - c) / cols;
    // Read the water body's shape to decide whether the name runs down or across.
    let vertical = 0;
    let horizontal = 0;
    for (let k = 1; k < 12; k++) {
      if (r - k >= 0 && !land[(r - k) * cols + c]) vertical++;
      if (r + k < rows && !land[(r + k) * cols + c]) vertical++;
      if (c - k >= 0 && !land[r * cols + (c - k)]) horizontal++;
      if (c + k < cols && !land[r * cols + (c + k)]) horizontal++;
    }
    labels.push({
      id: `l_sea_${input.seed}`,
      text: seaName,
      x: (c + 0.5) * cellW,
      y: (r + 0.5) * cellH,
      fontSize: 18,
      rotation: vertical > horizontal * 1.2 ? -90 : 0,
      color: '#3b82f6',
      category: 'ocean',
      stylePreset: 'ocean'
    });
  }

  labels.push({
    id: `l_realm_${input.seed}`,
    text: realmName,
    x: input.width / 2,
    y: input.height * 0.09,
    fontSize: 22,
    category: 'region',
    stylePreset: 'region'
  });

  // One label per range, angled along its ridge.
  const namedRanges = [...ranges].sort((a, b) => b.peaks.length - a.peaks.length).slice(0, 3);
  for (const range of namedRanges) {
    if (range.axis.length < 4) continue;
    const mid = Math.floor(range.axis.length / 2);
    const a = range.axis[Math.max(0, mid - 2)];
    const b = range.axis[Math.min(range.axis.length - 1, mid + 2)];
    let angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    // Keep text upright.
    if (angle > 90) angle -= 180;
    if (angle < -90) angle += 180;
    labels.push({
      id: `l_range_${range.id}`,
      text: range.name.toUpperCase(),
      x: range.axis[mid].x,
      y: range.axis[mid].y - 34,
      fontSize: 12,
      rotation: Math.round(angle),
      category: 'mountain',
      stylePreset: 'mountain'
    });
  }

  for (const lake of water.lakes.slice(0, 2)) {
    if (lake.ring.length < 4) continue;
    let sx = 0;
    let sy = 0;
    for (const p of lake.ring) {
      sx += p.x;
      sy += p.y;
    }
    labels.push({
      id: `l_lake_${labels.length}_${input.seed}`,
      text: lake.name,
      x: sx / lake.ring.length,
      y: sy / lake.ring.length,
      fontSize: 10,
      category: 'water',
      stylePreset: 'river'
    });
  }

  // Name the two largest wildernesses, positioned at their own centre of mass.
  const areas = new Map<BiomeType, { count: number; sx: number; sy: number }>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (!land[i] || lakeId[i] > 0) continue;
      const b = biome[i];
      if (!BIOME_LABELS[b]) continue;
      const entry = areas.get(b) ?? { count: 0, sx: 0, sy: 0 };
      entry.count++;
      entry.sx += (c + 0.5) * cellW;
      entry.sy += (r + 0.5) * cellH;
      areas.set(b, entry);
    }
  }
  const ranked = [...areas.entries()].sort((a, b) => b[1].count - a[1].count);
  const minArea = cols * rows * 0.03;
  for (const [b, entry] of ranked.slice(0, 2)) {
    if (entry.count < minArea) continue;
    const forms = BIOME_LABELS[b]!;
    const text = forms[prng.nextInt(0, forms.length - 1)].replace(
      '%s',
      PLACE_WORDS[prng.nextInt(0, PLACE_WORDS.length - 1)]
    );
    labels.push({
      id: `l_biome_${b}_${input.seed}`,
      text,
      x: entry.sx / entry.count,
      y: entry.sy / entry.count,
      fontSize: 13,
      opacity: 0.75,
      category: 'terrain',
      stylePreset: 'region'
    });
  }

  return labels;
}
