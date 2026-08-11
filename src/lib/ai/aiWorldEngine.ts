import type {
  WorldPlanSummary,
  WorldStyle,
  WorldCharacter,
  WorldKingdom,
  WorldCity,
  WorldLocation,
  Quest,
  TimelineEvent
} from '../../types/world';

export const AIWorldEngine = {
  // Generate World Plan Summary Preview
  async generateWorldPlan(prompt: string, style: WorldStyle = 'dark-fantasy'): Promise<WorldPlanSummary> {
    await new Promise((res) => setTimeout(res, 800));

    const cleanPrompt = prompt.toLowerCase();
    const isDark = style === 'dark-fantasy' || cleanPrompt.includes('dark') || cleanPrompt.includes('shadow');

    return {
      worldName: cleanPrompt.includes('realm') ? 'The Shadow Realms of Eldoria' : 'The Five Kingdoms of Eldoria',
      style,
      kingdomCount: isDark ? 4 : 5,
      regionCount: 7,
      cityCount: 16,
      factionCount: 6,
      characterCount: 12,
      eventCount: 10,
      questCount: 8,
      sampleKingdoms: [
        'High Kingdom of Sunreach',
        'Ironpeak Dominion',
        'Obsidian Citadel of Morvath',
        'Siren Bay Principality'
      ],
      sampleCharacters: [
        'King Aldren IV (Monarch of Sunreach)',
        'Archmage Morvath (Shadow Weaver)',
        'Commander Vaelen (Sun Guard Commander)',
        'Lady Yvenne (Rebel Spymaster)'
      ]
    };
  },

  // Generate Character Profile Draft
  async generateCharacterAI(
    worldId: string,
    prompt: string
  ): Promise<Partial<WorldCharacter>> {
    await new Promise((res) => setTimeout(res, 600));

    const text = prompt.toLowerCase();
    let name = 'Sir Garreth the Undaunted';
    let role: WorldCharacter['role'] = 'Knight';

    if (text.includes('knight') || text.includes('paladin')) {
      name = 'Sir Garreth the Disgraced';
      role = 'Knight';
    } else if (text.includes('mage') || text.includes('wizard')) {
      name = 'Archmage Vaelen';
      role = 'Mage';
    } else if (text.includes('assassin') || text.includes('rogue')) {
      name = 'Lyra Nightshade';
      role = 'Assassin';
    } else if (text.includes('king') || text.includes('ruler')) {
      name = 'King Theron II';
      role = 'King';
    }

    return {
      worldId,
      name,
      title: 'Disgraced Captain of the Sun Guard',
      role,
      description: 'A battle-worn knight stripped of his titles after refusing to execute civilian rebels.',
      age: 38,
      personality: 'Honorable, secretive, vigilant, burdened by oath',
      appearance: 'Scratched steel breastplate over dark wool, silver crest missing.',
      background: 'Served ten years in the royal court before discovering corruption in the high council.',
      goals: 'Secretly protect the rebel enclave and redeem his family knight house.',
      fears: 'Discovery by royal inquisitors before the prince is rescued.',
      status: 'Alive'
    };
  },

  // Generate Kingdom Draft
  async generateKingdomAI(worldId: string, _prompt?: string): Promise<Partial<WorldKingdom>> {
    await new Promise((res) => setTimeout(res, 600));

    return {
      worldId,
      name: 'Vaeloria Duchy',
      description: 'A mist-shrouded coastal duchy famed for seafaring warships and ancient lighthouse shrines.',
      ruler: 'Duchess Katherine Vael',
      government: 'Monarchy',
      culture: 'Seafaring heraldry, tidal festivals, honor duels',
      economy: 'Maritime trade, pearl diving, ship timber',
      militaryStrength: '30 Armored Galleys & Coastal Archery Regiments',
      color: '#2980b9'
    };
  },

  // Generate City Draft
  async generateCityAI(worldId: string, _prompt?: string): Promise<Partial<WorldCity>> {
    await new Promise((res) => setTimeout(res, 600));

    return {
      worldId,
      name: 'Oakhaven Port',
      cityType: 'Port',
      description: 'A bustling coastal harbor built around towering ancient elven trees.',
      population: 18500,
      government: 'Merchant Syndicate Charter',
      economy: 'Spices, ship construction, black market smuggling',
      culture: 'Tavern shanties, multicultural trade, guild rivalries',
      landmarks: ['The Great Iron Crane', 'Drowned Anchor Tavern', 'Storm Beacon Tower'],
      problems: ['Smuggler corruption in lower docks', 'Pirate raids on incoming cargo ships']
    };
  },

  // Generate Location Details Draft
  async generateLocationAI(worldId: string, locationType: string): Promise<Partial<WorldLocation>> {
    await new Promise((res) => setTimeout(res, 600));

    return {
      worldId,
      name: `Ruins of ${locationType === 'Castle' ? 'Ravenhold Fortress' : 'the Sunken Shrine'}`,
      type: (locationType as any) || 'Ruins',
      description: 'Crumbled obsidian masonry shrouded in perpetual fog. Ancient runes glow along the mossy courtyard pillars.',
      dangerLevel: 'High',
      secrets: 'Contains a hidden subterranean crypt housing the Tome of Sunreach.'
    };
  },

  // Generate Timeline Events Batch
  async generateHistoryAI(worldId: string): Promise<Partial<TimelineEvent>[]> {
    await new Promise((res) => setTimeout(res, 700));

    return [
      {
        worldId,
        yearDate: 'Year 12',
        title: 'The Great Convergence',
        description: 'Five magical comets fall across Eldoria, creating the first enchanted crystals.',
        category: 'Magical'
      },
      {
        worldId,
        yearDate: 'Year 85',
        title: 'Siege of Oakhaven',
        description: 'The Ironpeak Dominion invades the western coastline.',
        category: 'War'
      },
      {
        worldId,
        yearDate: 'Year 194',
        title: 'Edict of Light',
        description: 'King Aldren IV declares the Sun Guard as the supreme military order.',
        category: 'Political'
      }
    ];
  },

  // Generate Quests Connected to Existing World Context
  async generateQuestsAI(worldId: string, contextName: string): Promise<Partial<Quest>[]> {
    await new Promise((res) => setTimeout(res, 700));

    return [
      {
        worldId,
        title: `The Secret of ${contextName}`,
        description: `Investigate rumors of dark necromancy spreading near ${contextName}.`,
        questType: 'Investigation',
        difficulty: 'Medium',
        status: 'Open',
        rewards: '250 Gold Dragons & Sun Guard Favor',
        consequences: 'Failure allows the cult to summon a spectral beast.'
      },
      {
        worldId,
        title: 'Recover the Sunreach Artifact',
        description: `Retrieve an ancient stolen reliquary hidden deep within ${contextName}.`,
        questType: 'Treasure Hunt',
        difficulty: 'Hard',
        status: 'Open',
        rewards: 'Ancient Runed Sword & Royal Access Seal',
        consequences: 'If lost, Archmage Morvath will unlock blood magic.'
      }
    ];
  },

  // AI Command Bar Q&A ("Ask Your World...")
  async askWorldAICommand(worldData: any, question: string): Promise<string> {
    await new Promise((res) => setTimeout(res, 500));
    const q = question.toLowerCase();

    if (q.includes('ruler') || q.includes('king') || q.includes('who rules')) {
      return `According to the structured records of ${worldData.world?.name || 'your world'}: King Aldren IV rules the High Kingdom of Sunreach from Silverkeep Citadel, while High Thane Thrain leads the Ironpeak Dominion.`;
    }
    if (q.includes('faction') || q.includes('enemy') || q.includes('threat')) {
      return `The primary hostile faction is the Shadow Coven led by Archmage Morvath, currently opposed by the Sun Guard Order under Commander Vaelen.`;
    }
    if (q.includes('capital') || q.includes('city') || q.includes('where')) {
      return `The major capital city is Silverkeep Citadel (population ~45,000), located in Sunreach. Nearby coastal settlements include Oakhaven Port.`;
    }

    return `Based on your world records for "${worldData.world?.name || 'this world'}": This world features ${worldData.kingdoms?.length || 2} kingdoms, ${worldData.characters?.length || 2} key figures, and ${worldData.factions?.length || 2} rival factions currently locked in conflict over magical artifacts.`;
  }
};
