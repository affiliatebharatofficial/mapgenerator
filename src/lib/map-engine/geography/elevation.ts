import { SimplexNoise2D } from '../noise';
import { PRNG } from '../prng';
import type { GenerationInput, MountainRange, WorldField } from './types';
import {
  blurField,
  chaikinOpen,
  clamp,
  distanceTransform,
  resample,
  smoothstep,
  unit,
  type Pt
} from './util';

export const SEA_LEVEL = 0.3;

/** Recomputes the gradient magnitude of the elevation field. */
export function computeSlope(field: WorldField): void {
  const { cols, rows, elevation, slope } = field;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const l = elevation[c > 0 ? i - 1 : i];
      const rt = elevation[c < cols - 1 ? i + 1 : i];
      const up = elevation[r > 0 ? i - cols : i];
      const dn = elevation[r < rows - 1 ? i + cols : i];
      slope[i] = Math.hypot(rt - l, dn - up) * 0.5;
    }
  }
}

/** Guarantees the elevation field agrees with the traced coastline. */
export function clampToMask(field: WorldField): void {
  const { land, elevation } = field;
  for (let i = 0; i < elevation.length; i++) {
    if (land[i]) {
      if (elevation[i] <= SEA_LEVEL) elevation[i] = SEA_LEVEL + 0.006;
    } else if (elevation[i] >= SEA_LEVEL) {
      elevation[i] = SEA_LEVEL - 0.01;
    }
  }
}

/**
 * Builds the base elevation surface from the land mask.
 *
 * Elevation rises with distance from the shore, so coastal plains, inland
 * uplands and mountain interiors all fall out of one field. Everything
 * downstream -- rivers, climate, biomes, roads -- reads this same surface.
 */
export function buildBaseElevation(field: WorldField, input: GenerationInput): void {
  const { cols, rows, land, elevation } = field;
  const detailNoise = new SimplexNoise2D(new PRNG(input.seed ^ 0x7f4a7c15));
  const warpNoise = new SimplexNoise2D(new PRNG(input.seed ^ 0x3b1e5a91));

  // How far inland each land cell is, and how far offshore each water cell is.
  const coastDist = distanceTransform(cols, rows, (i) => land[i] === 0);
  const seaDist = distanceTransform(cols, rows, (i) => land[i] === 1);
  field.coastDist.set(coastDist);

  let maxDist = 1;
  for (let i = 0; i < coastDist.length; i++) {
    if (land[i] && coastDist[i] > maxDist) maxDist = coastDist[i];
  }
  const rampEnd = Math.max(4, maxDist * 0.62);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;

      if (!land[i]) {
        // Sea floor deepens away from the shore.
        elevation[i] = clamp(SEA_LEVEL - 0.03 - seaDist[i] * 0.006, 0.02, SEA_LEVEL - 0.01);
        continue;
      }

      const u = c / cols;
      const v = r / rows;
      const wx = warpNoise.noise(u * 2.2, v * 2.2) * 0.22;
      const wy = warpNoise.noise(u * 2.2 + 4.3, v * 2.2 + 1.7) * 0.22;
      const detail = unit(detailNoise.fbm((u + wx) * 4.4, (v + wy) * 4.4, 5, 0.5, 2.1));

      const inland = smoothstep(0, rampEnd, coastDist[i]);
      elevation[i] = SEA_LEVEL + 0.012 + inland * 0.28 + detail * (0.09 + inland * 0.24);
    }
  }

  blurField(elevation, cols, rows, 1, 1);
  clampToMask(field);
  computeSlope(field);
}

// ----------------------------------------------------------------------------
// Mountain systems
// ----------------------------------------------------------------------------

const RANGE_NAME_HEADS = [
  'Dragonspine', 'Frostcrown', 'Ironhorn', 'Stormwall', 'Ashfell', 'Grimhold',
  'Thundercrag', 'Silverspire', 'Wyrmtooth', 'Blackmere', 'Sunfang', 'Hollowpeak'
];
const RANGE_NAME_TAILS = ['Mountains', 'Range', 'Peaks', 'Heights', 'Ridge', 'Spurs'];

interface RangePlan {
  axis: Pt[];
  width: number;
  amplitude: number;
}

/**
 * Grows mountain ridges along the iso-lines of a low-frequency "orogenic belt"
 * field. Following an iso-line rather than random-walking is what makes ranges
 * read as long, curved, coherent systems instead of scattered peaks.
 */
function planRanges(field: WorldField, input: GenerationInput, prng: PRNG): RangePlan[] {
  const { cols, rows, land, cellW, cellH } = field;
  const beltNoise = new SimplexNoise2D(new PRNG(input.seed ^ 0x6b43a917));

  const belt = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      belt[r * cols + c] = unit(beltNoise.fbm((c / cols) * 2.4, (r / rows) * 2.4, 3, 0.55, 2.0));
    }
  }
  blurField(belt, cols, rows, 2, 1);

  const targetCount = clamp(Math.round(input.mountainDensity * 0.5) + 1, 1, 5);

  const candidates: { i: number; score: number }[] = [];
  for (let r = 2; r < rows - 2; r++) {
    for (let c = 2; c < cols - 2; c++) {
      const i = r * cols + c;
      if (!land[i] || field.coastDist[i] < 3.5) continue;
      candidates.push({ i, score: belt[i] + field.coastDist[i] * 0.012 });
    }
  }
  if (candidates.length === 0) return [];
  candidates.sort((a, b) => b.score - a.score);

  // Draw seeds from the strongest band, spaced so ranges do not stack up.
  const pool = candidates.slice(0, Math.max(8, Math.floor(candidates.length * 0.3)));
  const seeds: number[] = [];
  const minSep = Math.min(cols, rows) * 0.24;
  for (let attempt = 0; attempt < pool.length * 2 && seeds.length < targetCount; attempt++) {
    const pick = pool[prng.nextInt(0, pool.length - 1)].i;
    const pc = pick % cols;
    const pr = (pick - pc) / cols;
    let ok = true;
    for (const s of seeds) {
      const sc = s % cols;
      const sr = (s - sc) / cols;
      if (Math.hypot(pc - sc, pr - sr) < minSep) {
        ok = false;
        break;
      }
    }
    if (ok) seeds.push(pick);
  }
  if (seeds.length === 0) seeds.push(pool[0].i);

  const gradAt = (c: number, r: number) => {
    const cc = clamp(c, 1, cols - 2);
    const rr = clamp(r, 1, rows - 2);
    const i = rr * cols + cc;
    return {
      gx: (belt[i + 1] - belt[i - 1]) * 0.5,
      gy: (belt[i + cols] - belt[i - cols]) * 0.5
    };
  };

  const plans: RangePlan[] = [];

  for (const seedCell of seeds) {
    const sc = seedCell % cols;
    const sr = (seedCell - sc) / cols;
    const maxLen = Math.min(cols, rows) * prng.nextFloat(0.4, 0.75);
    const step = 1.35;
    const halves: Pt[][] = [];

    for (const orientation of [1, -1]) {
      const walk: Pt[] = [];
      let c = sc;
      let r = sr;
      let dirX = 0;
      let dirY = 0;
      let travelled = 0;

      while (travelled < maxLen) {
        const { gx, gy } = gradAt(Math.round(c), Math.round(r));
        // Perpendicular to the gradient runs along the belt's iso-line.
        let tx = -gy;
        let ty = gx;
        const mag = Math.hypot(tx, ty);
        if (mag < 1e-6) {
          tx = 1;
          ty = 0;
        } else {
          tx /= mag;
          ty /= mag;
        }
        if (dirX === 0 && dirY === 0) {
          dirX = tx * orientation;
          dirY = ty * orientation;
        } else {
          if (tx * dirX + ty * dirY < 0) {
            tx = -tx;
            ty = -ty;
          }
          dirX = dirX * 0.62 + tx * 0.38;
          dirY = dirY * 0.62 + ty * 0.38;
          const dm = Math.hypot(dirX, dirY) || 1;
          dirX /= dm;
          dirY /= dm;
        }

        c += dirX * step;
        r += dirY * step;
        travelled += step;

        const ci = Math.round(c);
        const ri = Math.round(r);
        if (ci < 1 || ri < 1 || ci >= cols - 1 || ri >= rows - 1) break;
        const idx = ri * cols + ci;
        // Ranges stop at the sea and fade out where the belt weakens.
        if (!land[idx] || belt[idx] < 0.34) break;

        walk.push({ x: (c + 0.5) * cellW, y: (r + 0.5) * cellH });
      }
      halves.push(walk);
    }

    const axis = [
      ...halves[1].reverse(),
      { x: (sc + 0.5) * cellW, y: (sr + 0.5) * cellH },
      ...halves[0]
    ];
    if (axis.length < 5) continue;

    plans.push({
      axis: chaikinOpen(axis, 1),
      width: Math.min(cellW, cellH) * prng.nextFloat(3.2, 5.2),
      amplitude: prng.nextFloat(0.3, 0.42)
    });
  }

  return plans;
}

/**
 * Applies each range's uplift to the shared elevation field, then derives the
 * peaks, foothills and passes that later stages depend on.
 */
export function buildMountainSystem(field: WorldField, input: GenerationInput): MountainRange[] {
  const prng = new PRNG(input.seed ^ 0x517cc1b7);
  const crestNoise = new SimplexNoise2D(new PRNG(input.seed ^ 0x2545f491));
  const plans = planRanges(field, input, prng);
  const { cols, rows, cellW, cellH, land, elevation } = field;

  const ranges: MountainRange[] = [];
  // Uplift is accumulated with max() so overlapping stamps along one ridge do
  // not pile up into a spike.
  const uplift = new Float32Array(cols * rows);

  plans.forEach((plan, rangeIdx) => {
    const axis = plan.axis;
    const width = plan.width;
    const reach = width * 2.3;

    const arc: number[] = [0];
    for (let i = 1; i < axis.length; i++) {
      arc.push(arc[i - 1] + Math.hypot(axis[i].x - axis[i - 1].x, axis[i].y - axis[i - 1].y));
    }
    const total = arc[arc.length - 1] || 1;

    // Crest profile along the range: highs become summits, lows become passes.
    const crestAt = (t: number) => {
      const n = unit(crestNoise.fbm(t * 3.1 + rangeIdx * 7.3, rangeIdx * 2.1, 3, 0.55, 2.0));
      // Taper the ends so ranges rise out of the land instead of stopping dead.
      const taper = smoothstep(0, 0.16, t) * smoothstep(1, 0.84, t);
      return (0.32 + n * 0.68) * taper;
    };

    // Stamp a radial kernel along the ridge: O(axis x kernel) instead of
    // testing every cell in the bounding box against every axis point.
    const kernelCells = Math.ceil(reach / Math.min(cellW, cellH));
    for (let k = 0; k < axis.length; k++) {
      const strength = crestAt(arc[k] / total);
      if (strength <= 0) continue;
      const ac = Math.round(axis[k].x / cellW);
      const ar = Math.round(axis[k].y / cellH);

      for (let dr = -kernelCells; dr <= kernelCells; dr++) {
        const r = ar + dr;
        if (r < 0 || r >= rows) continue;
        for (let dc = -kernelCells; dc <= kernelCells; dc++) {
          const c = ac + dc;
          if (c < 0 || c >= cols) continue;
          const i = r * cols + c;
          if (!land[i]) continue;
          const d = Math.hypot((c + 0.5) * cellW - axis[k].x, (r + 0.5) * cellH - axis[k].y);
          if (d > reach) continue;
          // Full height along the crest, tailing off into foothills.
          const across = 1 - smoothstep(width * 0.28, reach, d);
          const v = plan.amplitude * strength * across;
          if (v > uplift[i]) uplift[i] = v;
        }
      }
    }

    // --- Peaks, passes and foothills ---
    // Sampling the ridge at a fixed spacing keeps the rendered chain continuous;
    // the crest profile decides which samples are summits and which are gaps.
    const glyphSpacing = Math.max(27, width * 0.85);
    const samples = resample(axis, glyphSpacing);
    const peaks: MountainRange['peaks'] = [];
    const passes: MountainRange['passes'] = [];
    const foothills: MountainRange['foothills'] = [];

    const elevAt = (x: number, y: number) => {
      const cc = clamp(Math.round(x / cellW), 0, cols - 1);
      const rr = clamp(Math.round(y / cellH), 0, rows - 1);
      return elevation[rr * cols + cc] + uplift[rr * cols + cc];
    };

    let travelledFromStart = 0;
    for (let k = 0; k < samples.length; k++) {
      if (k > 0) travelledFromStart += Math.hypot(
        samples[k].x - samples[k - 1].x,
        samples[k].y - samples[k - 1].y
      );
      const t = clamp(travelledFromStart / total, 0, 1);
      const strength = crestAt(t);

      // Nudge glyphs off the exact centreline so the chain is not perfectly collinear.
      const prev = samples[Math.max(0, k - 1)];
      const next = samples[Math.min(samples.length - 1, k + 1)];
      let nx = -(next.y - prev.y);
      let ny = next.x - prev.x;
      const m = Math.hypot(nx, ny) || 1;
      nx /= m;
      ny /= m;
      const jitter = prng.nextFloat(-0.4, 0.4) * width;
      const px = samples[k].x + nx * jitter;
      const py = samples[k].y + ny * jitter;

      const cc = clamp(Math.round(px / cellW), 0, cols - 1);
      const rr = clamp(Math.round(py / cellH), 0, rows - 1);
      if (!land[rr * cols + cc]) continue;

      if (strength > 0.34) {
        peaks.push({ x: px, y: py, elevation: elevAt(px, py), prominence: strength });
      } else if (strength > 0.02) {
        // A dip in the crest is a natural crossing point for roads.
        passes.push({ x: samples[k].x, y: samples[k].y, elevation: elevAt(samples[k].x, samples[k].y) });
      }
    }

    // Foothills sit on the flanks: mountain -> foothill -> plain transition.
    const flankStep = Math.max(2, Math.round(samples.length / 6));
    for (let k = 1; k < samples.length - 1; k += flankStep) {
      const prev = samples[k - 1];
      const next = samples[k + 1];
      let nx = -(next.y - prev.y);
      let ny = next.x - prev.x;
      const m = Math.hypot(nx, ny) || 1;
      nx /= m;
      ny /= m;
      for (const side of [1, -1]) {
        if (prng.next() < 0.35) continue;
        const off = width * prng.nextFloat(1.2, 1.8);
        const fx = samples[k].x + nx * off * side;
        const fy = samples[k].y + ny * off * side;
        const cc = clamp(Math.round(fx / cellW), 0, cols - 1);
        const rr = clamp(Math.round(fy / cellH), 0, rows - 1);
        if (!land[rr * cols + cc]) continue;
        foothills.push({ x: fx, y: fy, elevation: elevAt(fx, fy) });
      }
    }

    if (peaks.length === 0) return;

    let peakElevation = 0;
    for (const p of peaks) peakElevation = Math.max(peakElevation, p.elevation);

    ranges.push({
      id: `mtn_range_${rangeIdx}_${input.seed}`,
      name: `${RANGE_NAME_HEADS[(input.seed + rangeIdx * 5) % RANGE_NAME_HEADS.length]} ${
        RANGE_NAME_TAILS[(input.seed + rangeIdx * 3) % RANGE_NAME_TAILS.length]
      }`,
      axis,
      peaks,
      foothills,
      passes,
      peakElevation
    });
  });

  for (let i = 0; i < elevation.length; i++) {
    if (uplift[i] > 0) elevation[i] = clamp(elevation[i] + uplift[i], 0.02, 1);
  }

  // Smooth the uplift seams, re-assert the coastline, refresh derived fields.
  blurField(elevation, cols, rows, 1, 1);
  clampToMask(field);
  computeSlope(field);

  return ranges;
}
