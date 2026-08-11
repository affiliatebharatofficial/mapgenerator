export type CartographyStyleId =
  | 'parchment'
  | 'dark-fantasy'
  | 'high-fantasy'
  | 'medieval'
  | 'hand-drawn'
  | 'minimal'
  | 'explorer'
  | 'ancient';

export type MountainSymbolVariant = 'classic-peaks' | 'ink-hatching' | 'minimal-triangles' | 'dark-silhouettes';
export type SettlementSymbolVariant = 'heraldic-crest' | 'double-ring' | 'classic-icon' | 'minimal-dot';
export type BorderVariant = 'solid' | 'dashed' | 'ink-drawn' | 'glowing-rune' | 'disputed-hatch';
export type CoastlineVariant = 'ink-line' | 'double-line' | 'soft-glow' | 'parchment-edge';

export interface CartographicThemeConfig {
  id: CartographyStyleId;
  name: string;
  description: string;
  
  // Terrain & Shading
  terrainColor: string;
  terrainTexture: 'parchment' | 'noise' | 'clean' | 'aged';
  reliefShadingEnabled: boolean;
  hillshadeAngle: number; // e.g. 315 deg NW
  hillshadeStrength: number; // 0 to 1
  contourLinesEnabled: boolean;

  // Water & Coastlines
  oceanColor: string;
  coastColor: string;
  waterPattern: 'flat' | 'parchment' | 'ink' | 'waves';
  coastlineVariant: CoastlineVariant;

  // Features & Symbols
  mountainVariant: MountainSymbolVariant;
  mountainColor: string;
  forestColor: string;
  forestStroke: string;

  // Settlements & Political
  settlementVariant: SettlementSymbolVariant;
  capitalColor: string;
  cityColor: string;
  townColor: string;

  // Borders & Roads
  borderVariant: BorderVariant;
  borderColor: string;
  borderWidth: number;
  roadColor: string;
  roadWidth: number;

  // Typography & Labels
  fontCategory: 'Cinzel' | 'Medieval' | 'Georgia' | 'Inter';
  textColor: string;
  oceanTextColor: string;
  autoCollisionDetection: boolean;
  labelDensity: 'low' | 'medium' | 'high';
}

export interface UserStylePreset {
  id: string;
  userId: string;
  name: string;
  config: CartographicThemeConfig;
  createdAt: string;
}
