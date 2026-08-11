import { supabase, isSupabaseConfigured } from '../supabase/client';
import type {
  GeneratedImage,
  AssetUsageRecord,
  ImageStudioFilter,
  ImageStudioSort,
  VisualEntityType
} from '../../types/visualAssets';

const LOCAL_STORAGE_ASSETS_KEY = 'createfantasymap_generated_images_db';
const LOCAL_STORAGE_USAGES_KEY = 'createfantasymap_asset_usages_db';

export const ImageStudioService = {
  // ----------------------------------------------------
  // 1. ASSET FETCHING & QUERYING
  // ----------------------------------------------------
  getStoredAssetsLocal(): GeneratedImage[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_ASSETS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getStoredUsagesLocal(): AssetUsageRecord[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_USAGES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveStoredAssetsLocal(assets: GeneratedImage[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_ASSETS_KEY, JSON.stringify(assets));
    } catch (e) {
      console.warn('[ImageStudioService] LocalStorage save warning:', e);
    }
  },

  saveStoredUsagesLocal(usages: AssetUsageRecord[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_USAGES_KEY, JSON.stringify(usages));
    } catch (e) {
      console.warn('[ImageStudioService] LocalStorage save usages warning:', e);
    }
  },

  async getUserAssets(
    userId: string = 'user_current',
    options?: {
      filter?: ImageStudioFilter;
      sort?: ImageStudioSort;
      search?: string;
      onlyFavorites?: boolean;
    }
  ): Promise<GeneratedImage[]> {
    let assets: GeneratedImage[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('image_assets')
          .select('*')
          .eq('user_id', userId)
          .eq('is_archived', false)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const usages = await this.getAllUsagesForUser(userId);

          assets = data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            name: item.name || 'Untitled Fantasy Art',
            source: item.source || 'generated',
            worldId: item.world_id,
            entityType: (item.entity_type as VisualEntityType) || 'world_cover',
            entityId: item.entity_id,
            provider: item.provider || 'Runware AI',
            model: item.model || 'runware:100@1',
            prompt: item.prompt,
            style: item.style,
            storagePath: item.storage_path,
            url: item.url,
            thumbnailUrl: item.thumbnail_url || item.url,
            width: item.width || 1024,
            height: item.height || 1024,
            isPrimary: false,
            isFavorite: item.is_favorite || false,
            isArchived: item.is_archived || false,
            creditsCharged: item.credits_charged || 5,
            providerCost: item.provider_cost || 0.0015,
            tags: item.tags || [],
            status: 'completed',
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            usages: usages.filter((u) => u.assetId === item.id)
          }));
        } else {
          assets = this.getStoredAssetsLocal();
        }
      } catch {
        assets = this.getStoredAssetsLocal();
      }
    } else {
      assets = this.getStoredAssetsLocal();
    }

    // Attach usages for local assets if needed
    const usages = this.getStoredUsagesLocal();
    assets = assets.map((a) => ({
      ...a,
      usages: a.usages || usages.filter((u) => u.assetId === a.id)
    }));

    // Filter by favorites
    if (options?.onlyFavorites) {
      assets = assets.filter((a) => a.isFavorite);
    }

    // Filter by Category
    if (options?.filter && options.filter !== 'all') {
      const f = options.filter;
      if (f === 'generated') assets = assets.filter((a) => a.source === 'generated');
      else if (f === 'uploaded') assets = assets.filter((a) => a.source === 'uploaded');
      else if (f === 'world_artwork') assets = assets.filter((a) => a.entityType === 'world_cover' || a.entityType === 'kingdom' || a.entityType === 'kingdom_emblem');
      else if (f === 'map_artwork') assets = assets.filter((a) => a.entityType === 'artistic_map_render' || a.entityType === 'map_ornament');
      else if (f === 'npc_portrait') assets = assets.filter((a) => a.entityType === 'character');
      else if (f === 'location_artwork') assets = assets.filter((a) => a.entityType === 'location' || a.entityType === 'city');
      else if (f === 'adventure_artwork') assets = assets.filter((a) => a.entityType === 'creature' || a.entityType === 'faction');
      else if (f === 'campaign_artwork') assets = assets.filter((a) => (a.usages && a.usages.some((u) => u.entityType === 'campaign')) || a.entityType === 'world_cover');
    }

    // Search Query
    if (options?.search && options.search.trim().length > 0) {
      const query = options.search.toLowerCase().trim();
      assets = assets.filter((a) => {
        const nameMatch = a.name.toLowerCase().includes(query);
        const promptMatch = a.prompt.toLowerCase().includes(query);
        const tagMatch = a.tags?.some((t) => t.toLowerCase().includes(query));
        const usageMatch = a.usages?.some((u) => u.entityName?.toLowerCase().includes(query));
        return nameMatch || promptMatch || tagMatch || usageMatch;
      });
    }

    // Sort
    const sort = options?.sort || 'newest';
    if (sort === 'newest') {
      assets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'oldest') {
      assets.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'favorites') {
      assets.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    } else if (sort === 'recently_used') {
      assets.sort((a, b) => (b.usages?.length || 0) - (a.usages?.length || 0));
    }

    return assets;
  },

  // ----------------------------------------------------
  // 2. SAVE & CREATE ASSET
  // ----------------------------------------------------
  async saveAsset(asset: GeneratedImage): Promise<GeneratedImage> {
    const formattedAsset: GeneratedImage = {
      ...asset,
      name: asset.name || this.generateDefaultTitle(asset.prompt),
      source: asset.source || 'generated',
      isFavorite: asset.isFavorite || false,
      isArchived: false,
      tags: asset.tags || [],
      createdAt: asset.createdAt || new Date().toISOString()
    };

    // Save Local
    const localAssets = this.getStoredAssetsLocal();
    const existingIndex = localAssets.findIndex((a) => a.id === formattedAsset.id);
    if (existingIndex >= 0) {
      localAssets[existingIndex] = formattedAsset;
    } else {
      localAssets.unshift(formattedAsset);
    }
    this.saveStoredAssetsLocal(localAssets);

    // Sync to Supabase DB if available
    if (isSupabaseConfigured) {
      try {
        await supabase.from('image_assets').upsert({
          id: formattedAsset.id,
          user_id: formattedAsset.userId,
          name: formattedAsset.name,
          source: formattedAsset.source,
          provider: formattedAsset.provider,
          model: formattedAsset.model,
          prompt: formattedAsset.prompt,
          style: formattedAsset.style || '',
          width: formattedAsset.width,
          height: formattedAsset.height,
          format: 'WEBP',
          storage_path: formattedAsset.storagePath,
          url: formattedAsset.url,
          thumbnail_url: formattedAsset.thumbnailUrl || formattedAsset.url,
          is_favorite: formattedAsset.isFavorite,
          is_archived: false,
          credits_charged: formattedAsset.creditsCharged || 5,
          provider_cost: formattedAsset.providerCost || 0.0015,
          world_id: formattedAsset.worldId || null,
          entity_type: formattedAsset.entityType,
          entity_id: formattedAsset.entityId || null,
          tags: formattedAsset.tags
        });
      } catch (err) {
        console.warn('[ImageStudioService] DB save fallback to local:', err);
      }
    }

    return formattedAsset;
  },

  // ----------------------------------------------------
  // 3. FAVORITE, RENAME & ARCHIVE / DELETE
  // ----------------------------------------------------
  async toggleFavorite(assetId: string, userId: string = 'user_current'): Promise<boolean> {
    const localAssets = this.getStoredAssetsLocal();
    const asset = localAssets.find((a) => a.id === assetId);
    let newFavState = false;

    if (asset) {
      asset.isFavorite = !asset.isFavorite;
      newFavState = asset.isFavorite;
      this.saveStoredAssetsLocal(localAssets);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('image_assets')
          .update({ is_favorite: newFavState })
          .eq('id', assetId);
      } catch {
        // ignore
      }
    }
    return newFavState;
  },

  async renameAsset(assetId: string, newName: string): Promise<void> {
    const localAssets = this.getStoredAssetsLocal();
    const asset = localAssets.find((a) => a.id === assetId);
    if (asset) {
      asset.name = newName.trim();
      asset.updatedAt = new Date().toISOString();
      this.saveStoredAssetsLocal(localAssets);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('image_assets')
          .update({ name: newName.trim(), updated_at: new Date().toISOString() })
          .eq('id', assetId);
      } catch {
        // ignore
      }
    }
  },

  async deleteAsset(assetId: string): Promise<void> {
    // Safe soft deletion / archive
    let localAssets = this.getStoredAssetsLocal();
    localAssets = localAssets.filter((a) => a.id !== assetId);
    this.saveStoredAssetsLocal(localAssets);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('image_assets')
          .update({ is_archived: true })
          .eq('id', assetId);
      } catch {
        // ignore
      }
    }
  },

  // ----------------------------------------------------
  // 4. ENTITY USAGE TRACKING & ATTACHMENT
  // ----------------------------------------------------
  async getAllUsagesForUser(userId: string): Promise<AssetUsageRecord[]> {
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('asset_usages')
          .select('*')
          .eq('user_id', userId);
        if (data) {
          return data.map((d: any) => ({
            id: d.id,
            assetId: d.asset_id,
            userId: d.user_id,
            entityType: d.entity_type,
            entityId: d.entity_id,
            usageType: d.usage_type,
            createdAt: d.created_at
          }));
        }
      } catch {
        // fallback
      }
    }
    return this.getStoredUsagesLocal();
  },

  async attachAssetToEntity(
    assetId: string,
    userId: string,
    entityType: 'world' | 'map' | 'npc' | 'location' | 'faction' | 'adventure' | 'campaign',
    entityId: string,
    entityName?: string,
    usageType: 'cover' | 'portrait' | 'artwork' | 'lore' | 'map_banner' = 'artwork'
  ): Promise<AssetUsageRecord> {
    const usageRecord: AssetUsageRecord = {
      id: `usg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      assetId,
      userId,
      entityType,
      entityId,
      entityName,
      usageType,
      createdAt: new Date().toISOString()
    };

    const usages = this.getStoredUsagesLocal();
    // Prevent duplicate exact attachment
    const existingIdx = usages.findIndex(
      (u) => u.assetId === assetId && u.entityType === entityType && u.entityId === entityId && u.usageType === usageType
    );
    if (existingIdx >= 0) {
      usages[existingIdx] = usageRecord;
    } else {
      usages.push(usageRecord);
    }
    this.saveStoredUsagesLocal(usages);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('asset_usages').upsert({
          id: usageRecord.id,
          asset_id: assetId,
          user_id: userId,
          entity_type: entityType,
          entity_id: entityId,
          usage_type: usageType
        });
      } catch {
        // ignore
      }
    }

    return usageRecord;
  },

  async removeEntityArtwork(
    entityType: 'world' | 'map' | 'npc' | 'location' | 'faction' | 'adventure' | 'campaign',
    entityId: string,
    usageType: string = 'artwork'
  ): Promise<void> {
    // 1. Remove from LocalStorage usages list
    let usages = this.getStoredUsagesLocal();
    usages = usages.filter(
      (u) => !(u.entityType === entityType && u.entityId === entityId && u.usageType === usageType)
    );
    this.saveStoredUsagesLocal(usages);

    // 2. Remove from Supabase DB usages table
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('asset_usages')
          .delete()
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .eq('usage_type', usageType);
      } catch {
        // ignore
      }
    }
  },

  async getAssetUsages(assetId: string): Promise<AssetUsageRecord[]> {
    const all = this.getStoredUsagesLocal();
    return all.filter((u) => u.assetId === assetId);
  },

  // ----------------------------------------------------
  // 5. HELPER UTILITIES
  // ----------------------------------------------------
  generateDefaultTitle(prompt: string): string {
    if (!prompt) return 'Fantasy Artwork';
    // Clean prompt of style suffixes
    const cleanPrompt = prompt.split(',')[0].replace(/\[.*?\]/g, '').trim();
    if (cleanPrompt.length <= 40) return cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);
    return cleanPrompt.substring(0, 40) + '...';
  },

  // Context-aware prompt builders (pruning GM secret notes & private player info)
  buildWorldContextPrompt(world: { name: string; description?: string; style?: string }): string {
    return `Epic cinematic cover artwork for fantasy world "${world.name}". Description: ${world.description || 'a vast fantasy realm with legendary landscapes'}. Atmospheric visual style: ${world.style || 'epic fantasy illustration'}. Detailed painting, 8k resolution.`;
  },

  buildLocationContextPrompt(location: { name: string; type?: string; description?: string; regionName?: string }): string {
    return `Atmospheric view of fantasy ${location.type || 'location'} "${location.name}" located in ${location.regionName || 'the realm'}. Architecture and scenery: ${location.description || 'ancient stone ruins surrounded by majestic nature'}. Wide shot, highly detailed artstation concept art.`;
  },

  buildNPCContextPrompt(npc: { name: string; role?: string; appearance?: string; age?: number; personality?: string }): string {
    // Note: Deliberately omits GM secrets & private motivations
    return `Fantasy character portrait of ${npc.name}, ${npc.role || 'heroic figure'}, age ${npc.age || 30}. Appearance: ${npc.appearance || 'wearing intricate ornate armor'}. Expression: ${npc.personality || 'determined'}. Dramatic lighting, character concept art, clear focal point.`;
  },

  buildAdventureContextPrompt(adventure: { title: string; premise?: string; setting?: string }): string {
    // Note: Deliberately omits GM secret twists & spoilers
    return `Dramatic cover artwork for fantasy adventure titled "${adventure.title}". Scene premise: ${adventure.premise || 'heroes embarking on a perilous quest'}. Setting: ${adventure.setting || 'ancient wilderness'}. Ominous lighting, epic scale digital painting.`;
  },

  buildCampaignContextPrompt(campaign: { name: string; description?: string; system?: string }): string {
    return `Grand campaign banner illustration for "${campaign.name}". World environment: ${campaign.description || 'heroic RPG setting'}. High fantasy RPG campaign aesthetic, cinematic wide angle view.`;
  }
};
