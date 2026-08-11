import type {
  Follow,
  CreatorProfileInfo,
  Collection,
  CollectionItem,
  Comment,
  Notification,
  ExploreFilters,
  SearchResult,
  ContentReport,
  CreatorAnalytics
} from '../../types/community';
import type { CloudMapRecord } from './mapService';
import { MapService } from './mapService';
import type { World } from '../../types/world';
import { WorldService } from './worldService';

const FOLLOWS_STORAGE_KEY = 'createfantasymap_follows_db';
const COLLECTIONS_STORAGE_KEY = 'createfantasymap_collections_db';
const COLLECTION_ITEMS_STORAGE_KEY = 'createfantasymap_collection_items_db';
const COMMENTS_STORAGE_KEY = 'createfantasymap_comments_db';
const NOTIFICATIONS_STORAGE_KEY = 'createfantasymap_notifications_db';
const WORLD_LIKES_STORAGE_KEY = 'createfantasymap_world_likes_db';

// Initial Mock Notifications
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    user_id: 'user_master_cartographer',
    type: 'follow',
    actor_id: 'usr_lyra',
    actor_name: 'Lyra Nightshade',
    actor_username: 'lyra_maps',
    actor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    target_type: 'user',
    target_id: 'user_master_cartographer',
    message: 'started following your cartography profile.',
    read_at: null,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif_2',
    user_id: 'user_master_cartographer',
    type: 'map_like',
    actor_id: 'usr_garreth',
    actor_name: 'Sir Garreth',
    actor_username: 'garreth_knight',
    actor_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    target_type: 'map',
    target_id: 'map_eldoria',
    target_title: 'The Continent of Eldoria',
    message: 'liked your map "The Continent of Eldoria".',
    read_at: null,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const CommunityService = {
  // ----------------------------------------------------
  // 1. FOLLOW SYSTEM
  // ----------------------------------------------------
  getFollows(): Follow[] {
    const data = localStorage.getItem(FOLLOWS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveFollows(follows: Follow[]) {
    localStorage.setItem(FOLLOWS_STORAGE_KEY, JSON.stringify(follows));
  },

  isFollowing(followerId: string, targetUsername: string): boolean {
    const follows = this.getFollows();
    return follows.some((f) => f.follower_id === followerId && f.following_id === targetUsername);
  },

  followUser(followerId: string, targetUsername: string, actorInfo?: { name: string; username: string; avatar?: string }): boolean {
    if (followerId === targetUsername) return false;
    const follows = this.getFollows();
    if (follows.some((f) => f.follower_id === followerId && f.following_id === targetUsername)) return false;

    follows.push({
      id: `fol_${Date.now()}`,
      follower_id: followerId,
      following_id: targetUsername,
      created_at: new Date().toISOString()
    });
    this.saveFollows(follows);

    // Trigger Notification
    if (actorInfo) {
      this.addNotification({
        user_id: targetUsername,
        type: 'follow',
        actor_id: followerId,
        actor_name: actorInfo.name,
        actor_username: actorInfo.username,
        actor_avatar: actorInfo.avatar,
        target_type: 'user',
        target_id: targetUsername,
        message: 'started following your cartography profile.'
      });
    }

    return true;
  },

  unfollowUser(followerId: string, targetUsername: string): boolean {
    let follows = this.getFollows();
    const len = follows.length;
    follows = follows.filter((f) => !(f.follower_id === followerId && f.following_id === targetUsername));
    this.saveFollows(follows);
    return follows.length < len;
  },

  getFollowerCount(username: string): number {
    return this.getFollows().filter((f) => f.following_id === username).length + 42; // Base offset for demo
  },

  getFollowingCount(username: string): number {
    return this.getFollows().filter((f) => f.follower_id === username).length + 12;
  },

  // ----------------------------------------------------
  // 2. CREATOR PROFILES
  // ----------------------------------------------------
  async getCreatorProfile(username: string, currentUserId?: string): Promise<CreatorProfileInfo> {
    const maps = await MapService.getUserMaps(username);
    const isFollow = currentUserId ? this.isFollowing(currentUserId, username) : false;

    return {
      id: username,
      username,
      display_name: username === 'master_cartographer' ? 'Master Eldoria' : username.replace('_', ' ').toUpperCase(),
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      cover_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=400&fit=crop',
      bio: 'Professional fantasy cartographer & RPG campaign worldbuilder. Creating dark fantasy continents & continent maps.',
      joined_at: 'January 2025',
      map_count: maps.length || 5,
      world_count: 3,
      follower_count: this.getFollowerCount(username),
      following_count: this.getFollowingCount(username),
      total_likes: 1280,
      is_following: isFollow
    };
  },

  // ----------------------------------------------------
  // 3. COLLECTIONS & SAVES
  // ----------------------------------------------------
  getCollections(): Collection[] {
    const data = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [
      {
        id: 'col_dnd',
        user_id: 'user_master_cartographer',
        slug: 'dnd-campaign-maps',
        name: 'D&D Campaign Maps',
        description: 'Selected dark fantasy maps for tabletop campaign sessions.',
        visibility: 'public',
        cover_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=400&fit=crop',
        item_count: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_name: 'Master Eldoria',
        author_username: 'master_cartographer'
      }
    ];
  },

  saveCollections(cols: Collection[]) {
    localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(cols));
  },

  getCollectionItems(): CollectionItem[] {
    const data = localStorage.getItem(COLLECTION_ITEMS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCollectionItems(items: CollectionItem[]) {
    localStorage.setItem(COLLECTION_ITEMS_STORAGE_KEY, JSON.stringify(items));
  },

  getUserCollections(userId: string): Collection[] {
    return this.getCollections().filter((c) => c.user_id === userId);
  },

  createCollection(userId: string, name: string, description?: string, visibility: 'public' | 'private' = 'public'): Collection {
    const cols = this.getCollections();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCol: Collection = {
      id: `col_${Date.now()}`,
      user_id: userId,
      slug: `${slug}-${Date.now().toString(36)}`,
      name,
      description,
      visibility,
      item_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    cols.push(newCol);
    this.saveCollections(cols);
    return newCol;
  },

  saveToCollection(collectionId: string, mapId?: string, worldId?: string): boolean {
    const items = this.getCollectionItems();
    if (items.some((i) => i.collection_id === collectionId && (i.map_id === mapId || i.world_id === worldId))) {
      return false; // Duplicate check
    }

    items.push({
      id: `ci_${Date.now()}`,
      collection_id: collectionId,
      map_id: mapId,
      world_id: worldId,
      created_at: new Date().toISOString()
    });
    this.saveCollectionItems(items);

    // Update item count on collection
    const cols = this.getCollections();
    const col = cols.find((c) => c.id === collectionId);
    if (col) {
      col.item_count = (col.item_count || 0) + 1;
      this.saveCollections(cols);
    }
    return true;
  },

  async getCollectionBySlug(slug: string): Promise<{ collection: Collection; items: (CloudMapRecord | World)[] } | null> {
    const cols = this.getCollections();
    const col = cols.find((c) => c.slug === slug || c.id === slug);
    if (!col) return null;

    const rawItems = this.getCollectionItems().filter((i) => i.collection_id === col.id);
    const publicMaps = await MapService.getPublicMaps();

    const items: (CloudMapRecord | World)[] = [];
    for (const item of rawItems) {
      if (item.map_id) {
        const m = publicMaps.find((map) => map.id === item.map_id);
        if (m) items.push(m);
      }
    }

    return { collection: col, items };
  },

  // ----------------------------------------------------
  // 4. COMMENTS SYSTEM
  // ----------------------------------------------------
  getComments(): Comment[] {
    const data = localStorage.getItem(COMMENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [
      {
        id: 'cmt_1',
        user_id: 'usr_lyra',
        map_id: 'map_eldoria',
        content: 'The coastline detailing on the northern mountain pass is stunning! Excellent cartography.',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        author_name: 'Lyra Nightshade',
        author_username: 'lyra_maps',
        author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
      }
    ];
  },

  saveComments(comments: Comment[]) {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
  },

  getCommentsForTarget(targetId: string, targetType: 'map' | 'world'): Comment[] {
    const all = this.getComments();
    const topLevel = all.filter((c) => !c.parent_id && (targetType === 'map' ? c.map_id === targetId : c.world_id === targetId));

    return topLevel.map((parent) => ({
      ...parent,
      replies: all.filter((r) => r.parent_id === parent.id)
    }));
  },

  addComment(
    userId: string,
    targetId: string,
    targetType: 'map' | 'world',
    content: string,
    authorInfo: { name: string; username: string; avatar?: string },
    parentId?: string
  ): Comment {
    const comments = this.getComments();
    const newComment: Comment = {
      id: `cmt_${Date.now()}`,
      user_id: userId,
      map_id: targetType === 'map' ? targetId : undefined,
      world_id: targetType === 'world' ? targetId : undefined,
      parent_id: parentId,
      content,
      created_at: new Date().toISOString(),
      author_name: authorInfo.name,
      author_username: authorInfo.username,
      author_avatar: authorInfo.avatar
    };

    comments.push(newComment);
    this.saveComments(comments);
    return newComment;
  },

  deleteComment(commentId: string, userId: string): boolean {
    let comments = this.getComments();
    const len = comments.length;
    comments = comments.filter((c) => c.id !== commentId && c.parent_id !== commentId);
    this.saveComments(comments);
    return comments.length < len;
  },

  // ----------------------------------------------------
  // 5. NOTIFICATIONS CENTER
  // ----------------------------------------------------
  getNotifications(): Notification[] {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  },

  saveNotifications(notifs: Notification[]) {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  },

  getUserNotifications(userId: string): Notification[] {
    return this.getNotifications().filter((n) => n.user_id === userId || n.user_id === 'user_master_cartographer');
  },

  addNotification(notif: Omit<Notification, 'id' | 'created_at'>) {
    const notifs = this.getNotifications();
    notifs.unshift({
      ...notif,
      id: `notif_${Date.now()}`,
      created_at: new Date().toISOString()
    });
    this.saveNotifications(notifs);
  },

  markAsRead(notifId: string) {
    const notifs = this.getNotifications();
    const n = notifs.find((item) => item.id === notifId);
    if (n) {
      n.read_at = new Date().toISOString();
      this.saveNotifications(notifs);
    }
  },

  markAllAsRead(userId: string) {
    const notifs = this.getNotifications();
    notifs.forEach((n) => {
      if (n.user_id === userId || n.user_id === 'user_master_cartographer') {
        n.read_at = new Date().toISOString();
      }
    });
    this.saveNotifications(notifs);
  },

  // ----------------------------------------------------
  // 6. DISCOVERY, EXPLORE & SEARCH
  // ----------------------------------------------------
  async getExploreContent(filters: ExploreFilters): Promise<{ maps: CloudMapRecord[]; worlds: World[] }> {
    let maps = await MapService.getPublicMaps();

    // Map Type filter
    if (filters.mapType && filters.mapType !== 'all') {
      maps = maps.filter((m) => m.map_type === filters.mapType);
    }

    // Map Style filter
    if (filters.style && filters.style !== 'all') {
      maps = maps.filter((m) => m.map_style === filters.style);
    }

    // Sort order
    if (filters.sort === 'popular' || filters.sort === 'trending') {
      maps.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    } else if (filters.sort === 'most_remixed') {
      maps.sort((a, b) => (b.remix_count || 0) - (a.remix_count || 0));
    } else {
      maps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return { maps, worlds: [] };
  },

  async globalSearch(query: string): Promise<SearchResult> {
    const q = query.toLowerCase().trim();
    if (!q) return { maps: [], worlds: [], creators: [], items: [] };

    const publicMaps = await MapService.getPublicMaps();
    const filteredMaps = publicMaps.filter(
      (m) => m.title.toLowerCase().includes(q) || m.map_type.includes(q) || m.map_style.includes(q)
    );

    const creators: CreatorProfileInfo[] = [
      await this.getCreatorProfile('master_cartographer'),
      await this.getCreatorProfile('lyra_maps')
    ].filter((c) => c.username.toLowerCase().includes(q) || c.display_name.toLowerCase().includes(q));

    const items = filteredMaps.map((m) => ({
      id: m.id,
      type: 'Map',
      title: m.title,
      description: `${m.map_type} map generated in ${m.map_style} style`,
      url: `/map/${m.slug}`
    }));

    return { maps: filteredMaps, worlds: [], creators, items };
  },

  searchPublicContent(query: string): any[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return [
      {
        id: 'res_1',
        type: 'Map',
        title: 'The Realm of Eldoria',
        description: 'Continent fantasy map with high mountain passes, winding rivers, and coastal kingdoms.',
        url: '/create'
      },
      {
        id: 'res_2',
        type: 'World',
        title: 'Archipelago of Eldoria',
        description: 'Island sea realm featuring 12 pirate ports, elven forests, and volcanic islands.',
        url: '/worlds'
      }
    ].filter((item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
  },

  // ----------------------------------------------------
  // 7. CONTENT REPORTING & SAFETY
  // ----------------------------------------------------
  reportContent(report: Omit<ContentReport, 'id' | 'status' | 'created_at'>): boolean {
    // Audit logging for moderation
    console.log('[CommunityService] Content Report Filed:', report);
    return true;
  }
};
