export type SelectionFilter =
  | 'all'
  | 'cities'
  | 'rivers'
  | 'roads'
  | 'labels'
  | 'kingdoms'
  | 'locations'
  | 'mountains';

export type TerrainSculptMode = 'raise' | 'lower' | 'smooth' | 'flatten';
export type BrushShape = 'circle' | 'square';
export type AlignmentMode = 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v';

export interface AIOperation {
  id: string;
  type: 'add_settlement' | 'move_settlement' | 'delete_entity' | 'rename_entity' | 'add_road' | 'add_river';
  entityCategory: 'city' | 'river' | 'road' | 'kingdom' | 'location' | 'label';
  description: string;
  params: Record<string, any>;
  approved: boolean;
}

export interface PrecisionEditorState {
  selectedObjectIds: string[];
  selectionFilter: SelectionFilter;
  sculptMode: TerrainSculptMode;
  brushSize: number;
  brushStrength: number;
  brushShape: BrushShape;
  lockedObjectIds: string[];
}
