export type WorldStyle = 'classic' | 'dark-fantasy' | 'high-fantasy' | 'medieval' | 'grim-fantasy' | 'mythic-fantasy';

export interface World {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  style: WorldStyle;
  coverImage?: string;
  isPublic: boolean;
  mapIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorldRegion {
  id: string;
  worldId: string;
  mapId?: string;
  name: string;
  description: string;
  regionType: 'mountains' | 'forest' | 'wasteland' | 'plains' | 'coastal' | 'swamp' | 'tundra' | 'desert';
  climate: string;
  terrain: string;
  population?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorldKingdom {
  id: string;
  worldId: string;
  regionId?: string;
  name: string;
  description: string;
  ruler: string;
  government: 'Monarchy' | 'Empire' | 'Feudal Alliance' | 'Theocracy' | 'Republic' | 'Tribal Confederacy' | 'Magocracy';
  capitalCityId?: string;
  culture: string;
  economy: string;
  militaryStrength: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorldCity {
  id: string;
  worldId: string;
  regionId?: string;
  kingdomId?: string;
  mapId?: string;
  name: string;
  cityType: 'Capital' | 'Major City' | 'Town' | 'Village' | 'Port' | 'Fortress' | 'Religious City';
  description: string;
  population: number;
  government: string;
  economy: string;
  culture?: string;
  landmarks?: string[];
  problems?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorldLocation {
  id: string;
  worldId: string;
  regionId?: string;
  mapId?: string;
  name: string;
  type: 'Castle' | 'Ruins' | 'Temple' | 'Dungeon' | 'Mine' | 'Tower' | 'Battlefield' | 'Shrine' | 'Magical Site' | 'Dragon Lair';
  description: string;
  dangerLevel: 'Safe' | 'Low' | 'Moderate' | 'High' | 'Deadly';
  secrets?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Faction {
  id: string;
  worldId: string;
  name: string;
  type: 'Royal House' | 'Merchant Guild' | 'Assassin Order' | 'Mage Council' | 'Rebel Army' | 'Religious Order' | 'Criminal Syndicate';
  description: string;
  goals: string;
  ideology: string;
  headquarters: string;
  leader: string;
  resources: string;
  influence: 'Local' | 'Regional' | 'Continental' | 'Global';
  createdAt: string;
  updatedAt: string;
}

export interface FactionRelationship {
  id: string;
  worldId: string;
  sourceFactionId: string;
  targetFactionId: string;
  relationshipType: 'Allied' | 'Friendly' | 'Neutral' | 'Rival' | 'Hostile' | 'At War';
  notes?: string;
}

export interface WorldCharacter {
  id: string;
  worldId: string;
  name: string;
  title: string;
  role: 'King' | 'Queen' | 'Prince' | 'General' | 'Mage' | 'Knight' | 'Merchant' | 'Villain' | 'Hero' | 'Priest' | 'Assassin' | 'Scholar';
  description: string;
  age: number;
  personality: string;
  appearance?: string;
  background: string;
  goals: string;
  fears?: string;
  factionId?: string;
  kingdomId?: string;
  cityId?: string;
  status: 'Alive' | 'Deceased' | 'Missing' | 'Exiled';
  createdAt: string;
  updatedAt: string;
}

export interface CharacterRelationship {
  id: string;
  worldId: string;
  sourceCharacterId: string;
  targetCharacterId: string;
  relationshipType: 'Ally' | 'Enemy' | 'Friend' | 'Rival' | 'Family' | 'Mentor' | 'Student' | 'Romantic' | 'Political';
  notes?: string;
}

export interface LoreEntry {
  id: string;
  worldId: string;
  entityType?: 'world' | 'kingdom' | 'city' | 'character' | 'faction' | 'location';
  entityId?: string;
  title: string;
  section: 'Overview' | 'History' | 'Culture' | 'Politics' | 'Economy' | 'Religion' | 'Conflicts' | 'Secrets';
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  worldId: string;
  yearDate: string;
  title: string;
  description: string;
  category: 'Founding' | 'War' | 'Disaster' | 'Political' | 'Discovery' | 'Magical';
  relatedEntityId?: string;
  createdAt: string;
}

export interface Quest {
  id: string;
  worldId: string;
  title: string;
  description: string;
  questType: 'Main Quest' | 'Side Quest' | 'Investigation' | 'Escort' | 'Battle' | 'Treasure Hunt' | 'Political' | 'Mystery' | 'Exploration';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly' | 'Legendary';
  status: 'Open' | 'In Progress' | 'Completed' | 'Failed';
  locationId?: string;
  factionId?: string;
  characterId?: string;
  rewards: string;
  consequences: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorldPlanSummary {
  worldName: string;
  style: WorldStyle;
  kingdomCount: number;
  regionCount: number;
  cityCount: number;
  factionCount: number;
  characterCount: number;
  eventCount: number;
  questCount: number;
  sampleKingdoms: string[];
  sampleCharacters: string[];
}
