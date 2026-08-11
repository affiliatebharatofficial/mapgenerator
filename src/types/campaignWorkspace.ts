export type CampaignRole = 'gm' | 'player';
export type MembershipStatus = 'invited' | 'active' | 'removed';

export interface CampaignMember {
  id: string;
  campaignId: string;
  userId: string;
  playerName: string;
  role: CampaignRole;
  status: MembershipStatus;
  joinedAt: string;
}

export type SessionEventType =
  | 'battle'
  | 'discovery'
  | 'conversation'
  | 'death'
  | 'decision'
  | 'travel'
  | 'quest_progress'
  | 'faction_change'
  | 'location_discovery';

export interface SessionEvent {
  id: string;
  sessionId: string;
  campaignId: string;
  eventType: SessionEventType;
  timestamp: string;
  description: string;
  relatedEntities?: { type: string; id: string; name: string }[];
  isGmSecret?: boolean;
}

export interface PlayerDecision {
  id: string;
  campaignId: string;
  playerId: string;
  playerName: string;
  characterName: string;
  decisionText: string;
  status: 'pending' | 'accepted' | 'modified' | 'rejected';
  gmResponse?: string;
  createdAt: string;
}

export interface FactionReputation {
  id: string;
  campaignId: string;
  factionId: string;
  factionName: string;
  reputationScore: number; // -100 to +100
  standing: 'Hostile' | 'Unfriendly' | 'Neutral' | 'Friendly' | 'Allied';
}

export interface StoryThread {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  status: 'unresolved' | 'resolved';
  relatedEntities: string[];
  resolvedInSession?: number;
}

export interface CampaignSnapshot {
  id: string;
  campaignId: string;
  title: string;
  stateData: Record<string, any>;
  createdAt: string;
}

export interface CampaignHandout {
  id: string;
  campaignId: string;
  title: string;
  type: 'letter' | 'map' | 'rumor' | 'journal' | 'prophecy' | 'poster' | 'item';
  content: string;
  imageUrl?: string;
  status: 'draft' | 'shared' | 'hidden' | 'archived';
  sharedAt?: string;
}
