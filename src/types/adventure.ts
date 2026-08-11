export type AdventureType =
  | 'main_quest'
  | 'side_quest'
  | 'investigation'
  | 'political_intrigue'
  | 'exploration'
  | 'dungeon'
  | 'escort'
  | 'rescue'
  | 'retrieval'
  | 'war'
  | 'survival'
  | 'horror';

export type AdventureLength = 'one_shot' | 'short' | 'medium' | 'long' | 'epic';
export type StoryTone = 'epic' | 'dark' | 'lighthearted' | 'political' | 'mysterious' | 'horror' | 'adventurous' | 'tragic' | 'whimsical';

export interface QuestBranch {
  id: string;
  title: string;
  choiceText: string;
  type: 'choice' | 'conditional' | 'reputation' | 'relationship' | 'item' | 'world_event';
  targetObjectiveId: string;
  consequences: {
    reputationChanges?: Record<string, number>;
    storyFlagsSet?: Record<string, boolean>;
    unlockedQuests?: string[];
  };
}

export interface QuestObjective {
  id: string;
  title: string;
  description: string;
  type:
    | 'reach_location'
    | 'talk_npc'
    | 'investigate'
    | 'find_item'
    | 'defeat_enemy'
    | 'escort'
    | 'solve_puzzle'
    | 'make_decision';
  isPrimary: boolean;
  isSecondary?: boolean;
  isOptional?: boolean;
  status: 'hidden' | 'revealed' | 'completed';
  gmSecrets?: string;
  dependencies?: string[];
  branches?: QuestBranch[];
}

export interface AdventureOutline {
  premise: string;
  mainConflict: string;
  mainNpcs: string[];
  locations: string[];
  factions: string[];
  beats: { title: string; summary: string }[];
  potentialEndings: string[];
}

export interface InvestigationClue {
  id: string;
  title: string;
  foundAtLocation: string;
  pointsToward: string;
  actualMeaning: string;
  isDiscovered: boolean;
}

export interface GroundedAdventurePackage {
  id: string;
  worldId: string;
  campaignId?: string;
  title: string;
  summary: string;
  type: AdventureType;
  tone: StoryTone;
  length: AdventureLength;
  outline: AdventureOutline;
  objectives: QuestObjective[];
  clues: InvestigationClue[];
  gmSecrets: string[];
  storyFlags: Record<string, boolean>;
  createdAt: string;
}
