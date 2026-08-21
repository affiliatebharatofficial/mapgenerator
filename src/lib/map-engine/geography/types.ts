import type { BiomeType } from '../../../types/mapGeography';
import type { MapType } from '../../../types/map';
import type { Pt } from './util';

/**
 * The shared world grid. Every generation stage reads from and writes to this
 * single structure, which is what makes later layers respond to earlier ones.
 * All fields are flat arrays indexed `r * cols + c`.
 */
export interface WorldField {
  cols: number;
  rows: number;
  /** Map-space size of one cell. */
  cellW: number;
  cellH: number;
  width: number;
  height: number;
  seaLevel: number;

  /** 1 where the cell is above sea level. */
  land: Uint8Array;
  /** 0..1 elevation. Below `seaLevel` means ocean or lake bed. */
  elevation: Float32Array;
  /** Local gradient magnitude of `elevation`. */
  slope: Float32Array;
  /** Distance in cells to the nearest ocean cell (0 for ocean). */
  coastDist: Float32Array;
  /** 0..1, cold to hot. */
  temperature: Float32Array;
  /** 0..1, arid to wet. */
  moisture: Float32Array;
  /** Upstream cell count from the flow routing pass. */
  flowAccum: Float32Array;
  /** Index of the downhill neighbour, or -1 for a sink. */
  flowTo: Int32Array;
  /** Lake id + 1 for cells covered by standing inland water, else 0. */
  lakeId: Uint16Array;
  /** 1 where a river channel passes through the cell. */
  riverMask: Uint8Array;
  biome: BiomeType[];
  /** Political region id + 1, else 0. */
  regionId: Uint8Array;
  /** Accumulated travel cost surface used by the road router. */
  travelCost: Float32Array;
}

export interface MountainRange {
  id: string;
  name: string;
  /** Ridge axis in map coordinates, ordered along the range. */
  axis: Pt[];
  /** Peaks rendered as mountain glyphs, strongest first. */
  peaks: { x: number; y: number; elevation: number; prominence: number }[];
  foothills: { x: number; y: number; elevation: number }[];
  /** Low points along the ridge where roads can cross. */
  passes: { x: number; y: number; elevation: number }[];
  peakElevation: number;
}

export interface RiverSegment {
  id: string;
  name: string;
  points: Pt[];
  /** Strahler-like order; trunks have the highest value. */
  order: number;
  /** Max flow accumulation along the segment. */
  discharge: number;
  mouth: 'ocean' | 'lake' | 'inland';
  /** Cell index where this river joins its parent, if any. */
  joinsAt?: number;
}

export interface LakeBody {
  id: string;
  name: string;
  ring: Pt[];
  cells: number[];
  area: number;
  elevation: number;
}

export interface SiteCandidate {
  cell: number;
  x: number;
  y: number;
  score: number;
  onCoast: boolean;
  onRiver: boolean;
  onLake: boolean;
  isConfluence: boolean;
  isHarbor: boolean;
  isPass: boolean;
  fertility: number;
}

export interface PoliticalRegion {
  id: string;
  name: string;
  color: string;
  ruler: string;
  seatCell: number;
  center: Pt;
  cells: number[];
  ring: Pt[];
  /** SVG outline of the territory; may contain several subpaths. */
  borderPath: string;
}

export interface GenerationInput {
  seed: number;
  width: number;
  height: number;
  mapType: MapType;
  seaLevel: number;
  landmassAmount: number;
  mountainDensity: number;
  riverDensity: number;
  forestDensity: number;
  settlementCount: number;
  kingdomCount: number;
  /** Hand-authored coastline for the real-world preset map types. */
  presetCoastline?: string;
}
