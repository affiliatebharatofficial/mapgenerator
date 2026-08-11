export type GenerationProfile =
  | 'balanced-fantasy'
  | 'realistic-geography'
  | 'island-world'
  | 'archipelago'
  | 'supercontinent'
  | 'mountainous'
  | 'desert-world'
  | 'frozen-world'
  | 'coastal-world'
  | 'dark-fantasy';

export type BiomeType =
  | 'ocean'
  | 'coast'
  | 'tundra'
  | 'taiga'
  | 'temperate-forest'
  | 'tropical-forest'
  | 'grassland'
  | 'savanna'
  | 'desert'
  | 'wetlands'
  | 'mountains'
  | 'highlands';

export type MountainRangeType = 'continental' | 'volcanic' | 'ancient' | 'dramatic';

export interface MountainRangeData {
  id: string;
  name: string;
  ridgePoints: { x: number; y: number }[];
  peakElevation: number;
  rangeType: MountainRangeType;
}

export interface HeightmapGrid {
  cols: number;
  rows: number;
  cellSize: number;
  elevation: number[][]; // 0.0 to 1.0
  slope: number[][];
  rainfall: number[][];
  temperature: number[][];
  biome: BiomeType[][];
}

export interface GeographicHealthIssue {
  id: string;
  severity: 'error' | 'warning' | 'suggestion';
  category: 'geography' | 'civilization' | 'political';
  title: string;
  description: string;
  autoFixAction?: 'reroute_river' | 'relocate_settlement' | 'add_lake' | 'adjust_border';
  affectedId?: string;
}

export interface FeatureLocks {
  lockedCityIds: string[];
  lockedRiverIds: string[];
  lockedMountainIds: string[];
  lockedKingdomIds: string[];
}

export interface AdvancedGeographyConfig {
  seed: number;
  profile: GenerationProfile;
  realismLevel: number; // 0 (Fantasy) to 100 (Realistic)
  landmassAmount: number; // 1 to 10
  mountainDensity: number; // 1 to 10
  riverDensity: number; // 1 to 10
  forestDensity: number; // 1 to 10
  settlementDensity: number; // 1 to 10
  rainfallLevel: number; // 1 to 10
  temperatureLevel: number; // 1 to 10
  seaLevel: number; // 0.0 to 1.0
  rainShadowEffect: boolean;
  fantasyOverrides: {
    magicalRivers: boolean;
    floatingIslands: boolean;
    impossiblePeaks: boolean;
  };
}
