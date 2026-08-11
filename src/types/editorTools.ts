export type ActiveTool =
  | 'select'
  | 'pan'
  | 'terrain_brush'
  | 'eraser'
  | 'mountain'
  | 'forest'
  | 'river'
  | 'road'
  | 'region'
  | 'kingdom_border'
  | 'city'
  | 'location'
  | 'label'
  | 'icon'
  | 'poi_placer'
  | 'marker_placer'
  | 'gm_note'
  | 'artwork_attach';

export type TerrainBrushType =
  | 'plains'
  | 'hills'
  | 'mountains'
  | 'desert'
  | 'snow'
  | 'swamp'
  | 'forest'
  | 'tundra'
  | 'volcanic'
  | 'wasteland';

export type SnapMode = 'none' | 'grid' | 'object';

export type GridType = 'square' | 'hex' | 'coordinates';

export type FrameStyle = 'none' | 'simple' | 'medieval' | 'ornamental' | 'dark-fantasy' | 'minimal';

export type CompassStyle = 'classic' | 'minimal' | 'ornamental' | 'fantasy';

export type ScaleUnit = 'miles' | 'kilometers' | 'leagues';

export interface TerrainCell {
  x: number;
  y: number;
  type: TerrainBrushType;
}

export interface RegionPolygon {
  id: string;
  name: string;
  color: string;
  opacity: number;
  points: { x: number; y: number }[];
}

export interface KingdomBorderPolygon {
  id: string;
  name: string;
  color: string;
  opacity: number;
  worldKingdomId?: string;
  points: { x: number; y: number }[];
}

export interface LegendEntry {
  id: string;
  label: string;
  iconSymbol: string;
}
