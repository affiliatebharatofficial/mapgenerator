export type AgentMode = 'answer' | 'action_plan';

export type RiskLevel = 'low' | 'medium' | 'high';

export type AgentActionType =
  | 'add_city'
  | 'move_city'
  | 'delete_city'
  | 'rename_city'
  | 'add_village'
  | 'add_mountain_range'
  | 'add_forest'
  | 'add_river'
  | 'rename_river'
  | 'add_road'
  | 'move_location'
  | 'delete_location'
  | 'rename_location'
  | 'add_region'
  | 'create_kingdom'
  | 'rename_kingdom'
  | 'change_kingdom_color'
  | 'create_character'
  | 'update_character'
  | 'delete_character'
  | 'create_faction'
  | 'update_faction'
  | 'create_lore'
  | 'update_lore'
  | 'create_quest'
  | 'update_quest'
  | 'change_map_style';

export interface AgentAction {
  id: string;
  type: AgentActionType;
  entityType: 'city' | 'kingdom' | 'location' | 'river' | 'road' | 'region' | 'character' | 'faction' | 'lore' | 'quest' | 'style';
  entityId?: string;
  description: string;
  newValues: Record<string, any>;
  oldValues?: Record<string, any>;
  riskLevel: RiskLevel;
  enabled: boolean;
  conflictsWithCanon?: boolean;
  canonNote?: string;
}

export interface AgentResponse {
  mode: AgentMode;
  answer?: string;
  actions?: AgentAction[];
  confidence: 'high' | 'medium' | 'low';
  summary?: string;
  estimatedCreditCost: number;
  thinkingSteps: string[];
}

export type CanonStatus = 'canon' | 'draft' | 'ai_generated' | 'archived';

export interface ConsistencyIssue {
  id: string;
  severity: 'error' | 'warning' | 'suggestion';
  title: string;
  description: string;
  entityId?: string;
  entityType?: string;
  fixAction?: AgentAction;
}

export interface WorldSummary {
  worldName: string;
  premise: string;
  majorKingdoms: string[];
  mainConflict: string;
  keyFactions: string[];
  keyCharacters: string[];
  importantLocations: string[];
  timelineHighlights: string[];
}
