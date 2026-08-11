import type {
  TerrainCell,
  RegionPolygon,
  KingdomBorderPolygon,
  GridType,
  FrameStyle,
  CompassStyle,
  ScaleUnit,
  LegendEntry
} from './editorTools';

export type MapType = 'continent' | 'island' | 'archipelago' | 'kingdom' | 'region';
export type MapStyle = 'parchment' | 'dark-fantasy' | 'clean' | 'hand-drawn' | 'rpg';

export interface Position {
  x: number;
  y: number;
  id?: string;
  height?: number;
  size?: number;
}

export interface Settlement {
  id: string;
  name: string;
  type: 'capital' | 'city' | 'town' | 'village' | 'port' | 'fortress';
  x: number;
  y: number;
  population?: number;
  kingdomId?: string;
  worldCityId?: string;
  description?: string;
}

export interface MapKingdom {
  id: string;
  name: string;
  color: string;
  ruler?: string;
  worldKingdomId?: string;
  description?: string;
  center?: Position;
  borderPath?: string;
}

export interface MapLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  rotation?: number;
  isCurved?: boolean;
  curvePathId?: string;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  opacity?: number;
  category?: string;
  stylePreset?: 'region' | 'kingdom' | 'city' | 'river' | 'mountain' | 'ocean';
}

export interface PointOfInterest {
  id: string;
  name: string;
  type: 'ruins' | 'dungeon' | 'tower' | 'castle' | 'shrine' | 'mine' | 'temple' | 'battlefield' | 'magical-site' | 'dragon-lair' | 'dragon' | 'magical' | 'camp';
  x: number;
  y: number;
  worldLocationId?: string;
  description?: string;
}

export interface RiverPath {
  id: string;
  name?: string;
  width: number;
  color?: string;
  points: Position[];
  path?: Position[];
}

export interface RoadPath {
  id: string;
  roadType?: 'main' | 'secondary' | 'trail' | 'military';
  width?: number;
  color?: string;
  points?: Position[];
  path?: Position[];
}

export interface LayerState {
  visible: boolean;
  locked: boolean;
  opacity: number;
  orderIndex: number;
}

export interface MapLayers {
  terrain: boolean;
  elevation?: boolean;
  water?: boolean;
  mountains: boolean;
  forests: boolean;
  rivers: boolean;
  lakes?: boolean;
  roads: boolean;
  regions?: boolean;
  cities: boolean;
  kingdoms: boolean;
  locations?: boolean;
  labels: boolean;
  decorations?: boolean;
  grid: boolean;
  compass: boolean;
  legend: boolean;
  coordinates?: boolean;
  private_gm?: boolean;
  user_artwork?: boolean;
}

export interface AdvancedLayersState {
  [layerKey: string]: LayerState;
}

export interface ForestCluster {
  id?: string;
  x: number;
  y: number;
  radius: number;
  radiusX?: number;
  radiusY?: number;
  count: number;
}

export interface LakePath {
  id: string;
  points: Position[];
}

export interface FantasyMap {
  id: string;
  seed: number;
  name: string;
  type: MapType;
  style: MapStyle;
  width: number;
  height: number;
  viewBox: { x: number; y: number; width: number; height: number };
  
  // Natural Features
  coastline: string;
  coastlinePath?: string;
  islandPaths?: string[];
  mountains: Position[];
  forests: ForestCluster[];
  rivers: RiverPath[];
  roads?: RoadPath[];
  lakes?: LakePath[];
  terrainCells?: TerrainCell[];
  customRegions?: RegionPolygon[];
  kingdomBorders?: KingdomBorderPolygon[];

  // Political & Structural Features
  cities: Settlement[];
  kingdoms: MapKingdom[];
  labels: MapLabel[];
  pointsOfInterest: PointOfInterest[];

  // Cartography Ornaments & Layout
  compassPosition?: Position;
  compassStyle?: CompassStyle;
  compassRotation?: number;
  scaleBarPosition?: Position;
  scaleUnit?: ScaleUnit;
  legendPosition?: Position;
  legendEntries?: LegendEntry[];
  titleBannerText?: string;
  mapFrameStyle?: FrameStyle;
  gridType?: GridType;
  snapToGrid?: boolean;

  // Metadata
  worldId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratorConfig {
  name?: string;
  seed: number;
  type: MapType;
  style: MapStyle;
  width: number;
  height: number;
  mountainDensity: number;
  forestDensity: number;
  riverDensity: number;
  settlementCount: number;
  kingdomCount: number;
  showDeserts: boolean;
  showSwamps: boolean;
  showSnow: boolean;
}

export interface SelectedObjectRef {
  type: 'city' | 'kingdom' | 'label' | 'poi' | 'river' | 'road' | 'region' | 'kingdom_border' | 'gm_note' | 'custom_marker' | 'user_artwork' | 'mountain' | 'forest';
  id: string;
}

// Type aliases for generator compatibility
export type Mountain = Position;
export type Forest = ForestCluster;
export type River = RiverPath;
export type Lake = LakePath;
export type City = Settlement;
export type Kingdom = MapKingdom;
export type BiomeRegion = RegionPolygon;
