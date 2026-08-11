import type {
  AdventureType,
  AdventureLength,
  StoryTone,
  AdventureOutline,
  GroundedAdventurePackage,
  QuestObjective
} from '../../types/adventure';
import { WorldService } from '../supabase/worldService';
import { WorldBibleService } from '../supabase/worldBibleService';

export interface AdventureGenerationOptions {
  worldId: string;
  locationName?: string;
  type: AdventureType;
  tone: StoryTone;
  length: AdventureLength;
  factions?: string[];
  partyLevel?: number;
}

export const AdventureEngine = {
  // ----------------------------------------------------
  // 1. GENERATE STORY OUTLINE FIRST
  // ----------------------------------------------------
  async generateStoryOutline(opts: AdventureGenerationOptions): Promise<AdventureOutline> {
    const world = await WorldService.getWorldById(opts.worldId);
    const worldName = world?.name || 'Aenor';
    const loc = opts.locationName || 'Silverkeep';

    return {
      premise: `In the realm of ${worldName}, rising tensions around ${loc} threaten to break the fragile peace.`,
      mainConflict: `Competing regional interests clash over control of ancient resources near ${loc}.`,
      mainNpcs: ['Queen Elara', 'High Commander Varik', 'Archmage Kaelen'],
      locations: [loc, 'Ashen Ruins', 'Whispering Woods'],
      factions: ['The Crown Guard', 'Iron Syndicate', 'Shadow Circle'],
      beats: [
        { title: 'The Hook', summary: `A urgent courier arrives in ${loc} with sealed documents.` },
        { title: 'The Investigation', summary: `Uncover hidden clues left in the Ashen Ruins.` },
        { title: 'The Confrontation', summary: `Confront the syndicate leader before the ritual succeeds.` },
        { title: 'The Climax & Resolution', summary: `Decide the fate of the captive envoy and claim the arcana.` }
      ],
      potentialEndings: [
        'Alliance restored with the Crown (+20 Crown Standing)',
        'Syndicate takes control of the region (Unlocks Rebel Path)',
        'Ancient seal broken (World Flag: Shadow Gate Unlocked)'
      ]
    };
  },

  // ----------------------------------------------------
  // 2. GENERATE FULL GROUNDED ADVENTURE PACKAGE
  // ----------------------------------------------------
  async generateFullAdventure(opts: AdventureGenerationOptions, outline: AdventureOutline): Promise<GroundedAdventurePackage> {
    const objectives: QuestObjective[] = [
      {
        id: 'obj_1',
        title: `Investigate rumors in ${opts.locationName || 'Silverkeep'}`,
        description: 'Speak with local tavern keepers and guards to identify who intercepted the royal envoy.',
        type: 'talk_npc',
        isPrimary: true,
        status: 'revealed',
        gmSecrets: 'The tavern keeper is secretly a paid informant for the Iron Syndicate.',
        branches: [
          {
            id: 'br_1',
            title: 'Bribe Informant',
            choiceText: 'Offer 50 gold coins for immediate intel.',
            type: 'choice',
            targetObjectiveId: 'obj_2',
            consequences: { reputationChanges: { IronSyndicate: -5 } }
          }
        ]
      },
      {
        id: 'obj_2',
        title: 'Explore the Ashen Ruins',
        description: 'Navigate the trapped catacombs beneath the ruins to locate the stolen treaty.',
        type: 'investigate',
        isPrimary: true,
        status: 'hidden',
        gmSecrets: 'A hidden wall at area 4 contains the secret vault key.',
        dependencies: ['obj_1']
      }
    ];

    return {
      id: `adv_${Date.now()}`,
      worldId: opts.worldId,
      title: `${outline.premise.substring(0, 30)}...`,
      summary: outline.mainConflict,
      type: opts.type,
      tone: opts.tone,
      length: opts.length,
      outline,
      objectives,
      clues: [
        {
          id: 'clue_1',
          title: 'Burned Wax Seal',
          foundAtLocation: 'Tavern Floor',
          pointsToward: 'Royal Envoy',
          actualMeaning: 'Proves the treaty was signed under duress.',
          isDiscovered: false
        }
      ],
      gmSecrets: [
        'High Commander Varik is being blackmailed by the Shadow Circle.',
        'The stolen treaty is an ancient magical contract, not just parchment.'
      ],
      storyFlags: {
        royal_treaty_stolen: true,
        shadow_gate_opened: false
      },
      createdAt: new Date().toISOString()
    };
  }
};
