import type { Campaign, Adventure, Scene, Session, Encounter } from '../../types/campaign';

export const AICampaignEngine = {
  // ----------------------------------------------------
  // 1. AI CAMPAIGN SETUP WIZARD GENERATOR
  // ----------------------------------------------------
  async generateCampaignWithAI(
    worldName: string,
    genre: string,
    campaignName: string
  ): Promise<{ description: string; adventures: Omit<Adventure, 'id' | 'campaignId' | 'createdAt' | 'updatedAt'>[] }> {
    await new Promise((res) => setTimeout(res, 1200));

    return {
      description: `An epic ${genre.toLowerCase()} campaign set in the world of ${worldName}. High stakes, ancient mysteries, and faction rivalries shape the destiny of the land.`,
      adventures: [
        {
          title: `Act 1: Shadows over ${worldName}`,
          description: `The party investigates mysterious disturbances and uncovers the first clues of a brewing conflict.`,
          summary: `Introductory adventure establishing party ties and local threats.`,
          status: 'Active',
          orderIndex: 1
        },
        {
          title: `Act 2: The Broken Alliance`,
          description: `Political intrigue and warring factions force the party to choose powerful allies.`,
          summary: `Regional conflict escalating across multiple kingdoms.`,
          status: 'Planned',
          orderIndex: 2
        },
        {
          title: `Act 3: The Final Confrontation`,
          description: `The party ventures into dangerous territory to confront the ultimate threat to ${worldName}.`,
          summary: `Climactic finale determining the fate of the realm.`,
          status: 'Planned',
          orderIndex: 3
        }
      ]
    };
  },

  // ----------------------------------------------------
  // 2. AI ENCOUNTER GENERATOR
  // ----------------------------------------------------
  async generateEncounterWithAI(
    campaignName: string,
    location: string,
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly',
    promptText: string
  ): Promise<Omit<Encounter, 'id' | 'campaignId' | 'createdAt'>> {
    await new Promise((res) => setTimeout(res, 1000));

    return {
      title: `${difficulty} Tactical Ambush at ${location || 'Ruined Keep'}`,
      type: 'Combat',
      location: location || 'Ancient Ruins',
      difficulty,
      description: promptText || `A dangerous confrontation featuring hostile sentinels guarding an ancient relic. Terrain features hazardous crumbling stone and elevated archer vantage points.`,
      tactics: `Enemies deploy flank maneuvers using high ground while leaders cast disorienting spells from behind cover.`,
      loot: `120 Gold Pieces, 1x Potion of Greater Healing, Ancient Parchment Map Fragment`,
      status: 'Planned'
    };
  },

  // ----------------------------------------------------
  // 3. AI SESSION RECAP GENERATOR
  // ----------------------------------------------------
  async generateSessionSummaryWithAI(
    sessionTitle: string,
    rawNotes: string,
    completedScenes: string[]
  ): Promise<{ recap: string; keyDecisions: string[] }> {
    await new Promise((res) => setTimeout(res, 900));

    return {
      recap: `During "${sessionTitle}", the party navigated through critical challenges. ${rawNotes ? `Notes recorded: "${rawNotes.substring(0, 100)}..."` : 'The group made significant progress.'} They completed ${completedScenes.length || 2} key scenes and secured vital intelligence regarding local faction movements.`,
      keyDecisions: [
        'Selected alliance with local merchant guild over royal court',
        'Spared the captured bandit captain for secret information',
        'Secured ancient key relic from hidden temple'
      ]
    };
  },

  // ----------------------------------------------------
  // 4. AI NEXT SESSION PLANNER
  // ----------------------------------------------------
  async planNextSessionWithAI(
    campaign: Campaign,
    lastSessionSummary?: string
  ): Promise<{ suggestedTitle: string; proposedScenes: Omit<Scene, 'id' | 'adventureId' | 'createdAt'>[]; hook: string }> {
    await new Promise((res) => setTimeout(res, 1000));

    return {
      suggestedTitle: `Session ${ (campaign.currentSessionId ? 4 : 1) }: Convergence at Silver Gate`,
      hook: `As the party prepares to leave their current refuge, a messenger arrives bearing urgent news of an enemy advance.`,
      proposedScenes: [
        {
          title: `Scene 1: Morning Briefing & Travel Setup`,
          description: `The party plans their route, purchases supplies, and gathers rumors.`,
          sceneType: 'Roleplay',
          orderIndex: 1,
          isCompleted: false
        },
        {
          title: `Scene 2: Canyon Ambush Encounter`,
          description: `A surprise attack while navigating the narrow mountain pass.`,
          sceneType: 'Combat',
          orderIndex: 2,
          isCompleted: false
        },
        {
          title: `Scene 3: Discovery at the Waystone`,
          description: `Uncovering a hidden glowing arcane marker revealing secret faction activity.`,
          sceneType: 'Discovery',
          orderIndex: 3,
          isCompleted: false
        }
      ]
    };
  },

  // ----------------------------------------------------
  // 5. AI TRAVEL PLANNER
  // ----------------------------------------------------
  async planTravelWithAI(
    origin: string,
    destination: string,
    worldName: string
  ): Promise<{ distanceDays: number; weather: string; hazard: string; complications: string[] }> {
    await new Promise((res) => setTimeout(res, 900));

    return {
      distanceDays: 4,
      weather: 'Heavy mountain mist with cold rainfall',
      hazard: 'Crumbling ridge pathways & rockslides',
      complications: [
        'Day 2: Discovered abandoned supply wagon with suspicious tracks',
        'Day 3: Crossing river bridge guarded by toll collectors',
        'Day 4: Nightly howl of mountain wolves near camp'
      ]
    };
  }
};
