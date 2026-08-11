export type ExportType =
  | 'map'
  | 'worldbook'
  | 'campaign_book'
  | 'character_guide'
  | 'kingdom_guide'
  | 'adventure_book'
  | 'map_pack'
  | 'poster';

export type ExportFormat = 'pdf' | 'png' | 'svg' | 'zip';
export type PrintSize = 'A4' | 'A3' | 'A2' | 'Letter' | 'Legal' | 'Poster' | 'Custom';
export type PrintOrientation = 'portrait' | 'landscape' | 'auto';
export type TemplateStyle = 'classic-fantasy' | 'dark-fantasy' | 'medieval-chronicle' | 'explorers-journal' | 'rpg-campaign' | 'minimal';
export type CampaignEdition = 'gm_edition' | 'player_edition';

export interface CoverConfig {
  title: string;
  subtitle?: string;
  author?: string;
  coverImage?: string;
  fontCategory: 'fantasy-serif' | 'medieval' | 'classic-serif' | 'modern';
  accentColor: string;
}

export interface ExportSelectionConfig {
  includeOverview: boolean;
  includeMainMap: boolean;
  includeRegions: boolean;
  includeKingdoms: boolean;
  includeCities: boolean;
  includeLocations: boolean;
  includeFactions: boolean;
  includeCharacters: boolean;
  includeTimeline: boolean;
  includeLore: boolean;
  includeQuests: boolean;
  includeLegend: boolean;
  includeCompass: boolean;
}

export interface ExportJob {
  id: string;
  userId: string;
  worldId?: string;
  mapId?: string;
  campaignId?: string;
  title: string;
  exportType: ExportType;
  format: ExportFormat;
  templateStyle: TemplateStyle;
  printSize: PrintSize;
  orientation: PrintOrientation;
  campaignEdition?: CampaignEdition;
  storageUrl: string;
  fileSize: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  creditCost: number;
  createdAt: string;
  expiresAt: string;
}

export interface ExportPreset {
  id: string;
  userId: string;
  name: string;
  exportType: ExportType;
  printSize: PrintSize;
  orientation: PrintOrientation;
  templateStyle: TemplateStyle;
}
