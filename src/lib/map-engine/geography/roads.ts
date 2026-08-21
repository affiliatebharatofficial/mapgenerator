import { PRNG } from '../prng';
import type { GenerationInput, WorldField } from './types';
import { cellsToPoints, buildReachability, findRoute } from './travel';
import { chaikinOpen, clamp, simplify, type Pt } from './util';
import type { RoadPath, Settlement } from '../../../types/map';

interface RoadNode {
  cell: number;
  x: number;
  y: number;
  /** 3 capital, 2 city/port, 1 town/fortress, 0 village. */
  rank: number;
}

interface Candidate {
  a: number;
  b: number;
  weight: number;
}

function rankOf(type: Settlement['type']): number {
  switch (type) {
    case 'capital':
      return 3;
    case 'city':
    case 'port':
      return 2;
    case 'town':
    case 'fortress':
      return 1;
    default:
      return 0;
  }
}

class UnionFind {
  parent: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(i: number): number {
    while (this.parent[i] !== i) {
      this.parent[i] = this.parent[this.parent[i]];
      i = this.parent[i];
    }
    return i;
  }
  union(a: number, b: number): boolean {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return false;
    this.parent[rb] = ra;
    return true;
  }
}

/**
 * Cheap terrain-aware estimate for an edge, used only to decide which pairs are
 * worth connecting. The chosen edges are routed properly with A* afterwards.
 */
function estimateWeight(field: WorldField, a: RoadNode, b: RoadNode): number {
  const { cols, rows, cellW, cellH, travelCost } = field;
  const straight = Math.hypot(b.x - a.x, b.y - a.y);
  const samples = 16;
  let sum = 0;
  let blocked = 0;
  for (let s = 0; s <= samples; s++) {
    const t = s / samples;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    const c = clamp(Math.round(x / cellW), 0, cols - 1);
    const r = clamp(Math.round(y / cellH), 0, rows - 1);
    const v = travelCost[r * cols + c];
    if (Number.isFinite(v)) sum += v;
    else {
      blocked++;
      sum += 3;
    }
  }
  const avg = sum / (samples + 1);
  // Water in the way means a long detour, so the pair is much less attractive.
  const detour = 1 + (blocked / (samples + 1)) * 2.5;
  return straight * avg * detour;
}

/**
 * Builds the road network.
 *
 * A minimum spanning tree over terrain-weighted edges guarantees every
 * settlement is reachable while keeping the network sparse -- nothing like
 * connecting each place to every other. A handful of extra links between
 * important towns adds the loops a real trade network has.
 */
export function buildRoads(
  field: WorldField,
  input: GenerationInput,
  settlements: Settlement[],
  cells: number[]
): RoadPath[] {
  if (settlements.length < 2) return [];
  const prng = new PRNG(input.seed ^ 0x7c3af1e9);
  const landmass = buildReachability(field);

  const nodes: RoadNode[] = settlements.map((s, i) => ({
    cell: cells[i],
    x: s.x,
    y: s.y,
    rank: rankOf(s.type)
  }));

  // --- Candidate edges: local neighbours, plus every pair of major places ---
  const seen = new Set<string>();
  const candidates: Candidate[] = [];
  const addCandidate = (a: number, b: number) => {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    // No overland route exists between separate landmasses.
    if (landmass[nodes[a].cell] !== landmass[nodes[b].cell]) return;
    candidates.push({ a, b, weight: estimateWeight(field, nodes[a], nodes[b]) });
  };

  const neighbourCount = 4;
  for (let i = 0; i < nodes.length; i++) {
    const order = nodes
      .map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
      .filter((e) => e.j !== i)
      .sort((p, q) => p.d - q.d);
    for (let k = 0; k < Math.min(neighbourCount, order.length); k++) {
      addCandidate(i, order[k].j);
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].rank < 2) continue;
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[j].rank < 2) continue;
      addCandidate(i, j);
    }
  }

  candidates.sort((p, q) => p.weight - q.weight);

  // --- Spanning tree keeps the network connected but thin ---
  const uf = new UnionFind(nodes.length);
  const chosen: Candidate[] = [];
  const rest: Candidate[] = [];
  for (const edge of candidates) {
    if (uf.union(edge.a, edge.b)) chosen.push(edge);
    else rest.push(edge);
  }

  // --- A few redundant links, only between places that would fund a road ---
  const extraBudget = clamp(Math.round(chosen.length * 0.16), 1, 5);
  let extras = 0;
  for (const edge of rest) {
    if (extras >= extraBudget) break;
    if (nodes[edge.a].rank < 2 || nodes[edge.b].rank < 2) continue;
    chosen.push(edge);
    extras++;
  }

  // Lay the most important roads first so lesser ones can join their corridors.
  chosen.sort((p, q) => {
    const rp = nodes[p.a].rank + nodes[p.b].rank;
    const rq = nodes[q.a].rank + nodes[q.b].rank;
    if (rq !== rp) return rq - rp;
    return p.weight - q.weight;
  });

  const roads: RoadPath[] = [];

  for (const edge of chosen) {
    const from = nodes[edge.a];
    const to = nodes[edge.b];
    const route = findRoute(field, from.cell, to.cell);
    // Unreachable overland (a different island): no road, rather than a road
    // drawn across open water.
    if (!route || route.cells.length < 3) continue;

    const raw = cellsToPoints(field, route.cells);
    // Snap the ends to the settlements themselves so roads meet the town marker.
    raw[0] = { x: from.x, y: from.y };
    raw[raw.length - 1] = { x: to.x, y: to.y };

    const smoothed: Pt[] = chaikinOpen(
      simplify(raw, Math.min(field.cellW, field.cellH) * 0.7),
      2
    );

    const lowRank = Math.min(from.rank, to.rank);
    const isFortress =
      settlements[edge.a].type === 'fortress' || settlements[edge.b].type === 'fortress';

    let roadType: NonNullable<RoadPath['roadType']>;
    if (isFortress) roadType = 'military';
    else if (lowRank >= 2) roadType = 'main';
    else if (lowRank === 1) roadType = 'secondary';
    else roadType = 'trail';

    roads.push({
      id: `road_${roads.length}_${input.seed}`,
      roadType,
      width: roadType === 'main' ? 1.6 : roadType === 'military' ? 1.4 : 1.0,
      points: smoothed.map((p) => ({ x: p.x, y: p.y }))
    });

    // Traffic concentrates: discount the corridor so later routes braid onto it
    // instead of cutting a fresh line through the same hills.
    const discount = roadType === 'main' ? 0.45 : 0.7;
    for (const cell of route.cells) {
      field.travelCost[cell] = Math.max(0.35, field.travelCost[cell] * discount);
    }
  }

  // Slight ordering shuffle so the draw order does not mirror the build order.
  for (let i = roads.length - 1; i > 0; i--) {
    const j = prng.nextInt(0, i);
    [roads[i], roads[j]] = [roads[j], roads[i]];
  }

  return roads;
}
