import { SimplexNoise2D } from '../noise';
import { PRNG } from '../prng';
import { SEA_LEVEL } from './elevation';
import type { GenerationInput, WorldField } from './types';
import type { BiomeType } from '../../../types/mapGeography';
import { blurField, clamp, distanceTransform, smoothstep, unit } from './util';

export type WindDir = 'west' | 'east' | 'north' | 'south';

/** Prevailing wind for this world; drives which side of a range gets the rain. */
export function pickWind(seed: number): WindDir {
  const dirs: WindDir[] = ['west', 'east', 'north', 'south'];
  // Westerlies are the common case; the others add variety between worlds.
  const roll = new PRNG(seed ^ 0x1b873593).next();
  if (roll < 0.55) return 'west';
  if (roll < 0.78) return 'east';
  if (roll < 0.9) return 'north';
  return dirs[3];
}

/**
 * Temperature from latitude and elevation, moisture from an air-mass sweep.
 *
 * The sweep carries humidity across the map in the wind direction: it saturates
 * over water and precipitates when the air is forced to climb. That single rule
 * produces wet windward coasts and genuine rain shadows behind mountain ranges,
 * which is what makes desert placement explainable.
 */
export function buildClimate(field: WorldField, input: GenerationInput, wind: WindDir): void {
  const { cols, rows, land, elevation, temperature, moisture, coastDist, lakeId, riverMask } = field;
  const tempNoise = new SimplexNoise2D(new PRNG(input.seed ^ 0x27d4eb2f));
  const wetNoise = new SimplexNoise2D(new PRNG(input.seed ^ 0x165667b1));
  const prng = new PRNG(input.seed ^ 0x85ebca6b);

  // Where this world sits latitudinally, so not every map is temperate.
  const bandCentre = prng.nextFloat(0.3, 0.78);
  const bandSpan = prng.nextFloat(0.5, 0.9);

  for (let r = 0; r < rows; r++) {
    // Top of the map is the colder pole-ward edge.
    const lat = r / (rows - 1);
    const latTemp = bandCentre + (0.5 - lat) * bandSpan;
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const lapse = Math.max(0, elevation[i] - SEA_LEVEL) * 1.15;
      const wobble = tempNoise.fbm((c / cols) * 2.6, (r / rows) * 2.6, 2, 0.5, 2) * 0.07;
      temperature[i] = clamp(latTemp - lapse + wobble, 0, 1);
    }
  }

  // --- Orographic moisture sweep ---
  const horizontal = wind === 'west' || wind === 'east';
  const outer = horizontal ? rows : cols;
  const inner = horizontal ? cols : rows;
  const forward = wind === 'west' || wind === 'north';

  for (let o = 0; o < outer; o++) {
    let humidity = 1;
    let prevElev = 0;
    for (let step = 0; step < inner; step++) {
      const k = forward ? step : inner - 1 - step;
      const i = horizontal ? o * cols + k : k * cols + o;

      if (!land[i] || lakeId[i] > 0) {
        // Open water recharges the air mass.
        humidity = Math.min(1, humidity + 0.16);
        moisture[i] = humidity;
        prevElev = elevation[i];
        continue;
      }

      const rise = Math.max(0, elevation[i] - prevElev);
      // Forced ascent wrings water out of the air; the lee side stays dry.
      const orographic = Math.min(humidity, rise * 6.5);
      // Baseline drying as the air travels over land.
      const overland = humidity * 0.022;
      humidity = clamp(humidity - orographic - overland, 0.02, 1);
      moisture[i] = clamp(humidity + orographic * 0.85, 0, 1);
      prevElev = elevation[i];
    }
  }

  // Local water bodies and coastal proximity add their own humidity.
  const freshDist = distanceTransform(cols, rows, (i) => riverMask[i] === 1 || lakeId[i] > 0);
  for (let i = 0; i < moisture.length; i++) {
    if (!land[i]) continue;
    const coastal = 1 - smoothstep(0, 14, coastDist[i]);
    const fresh = 1 - smoothstep(0, 6, freshDist[i]);
    const wobble = unit(wetNoise.fbm((i % cols) / cols * 3.4, Math.floor(i / cols) / rows * 3.4, 3, 0.5, 2)) - 0.5;
    moisture[i] = clamp(
      moisture[i] * 0.72 + coastal * 0.16 + fresh * 0.16 + wobble * 0.12 + (input.forestDensity - 5) * 0.012,
      0,
      1
    );
  }

  blurField(moisture, cols, rows, 1, 1);
  blurField(temperature, cols, rows, 1, 1);
}

/** Elevation thresholds derived from the actual field, so they adapt per world. */
function reliefBands(field: WorldField): { highland: number; mountain: number } {
  const { land, elevation } = field;
  const vals: number[] = [];
  for (let i = 0; i < elevation.length; i++) if (land[i]) vals.push(elevation[i]);
  if (vals.length === 0) return { highland: 0.6, mountain: 0.75 };
  vals.sort((a, b) => a - b);
  const at = (p: number) => vals[clamp(Math.floor(vals.length * p), 0, vals.length - 1)];
  return { highland: at(0.82), mountain: at(0.93) };
}

/**
 * Classifies each land cell from elevation, temperature and moisture, then
 * applies a majority filter so biomes form contiguous regions rather than
 * speckle. No biome is placed directly; every one is a consequence of climate.
 */
export function buildBiomes(field: WorldField): void {
  const { cols, rows, land, elevation, temperature, moisture, slope, lakeId, riverMask, biome } = field;
  const { highland, mountain } = reliefBands(field);

  for (let i = 0; i < land.length; i++) {
    if (!land[i]) {
      biome[i] = 'ocean';
      continue;
    }
    if (lakeId[i] > 0) {
      biome[i] = 'ocean';
      continue;
    }

    const e = elevation[i];
    const t = temperature[i];
    const m = moisture[i];

    if (e >= mountain) {
      biome[i] = 'mountains';
    } else if (e >= highland) {
      biome[i] = t < 0.3 ? 'tundra' : 'highlands';
    } else if (t < 0.18) {
      biome[i] = 'tundra';
    } else if (t < 0.34) {
      biome[i] = m > 0.4 ? 'taiga' : 'tundra';
    } else if (m < 0.2) {
      biome[i] = 'desert';
    } else if (m < 0.34) {
      biome[i] = t > 0.66 ? 'savanna' : 'grassland';
    } else if (m > 0.74 && slope[i] < 0.012 && e < SEA_LEVEL + 0.08 && (riverMask[i] === 1 || m > 0.85)) {
      biome[i] = 'wetlands';
    } else if (m > 0.62) {
      biome[i] = t > 0.72 ? 'tropical-forest' : 'temperate-forest';
    } else {
      biome[i] = 'grassland';
    }
  }

  // Majority smoothing: removes single-cell speckle, keeps region boundaries irregular.
  for (let pass = 0; pass < 2; pass++) {
    const snapshot = biome.slice();
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        const i = r * cols + c;
        if (!land[i] || lakeId[i] > 0) continue;
        const counts = new Map<BiomeType, number>();
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const n = (r + dr) * cols + (c + dc);
            if (!land[n] || lakeId[n] > 0) continue;
            const b = snapshot[n];
            counts.set(b, (counts.get(b) ?? 0) + (dr === 0 && dc === 0 ? 2 : 1));
          }
        }
        let bestBiome = snapshot[i];
        let bestCount = 0;
        for (const [b, n] of counts) {
          if (n > bestCount) {
            bestCount = n;
            bestBiome = b;
          }
        }
        biome[i] = bestBiome;
      }
    }
  }

  // Coastal strip is labelled last so it always hugs the actual shoreline.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (!land[i] || lakeId[i] > 0) continue;
      if (biome[i] === 'mountains' || biome[i] === 'highlands') continue;
      const touchesSea =
        (c > 0 && !land[i - 1]) ||
        (c < cols - 1 && !land[i + 1]) ||
        (r > 0 && !land[i - cols]) ||
        (r < rows - 1 && !land[i + cols]);
      if (touchesSea && biome[i] === 'grassland') biome[i] = 'coast';
    }
  }
}

export interface ForestCluster {
  x: number;
  y: number;
  radius: number;
  count: number;
}

const FOREST_BIOMES = new Set<BiomeType>(['temperate-forest', 'tropical-forest', 'taiga']);

/**
 * Turns forest biome regions into overlapping clusters. The renderer draws each
 * cluster as an irregular blob, so overlapping them makes the union read as one
 * continuous woodland with a ragged edge instead of a row of green circles.
 */
export function extractForestClusters(
  field: WorldField,
  input: GenerationInput
): ForestCluster[] {
  const { cols, rows, cellW, cellH, biome, land } = field;
  const isForest = new Uint8Array(cols * rows);
  for (let i = 0; i < isForest.length; i++) {
    if (land[i] && FOREST_BIOMES.has(biome[i])) isForest[i] = 1;
  }

  // Distance to the edge of the wooded area: bigger clusters go in the interior.
  const inner = distanceTransform(cols, rows, (i) => isForest[i] === 0);

  // Connected components so separate woodlands stay separate.
  const seen = new Uint8Array(isForest.length);
  const queue = new Int32Array(isForest.length);
  const components: number[][] = [];
  for (let start = 0; start < isForest.length; start++) {
    if (!isForest[start] || seen[start]) continue;
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
      const nbrs = [c > 0 ? i - 1 : -1, c < cols - 1 ? i + 1 : -1, r > 0 ? i - cols : -1, r < rows - 1 ? i + cols : -1];
      for (const n of nbrs) {
        if (n >= 0 && isForest[n] && !seen[n]) {
          seen[n] = 1;
          queue[tail++] = n;
        }
      }
    }
    components.push(cells);
  }
  components.sort((a, b) => b.length - a.length);

  const maxClusters = clamp(8 + input.forestDensity * 3, 10, 44);
  const minComponent = Math.max(6, Math.round(cols * rows * 0.0009));
  const clusters: ForestCluster[] = [];
  const taken = new Uint8Array(isForest.length);

  for (const cells of components) {
    if (clusters.length >= maxClusters) break;
    if (cells.length < minComponent) continue;

    // Greedy: repeatedly take the deepest untouched cell and cover its area.
    const sorted = [...cells].sort((a, b) => inner[b] - inner[a]);
    for (const i of sorted) {
      if (clusters.length >= maxClusters) break;
      if (taken[i]) continue;

      const c = i % cols;
      const r = (i - c) / cols;
      // Radius follows how deep into the wood this point is, bounded so a huge
      // forest becomes several overlapping clusters rather than one big disc.
      const depth = inner[i];
      const radiusCells = clamp(depth * 1.25, 2.2, 7.5);
      const radius = radiusCells * Math.min(cellW, cellH);

      clusters.push({
        x: (c + 0.5) * cellW,
        y: (r + 0.5) * cellH,
        radius,
        count: Math.round(8 + radiusCells * 2)
      });

      // Mark the covered area, leaving overlap so neighbours merge visually.
      const mark = Math.ceil(radiusCells * 0.82);
      for (let dr = -mark; dr <= mark; dr++) {
        for (let dc = -mark; dc <= mark; dc++) {
          const nc = c + dc;
          const nr = r + dr;
          if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
          if (Math.hypot(dc, dr) <= mark) taken[nr * cols + nc] = 1;
        }
      }
    }
  }

  return clusters;
}
