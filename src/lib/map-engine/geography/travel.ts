import { SEA_LEVEL } from './elevation';
import type { WorldField } from './types';
import { clamp, MinHeap, type Pt } from './util';
import type { BiomeType } from '../../../types/mapGeography';

/**
 * Cost of moving through one cell of each biome, relative to open grassland.
 * These are the numbers that make roads bend around forests and refuse to climb
 * mountains, so they matter more to the final layout than they might look.
 */
const BIOME_COST: Record<BiomeType, number> = {
  ocean: Infinity,
  coast: 1.05,
  grassland: 1.0,
  savanna: 1.25,
  'temperate-forest': 1.75,
  'tropical-forest': 2.4,
  taiga: 1.95,
  tundra: 1.7,
  desert: 2.0,
  wetlands: 2.8,
  highlands: 2.5,
  mountains: 6.0
};

export const IMPASSABLE = Infinity;

/**
 * Builds the per-cell travel cost surface. Slope dominates: a route through a
 * low saddle is cheap while the same horizontal distance over a ridge is not,
 * which is what pushes roads into valleys and through mountain passes.
 */
export function buildTravelCost(field: WorldField): void {
  const { cols, rows, land, elevation, slope, biome, lakeId, riverMask, coastDist, travelCost } = field;

  for (let i = 0; i < travelCost.length; i++) {
    if (!land[i] || lakeId[i] > 0) {
      travelCost[i] = IMPASSABLE;
      continue;
    }

    let cost = BIOME_COST[biome[i]] ?? 1.4;

    // Climbing is the expensive part of travel, not distance.
    cost += slope[i] * 90;

    // Altitude itself thins the air and the traffic.
    const above = Math.max(0, elevation[i] - SEA_LEVEL);
    cost += above * above * 6;

    // Crossing a watercourse costs a ford or a bridge.
    if (riverMask[i] === 1) cost += 1.6;

    // Coastal shelves are the natural corridors for long-distance travel.
    if (coastDist[i] < 2.5) cost *= 0.9;

    travelCost[i] = cost;
  }
}

const NB8 = [
  [-1, -1, Math.SQRT2], [0, -1, 1], [1, -1, Math.SQRT2],
  [-1, 0, 1], [1, 0, 1],
  [-1, 1, Math.SQRT2], [0, 1, 1], [1, 1, Math.SQRT2]
] as const;

/**
 * Labels each passable cell with its connected landmass id. Lets the road
 * builder skip pairs that no overland route could ever join, instead of running
 * a doomed search across the whole grid.
 */
export function buildReachability(field: WorldField): Int32Array {
  const { cols, rows, travelCost } = field;
  const label = new Int32Array(cols * rows).fill(-1);
  const queue = new Int32Array(cols * rows);
  let next = 0;

  for (let start = 0; start < label.length; start++) {
    if (label[start] !== -1 || !Number.isFinite(travelCost[start])) continue;
    const id = next++;
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    label[start] = id;
    while (head < tail) {
      const i = queue[head++];
      const c = i % cols;
      const r = (i - c) / cols;
      for (const [dc, dr] of NB8) {
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
        const n = nr * cols + nc;
        if (label[n] !== -1 || !Number.isFinite(travelCost[n])) continue;
        label[n] = id;
        queue[tail++] = n;
      }
    }
  }
  return label;
}

export interface PathResult {
  cells: number[];
  cost: number;
}

/**
 * A* over the travel cost surface. Returns the cheapest practical route rather
 * than a straight line, which is the whole point: the road has to look like
 * something a cart could actually take.
 */
export function findRoute(field: WorldField, fromCell: number, toCell: number): PathResult | null {
  const { cols, rows, travelCost } = field;
  const n = cols * rows;
  if (fromCell === toCell) return { cells: [fromCell], cost: 0 };
  if (!Number.isFinite(travelCost[fromCell]) || !Number.isFinite(travelCost[toCell])) return null;

  const gScore = new Float32Array(n).fill(Infinity);
  const cameFrom = new Int32Array(n).fill(-1);
  const closed = new Uint8Array(n);
  const heap = new MinHeap<number>();

  const tc = toCell % cols;
  const tr = (toCell - tc) / cols;
  // Underestimate so A* stays admissible: cheapest possible cell times distance.
  const heuristic = (i: number) => {
    const c = i % cols;
    const r = (i - c) / cols;
    return Math.hypot(c - tc, r - tr) * 0.95;
  };

  gScore[fromCell] = 0;
  heap.push(fromCell, heuristic(fromCell));

  let found = false;
  let guard = 0;
  const maxVisits = n * 4;

  while (heap.size > 0) {
    const cur = heap.pop()!;
    if (closed[cur]) continue;
    closed[cur] = 1;
    if (cur === toCell) {
      found = true;
      break;
    }
    if (++guard > maxVisits) break;

    const c = cur % cols;
    const r = (cur - c) / cols;
    for (const [dc, dr, w] of NB8) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      const nx = nr * cols + nc;
      if (closed[nx]) continue;
      const cellCost = travelCost[nx];
      if (!Number.isFinite(cellCost)) continue;
      const step = ((travelCost[cur] + cellCost) * 0.5) * w;
      const tentative = gScore[cur] + step;
      if (tentative < gScore[nx]) {
        gScore[nx] = tentative;
        cameFrom[nx] = cur;
        heap.push(nx, tentative + heuristic(nx));
      }
    }
  }

  if (!found) return null;

  const cells: number[] = [];
  let walk = toCell;
  while (walk !== -1) {
    cells.push(walk);
    if (walk === fromCell) break;
    walk = cameFrom[walk];
  }
  cells.reverse();
  return { cells, cost: gScore[toCell] };
}

/**
 * How well connected a cell is: the average cost of the terrain around it.
 * Low values mark open ground and natural gaps -- the crossroads where towns
 * grow -- while high values mark terrain traffic avoids.
 */
export function buildAccessibility(field: WorldField): Float32Array {
  const { cols, rows, travelCost } = field;
  const access = new Float32Array(cols * rows);
  const radius = 3;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (!Number.isFinite(travelCost[i])) {
        access[i] = 0;
        continue;
      }
      let sum = 0;
      let count = 0;
      for (let dr = -radius; dr <= radius; dr++) {
        const rr = r + dr;
        if (rr < 0 || rr >= rows) continue;
        for (let dc = -radius; dc <= radius; dc++) {
          const cc = c + dc;
          if (cc < 0 || cc >= cols) continue;
          const v = travelCost[rr * cols + cc];
          // Water is not traversable but a shoreline site is still well placed,
          // so unreachable neighbours count as neutral rather than terrible.
          sum += Number.isFinite(v) ? v : 2.2;
          count++;
        }
      }
      const avg = sum / Math.max(1, count);
      access[i] = clamp(1 - (avg - 1) / 3.2, 0, 1);
    }
  }
  return access;
}

/** Converts a routed cell chain into canvas-space points. */
export function cellsToPoints(field: WorldField, cells: number[]): Pt[] {
  const { cols, cellW, cellH } = field;
  return cells.map((i) => {
    const c = i % cols;
    const r = (i - c) / cols;
    return { x: (c + 0.5) * cellW, y: (r + 0.5) * cellH };
  });
}
