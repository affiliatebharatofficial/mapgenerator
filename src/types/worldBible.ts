export type CanonStatus = 'canon' | 'draft' | 'non-canon' | 'archived';

export type RelationshipType =
  | 'located_in'
  | 'borders'
  | 'parent_of'
  | 'child_of'
  | 'sibling_of'
  | 'married_to'
  | 'rules'
  | 'governed_by'
  | 'allied_with'
  | 'hostile_to'
  | 'vassal_of'
  | 'member_of'
  | 'leads'
  | 'participated_in'
  | 'caused';

export interface EntityRelationship {
  id: string;
  worldId: string;
  sourceEntityId: string;
  sourceEntityType: string;
  relationshipType: RelationshipType;
  targetEntityId: string;
  targetEntityType: string;
  metadata?: {
    sinceYear?: number;
    notes?: string;
  };
  canonStatus: CanonStatus;
}

export interface WorldCulture {
  id: string;
  worldId: string;
  name: string;
  description: string;
  region?: string;
  values?: string[];
  traditions?: string[];
  namingStyle?: string;
  canonStatus: CanonStatus;
}

export interface WorldReligion {
  id: string;
  worldId: string;
  name: string;
  description: string;
  deities?: string[];
  beliefs?: string[];
  sacredLocations?: string[];
  canonStatus: CanonStatus;
}

export interface WorldLanguage {
  id: string;
  worldId: string;
  name: string;
  description: string;
  script?: string;
  region?: string;
  canonStatus: CanonStatus;
}

export interface WorldCreature {
  id: string;
  worldId: string;
  name: string;
  type: string;
  description: string;
  habitat?: string;
  behavior?: string;
  dangerLevel: 'Safe' | 'Low' | 'Moderate' | 'High' | 'Deadly';
  canonStatus: CanonStatus;
}

export interface WorldItem {
  id: string;
  worldId: string;
  name: string;
  type: string;
  description: string;
  origin?: string;
  currentOwnerId?: string;
  canonStatus: CanonStatus;
}

export interface WorldEra {
  id: string;
  worldId: string;
  name: string;
  description: string;
  startYear: number;
  endYear?: number;
}

export interface FantasyCalendar {
  id: string;
  worldId: string;
  name: string;
  months: string[];
  daysPerMonth: number;
  yearLength: number;
  eras: WorldEra[];
}

export interface LoreDocument {
  id: string;
  worldId: string;
  title: string;
  category: 'history' | 'geography' | 'culture' | 'religion' | 'mythology' | 'magic';
  content: string;
  mentions: { entityId: string; entityType: string; name: string }[];
  canonStatus: CanonStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorldConsistencyIssue {
  id: string;
  worldId: string;
  severity: 'error' | 'warning' | 'info';
  category: 'geography' | 'characters' | 'timeline' | 'politics';
  title: string;
  description: string;
  evidence: string[];
  suggestedFix: string;
  reviewed: boolean;
}
