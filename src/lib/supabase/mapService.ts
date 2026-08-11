import type { FantasyMap, MapStyle, MapType } from '../../types/map';
import { generateFantasyMap } from '../map-engine/generator';

export interface CloudMapRecord {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description?: string;
  map_data: FantasyMap;
  map_type: MapType;
  map_style: MapStyle;
  seed: number;
  thumbnail_url?: string;
  is_public: boolean;
  is_featured: boolean;
  view_count: number;
  remix_count: number;
  created_at: string;
  updated_at: string;

  // Joined Profile info for gallery & public page
  author_name?: string;
  author_username?: string;
  author_avatar?: string;
  liked_by_user?: boolean;
}

const CLOUD_MAPS_STORAGE_KEY = 'createfantasymap_cloud_maps_db';
const LIKES_STORAGE_KEY = 'createfantasymap_likes_db';

// Initial pre-loaded showcase maps for gallery
const INITIAL_PRESET_MAPS: CloudMapRecord[] = [
  {
    id: 'map_eldoria',
    user_id: 'user_master_cartographer',
    slug: 'the-continent-of-eldoria',
    title: 'The Continent of Eldoria',
    description: 'A vast fantasy continent with three rival kingdoms, central lakes, and northern mountain barrier.',
    map_data: generateFantasyMap({
      seed: 847291,
      type: 'continent',
      style: 'parchment',
      width: 1200,
      height: 800,
      mountainDensity: 7,
      forestDensity: 6,
      riverDensity: 5,
      settlementCount: 10,
      kingdomCount: 3,
      showDeserts: true,
      showSwamps: true,
      showSnow: true
    }),
    map_type: 'continent',
    map_style: 'parchment',
    seed: 847291,
    is_public: true,
    is_featured: true,
    view_count: 1420,
    remix_count: 42,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    author_name: 'Archmage Eldrin',
    author_username: 'archmage_eldrin',
    author_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=archmage_eldrin'
  },
  {
    id: 'map_shadowfall',
    user_id: 'user_dark_master',
    slug: 'shadowfall-realm',
    title: 'Shadowfall Realm',
    description: 'Obsidian crags and glowing golden coastlines shrouded in ancient mystery.',
    map_data: generateFantasyMap({
      seed: 492103,
      type: 'kingdom',
      style: 'dark-fantasy',
      width: 1200,
      height: 800,
      mountainDensity: 8,
      forestDensity: 5,
      riverDensity: 4,
      settlementCount: 8,
      kingdomCount: 2,
      showDeserts: true,
      showSwamps: false,
      showSnow: true
    }),
    map_type: 'kingdom',
    map_style: 'dark-fantasy',
    seed: 492103,
    is_public: true,
    is_featured: true,
    view_count: 890,
    remix_count: 18,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    author_name: 'Lord Vaelen',
    author_username: 'lord_vaelen',
    author_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lord_vaelen'
  },
  {
    id: 'map_siren_crest',
    user_id: 'user_sea_captain',
    slug: 'isle-of-sirens-crest',
    title: "Isle of Siren's Crest",
    description: 'Single isolated fantasy island featuring dense ancient woods and coastal fortress.',
    map_data: generateFantasyMap({
      seed: 129482,
      type: 'island',
      style: 'hand-drawn',
      width: 1200,
      height: 800,
      mountainDensity: 5,
      forestDensity: 8,
      riverDensity: 4,
      settlementCount: 5,
      kingdomCount: 1,
      showDeserts: false,
      showSwamps: true,
      showSnow: false
    }),
    map_type: 'island',
    map_style: 'hand-drawn',
    seed: 129482,
    is_public: true,
    is_featured: false,
    view_count: 650,
    remix_count: 9,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    author_name: 'Captain Morgan',
    author_username: 'captain_morgan',
    author_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=captain_morgan'
  },
  {
    id: 'map_iron_peaks',
    user_id: 'user_dwarf_smith',
    slug: 'the-iron-peak-passes',
    title: 'The Iron Peak Passes',
    description: 'Detailed highland region with strategic fortress passes and alpine villages.',
    map_data: generateFantasyMap({
      seed: 731948,
      type: 'region',
      style: 'clean',
      width: 1200,
      height: 800,
      mountainDensity: 9,
      forestDensity: 4,
      riverDensity: 6,
      settlementCount: 7,
      kingdomCount: 2,
      showDeserts: false,
      showSwamps: false,
      showSnow: true
    }),
    map_type: 'region',
    map_style: 'clean',
    seed: 731948,
    is_public: true,
    is_featured: false,
    view_count: 530,
    remix_count: 7,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    author_name: 'Thrain Ironfoot',
    author_username: 'thrain_ironfoot',
    author_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=thrain_ironfoot'
  }
];

function getStoredCloudMaps(): CloudMapRecord[] {
  try {
    const raw = localStorage.getItem(CLOUD_MAPS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLOUD_MAPS_STORAGE_KEY, JSON.stringify(INITIAL_PRESET_MAPS));
      return INITIAL_PRESET_MAPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRESET_MAPS;
  }
}

function saveStoredCloudMaps(maps: CloudMapRecord[]): void {
  try {
    localStorage.setItem(CLOUD_MAPS_STORAGE_KEY, JSON.stringify(maps));
  } catch (err) {
    console.warn('Failed to persist maps store:', err);
  }
}

function getStoredLikes(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(LIKES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredLikes(likes: Record<string, string[]>): void {
  try {
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes));
  } catch (err) {
    console.warn('Failed to persist likes store:', err);
  }
}

// Slug Generator
export function slugifyTitle(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  return `${base || 'fantasy-map'}-${id.slice(-6)}`;
}

// Map Data Service APIs
export const MapService = {
  // Fetch user's saved maps for dashboard
  async getUserMaps(userId: string): Promise<CloudMapRecord[]> {
    const all = getStoredCloudMaps();
    return all.filter((m) => m.user_id === userId);
  },

  // Save or Update Map
  async saveMap(
    userId: string,
    map: FantasyMap,
    options: { title: string; description?: string; is_public: boolean; authorName?: string; authorUsername?: string; authorAvatar?: string }
  ): Promise<CloudMapRecord> {
    const all = getStoredCloudMaps();
    const existingIndex = all.findIndex((m) => m.id === map.id);

    const slug = slugifyTitle(options.title, map.id);

    let record: CloudMapRecord;

    if (existingIndex >= 0) {
      record = {
        ...all[existingIndex],
        title: options.title,
        description: options.description,
        map_data: { ...map, name: options.title },
        map_type: map.type,
        map_style: map.style,
        seed: map.seed,
        is_public: options.is_public,
        updated_at: new Date().toISOString()
      };
      all[existingIndex] = record;
    } else {
      record = {
        id: map.id,
        user_id: userId,
        slug,
        title: options.title,
        description: options.description,
        map_data: { ...map, name: options.title },
        map_type: map.type,
        map_style: map.style,
        seed: map.seed,
        is_public: options.is_public,
        is_featured: false,
        view_count: 0,
        remix_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_name: options.authorName || 'Anonymous',
        author_username: options.authorUsername || 'guest',
        author_avatar: options.authorAvatar
      };
      all.unshift(record);
    }

    saveStoredCloudMaps(all);
    return record;
  },

  // Fetch all public maps
  async getPublicMaps(): Promise<CloudMapRecord[]> {
    return getStoredCloudMaps().filter((m) => m.is_public);
  },

  // Fetch Public Gallery maps with search, filter, and sorting
  async getPublicGallery(filters?: {
    search?: string;
    mapType?: string;
    style?: string;
    category?: 'featured' | 'popular' | 'latest' | 'trending';
    sortBy?: 'popular' | 'latest' | 'views' | 'likes';
    userId?: string;
  }): Promise<CloudMapRecord[]> {
    let maps = getStoredCloudMaps().filter((m) => m.is_public);
    const likesStore = getStoredLikes();

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      maps = maps.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q)) ||
          (m.author_username && m.author_username.toLowerCase().includes(q))
      );
    }

    if (filters?.mapType && filters.mapType !== 'all') {
      maps = maps.filter((m) => m.map_type === filters.mapType);
    }

    if (filters?.style && filters.style !== 'all') {
      maps = maps.filter((m) => m.map_style === filters.style);
    }

    if (filters?.category === 'featured') {
      maps = maps.filter((m) => m.is_featured);
    }

    // Attach liked_by_user
    if (filters?.userId) {
      maps = maps.map((m) => ({
        ...m,
        liked_by_user: (likesStore[m.id] || []).includes(filters.userId!)
      }));
    }

    // Sort order
    if (filters?.sortBy === 'latest' || filters?.category === 'latest') {
      maps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      maps.sort((a, b) => b.view_count + b.remix_count * 2 - (a.view_count + a.remix_count * 2));
    }

    return maps;
  },

  // Fetch single map by slug or ID
  async getMapBySlug(slugOrId: string, currentUserId?: string): Promise<CloudMapRecord | null> {
    const all = getStoredCloudMaps();
    const found = all.find((m) => m.slug === slugOrId || m.id === slugOrId);

    if (!found) return null;

    if (currentUserId) {
      const likesStore = getStoredLikes();
      found.liked_by_user = (likesStore[found.id] || []).includes(currentUserId);
    }

    return found;
  },

  // Remix Map Action
  async remixMap(
    originalMapId: string,
    newUserId: string,
    newAuthor: { name: string; username: string; avatar?: string }
  ): Promise<CloudMapRecord | null> {
    const all = getStoredCloudMaps();
    const original = all.find((m) => m.id === originalMapId);
    if (!original) return null;

    // Increment remix count on original
    original.remix_count += 1;

    const newMapId = `map_remix_${Date.now().toString(36)}`;
    const newTitle = `${original.title} (Remix)`;
    const newSlug = slugifyTitle(newTitle, newMapId);

    const remixedMapData: FantasyMap = {
      ...original.map_data,
      id: newMapId,
      name: newTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newRecord: CloudMapRecord = {
      id: newMapId,
      user_id: newUserId,
      slug: newSlug,
      title: newTitle,
      description: `Remixed from "${original.title}" by @${original.author_username || 'creator'}`,
      map_data: remixedMapData,
      map_type: original.map_type,
      map_style: original.map_style,
      seed: original.seed,
      is_public: false,
      is_featured: false,
      view_count: 0,
      remix_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_name: newAuthor.name,
      author_username: newAuthor.username,
      author_avatar: newAuthor.avatar
    };

    all.unshift(newRecord);
    saveStoredCloudMaps(all);
    return newRecord;
  },

  // Like / Unlike Map
  async toggleLike(mapId: string, userId: string): Promise<{ liked: boolean; totalLikes: number }> {
    const likesStore = getStoredLikes();
    const userList = likesStore[mapId] || [];
    const hasLiked = userList.includes(userId);

    let nextList: string[];
    if (hasLiked) {
      nextList = userList.filter((id) => id !== userId);
    } else {
      nextList = [...userList, userId];
    }

    likesStore[mapId] = nextList;
    saveStoredLikes(likesStore);

    return { liked: !hasLiked, totalLikes: nextList.length };
  },

  // Increment View Count
  async incrementViewCount(mapId: string): Promise<number> {
    const all = getStoredCloudMaps();
    const map = all.find((m) => m.id === mapId);
    if (map) {
      map.view_count += 1;
      saveStoredCloudMaps(all);
      return map.view_count;
    }
    return 0;
  },

  // Delete Map
  async deleteMap(mapId: string, userId: string): Promise<boolean> {
    let all = getStoredCloudMaps();
    const map = all.find((m) => m.id === mapId);

    if (!map || map.user_id !== userId) return false;

    all = all.filter((m) => m.id !== mapId);
    saveStoredCloudMaps(all);
    return true;
  },

  // Report Map
  async reportMap(mapId: string, userId: string, reason: string, details?: string): Promise<boolean> {
    console.log('Report filed:', { mapId, userId, reason, details });
    return true;
  }
};
