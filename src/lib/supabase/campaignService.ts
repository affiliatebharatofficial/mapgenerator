import type {
  Campaign,
  Adventure,
  Scene,
  Session,
  PlayerCharacter,
  CampaignNPC,
  Encounter,
  Handout,
  CampaignMarker,
  CampaignJournalEntry
} from '../../types/campaign';

const CAMPAIGNS_KEY = 'createfantasymap_campaigns_db';
const ADVENTURES_KEY = 'createfantasymap_adventures_db';
const SCENES_KEY = 'createfantasymap_scenes_db';
const SESSIONS_KEY = 'createfantasymap_sessions_db';
const PLAYER_CHARS_KEY = 'createfantasymap_player_chars_db';
const CAMPAIGN_NPCS_KEY = 'createfantasymap_campaign_npcs_db';
const ENCOUNTERS_KEY = 'createfantasymap_encounters_db';
const HANDOUTS_KEY = 'createfantasymap_handouts_db';
const MARKERS_KEY = 'createfantasymap_campaign_markers_db';
const JOURNALS_KEY = 'createfantasymap_campaign_journals_db';

export const CampaignService = {
  // ----------------------------
  // 1. CAMPAIGNS CRUD
  // ----------------------------
  getUserCampaigns(userId: string): Campaign[] {
    const data = localStorage.getItem(CAMPAIGNS_KEY);
    const list: Campaign[] = data ? JSON.parse(data) : [];
    return list.filter((c) => c.userId === userId || userId === 'user_current');
  },

  getCampaignById(id: string): Campaign | undefined {
    const data = localStorage.getItem(CAMPAIGNS_KEY);
    const list: Campaign[] = data ? JSON.parse(data) : [];
    return list.find((c) => c.id === id);
  },

  saveCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Campaign {
    const data = localStorage.getItem(CAMPAIGNS_KEY);
    const list: Campaign[] = data ? JSON.parse(data) : [];

    const now = new Date().toISOString();
    let record: Campaign;

    if (campaign.id) {
      const idx = list.findIndex((c) => c.id === campaign.id);
      record = {
        ...list[idx],
        ...campaign,
        updatedAt: now
      } as Campaign;
      if (idx >= 0) list[idx] = record;
      else list.unshift(record);
    } else {
      record = {
        ...campaign,
        id: `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        updatedAt: now
      } as Campaign;
      list.unshift(record);
    }

    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(list));
    return record;
  },

  deleteCampaign(id: string) {
    const data = localStorage.getItem(CAMPAIGNS_KEY);
    const list: Campaign[] = data ? JSON.parse(data) : [];
    const filtered = list.filter((c) => c.id !== id);
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(filtered));
  },

  // ----------------------------
  // 2. ADVENTURES & SCENES
  // ----------------------------
  getAdventures(campaignId: string): Adventure[] {
    const data = localStorage.getItem(ADVENTURES_KEY);
    const list: Adventure[] = data ? JSON.parse(data) : [];
    return list.filter((a) => a.campaignId === campaignId).sort((a, b) => a.orderIndex - b.orderIndex);
  },

  saveAdventure(adv: Omit<Adventure, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Adventure {
    const data = localStorage.getItem(ADVENTURES_KEY);
    const list: Adventure[] = data ? JSON.parse(data) : [];
    const now = new Date().toISOString();
    const record: Adventure = {
      ...adv,
      id: adv.id || `adv_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    const idx = list.findIndex((a) => a.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    localStorage.setItem(ADVENTURES_KEY, JSON.stringify(list));
    return record;
  },

  getScenes(adventureId: string): Scene[] {
    const data = localStorage.getItem(SCENES_KEY);
    const list: Scene[] = data ? JSON.parse(data) : [];
    return list.filter((s) => s.adventureId === adventureId).sort((a, b) => a.orderIndex - b.orderIndex);
  },

  saveScene(scene: Omit<Scene, 'id' | 'createdAt'> & { id?: string }): Scene {
    const data = localStorage.getItem(SCENES_KEY);
    const list: Scene[] = data ? JSON.parse(data) : [];
    const record: Scene = {
      ...scene,
      id: scene.id || `scn_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const idx = list.findIndex((s) => s.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    localStorage.setItem(SCENES_KEY, JSON.stringify(list));
    return record;
  },

  // ----------------------------
  // 3. SESSIONS
  // ----------------------------
  getSessions(campaignId: string): Session[] {
    const data = localStorage.getItem(SESSIONS_KEY);
    const list: Session[] = data ? JSON.parse(data) : [];
    return list.filter((s) => s.campaignId === campaignId).sort((a, b) => b.sessionNumber - a.sessionNumber);
  },

  saveSession(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Session {
    const data = localStorage.getItem(SESSIONS_KEY);
    const list: Session[] = data ? JSON.parse(data) : [];
    const now = new Date().toISOString();
    const record: Session = {
      ...session,
      id: session.id || `ses_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    const idx = list.findIndex((s) => s.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.unshift(record);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(list));
    return record;
  },

  // ----------------------------
  // 4. CHARACTERS & NPCS
  // ----------------------------
  getPlayerCharacters(campaignId: string): PlayerCharacter[] {
    const data = localStorage.getItem(PLAYER_CHARS_KEY);
    const list: PlayerCharacter[] = data ? JSON.parse(data) : [];
    return list.filter((p) => p.campaignId === campaignId);
  },

  savePlayerCharacter(pc: Omit<PlayerCharacter, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): PlayerCharacter {
    const data = localStorage.getItem(PLAYER_CHARS_KEY);
    const list: PlayerCharacter[] = data ? JSON.parse(data) : [];
    const now = new Date().toISOString();
    const record: PlayerCharacter = {
      ...pc,
      id: pc.id || `pc_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    const idx = list.findIndex((p) => p.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    localStorage.setItem(PLAYER_CHARS_KEY, JSON.stringify(list));
    return record;
  },

  getCampaignNPCs(campaignId: string): CampaignNPC[] {
    const data = localStorage.getItem(CAMPAIGN_NPCS_KEY);
    const list: CampaignNPC[] = data ? JSON.parse(data) : [];
    return list.filter((n) => n.campaignId === campaignId);
  },

  saveCampaignNPC(npc: Omit<CampaignNPC, 'id'> & { id?: string }): CampaignNPC {
    const data = localStorage.getItem(CAMPAIGN_NPCS_KEY);
    const list: CampaignNPC[] = data ? JSON.parse(data) : [];
    const record: CampaignNPC = {
      ...npc,
      id: npc.id || `npc_${Date.now()}`
    };
    const idx = list.findIndex((n) => n.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    localStorage.setItem(CAMPAIGN_NPCS_KEY, JSON.stringify(list));
    return record;
  },

  // ----------------------------
  // 5. ENCOUNTERS, HANDOUTS, MARKERS, JOURNALS
  // ----------------------------
  getEncounters(campaignId: string): Encounter[] {
    const data = localStorage.getItem(ENCOUNTERS_KEY);
    const list: Encounter[] = data ? JSON.parse(data) : [];
    return list.filter((e) => e.campaignId === campaignId);
  },

  saveEncounter(enc: Omit<Encounter, 'id' | 'createdAt'> & { id?: string }): Encounter {
    const data = localStorage.getItem(ENCOUNTERS_KEY);
    const list: Encounter[] = data ? JSON.parse(data) : [];
    const record: Encounter = {
      ...enc,
      id: enc.id || `enc_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const idx = list.findIndex((e) => e.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    localStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(list));
    return record;
  },

  getHandouts(campaignId: string): Handout[] {
    const data = localStorage.getItem(HANDOUTS_KEY);
    const list: Handout[] = data ? JSON.parse(data) : [];
    return list.filter((h) => h.campaignId === campaignId);
  },

  saveHandout(handout: Omit<Handout, 'id' | 'createdAt'> & { id?: string }): Handout {
    const data = localStorage.getItem(HANDOUTS_KEY);
    const list: Handout[] = data ? JSON.parse(data) : [];
    const record: Handout = {
      ...handout,
      id: handout.id || `hnd_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const idx = list.findIndex((h) => h.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    localStorage.setItem(HANDOUTS_KEY, JSON.stringify(list));
    return record;
  },

  getCampaignMarkers(campaignId: string): CampaignMarker[] {
    const data = localStorage.getItem(MARKERS_KEY);
    const list: CampaignMarker[] = data ? JSON.parse(data) : [];
    return list.filter((m) => m.campaignId === campaignId);
  },

  saveCampaignMarker(marker: Omit<CampaignMarker, 'id'> & { id?: string }): CampaignMarker {
    const data = localStorage.getItem(MARKERS_KEY);
    const list: CampaignMarker[] = data ? JSON.parse(data) : [];
    const record: CampaignMarker = {
      ...marker,
      id: marker.id || `mrk_${Date.now()}`
    };
    const idx = list.findIndex((m) => m.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    localStorage.setItem(MARKERS_KEY, JSON.stringify(list));
    return record;
  },

  getJournals(campaignId: string): CampaignJournalEntry[] {
    const data = localStorage.getItem(JOURNALS_KEY);
    const list: CampaignJournalEntry[] = data ? JSON.parse(data) : [];
    return list.filter((j) => j.campaignId === campaignId);
  },

  saveJournalEntry(j: Omit<CampaignJournalEntry, 'id'> & { id?: string }): CampaignJournalEntry {
    const data = localStorage.getItem(JOURNALS_KEY);
    const list: CampaignJournalEntry[] = data ? JSON.parse(data) : [];
    const record: CampaignJournalEntry = {
      ...j,
      id: j.id || `jrn_${Date.now()}`
    };
    const idx = list.findIndex((entry) => entry.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.unshift(record);
    localStorage.setItem(JOURNALS_KEY, JSON.stringify(list));
    return record;
  }
};
