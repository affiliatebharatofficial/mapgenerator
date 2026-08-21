import { PRNG } from '../prng';
import { outerRingOf } from './contour';
import { SEA_LEVEL } from './elevation';
import { createNamer, REGION_COLORS } from './names';
import type { GenerationInput, PoliticalRegion, WorldField } from './types';
import { MinHeap, ringToPath, clamp } from './util';

/**
 * Cost of a realm extending its authority into a cell. Rough, high and cold
 * ground is expensive, rivers take a premium, and open sea nearly stops
 * expansion outright -- so borders settle onto ridgelines, watercourses and
 * shorelines by themselves rather than being drawn as straight lines.
 */
function expansionCost(field: WorldField, i: number): number {
  const { land, lakeId, slope, elevation, riverMask, biome } = field;

  if (!land[i] || lakeId[i] > 0) {
    // Narrow straits can be held; open ocean cannot.
    return 11;
  }

  let w = 1;
  w += slope[i] * 150;
  w += Math.max(0, elevation[i] - SEA_LEVEL) * 3.2;
  if (riverMask[i] === 1) w += 5.5;

  switch (biome[i]) {
    case 'mountains':
      w += 16;
      break;
    case 'highlands':
      w += 5;
      break;
    case 'desert':
      w += 4.5;
      break;
    case 'wetlands':
      w += 3.5;
      break;
    case 'tundra':
      w += 3.5;
      break;
    case 'tropical-forest':
      w += 2.6;
      break;
    case 'taiga':
      w += 2.2;
      break;
    case 'temperate-forest':
      w += 1.6;
      break;
    default:
      break;
  }
  return w;
}

const NB4 = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
] as const;

/** Connected sub-groups of a region's cells, largest first. */
function splitComponents(cells: number[], cols: number, rows: number): number[][] {
  const member = new Set(cells);
  const seen = new Set<number>();
  const groups: number[][] = [];

  for (const start of cells) {
    if (seen.has(start)) continue;
    const stack = [start];
    seen.add(start);
    const group: number[] = [];
    while (stack.length > 0) {
      const i = stack.pop()!;
      group.push(i);
      const c = i % cols;
      const r = (i - c) / cols;
      for (const [dc, dr] of NB4) {
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
        const n = nr * cols + nc;
        if (member.has(n) && !seen.has(n)) {
          seen.add(n);
          stack.push(n);
        }
      }
    }
    groups.push(group);
  }

  groups.sort((a, b) => b.length - a.length);
  return groups;
}

/**
 * Grows realms outward from their seats across the finished terrain. Because
 * every step pays the terrain's own cost, the resulting frontier follows
 * mountains, rivers and coasts wherever they are the cheapest place to stop.
 */
export function buildRegions(
  field: WorldField,
  input: GenerationInput,
  seatCells: number[]
): PoliticalRegion[] {
  const { cols, rows, cellW, cellH, land, lakeId, regionId } = field;
  const prng = new PRNG(input.seed ^ 0x0f1e2d3c);
  const namer = createNamer(input.seed ^ 0x5bd1e995);

  regionId.fill(0);
  if (seatCells.length === 0) return [];

  const n = cols * rows;
  const dist = new Float32Array(n).fill(Infinity);
  const owner = new Uint8Array(n);
  const heap = new MinHeap<number>();

  // Realms differ in reach, so the map does not end up with equal-sized slices.
  const vigour = seatCells.map(() => prng.nextFloat(0.72, 1.38));

  seatCells.forEach((cell, idx) => {
    dist[cell] = 0;
    owner[cell] = idx + 1;
    heap.push(cell, 0);
  });

  // A realm reaches only so far before distance defeats administration.
  const maxReach = Math.max(cols, rows) * 1.6;

  while (heap.size > 0) {
    const cur = heap.pop()!;
    const curDist = dist[cur];
    const id = owner[cur];
    if (id === 0) continue;
    if (curDist > maxReach) continue;

    const c = cur % cols;
    const r = (cur - c) / cols;
    for (const [dc, dr] of NB4) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      const nx = nr * cols + nc;
      const step = expansionCost(field, nx) / vigour[id - 1];
      const nd = curDist + step;
      if (nd < dist[nx]) {
        dist[nx] = nd;
        owner[nx] = id;
        heap.push(nx, nd);
      }
    }
  }

  // Only land actually belongs to a realm; the sea between them does not.
  const buckets: number[][] = seatCells.map(() => []);
  for (let i = 0; i < n; i++) {
    if (!land[i] || lakeId[i] > 0) continue;
    const id = owner[i];
    if (id === 0) continue;
    regionId[i] = id;
    buckets[id - 1].push(i);
  }

  const minCells = Math.max(12, Math.round(cols * rows * 0.004));
  const regions: PoliticalRegion[] = [];

  buckets.forEach((cells, idx) => {
    if (cells.length < minCells) {
      // Too small to be a realm: hand its ground back to nobody.
      for (const i of cells) regionId[i] = 0;
      return;
    }

    // A realm split by water still shows a border around each of its parts.
    const groups = splitComponents(cells, cols, rows);
    const keep = groups.filter((g) => g.length >= Math.max(8, cells.length * 0.05));
    const paths: string[] = [];
    let ring = outerRingOf(groups[0], cols, rows, cellW, cellH, 2);
    for (const group of keep) {
      const gRing = outerRingOf(group, cols, rows, cellW, cellH, 2);
      const d = ringToPath(gRing);
      if (d) paths.push(d);
    }
    if (paths.length === 0) return;
    if (ring.length < 4) ring = [];

    // Label anchor: the centroid of the largest contiguous block, nudged toward
    // the seat so the name never lands outside the territory.
    let sx = 0;
    let sy = 0;
    for (const i of groups[0]) {
      const c = i % cols;
      const r = (i - c) / cols;
      sx += (c + 0.5) * cellW;
      sy += (r + 0.5) * cellH;
    }
    const cx = sx / groups[0].length;
    const cy = sy / groups[0].length;

    const { name, ruler } = namer.region();

    regions.push({
      id: `k_${idx}_${input.seed}`,
      name,
      color: REGION_COLORS[idx % REGION_COLORS.length],
      ruler,
      seatCell: seatCells[idx],
      center: { x: cx, y: cy },
      cells,
      ring,
      borderPath: paths.join(' ')
    });
  });

  // Renumber so region ids stay contiguous after any were dropped.
  const remap = new Uint8Array(seatCells.length + 1);
  regions.forEach((region, newIdx) => {
    const oldIdx = Number(region.id.split('_')[1]);
    remap[oldIdx + 1] = newIdx + 1;
  });
  for (let i = 0; i < n; i++) {
    if (regionId[i] > 0) regionId[i] = remap[regionId[i]];
  }

  return regions.map((region, idx) => ({
    ...region,
    id: `k_${idx}_${input.seed}`,
    color: REGION_COLORS[clamp(idx, 0, REGION_COLORS.length - 1)]
  }));
}
