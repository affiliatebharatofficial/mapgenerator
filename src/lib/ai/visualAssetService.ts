import type {
  VisualEntityType,
  VisualStyle,
  ImageGenerationRequest,
  GeneratedImage,
  WorldArtDirection,
  WorldCreature
} from '../../types/visualAssets';

const GENERATED_IMAGES_STORAGE_KEY = 'createfantasymap_generated_images_db';
const CREATURES_STORAGE_KEY = 'createfantasymap_creatures_db';

// Curated high quality fantasy artwork proxies for reliable demo presentation
const ARTWORK_PROXIES: Record<string, string[]> = {
  character: [
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop'
  ],
  city: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1000&h=600&fit=crop'
  ],
  location: [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1000&h=600&fit=crop',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&h=600&fit=crop'
  ],
  kingdom: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&h=600&fit=crop'
  ],
  emblem: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop'
  ],
  creature: [
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&h=800&fit=crop'
  ],
  world_cover: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=600&fit=crop'
  ],
  artistic_map: [
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=800&fit=crop'
  ]
};

export const VisualAssetService = {
  // ----------------------------------------------------
  // 1. PROMPT BUILDER ALGORITHM
  // ----------------------------------------------------
  buildEntityPrompt(
    entityType: VisualEntityType,
    entityData: any,
    artDirection?: Partial<WorldArtDirection>,
    customInstructions?: string
  ): string {
    const styleStr = artDirection?.visualStyle || 'dark-fantasy';
    const moodStr = artDirection?.colorMood || 'dark';
    const archStr = artDirection?.architecture || 'gothic medieval';

    let basePrompt = '';

    if (entityType === 'character') {
      basePrompt = `Fantasy portrait of ${entityData.name || 'a character'}, ${entityData.role || 'warrior'}, age ${entityData.age || 30}. Appearance: ${entityData.appearance || entityData.description || 'dramatic clothing'}. Personality: ${entityData.personality || 'determined'}.`;
    } else if (entityType === 'city') {
      basePrompt = `Epic view of fantasy city "${entityData.name || 'City'}" (${entityData.cityType || 'Capital'}). Architecture: ${archStr}. Environment: ${entityData.description || 'coastal harbor'}.`;
    } else if (entityType === 'location') {
      basePrompt = `Atmospheric scene of fantasy location "${entityData.name || 'Ruins'}" (${entityData.type || 'Castle'}). ${entityData.description || 'ancient stone masonry'}.`;
    } else if (entityType === 'kingdom_emblem' || entityType === 'faction') {
      basePrompt = `Heraldic emblem coat of arms for "${entityData.name}", ${entityData.culture || entityData.symbolism || 'gold and obsidian heraldry'}, fantasy seal.`;
    } else if (entityType === 'creature') {
      basePrompt = `Concept art of mythical creature "${entityData.name}", ${entityData.description || 'beast'}, habitat: ${entityData.habitat || 'northern mountains'}.`;
    } else if (entityType === 'world_cover') {
      basePrompt = `Cinematic fantasy book cover for world "${entityData.name || 'Eldoria'}", ${entityData.description || 'five kingdoms'}, grand scale landscape.`;
    } else if (entityType === 'artistic_map_render') {
      basePrompt = `Artistic painted fantasy map render of "${entityData.name || 'Continent'}", ${styleStr} aesthetic, highly detailed geographical features.`;
    } else {
      basePrompt = `Fantasy visual asset for ${entityData.name || 'world item'}.`;
    }

    const negativeConstraints = 'No text, no watermarks, no UI elements, no distorted features, no modern objects.';
    const finalInstructions = customInstructions ? ` Additional details: ${customInstructions}.` : '';

    return `${basePrompt} Style: ${styleStr}, ${moodStr} lighting.${finalInstructions} [Negative: ${negativeConstraints}]`;
  },

  // ----------------------------------------------------
  // 2. IMAGE STORAGE & PERSISTENCE
  // ----------------------------------------------------
  getStoredImages(): GeneratedImage[] {
    const data = localStorage.getItem(GENERATED_IMAGES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveStoredImages(images: GeneratedImage[]) {
    localStorage.setItem(GENERATED_IMAGES_STORAGE_KEY, JSON.stringify(images));
  },

  getImagesForEntity(entityId: string): GeneratedImage[] {
    return this.getStoredImages().filter((img) => img.entityId === entityId);
  },

  getPrimaryImage(entityId: string): GeneratedImage | undefined {
    return this.getImagesForEntity(entityId).find((img) => img.isPrimary);
  },

  setPrimaryImage(imageId: string, entityId: string) {
    const images = this.getStoredImages();
    images.forEach((img) => {
      if (img.entityId === entityId) {
        img.isPrimary = img.id === imageId;
      }
    });
    this.saveStoredImages(images);
  },

  deleteImage(imageId: string) {
    let images = this.getStoredImages();
    images = images.filter((img) => img.id !== imageId);
    this.saveStoredImages(images);
  },

  // ----------------------------------------------------
  // 3. GENERATION ENGINE (Reserves credits, processes artwork)
  // ----------------------------------------------------
  async generateEntityVisual(
    request: ImageGenerationRequest,
    userId = 'user_current'
  ): Promise<GeneratedImage> {
    // 1. Simulate job processing delay
    await new Promise((res) => setTimeout(res, 1200));

    // Select suitable artwork proxy
    const proxyCategory = request.entityType.includes('emblem') ? 'emblem' : request.entityType;
    const pool = ARTWORK_PROXIES[proxyCategory] || ARTWORK_PROXIES.character;
    const selectedUrl = pool[Math.floor(Math.random() * pool.length)];

    // Unmark existing primary images for this entity if new generation completes
    const existing = this.getImagesForEntity(request.entityId || '');
    const isFirst = existing.length === 0;

    const newImage: GeneratedImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      worldId: request.worldId,
      entityType: request.entityType,
      entityId: request.entityId,
      provider: 'DALL-E 3 / Flux Pro',
      model: 'flux-fantasy-v2',
      prompt: request.prompt,
      storagePath: `worlds/${request.worldId || 'default'}/${request.entityType}/${Date.now()}.png`,
      url: selectedUrl,
      thumbnailUrl: selectedUrl,
      width: request.aspectRatio === '16:9' ? 1200 : 800,
      height: request.aspectRatio === '16:9' ? 675 : 800,
      isPrimary: isFirst,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    const images = this.getStoredImages();
    if (isFirst) newImage.isPrimary = true;
    images.unshift(newImage);
    this.saveStoredImages(images);

    return newImage;
  },

  // ----------------------------------------------------
  // 4. CREATURE BESTIARY
  // ----------------------------------------------------
  getCreatures(worldId: string): WorldCreature[] {
    const data = localStorage.getItem(CREATURES_STORAGE_KEY);
    const creatures: WorldCreature[] = data ? JSON.parse(data) : [];
    return creatures.filter((c) => c.worldId === worldId);
  },

  saveCreatures(creatures: WorldCreature[]) {
    localStorage.setItem(CREATURES_STORAGE_KEY, JSON.stringify(creatures));
  },

  async createCreature(worldId: string, creatureData: Omit<WorldCreature, 'id' | 'createdAt'>): Promise<WorldCreature> {
    const data = localStorage.getItem(CREATURES_STORAGE_KEY);
    const allCreatures: WorldCreature[] = data ? JSON.parse(data) : [];

    const newCreature: WorldCreature = {
      ...creatureData,
      id: `crt_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    allCreatures.push(newCreature);
    this.saveCreatures(allCreatures);
    return newCreature;
  }
};
