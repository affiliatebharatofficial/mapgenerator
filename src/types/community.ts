import type { MapStyle, MapType } from './map';
import type { CloudMapRecord } from '../lib/supabase/mapService';
import type { World } from './world';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface CreatorProfileInfo {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  cover_image?: string;
  bio?: string;
  joined_at: string;
  map_count: number;
  world_count: number;
  follower_count: number;
  following_count: number;
  total_likes: number;
  is_following?: boolean;
}

export interface Collection {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  cover_image?: string;
  item_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_username?: string;
  author_avatar?: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  map_id?: string;
  world_id?: string;
  created_at: string;
  map?: CloudMapRecord;
  world?: World;
}

export interface Comment {
  id: string;
  user_id: string;
  map_id?: string;
  world_id?: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at?: string;
  author_name: string;
  author_username: string;
  author_avatar?: string;
  replies?: Comment[];
}

export type NotificationType =
  | 'follow'
  | 'map_like'
  | 'world_like'
  | 'comment'
  | 'remix'
  | 'featured'
  | 'collection_save';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id: string;
  actor_name: string;
  actor_username: string;
  actor_avatar?: string;
  target_type: 'map' | 'world' | 'collection' | 'user';
  target_id: string;
  target_title?: string;
  message: string;
  read_at?: string | null;
  created_at: string;
}

export interface ExploreFilters {
  contentType: 'all' | 'maps' | 'worlds' | 'creators';
  mapType?: 'all' | MapType;
  style?: 'all' | MapStyle;
  sort: 'trending' | 'popular' | 'newest' | 'most_liked' | 'most_remixed';
  searchQuery?: string;
}

export interface SearchResult {
  maps: CloudMapRecord[];
  worlds: World[];
  creators: CreatorProfileInfo[];
}

export interface ContentReport {
  id: string;
  reporter_id: string;
  target_type: 'map' | 'world' | 'comment' | 'profile';
  target_id: string;
  reason: 'spam' | 'offensive' | 'copyright' | 'harassment' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface CreatorAnalytics {
  totalViews: number;
  totalLikes: number;
  totalSaves: number;
  totalRemixes: number;
  followerGrowth: number;
  viewsByPeriod: { date: string; views: number }[];
}
