import { PRNG } from '../prng';
import { outerRingOf } from './contour';
import { SEA_LEVEL } from './elevation';
import type { GenerationInput, LakeBody, RiverSegment, WorldField } from './types';
import { chaikinOpen, clamp, MinHeap, simplify, type Pt } from './util';

const RIVER_HEADS = [
  'Silverwash', 'Emberflow', 'Duskwater', 'Greenmere', 'Thornrun', 'Coldspring',
  'Wyrmsblood', 'Amberflow', 'Mistvale', 'Ironrun', 'Sablewater', 'Larkmere',
  'Whitespray', 'Fallowbrook', 'Gloamtide'
];
const RIVER_TAILS = ['River', 'River', 'Water', 'Flow', 'Run', 'Reach'];
const LAKE_HEADS = [
  'Mirrormere', 'Lake Serren', 'The Stillwater', 'Loch Vanyr', 'Lake Ashmoor',
  'Bleakmere', 'Lake Elowen', 'The Drowned Vale', 'Lake Hollow'
];

/** Offsets for the 8 neighbours, with their diagonal distance weights. */
const NB = [
  [-1, -1, Math.SQRT2], [0, -1, 1], [1, -1, Math.SQRT2],
  [-1, 0, 1], [1, 0, 1],
  [-1, 1, Math.SQRT2], [0, 1, 1], [1, 1, Math.SQRT2]
] as const;

export interface HydrologyResult {
  rivers: RiverSegment[];
  lakes: LakeBody[];
}

/**
 * Marks water cells reachable from the map border. Anything unreachable is an
 * enclosed basin, which becomes a lake rather than a hole in the coastline.
 */
function findOcean(field: WorldField): Uint8Array {
  const { cols, rows, land } = field;
  const isOcean = new Uint8Array(cols * rows);
  const queue = new Int32Array(cols * rows);
  let head = 0;
  let tail = 0;

  const push = (i: number) => {
    if (!land[i] && !isOcean[i]) {
      isOcean[i] = 1;
      queue[tail++] = i;
    }
  };
  for (let c = 0; c < cols; c++) {
    push(c);
    push((rows - 1) * cols + c);
  }
  for (let r = 0; r < rows; r++) {
    push(r * cols);
    push(r * cols + cols - 1);
  }

  while (head < tail) {
    const i = queue[head++];
    const c = i % cols;
    const r = (i - c) / cols;
    if (c > 0) push(i - 1);
    if (c < cols - 1) push(i + 1);
    if (r > 0) push(i - cols);
    if (r < rows - 1) push(i + cols);
  }
  return isOcean;
}

/**
 * Priority-flood depression filling. Produces a surface on which every land
 * cell has a strictly downhill path to the sea -- the guarantee that stops
 * rivers from running uphill or terminating in the middle of nowhere.
 * Cells lifted by the fill are the basins where lakes belong.
 */
function fillDepressions(field: WorldField, isOcean: Uint8Array): Float32Array {
  const { cols, rows, elevation } = field;
  const filled = new Float32Array(elevation.length);
  const closed = new Uint8Array(elevation.length);
  const heap = new MinHeap<number>();
  const EPS = 1e-4;

  for (let i = 0; i < elevation.length; i++) {
    filled[i] = elevation[i];
    if (isOcean[i]) {
      closed[i] = 1;
      heap.push(i, elevation[i]);
    }
  }

  while (heap.size > 0) {
    const i = heap.pop()!;
    const c = i % cols;
    const r = (i - c) / cols;
    for (const [dc, dr] of NB) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      const n = nr * cols + nc;
      if (closed[n]) continue;
      closed[n] = 1;
      // Raise the neighbour just enough to drain toward this cell.
      filled[n] = Math.max(elevation[n], filled[i] + EPS);
      heap.push(n, filled[n]);
    }
  }
  return filled;
}

/** D8 steepest-descent flow directions plus upstream area, computed on `filled`. */
function routeFlow(field: WorldField, filled: Float32Array, isOcean: Uint8Array): void {
  const { cols, rows, flowTo, flowAccum } = field;
  flowTo.fill(-1);
  flowAccum.fill(1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (isOcean[i]) continue;
      let best = -1;
      let bestDrop = 0;
      for (const [dc, dr, w] of NB) {
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
        const n = nr * cols + nc;
        const drop = (filled[i] - filled[n]) / w;
        if (drop > bestDrop) {
          bestDrop = drop;
          best = n;
        }
      }
      flowTo[i] = best;
    }
  }

  // Accumulate from high to low so each cell's total is final when used.
  const order: number[] = [];
  for (let i = 0; i < filled.length; i++) if (!isOcean[i]) order.push(i);
  order.sort((a, b) => filled[b] - filled[a]);
  for (const i of order) {
    const to = flowTo[i];
    if (to >= 0) flowAccum[to] += flowAccum[i];
  }
}

/** Connected groups of cells the fill had to raise: closed drainage basins. */
function findLakeBasins(
  field: WorldField,
  filled: Float32Array,
  isOcean: Uint8Array,
  minCells: number
): number[][] {
  const { cols, rows, elevation, land } = field;
  // A meaningful basin holds standing water, not just numerical epsilon.
  const isBasin = new Uint8Array(elevation.length);
  for (let i = 0; i < elevation.length; i++) {
    if (isOcean[i]) continue;
    if (!land[i]) {
      isBasin[i] = 1; // enclosed water from the land mask
    } else if (filled[i] - elevation[i] > 0.006) {
      isBasin[i] = 1;
    }
  }

  const seen = new Uint8Array(elevation.length);
  const groups: number[][] = [];
  const queue = new Int32Array(elevation.length);

  for (let start = 0; start < isBasin.length; start++) {
    if (!isBasin[start] || seen[start]) continue;
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
        if (n >= 0 && isBasin[n] && !seen[n]) {
          seen[n] = 1;
          queue[tail++] = n;
        }
      }
    }
    if (cells.length >= minCells) groups.push(cells);
  }

  groups.sort((a, b) => b.length - a.length);
  return groups;
}

/**
 * Builds the river network from flow accumulation.
 *
 * Each drainage basin is traced from its mouth upstream along the
 * highest-discharge branch, which yields one long trunk plus tributaries that
 * genuinely join it -- rather than a set of unrelated decorative lines.
 */
function traceRivers(
  field: WorldField,
  filled: Float32Array,
  isOcean: Uint8Array,
  input: GenerationInput,
  prng: PRNG
): RiverSegment[] {
  const { cols, rows, cellW, cellH, land, flowTo, flowAccum, lakeId } = field;

  let landCells = 0;
  for (let i = 0; i < land.length; i++) if (land[i]) landCells++;
  if (landCells === 0) return [];

  // Channel threshold controls how far upstream a watercourse stays visible.
  const channelThreshold = clamp(Math.round(landCells / 140), 10, 260);

  // Upstream adjacency, restricted to cells carrying enough water to be a channel.
  const upstream = new Map<number, number[]>();
  for (let i = 0; i < flowTo.length; i++) {
    if (!land[i] || flowAccum[i] < channelThreshold) continue;
    const to = flowTo[i];
    if (to < 0) continue;
    const list = upstream.get(to);
    if (list) list.push(i);
    else upstream.set(to, [i]);
  }

  // Outlets: channel cells that discharge into the sea or a lake.
  const outlets: number[] = [];
  for (let i = 0; i < flowTo.length; i++) {
    if (!land[i] || flowAccum[i] < channelThreshold) continue;
    const to = flowTo[i];
    if (to < 0 || isOcean[to] || lakeId[to] > 0) outlets.push(i);
  }
  outlets.sort((a, b) => flowAccum[b] - flowAccum[a]);

  const basinCount = clamp(2 + Math.round(input.riverDensity * 0.9), 2, 11);
  const chosen = outlets.slice(0, basinCount);

  const claimed = new Set<number>();
  const segments: RiverSegment[] = [];
  const toPt = (i: number): Pt => {
    const c = i % cols;
    const r = (i - c) / cols;
    return { x: (c + 0.5) * cellW, y: (r + 0.5) * cellH };
  };

  let nameIdx = prng.nextInt(0, RIVER_HEADS.length - 1);

  for (const outlet of chosen) {
    if (claimed.has(outlet)) continue;

    // Each entry is a branch waiting to be traced, starting at its junction.
    const branches: { from: number; order: number; joinsAt?: number }[] = [
      { from: outlet, order: 4 }
    ];

    while (branches.length > 0) {
      const branch = branches.shift()!;
      if (claimed.has(branch.from)) continue;

      // Walk upstream, always following the wettest parent.
      const chain: number[] = [];
      let cur = branch.from;
      let guard = 0;
      while (cur >= 0 && guard++ < cols * rows) {
        if (claimed.has(cur)) break;
        claimed.add(cur);
        chain.push(cur);
        const parents = upstream.get(cur);
        if (!parents || parents.length === 0) break;

        let main = -1;
        let mainAccum = -1;
        for (const p of parents) {
          if (claimed.has(p)) continue;
          if (flowAccum[p] > mainAccum) {
            mainAccum = flowAccum[p];
            main = p;
          }
        }
        // Remaining parents become tributaries joining at this cell.
        for (const p of parents) {
          if (p !== main && !claimed.has(p) && flowAccum[p] >= channelThreshold * 1.6) {
            branches.push({ from: p, order: Math.max(1, branch.order - 1), joinsAt: cur });
          }
        }
        if (main < 0) break;
        cur = main;
      }

      if (chain.length < 3) continue;

      // `chain` runs mouth -> source; reverse so points follow the flow.
      chain.reverse();
      let pts = chain.map(toPt);

      // Extend the mouth into its receiving water so the river visibly connects.
      const mouthCell = chain[chain.length - 1];
      const sink = flowTo[mouthCell];
      let mouth: RiverSegment['mouth'] = 'inland';
      if (sink >= 0 && isOcean[sink]) {
        mouth = 'ocean';
        pts.push(toPt(sink));
      } else if (sink >= 0 && lakeId[sink] > 0) {
        mouth = 'lake';
        pts.push(toPt(sink));
      }

      const minLen = Math.max(cellW, cellH) * 7;
      let length = 0;
      for (let k = 1; k < pts.length; k++) {
        length += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
      }
      if (length < minLen) continue;

      // Simplify the staircase from grid routing, then round the corners.
      pts = chaikinOpen(simplify(pts, Math.min(cellW, cellH) * 0.55), 2);

      const discharge = flowAccum[mouthCell];
      segments.push({
        id: `riv_${segments.length}_${input.seed}`,
        name: `${RIVER_HEADS[nameIdx++ % RIVER_HEADS.length]} ${
          RIVER_TAILS[(nameIdx + segments.length) % RIVER_TAILS.length]
        }`,
        points: pts,
        order: branch.order,
        discharge,
        mouth,
        joinsAt: branch.joinsAt
      });
    }
  }

  // Trunks first: the renderer and label layout both favour earlier entries.
  segments.sort((a, b) => b.discharge - a.discharge);
  return segments;
}

/** Runs the whole water system: basins, lakes, flow routing and rivers. */
export function buildWaterSystem(field: WorldField, input: GenerationInput): HydrologyResult {
  const prng = new PRNG(input.seed ^ 0x68e31da4);
  const { cols, rows, cellW, cellH, lakeId } = field;

  const isOcean = findOcean(field);
  const filled = fillDepressions(field, isOcean);

  // --- Lakes ---
  const minLakeCells = Math.max(5, Math.round(cols * rows * 0.0006));
  const basins = findLakeBasins(field, filled, isOcean, minLakeCells);
  const lakes: LakeBody[] = [];

  for (const cells of basins.slice(0, 6)) {
    const ring = outerRingOf(cells, cols, rows, cellW, cellH, 2);
    if (ring.length < 4) continue;

    let elevSum = 0;
    for (const i of cells) elevSum += filled[i];
    const id = lakes.length + 1;
    for (const i of cells) lakeId[i] = id;

    lakes.push({
      id: `lake_${lakes.length}_${input.seed}`,
      name: LAKE_HEADS[(input.seed + lakes.length * 3) % LAKE_HEADS.length],
      ring,
      cells,
      area: cells.length * cellW * cellH,
      elevation: elevSum / cells.length
    });
  }

  // --- Flow + rivers ---
  routeFlow(field, filled, isOcean);
  const rivers = traceRivers(field, filled, isOcean, input, prng);

  // Rasterize channels so later stages can ask "is there fresh water here?".
  field.riverMask.fill(0);
  for (const seg of rivers) {
    for (const p of seg.points) {
      const c = clamp(Math.round(p.x / cellW), 0, cols - 1);
      const r = clamp(Math.round(p.y / cellH), 0, rows - 1);
      field.riverMask[r * cols + c] = 1;
    }
  }

  // Lake surfaces sit at their fill level, so they read as flat water.
  for (const lake of lakes) {
    for (const i of lake.cells) {
      field.elevation[i] = Math.min(field.elevation[i], Math.max(SEA_LEVEL + 0.005, lake.elevation));
    }
  }

  return { rivers, lakes };
}
