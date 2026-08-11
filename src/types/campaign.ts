export type CampaignStatus = 'Planning' | 'Active' | 'Paused' | 'Completed' | 'Archived';
export type CampaignGenre = 'Epic Fantasy' | 'Dark Fantasy' | 'Mystery' | 'Political Intrigue' | 'Exploration' | 'Horror' | 'War' | 'Adventure';
export type AdventureStatus = 'Planned' | 'Active' | 'Completed' | 'Archived';
export type SceneType = 'Exploration' | 'Roleplay' | 'Combat' | 'Investigation' | 'Puzzle' | 'Travel' | 'Social' | 'Discovery';
export type SessionStatus = 'Planned' | 'Active' | 'Completed';
export type NpcRelationship = 'Friendly' | 'Neutral' | 'Suspicious' | 'Hostile' | 'Unknown';
export type EncounterType = 'Combat' | 'Social' | 'Exploration' | 'Puzzle' | 'Trap' | 'Chase' | 'Investigation';
export type HandoutType = 'Letter' | 'Map' | 'Rumor' | 'Journal' | 'Prophecy' | 'Poster' | 'Item';
export type MarkerType = 'party' | 'quest' | 'objective' | 'encounter' | 'secret' | 'npc' | 'treasure' | 'danger';

export interface Campaign {
  id: string;
  worldId: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  system: string;
  genre: CampaignGenre;
  status: CampaignStatus;
  coverImage?: string;
  currentSessionId?: string;
  partyLocation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Adventure {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  summary?: string;
  status: AdventureStatus;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  adventureId: string;
  title: string;
  description: string;
  sceneType: SceneType;
  orderIndex: number;
  locationId?: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  campaignId: string;
  adventureId?: string;
  sessionNumber: number;
  title: string;
  date: string;
  summary?: string;
  status: SessionStatus;
  currentSceneId?: string;
  privateNotes: string;
  publicNotes: string;
  elapsedTimeSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerCharacter {
  id: string;
  campaignId: string;
  name: string;
  playerName: string;
  characterClass: string;
  level: number;
  race: string;
  description: string;
  portrait?: string;
  notes?: string;
  status: 'Active' | 'Unconscious' | 'Deceased' | 'Retired';
  createdAt: string;
  updatedAt: string;
}

export interface CampaignNPC {
  id: string;
  campaignId: string;
  worldCharacterId?: string;
  name: string;
  role: string;
  location: string;
  relationship: NpcRelationship;
  status: string;
  notes?: string;
}

export interface Encounter {
  id: string;
  campaignId: string;
  sceneId?: string;
  title: string;
  type: EncounterType;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly';
  location: string;
  tactics?: string;
  loot?: string;
  status: 'Planned' | 'Active' | 'Resolved';
  createdAt: string;
}

export interface Handout {
  id: string;
  campaignId: string;
  title: string;
  type: HandoutType;
  content: string;
  isPlayerVisible: boolean;
  createdAt: string;
}

export interface CampaignMarker {
  id: string;
  campaignId: string;
  mapId: string;
  x: number;
  y: number;
  label: string;
  type: MarkerType;
  isDiscovered: boolean;
}

export interface CampaignJournalEntry {
  id: string;
  campaignId: string;
  sessionId?: string;
  title: string;
  date: string;
  recap: string;
  GMNotes?: string;
  decisions?: string[];
  locationsVisited?: string[];
}
