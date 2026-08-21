import { chaikinClosed, ringToPath, signedArea, simplify, type Pt } from './util';

/**
 * Traces the boundary of a set of land cells as closed rings.
 *
 * Each land cell contributes one directed edge per side that faces water,
 * oriented so land is always on the right of travel. Chaining those edges
 * end-to-end recovers the outline. At saddle points (two land cells touching
 * only diagonally) we always take the sharpest clockwise turn, which keeps
 * 4-connected components from being merged into one ring.
 */
function traceRings(
  cells: number[],
  cols: number,
  rows: number,
  cellW: number,
  cellH: number
): Pt[][] {
  const inSet = new Set(cells);
  const cornerCols = cols + 1;
  const key = (cc: number, rr: number) => rr * cornerCols + cc;

  // startCornerKey -> list of destination corners
  const outgoing = new Map<number, number[]>();
  const addEdge = (ac: number, ar: number, bc: number, br: number) => {
    const k = key(ac, ar);
    const list = outgoing.get(k);
    if (list) list.push(key(bc, br));
    else outgoing.set(k, [key(bc, br)]);
  };

  const isLand = (c: number, r: number) => {
    if (c < 0 || r < 0 || c >= cols || r >= rows) return false;
    return inSet.has(r * cols + c);
  };

  for (const i of cells) {
    const c = i % cols;
    const r = (i - c) / cols;
    if (!isLand(c, r - 1)) addEdge(c, r, c + 1, r); // north face
    if (!isLand(c + 1, r)) addEdge(c + 1, r, c + 1, r + 1); // east face
    if (!isLand(c, r + 1)) addEdge(c + 1, r + 1, c, r + 1); // south face
    if (!isLand(c - 1, r)) addEdge(c, r + 1, c, r); // west face
  }

  const cornerPt = (k: number): Pt => {
    const cc = k % cornerCols;
    const rr = (k - cc) / cornerCols;
    return { x: cc * cellW, y: rr * cellH };
  };

  const rings: Pt[][] = [];
  // Saddle corners carry more than one outgoing edge, so a corner may need to
  // be used by several rings. Keep sweeping until every edge is consumed.
  const cornerKeys = [...outgoing.keys()];
  let progressed = true;

  while (progressed) {
    progressed = false;
    for (const startKey of cornerKeys) {
      const list = outgoing.get(startKey);
      if (!list || list.length === 0) continue;
      progressed = true;

      const ring: Pt[] = [];
      let current = startKey;
      let inDx = 0;
      let inDy = 0;
      let guard = 0;
      const maxSteps = cells.length * 8 + 64;

      for (;;) {
        if (++guard > maxSteps) break;
        const options = outgoing.get(current);
        if (!options || options.length === 0) break;

        let pickIdx = 0;
        if (options.length > 1 && (inDx !== 0 || inDy !== 0)) {
          // Prefer the sharpest clockwise (right) turn.
          let bestRank = 99;
          let bestZ = -Infinity;
          for (let o = 0; o < options.length; o++) {
            const from = cornerPt(current);
            const to = cornerPt(options[o]);
            const dx = Math.sign(to.x - from.x);
            const dy = Math.sign(to.y - from.y);
            const z = inDx * dy - inDy * dx;
            const dot = inDx * dx + inDy * dy;
            const rank = z > 0 ? 0 : z === 0 && dot > 0 ? 1 : z < 0 ? 2 : 3;
            if (rank < bestRank || (rank === bestRank && z > bestZ)) {
              bestRank = rank;
              bestZ = z;
              pickIdx = o;
            }
          }
        }

        const next = options[pickIdx];
        options.splice(pickIdx, 1);

        const fromPt = cornerPt(current);
        ring.push(fromPt);
        const toPt = cornerPt(next);
        inDx = Math.sign(toPt.x - fromPt.x);
        inDy = Math.sign(toPt.y - fromPt.y);
        current = next;

        if (current === startKey) break;
      }

      if (ring.length > 3) rings.push(ring);
    }
  }

  return rings;
}

/**
 * Smoothed outer boundary of an arbitrary set of cells. Used for lakes and
 * political regions so their outlines follow the same organic treatment as the
 * coastline instead of being drawn as circles.
 */
export function outerRingOf(
  cells: number[],
  cols: number,
  rows: number,
  cellW: number,
  cellH: number,
  smoothing = 2
): Pt[] {
  const rings = traceRings(cells, cols, rows, cellW, cellH);
  let outer: Pt[] | null = null;
  let outerArea = 0;
  for (const ring of rings) {
    const area = signedArea(ring);
    if (area > outerArea) {
      outerArea = area;
      outer = ring;
    }
  }
  if (!outer) return [];
  return chaikinClosed(simplify(outer, Math.min(cellW, cellH) * 0.7), smoothing);
}

export interface CoastlineResult {
  /** Path data for landmasses large enough to be primary geography. */
  mainlandPaths: string[];
  /** Path data for small offshore islands. */
  islandPaths: string[];
  /** Smoothed outer rings of the mainland shapes, for downstream geometry. */
  mainlandRings: Pt[][];
}

/**
 * Converts the land mask into smoothed SVG outlines. Staircase artifacts from
 * the grid are removed by simplification followed by corner-cutting, which
 * leaves an organic shoreline without inventing extra noise.
 */
export function extractCoastlines(
  components: number[][],
  cols: number,
  rows: number,
  cellW: number,
  cellH: number
): CoastlineResult {
  const mainlandPaths: string[] = [];
  const islandPaths: string[] = [];
  const mainlandRings: Pt[][] = [];

  if (components.length === 0) {
    return { mainlandPaths, islandPaths, mainlandRings };
  }

  const largest = components[0].length;
  // Anything under a fraction of the main landmass reads as an offshore island.
  const islandCutoff = Math.max(24, largest * 0.06);
  const tolerance = Math.min(cellW, cellH) * 0.62;

  for (const cells of components) {
    const rings = traceRings(cells, cols, rows, cellW, cellH);
    // Outer boundary is the clockwise ring with the greatest area; the rest are
    // holes (inland water), which the lake stage handles instead.
    let outer: Pt[] | null = null;
    let outerArea = 0;
    for (const ring of rings) {
      const area = signedArea(ring);
      if (area > outerArea) {
        outerArea = area;
        outer = ring;
      }
    }
    if (!outer) continue;

    const smoothed = chaikinClosed(simplify(outer, tolerance), 2);
    const d = ringToPath(smoothed);
    if (!d) continue;

    if (cells.length >= islandCutoff) {
      mainlandPaths.push(d);
      mainlandRings.push(smoothed);
    } else {
      islandPaths.push(d);
    }
  }

  return { mainlandPaths, islandPaths, mainlandRings };
}
