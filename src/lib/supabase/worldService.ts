import type {
  World,
  WorldKingdom,
  WorldCity,
  WorldLocation,
  Faction,
  WorldCharacter,
  TimelineEvent,
  Quest
} from '../../types/world';
import { slugifyTitle } from './mapService';

const WORLDS_KEY = 'createfantasymap_worlds_db';
const KINGDOMS_KEY = 'createfantasymap_kingdoms_db';
const CITIES_KEY = 'createfantasymap_cities_db';
const LOCATIONS_KEY = 'createfantasymap_locations_db';
const FACTIONS_KEY = 'createfantasymap_factions_db';
const CHARACTERS_KEY = 'createfantasymap_characters_db';
const TIMELINE_KEY = 'createfantasymap_timeline_db';
const QUESTS_KEY = 'createfantasymap_quests_db';

// Initial pre-loaded showcase world: The Realms of Eldoria
const INITIAL_SHOWCASE_WORLD: World = {
  id: 'world_eldoria',
  userId: 'user_master_cartographer',
  name: 'The Realms of Eldoria',
  slug: 'the-realms-of-eldoria',
  description: 'A dark medieval world divided by ancient wars, noble houses, sorcery, and forgotten magical ruins.',
  style: 'dark-fantasy',
  coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
  isPublic: true,
  mapIds: ['map_eldoria'],
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  updatedAt: new Date().toISOString()
};

const INITIAL_KINGDOMS: WorldKingdom[] = [
  {
    id: 'k_sunreach',
    worldId: 'world_eldoria',
    name: 'High Kingdom of Sunreach',
    description: 'A prosperous feudal monarchy commanding central plains and golden wheatfields.',
    ruler: 'King Aldren IV',
    government: 'Monarchy',
    culture: 'Chivalric, noble, deeply religious',
    economy: 'Agriculture, iron mining, trade tax',
    militaryStrength: 'Heavy knight cavalry & fortified keep archers',
    color: '#d4af37',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'k_ironforge',
    worldId: 'world_eldoria',
    name: 'Ironpeak Dominion',
    description: 'Mountain fortresses and deep subterranean mines ruled by warrior clans.',
    ruler: 'High Thane Thrain',
    government: 'Feudal Alliance',
    culture: 'Craftsmanship, honor oaths, mountain warfare',
    economy: 'Mithril, steel, gem masonry',
    militaryStrength: 'Shieldwall infantry & siege engineers',
    color: '#c0392b',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_CITIES: WorldCity[] = [
  {
    id: 'c_silverkeep',
    worldId: 'world_eldoria',
    kingdomId: 'k_sunreach',
    mapId: 'map_eldoria',
    name: 'Silverkeep Citadel',
    cityType: 'Capital',
    description: 'The white stone capital castle city overlooking the Great Bay of Eldoria.',
    population: 45000,
    government: 'Royal Court Council',
    economy: 'Royal Treasury & Sea Trade',
    culture: 'High court banquets, tournament jousts',
    landmarks: ['Great Cathedral of Light', 'Sunreach Castle Keep', 'Royal Harbor'],
    problems: ['Secret rebel conspirators in lower docks', 'Food inflation due to border war'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_FACTIONS: Faction[] = [
  {
    id: 'fac_sun_guard',
    worldId: 'world_eldoria',
    name: 'The Sun Guard Order',
    type: 'Royal House',
    description: 'Elite paladins & knights sworn to defend the throne of Sunreach.',
    goals: 'Protect King Aldren IV and root out corrupt mage cults.',
    ideology: 'Honor, loyalty, light faith',
    headquarters: 'Silverkeep Citadel',
    leader: 'Lord Commander Vaelen',
    resources: 'Heavy plate armor, royal funding',
    influence: 'Continental',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fac_shadow_syndicate',
    worldId: 'world_eldoria',
    name: 'Shadow Coven',
    type: 'Mage Council',
    description: 'Secret society of forbidden necromancers seeking ancient titan relics.',
    goals: 'Resurrect the Obsidian Dragon of Eldoria.',
    ideology: 'Power beyond mortal laws',
    headquarters: 'Whispering Ruins',
    leader: 'Archmage Morvath',
    resources: 'Dark spells, bound undead beasts',
    influence: 'Regional',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_CHARACTERS: WorldCharacter[] = [
  {
    id: 'char_king_aldren',
    worldId: 'world_eldoria',
    kingdomId: 'k_sunreach',
    cityId: 'c_silverkeep',
    factionId: 'fac_sun_guard',
    name: 'King Aldren IV',
    title: 'High Sovereign of Sunreach',
    role: 'King',
    description: 'A battle-tested monarch facing growing unrest and northern incursions.',
    age: 48,
    personality: 'Stoic, strategic, cautious',
    background: 'Crown prince knight who won the Battle of Silver River 20 years ago.',
    goals: 'Unify the five kingdoms before the eclipse.',
    fears: 'Traitors within the royal inner council.',
    status: 'Alive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'char_morvath',
    worldId: 'world_eldoria',
    factionId: 'fac_shadow_syndicate',
    name: 'Archmage Morvath',
    title: 'The Shadow Weaver',
    role: 'Mage',
    description: 'Exiled high mage who learned blood magic in dark ruins.',
    age: 120,
    personality: 'Ruthless, brilliant, patient',
    background: 'Former Grand Scholar of Silverkeep who was banished for black alchemy.',
    goals: 'Unlock the Sunreach Vault.',
    fears: 'Loss of arcane immortality.',
    status: 'Alive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_TIMELINE: TimelineEvent[] = [
  {
    id: 'tl_1',
    worldId: 'world_eldoria',
    yearDate: 'Year 0',
    title: 'Founding of Silverkeep',
    description: 'The High Crown is forged and Silverkeep Castle foundation is laid.',
    category: 'Founding',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tl_2',
    worldId: 'world_eldoria',
    yearDate: 'Year 142',
    title: 'The Great Shadow War',
    description: 'Archmage Morvath lays siege to the eastern mountain passes.',
    category: 'War',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q_1',
    worldId: 'world_eldoria',
    title: 'Infiltrate the Shadow Coven',
    description: 'King Aldren IV requests a trusted agent to uncover the cult traitor inside the court.',
    questType: 'Investigation',
    difficulty: 'Hard',
    status: 'Open',
    characterId: 'char_king_aldren',
    factionId: 'fac_sun_guard',
    rewards: '500 Gold Dragons & Knighted Title',
    consequences: 'If exposed, the Shadow Coven will launch an early coup.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function getStoredArray<T>(key: string, defaultVal: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function saveStoredArray<T>(key: string, val: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`Failed saving ${key}:`, err);
  }
}

export const WorldService = {
  // Worlds CRUD
  async getUserWorlds(userId: string): Promise<World[]> {
    const worlds = getStoredArray<World>(WORLDS_KEY, [INITIAL_SHOWCASE_WORLD]);
    return worlds.filter((w) => w.userId === userId || w.isPublic);
  },

  async getWorldById(worldId: string): Promise<World | null> {
    const worlds = getStoredArray<World>(WORLDS_KEY, [INITIAL_SHOWCASE_WORLD]);
    return worlds.find((w) => w.id === worldId || w.slug === worldId) || null;
  },

  async createWorld(userId: string, data: Partial<World>): Promise<World> {
    const worlds = getStoredArray<World>(WORLDS_KEY, [INITIAL_SHOWCASE_WORLD]);
    const id = `world_${Date.now().toString(36)}`;
    const name = data.name || 'New Fantasy World';
    const slug = slugifyTitle(name, id);

    const newWorld: World = {
      id,
      userId,
      name,
      slug,
      description: data.description || 'A newly discovered fantasy world waiting to be built.',
      style: data.style || 'dark-fantasy',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
      isPublic: false,
      mapIds: data.mapIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    worlds.unshift(newWorld);
    saveStoredArray(WORLDS_KEY, worlds);
    return newWorld;
  },

  async deleteWorld(worldId: string): Promise<boolean> {
    let worlds = getStoredArray<World>(WORLDS_KEY, [INITIAL_SHOWCASE_WORLD]);
    worlds = worlds.filter((w) => w.id !== worldId);
    saveStoredArray(WORLDS_KEY, worlds);
    return true;
  },

  // Kingdoms CRUD
  async getKingdoms(worldId: string): Promise<WorldKingdom[]> {
    const all = getStoredArray<WorldKingdom>(KINGDOMS_KEY, INITIAL_KINGDOMS);
    return all.filter((k) => k.worldId === worldId);
  },

  async saveKingdom(kingdom: WorldKingdom): Promise<WorldKingdom> {
    const all = getStoredArray<WorldKingdom>(KINGDOMS_KEY, INITIAL_KINGDOMS);
    const idx = all.findIndex((k) => k.id === kingdom.id);
    if (idx >= 0) all[idx] = kingdom;
    else all.unshift(kingdom);
    saveStoredArray(KINGDOMS_KEY, all);
    return kingdom;
  },

  // Cities CRUD
  async getCities(worldId: string): Promise<WorldCity[]> {
    const all = getStoredArray<WorldCity>(CITIES_KEY, INITIAL_CITIES);
    return all.filter((c) => c.worldId === worldId);
  },

  async saveCity(city: WorldCity): Promise<WorldCity> {
    const all = getStoredArray<WorldCity>(CITIES_KEY, INITIAL_CITIES);
    const idx = all.findIndex((c) => c.id === city.id);
    if (idx >= 0) all[idx] = city;
    else all.unshift(city);
    saveStoredArray(CITIES_KEY, all);
    return city;
  },

  // Locations CRUD
  async getLocations(worldId: string): Promise<WorldLocation[]> {
    return getStoredArray<WorldLocation>(LOCATIONS_KEY, []).filter((l) => l.worldId === worldId);
  },

  async saveLocation(loc: WorldLocation): Promise<WorldLocation> {
    const all = getStoredArray<WorldLocation>(LOCATIONS_KEY, []);
    const idx = all.findIndex((l) => l.id === loc.id);
    if (idx >= 0) all[idx] = loc;
    else all.unshift(loc);
    saveStoredArray(LOCATIONS_KEY, all);
    return loc;
  },

  // Factions CRUD
  async getFactions(worldId: string): Promise<Faction[]> {
    const all = getStoredArray<Faction>(FACTIONS_KEY, INITIAL_FACTIONS);
    return all.filter((f) => f.worldId === worldId);
  },

  async saveFaction(faction: Faction): Promise<Faction> {
    const all = getStoredArray<Faction>(FACTIONS_KEY, INITIAL_FACTIONS);
    const idx = all.findIndex((f) => f.id === faction.id);
    if (idx >= 0) all[idx] = faction;
    else all.unshift(faction);
    saveStoredArray(FACTIONS_KEY, all);
    return faction;
  },

  // Characters CRUD
  async getCharacters(worldId: string): Promise<WorldCharacter[]> {
    const all = getStoredArray<WorldCharacter>(CHARACTERS_KEY, INITIAL_CHARACTERS);
    return all.filter((c) => c.worldId === worldId);
  },

  async saveCharacter(character: WorldCharacter): Promise<WorldCharacter> {
    const all = getStoredArray<WorldCharacter>(CHARACTERS_KEY, INITIAL_CHARACTERS);
    const idx = all.findIndex((c) => c.id === character.id);
    if (idx >= 0) all[idx] = character;
    else all.unshift(character);
    saveStoredArray(CHARACTERS_KEY, all);
    return character;
  },

  // Timeline CRUD
  async getTimelineEvents(worldId: string): Promise<TimelineEvent[]> {
    const all = getStoredArray<TimelineEvent>(TIMELINE_KEY, INITIAL_TIMELINE);
    return all.filter((t) => t.worldId === worldId);
  },

  async saveTimelineEvent(event: TimelineEvent): Promise<TimelineEvent> {
    const all = getStoredArray<TimelineEvent>(TIMELINE_KEY, INITIAL_TIMELINE);
    const idx = all.findIndex((t) => t.id === event.id);
    if (idx >= 0) all[idx] = event;
    else all.push(event);
    saveStoredArray(TIMELINE_KEY, all);
    return event;
  },

  // Quests CRUD
  async getQuests(worldId: string): Promise<Quest[]> {
    const all = getStoredArray<Quest>(QUESTS_KEY, INITIAL_QUESTS);
    return all.filter((q) => q.worldId === worldId);
  },

  async saveQuest(quest: Quest): Promise<Quest> {
    const all = getStoredArray<Quest>(QUESTS_KEY, INITIAL_QUESTS);
    const idx = all.findIndex((q) => q.id === quest.id);
    if (idx >= 0) all[idx] = quest;
    else all.unshift(quest);
    saveStoredArray(QUESTS_KEY, all);
    return quest;
  },

  // Global Multi-entity Search
  async searchWorldEntities(
    worldId: string,
    query: string
  ): Promise<{
    kingdoms: WorldKingdom[];
    cities: WorldCity[];
    characters: WorldCharacter[];
    factions: Faction[];
    quests: Quest[];
  }> {
    const q = query.toLowerCase().trim();
    if (!q) return { kingdoms: [], cities: [], characters: [], factions: [], quests: [] };

    const kingdoms = (await this.getKingdoms(worldId)).filter((k) => k.name.toLowerCase().includes(q) || k.description.toLowerCase().includes(q));
    const cities = (await this.getCities(worldId)).filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    const characters = (await this.getCharacters(worldId)).filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.role.toLowerCase().includes(q));
    const factions = (await this.getFactions(worldId)).filter((f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    const quests = (await this.getQuests(worldId)).filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));

    return { kingdoms, cities, characters, factions, quests };
  }
};
