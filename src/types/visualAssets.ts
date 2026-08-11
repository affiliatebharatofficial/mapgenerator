export type VisualEntityType =
  | 'character'
  | 'kingdom'
  | 'kingdom_emblem'
  | 'city'
  | 'location'
  | 'faction'
  | 'creature'
  | 'world_cover'
  | 'artistic_map_render'
  | 'map_ornament';

export type VisualStyle =
  | 'classic-fantasy'
  | 'dark-fantasy'
  | 'high-fantasy'
  | 'medieval'
  | 'grimdark'
  | 'painterly'
  | 'storybook'
  | 'concept-art'
  | 'old-parchment';

export type VisualFraming =
  | 'headshot'
  | 'bust'
  | 'full-body'
  | 'wide-landscape'
  | 'emblem-close-up';

export type VisualAspectRatio = '1:1' | '16:9' | '4:3' | '3:2' | '9:16' | '3:4';

export interface ImageGenerationRequest {
  entityType: VisualEntityType;
  entityId?: string;
  worldId?: string;
  prompt: string;
  style: VisualStyle | string;
  framing?: VisualFraming;
  aspectRatio: VisualAspectRatio;
  quality?: 'standard' | 'hd';
  customInstructions?: string;
  negativePrompt?: string;
  creditCost: number;
}

export interface AssetUsageRecord {
  id: string;
  assetId: string;
  userId: string;
  entityType: 'world' | 'map' | 'npc' | 'location' | 'adventure' | 'campaign';
  entityId: string;
  entityName?: string;
  usageType: 'cover' | 'portrait' | 'artwork' | 'lore' | 'map_banner';
  createdAt: string;
}

export interface GeneratedImage {
  id: string;
  userId: string;
  name: string;
  source: 'generated' | 'uploaded';
  worldId?: string;
  entityType: VisualEntityType;
  entityId?: string;
  provider: string;
  model: string;
  prompt: string;
  style?: string;
  storagePath: string;
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  isPrimary: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  creditsCharged?: number;
  providerCost?: number;
  tags?: string[];
  status: 'queued' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  updatedAt?: string;
  usages?: AssetUsageRecord[];
}

export interface WorldArtDirection {
  visualStyle: VisualStyle;
  colorMood: 'cold' | 'warm' | 'dark' | 'vibrant' | 'sepia';
  artDirection: 'painterly' | 'realistic' | 'illustrated' | 'concept-art';
  architecture: 'medieval-european' | 'gothic' | 'ancient-elven' | 'dwarven-stone' | 'desert-nomad';
  technology: 'low-fantasy' | 'steampunk' | 'magitech' | 'high-fantasy';
  magicLevel: 'low' | 'moderate' | 'high' | 'wild';
}

export interface WorldCreature {
  id: string;
  worldId: string;
  name: string;
  description: string;
  type: string;
  habitat: string;
  behavior: string;
  lore?: string;
  imageId?: string;
  imageUrl?: string;
  createdAt: string;
}

export type ImageStudioTab = 'generate' | 'library' | 'favorites' | 'styles' | 'recent';

export type ImageStudioFilter =
  | 'all'
  | 'generated'
  | 'uploaded'
  | 'world_artwork'
  | 'map_artwork'
  | 'npc_portrait'
  | 'location_artwork'
  | 'adventure_artwork'
  | 'campaign_artwork';

export type ImageStudioSort = 'newest' | 'oldest' | 'recently_used' | 'favorites';

