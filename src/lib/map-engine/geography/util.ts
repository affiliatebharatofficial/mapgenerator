// Shared numeric / geometry helpers for the geography pipeline.
// Everything here is pure and deterministic.

export interface Pt {
  x: number;
  y: number;
}

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Hermite smoothstep between two edges. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 === edge0) return x < edge0 ? 0 : 1;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Maps a value in [-1,1] to [0,1]. */
export const unit = (v: number) => clamp((v + 1) * 0.5, 0, 1);

export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Round coordinates so serialized map data stays compact and stable. */
export const q = (v: number) => Math.round(v * 100) / 100;

// ----------------------------------------------------------------------------
// Grid helpers
// ----------------------------------------------------------------------------

/** Allocates a rows x cols Float32 grid backed by a flat array. */
export function makeField(cols: number, rows: number, fill = 0): Float32Array {
  const f = new Float32Array(cols * rows);
  if (fill !== 0) f.fill(fill);
  return f;
}

/**
 * Chamfer distance transform (two-pass 3x4 kernel).
 * Returns, for each cell, the approximate distance in cells to the nearest cell
 * where `isSource` is true. Cells that are sources get distance 0.
 */
export function distanceTransform(
  cols: number,
  rows: number,
  isSource: (i: number) => boolean
): Float32Array {
  const INF = 1e9;
  const d = new Float32Array(cols * rows);
  for (let i = 0; i < d.length; i++) d[i] = isSource(i) ? 0 : INF;

  const D1 = 1;
  const D2 = Math.SQRT2;

  // Forward pass (top-left to bottom-right)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      let best = d[i];
      if (best === 0) continue;
      if (c > 0) best = Math.min(best, d[i - 1] + D1);
      if (r > 0) best = Math.min(best, d[i - cols] + D1);
      if (r > 0 && c > 0) best = Math.min(best, d[i - cols - 1] + D2);
      if (r > 0 && c < cols - 1) best = Math.min(best, d[i - cols + 1] + D2);
      d[i] = best;
    }
  }
  // Backward pass (bottom-right to top-left)
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = cols - 1; c >= 0; c--) {
      const i = r * cols + c;
      let best = d[i];
      if (best === 0) continue;
      if (c < cols - 1) best = Math.min(best, d[i + 1] + D1);
      if (r < rows - 1) best = Math.min(best, d[i + cols] + D1);
      if (r < rows - 1 && c < cols - 1) best = Math.min(best, d[i + cols + 1] + D2);
      if (r < rows - 1 && c > 0) best = Math.min(best, d[i + cols - 1] + D2);
      d[i] = best;
    }
  }
  return d;
}

/** In-place separable box blur over a field, `passes` times. Approximates a gaussian. */
export function blurField(
  field: Float32Array,
  cols: number,
  rows: number,
  radius = 1,
  passes = 1
): Float32Array {
  let src = field;
  const tmp = new Float32Array(src.length);
  for (let p = 0; p < passes; p++) {
    // horizontal
    for (let r = 0; r < rows; r++) {
      const row = r * cols;
      for (let c = 0; c < cols; c++) {
        let sum = 0;
        let n = 0;
        for (let k = -radius; k <= radius; k++) {
          const cc = c + k;
          if (cc < 0 || cc >= cols) continue;
          sum += src[row + cc];
          n++;
        }
        tmp[row + c] = sum / n;
      }
    }
    // vertical
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        let sum = 0;
        let n = 0;
        for (let k = -radius; k <= radius; k++) {
          const rr = r + k;
          if (rr < 0 || rr >= rows) continue;
          sum += tmp[rr * cols + c];
          n++;
        }
        src[r * cols + c] = sum / n;
      }
    }
  }
  return src;
}

// ----------------------------------------------------------------------------
// Polyline / polygon helpers
// ----------------------------------------------------------------------------

/** Signed area of a closed ring. Positive = clockwise in screen space (y down). */
export function signedArea(ring: Pt[]): number {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const p0 = ring[i];
    const p1 = ring[(i + 1) % ring.length];
    a += p0.x * p1.y - p1.x * p0.y;
  }
  return a / 2;
}

/** Ramer-Douglas-Peucker simplification of an open polyline. */
export function simplify(points: Pt[], tolerance: number): Pt[] {
  if (points.length < 3) return points.slice();

  const sqTol = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop()!;
    let maxSq = 0;
    let index = -1;
    const a = points[first];
    const b = points[last];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;

    for (let i = first + 1; i < last; i++) {
      const p = points[i];
      let sq: number;
      if (lenSq === 0) {
        sq = (p.x - a.x) ** 2 + (p.y - a.y) ** 2;
      } else {
        let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
        t = clamp(t, 0, 1);
        sq = (p.x - (a.x + t * dx)) ** 2 + (p.y - (a.y + t * dy)) ** 2;
      }
      if (sq > maxSq) {
        maxSq = sq;
        index = i;
      }
    }

    if (maxSq > sqTol && index > 0) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  const out: Pt[] = [];
  for (let i = 0; i < points.length; i++) if (keep[i]) out.push(points[i]);
  return out;
}

/** Chaikin corner-cutting subdivision of a closed ring. Removes staircase artifacts. */
export function chaikinClosed(ring: Pt[], iterations = 2): Pt[] {
  let pts = ring;
  for (let it = 0; it < iterations; it++) {
    const next: Pt[] = [];
    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[i];
      const p1 = pts[(i + 1) % pts.length];
      next.push(
        { x: p0.x * 0.75 + p1.x * 0.25, y: p0.y * 0.75 + p1.y * 0.25 },
        { x: p0.x * 0.25 + p1.x * 0.75, y: p0.y * 0.25 + p1.y * 0.75 }
      );
    }
    pts = next;
  }
  return pts;
}

/** Chaikin subdivision of an open polyline, keeping both endpoints anchored. */
export function chaikinOpen(line: Pt[], iterations = 2): Pt[] {
  let pts = line;
  for (let it = 0; it < iterations; it++) {
    if (pts.length < 3) break;
    const next: Pt[] = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      next.push(
        { x: p0.x * 0.75 + p1.x * 0.25, y: p0.y * 0.75 + p1.y * 0.25 },
        { x: p0.x * 0.25 + p1.x * 0.75, y: p0.y * 0.25 + p1.y * 0.75 }
      );
    }
    next.push(pts[pts.length - 1]);
    pts = next;
  }
  return pts;
}

/**
 * Builds a closed SVG path from a ring using midpoint-quadratic smoothing --
 * the same curve construction the existing renderer uses, so output blends in.
 */
export function ringToPath(ring: Pt[]): string {
  if (ring.length < 3) return '';
  const first = ring[0];
  const last = ring[ring.length - 1];
  const startX = q((last.x + first.x) / 2);
  const startY = q((last.y + first.y) / 2);
  let d = `M ${startX} ${startY}`;
  for (let i = 0; i < ring.length; i++) {
    const p0 = ring[i];
    const p1 = ring[(i + 1) % ring.length];
    d += ` Q ${q(p0.x)} ${q(p0.y)}, ${q((p0.x + p1.x) / 2)} ${q((p0.y + p1.y) / 2)}`;
  }
  return d + ' Z';
}

/** Point-in-polygon (ray casting) for a single ring. */
export function pointInRing(x: number, y: number, ring: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].x;
    const yi = ring[i].y;
    const xj = ring[j].x;
    const yj = ring[j].y;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Total length of an open polyline. */
export function pathLength(pts: Pt[]): number {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += dist(pts[i - 1], pts[i]);
  return total;
}

/** Resamples a polyline so vertices are roughly `spacing` apart. */
export function resample(pts: Pt[], spacing: number): Pt[] {
  if (pts.length < 2) return pts.slice();
  const out: Pt[] = [pts[0]];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const seg = dist(a, b);
    if (seg === 0) continue;
    let t = spacing - carry;
    while (t <= seg) {
      out.push({ x: lerp(a.x, b.x, t / seg), y: lerp(a.y, b.y, t / seg) });
      t += spacing;
    }
    carry = (carry + seg) % spacing;
  }
  const tail = pts[pts.length - 1];
  if (dist(out[out.length - 1], tail) > spacing * 0.4) out.push(tail);
  return out;
}

// ----------------------------------------------------------------------------
// Minimal binary min-heap, used by the depression fill and A* router.
// ----------------------------------------------------------------------------

export class MinHeap<T> {
  private items: T[] = [];
  private keys: number[] = [];

  get size(): number {
    return this.items.length;
  }

  push(item: T, key: number): void {
    this.items.push(item);
    this.keys.push(key);
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.keys[parent] <= this.keys[i]) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  pop(): T | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const lastItem = this.items.pop()!;
    const lastKey = this.keys.pop()!;
    if (this.items.length > 0) {
      this.items[0] = lastItem;
      this.keys[0] = lastKey;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let smallest = i;
        if (l < this.keys.length && this.keys[l] < this.keys[smallest]) smallest = l;
        if (r < this.keys.length && this.keys[r] < this.keys[smallest]) smallest = r;
        if (smallest === i) break;
        this.swap(i, smallest);
        i = smallest;
      }
    }
    return top;
  }

  private swap(a: number, b: number): void {
    [this.items[a], this.items[b]] = [this.items[b], this.items[a]];
    [this.keys[a], this.keys[b]] = [this.keys[b], this.keys[a]];
  }
}
