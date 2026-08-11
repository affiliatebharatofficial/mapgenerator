import type {
  SessionEvent,
  PlayerDecision,
  FactionReputation,
  StoryThread,
  CampaignSnapshot,
  CampaignHandout
} from '../../types/campaignWorkspace';
import { WorldBibleService } from '../supabase/worldBibleService';

const EVENTS_KEY = 'createfantasymap_session_events';
const DECISIONS_KEY = 'createfantasymap_player_decisions';
const REPUTATION_KEY = 'createfantasymap_faction_reputation';
const THREADS_KEY = 'createfantasymap_story_threads';
const HANDOUTS_KEY = 'createfantasymap_campaign_handouts';

export const CampaignWorkspaceService = {
  // ----------------------------------------------------
  // 1. SESSION EVENTS & TIMELINE
  // ----------------------------------------------------
  getSessionEvents(sessionId: string): SessionEvent[] {
    const data = localStorage.getItem(EVENTS_KEY);
    const list: SessionEvent[] = data ? JSON.parse(data) : [];
    return list.filter((e) => e.sessionId === sessionId);
  },

  addSessionEvent(event: Omit<SessionEvent, 'id' | 'timestamp'>): SessionEvent {
    const data = localStorage.getItem(EVENTS_KEY);
    const list: SessionEvent[] = data ? JSON.parse(data) : [];
    const newRecord: SessionEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    list.push(newRecord);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
    return newRecord;
  },

  // ----------------------------------------------------
  // 2. PLAYER DECISION SUBMISSION & REVIEW
  // ----------------------------------------------------
  getPlayerDecisions(campaignId: string): PlayerDecision[] {
    const data = localStorage.getItem(DECISIONS_KEY);
    const list: PlayerDecision[] = data ? JSON.parse(data) : [];
    return list.filter((d) => d.campaignId === campaignId);
  },

  submitPlayerDecision(decision: Omit<PlayerDecision, 'id' | 'createdAt' | 'status'>): PlayerDecision {
    const data = localStorage.getItem(DECISIONS_KEY);
    const list: PlayerDecision[] = data ? JSON.parse(data) : [];
    const newRecord: PlayerDecision = {
      ...decision,
      id: `dec_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    list.push(newRecord);
    localStorage.setItem(DECISIONS_KEY, JSON.stringify(list));
    return newRecord;
  },

  reviewPlayerDecision(decisionId: string, status: PlayerDecision['status'], gmResponse?: string): PlayerDecision | null {
    const data = localStorage.getItem(DECISIONS_KEY);
    const list: PlayerDecision[] = data ? JSON.parse(data) : [];
    const idx = list.findIndex((d) => d.id === decisionId);
    if (idx < 0) return null;

    list[idx] = { ...list[idx], status, gmResponse };
    localStorage.setItem(DECISIONS_KEY, JSON.stringify(list));
    return list[idx];
  },

  // ----------------------------------------------------
  // 3. FACTION REPUTATION TRACKING
  // ----------------------------------------------------
  getFactionReputations(campaignId: string): FactionReputation[] {
    const data = localStorage.getItem(REPUTATION_KEY);
    const list: FactionReputation[] = data ? JSON.parse(data) : [];
    return list.filter((f) => f.campaignId === campaignId);
  },

  updateFactionReputation(campaignId: string, factionId: string, factionName: string, deltaScore: number): FactionReputation {
    const reps = this.getFactionReputations(campaignId);
    const existing = reps.find((f) => f.factionId === factionId);
    const newScore = Math.max(-100, Math.min(100, (existing?.reputationScore || 0) + deltaScore));

    let standing: FactionReputation['standing'] = 'Neutral';
    if (newScore >= 60) standing = 'Allied';
    else if (newScore >= 20) standing = 'Friendly';
    else if (newScore <= -60) standing = 'Hostile';
    else if (newScore <= -20) standing = 'Unfriendly';

    const record: FactionReputation = {
      id: existing?.id || `rep_${Date.now()}`,
      campaignId,
      factionId,
      factionName,
      reputationScore: newScore,
      standing
    };

    const data = localStorage.getItem(REPUTATION_KEY);
    const list: FactionReputation[] = data ? JSON.parse(data) : [];
    const idx = list.findIndex((f) => f.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);

    localStorage.setItem(REPUTATION_KEY, JSON.stringify(list));
    return record;
  },

  // ----------------------------------------------------
  // 4. EXPLICIT CANON PROMOTION
  // ----------------------------------------------------
  promoteEventToWorldCanon(worldId: string, title: string, content: string) {
    WorldBibleService.saveLoreDocument({
      worldId,
      title: `[Canonized Campaign Event] ${title}`,
      category: 'history',
      content,
      canonStatus: 'canon',
      mentions: []
    });
  }
};
