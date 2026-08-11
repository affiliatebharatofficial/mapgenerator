import { WorldService } from '../supabase/worldService';
import { CampaignService } from '../supabase/campaignService';
import { MapService } from '../supabase/mapService';

export interface EntityImageContext {
  entityType: 'world' | 'map' | 'location' | 'npc' | 'faction' | 'adventure' | 'campaign';
  entityId: string;
  title: string;
  summary: string;
  suggestedPrompt: string;
  suggestedStyle: string;
  suggestedAspectRatio: '1:1' | '16:9' | '4:3' | '3:2' | '9:16' | '3:4';
  defaultAssetName: string;
  contextPills: string[];
}

export const ImageGenerationContextService = {
  // ----------------------------------------------------
  // CENTRAL CONTEXT EXTRACTOR & PROMPT BUILDER
  // ----------------------------------------------------
  async getImageGenerationContext(
    entityType: 'world' | 'map' | 'location' | 'npc' | 'faction' | 'adventure' | 'campaign',
    entityId: string,
    customData?: any
  ): Promise<EntityImageContext> {
    if (entityType === 'world') {
      return this.buildWorldContext(entityId, customData);
    } else if (entityType === 'map') {
      return this.buildMapContext(entityId, customData);
    } else if (entityType === 'npc') {
      return this.buildNPCContext(entityId, customData);
    } else if (entityType === 'location') {
      return this.buildLocationContext(entityId, customData);
    } else if (entityType === 'faction') {
      return this.buildFactionContext(entityId, customData);
    } else if (entityType === 'adventure') {
      return this.buildAdventureContext(entityId, customData);
    } else if (entityType === 'campaign') {
      return this.buildCampaignContext(entityId, customData);
    }

    // Default Fallback
    return {
      entityType,
      entityId,
      title: customData?.name || 'Fantasy Entity',
      summary: 'Fantasy artwork asset.',
      suggestedPrompt: `Fantasy artwork for ${customData?.name || 'entity'}, epic digital painting, detailed lighting`,
      suggestedStyle: 'fantasy_illustration',
      suggestedAspectRatio: '16:9',
      defaultAssetName: `${customData?.name || 'Asset'} — Artwork`,
      contextPills: ['Fantasy Artwork']
    };
  },

  // ----------------------------------------------------
  // 1. WORLD CONTEXT (STRICT PRIVACY)
  // ----------------------------------------------------
  async buildWorldContext(worldId: string, customData?: any): Promise<EntityImageContext> {
    const world = customData || (await WorldService.getWorldById(worldId));
    const name = world?.name || 'Fantasy World';
    const description = this.sanitizeText(world?.description || 'A vast realm filled with magic and ancient secrets');
    const style = world?.style || 'dark-fantasy';

    return {
      entityType: 'world',
      entityId: worldId,
      title: name,
      summary: description,
      suggestedPrompt: `Epic wide-angle cinematic book cover painting for fantasy world "${name}". ${description}. Atmospheric lighting, grand scale, highly detailed artstation concept art`,
      suggestedStyle: 'cinematic_concept',
      suggestedAspectRatio: '16:9',
      defaultAssetName: `${name} — World Cover`,
      contextPills: [name, `${style} style`, 'Worldbook Cover']
    };
  },

  // ----------------------------------------------------
  // 2. MAP CONTEXT
  // ----------------------------------------------------
  async buildMapContext(mapId: string, customData?: any): Promise<EntityImageContext> {
    let map = customData;
    if (!map) {
      const maps = await MapService.getUserMaps('user_current');
      map = maps.find((m) => m.id === mapId);
    }
    const name = map?.title || map?.name || 'Fantasy Continent';
    const mapType = map?.map_type || map?.type || 'continent';
    const style = map?.map_style || map?.style || 'parchment';

    return {
      entityType: 'map',
      entityId: mapId,
      title: name,
      summary: `Procedural ${mapType} cartography map artwork illustration.`,
      suggestedPrompt: `Artistic painted fantasy map render of "${name}" (${mapType}). Cartography aesthetics, parchment paper texture, hand-inked borders, geographical features, highly detailed`,
      suggestedStyle: 'watercolor_map',
      suggestedAspectRatio: '16:9',
      defaultAssetName: `${name} — Map Artwork`,
      contextPills: [name, `${mapType} map`, `${style} cartography`]
    };
  },

  // ----------------------------------------------------
  // 3. NPC CONTEXT (STRICT PRIVACY: EXCLUDES GM SECRETS)
  // ----------------------------------------------------
  async buildNPCContext(npcId: string, customData?: any): Promise<EntityImageContext> {
    const npc = customData;
    const name = npc?.name || 'Fantasy Hero';
    const role = npc?.role || 'Knight Warrior';
    const age = npc?.age || 30;
    const appearance = this.sanitizeText(npc?.appearance || npc?.description || 'wearing ornate fantasy armor');
    const personality = this.sanitizeText(npc?.personality || 'determined expression');

    // PRIVACY ENFORCEMENT: Strips secrets, fears, hidden motivations, GM notes
    return {
      entityType: 'npc',
      entityId: npcId,
      title: name,
      summary: `${role}, age ${age}. ${appearance}`,
      suggestedPrompt: `Fantasy character portrait of ${name}, ${role}, age ${age}. Appearance: ${appearance}. Facial expression: ${personality}. Dramatic studio lighting, character concept art, clear focus`,
      suggestedStyle: 'fantasy_illustration',
      suggestedAspectRatio: '3:4',
      defaultAssetName: `${name} — NPC Portrait`,
      contextPills: [name, role, `Age ${age}`]
    };
  },

  // ----------------------------------------------------
  // 4. LOCATION CONTEXT (STRICT PRIVACY)
  // ----------------------------------------------------
  async buildLocationContext(locationId: string, customData?: any): Promise<EntityImageContext> {
    const loc = customData;
    const name = loc?.name || 'Ancient Citadel';
    const type = loc?.type || 'Castle';
    const description = this.sanitizeText(loc?.description || 'Stone masonry surrounded by mountains');

    // PRIVACY ENFORCEMENT: Strips secrets field
    return {
      entityType: 'location',
      entityId: locationId,
      title: name,
      summary: `${type} location. ${description}`,
      suggestedPrompt: `Atmospheric scene of fantasy ${type} location named "${name}". Scenery: ${description}. Dramatic environmental lighting, wide angle view, octane render, 8k concept art`,
      suggestedStyle: 'cinematic_concept',
      suggestedAspectRatio: '16:9',
      defaultAssetName: `${name} — Location Artwork`,
      contextPills: [name, type, 'Location Landscape']
    };
  },

  // ----------------------------------------------------
  // 5. FACTION CONTEXT
  // ----------------------------------------------------
  async buildFactionContext(factionId: string, customData?: any): Promise<EntityImageContext> {
    const fac = customData;
    const name = fac?.name || 'The Royal Guild';
    const type = fac?.type || 'Order';
    const description = this.sanitizeText(fac?.description || 'A guild of noble knights and mages');

    return {
      entityType: 'faction',
      entityId: factionId,
      title: name,
      summary: `${type}. ${description}`,
      suggestedPrompt: `Heraldic coat of arms emblem for fantasy faction "${name}" (${type}). ${description}. Gold and obsidian metalwork seal, intricate symbol, dark aesthetic`,
      suggestedStyle: 'dark_fantasy',
      suggestedAspectRatio: '1:1',
      defaultAssetName: `${name} — Faction Emblem`,
      contextPills: [name, type, 'Coat of Arms']
    };
  },

  // ----------------------------------------------------
  // 6. ADVENTURE CONTEXT (STRICT PRIVACY: EXCLUDES GM SPOILERS)
  // ----------------------------------------------------
  async buildAdventureContext(adventureId: string, customData?: any): Promise<EntityImageContext> {
    const adv = customData;
    const title = adv?.title || 'The Lost Crown';
    const premise = this.sanitizeText(adv?.summary || adv?.premise || 'A dangerous quest into forbidden ruins');
    const tone = adv?.tone || 'epic';

    // PRIVACY ENFORCEMENT: Excludes gmSecrets, clues, hidden solutions
    return {
      entityType: 'adventure',
      entityId: adventureId,
      title,
      summary: premise,
      suggestedPrompt: `Dramatic TTRPG adventure book cover for "${title}". Scene premise: ${premise}. ${tone} atmosphere, ominous lighting, movie poster aesthetic`,
      suggestedStyle: 'dark_fantasy',
      suggestedAspectRatio: '3:4',
      defaultAssetName: `${title} — Adventure Cover`,
      contextPills: [title, `${tone} tone`, 'Adventure Book Cover']
    };
  },

  // ----------------------------------------------------
  // 7. CAMPAIGN CONTEXT (STRICT PRIVACY)
  // ----------------------------------------------------
  async buildCampaignContext(campaignId: string, customData?: any): Promise<EntityImageContext> {
    const campaign = customData || (await CampaignService.getCampaignById(campaignId));
    const name = campaign?.name || 'Chronicles of Eldoria';
    const description = this.sanitizeText(campaign?.description || 'An epic tabletop RPG campaign');
    const genre = campaign?.genre || 'Epic Fantasy';

    // PRIVACY ENFORCEMENT: Excludes private GM notes & private player notes
    return {
      entityType: 'campaign',
      entityId: campaignId,
      title: name,
      summary: `${genre} campaign setting. ${description}`,
      suggestedPrompt: `Grand epic banner illustration for RPG campaign "${name}". ${description}. ${genre} mood, heroic scale digital painting`,
      suggestedStyle: 'fantasy_illustration',
      suggestedAspectRatio: '16:9',
      defaultAssetName: `${name} — Campaign Cover`,
      contextPills: [name, genre, 'Campaign Banner']
    };
  },

  // ----------------------------------------------------
  // SANITIZATION HELPERS
  // ----------------------------------------------------
  sanitizeText(text?: string, maxLength: number = 250): string {
    if (!text) return '';
    // Strip spoilers, GM notes tags, and limit character length
    let clean = text
      .replace(/\[GM SECRET:.*?\]/gi, '')
      .replace(/SECRET:.*?(\.|$)/gi, '')
      .replace(/PRIVATE:.*?(\.|$)/gi, '')
      .replace(/<[^>]*>?/gm, '')
      .trim();

    if (clean.length > maxLength) {
      clean = clean.substring(0, maxLength) + '...';
    }
    return clean;
  }
};
