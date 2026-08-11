import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Compass, Eye, Heart, Layers, UserPlus, UserCheck, Bookmark, Globe } from 'lucide-react';
import { MapService, type CloudMapRecord } from '../lib/supabase/mapService';
import { CommunityService } from '../lib/supabase/communityService';
import type { CreatorProfileInfo, Collection } from '../types/community';
import { useAuth } from '../lib/supabase/authStore';

interface ProfilePageProps {
  username: string;
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onViewPublicMap: (slug: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  username,
  onNavigateCreate,
  onNavigateHome,
  onViewPublicMap
}) => {
  const { user, profile: authProfile } = useAuth();
  const currentUserId = user?.id || 'user_guest';

  const [creator, setCreator] = useState<CreatorProfileInfo | null>(null);
  const [publicMaps, setPublicMaps] = useState<CloudMapRecord[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeTab, setActiveTab] = useState<'maps' | 'collections' | 'about'>('maps');
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);
    const info = await CommunityService.getCreatorProfile(username, currentUserId);
    setCreator(info);

    const all = await MapService.getPublicGallery();
    const filtered = all.filter(
      (m) => (m.author_username?.toLowerCase() === username.toLowerCase() || username === 'master_cartographer') && m.is_public
    );
    setPublicMaps(filtered);

    const cols = CommunityService.getUserCollections(username);
    setCollections(cols);
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, [username, currentUserId]);

  const handleToggleFollow = () => {
    if (!creator) return;
    if (creator.is_following) {
      CommunityService.unfollowUser(currentUserId, username);
    } else {
      CommunityService.followUser(currentUserId, username, {
        name: authProfile?.display_name || 'Explorer',
        username: authProfile?.username || 'explorer',
        avatar: authProfile?.avatar_url
      });
    }
    loadProfile();
  };

  if (loading || !creator) {
    return (
      <div className="min-h-screen bg-[#0b0d11] text-slate-100 flex flex-col justify-between">
        <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
        <div className="p-12 text-center text-amber-400 font-cinzel">Loading Creator Profile...</div>
        <Footer onNavigateCreate={onNavigateCreate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      {/* Cover Image Header Banner */}
      <div className="h-48 sm:h-64 w-full relative overflow-hidden bg-slate-950">
        <img src={creator.cover_image} alt="Profile Cover" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d11] via-transparent to-transparent" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-8">
        {/* Profile Info Header Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={creator.avatar_url}
              alt={creator.display_name}
              className="w-24 h-24 rounded-2xl border-4 border-[#0b0d11] bg-slate-900 object-cover shadow-2xl shrink-0"
            />
            <div className="space-y-1">
              <h1 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-100">{creator.display_name}</h1>
              <p className="text-xs text-amber-300 font-mono">@{creator.username}</p>
              <p className="text-xs text-slate-300 pt-1 leading-relaxed max-w-xl">{creator.bio}</p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-800 pt-4 sm:pt-0">
            {username !== authProfile?.username && (
              <button
                onClick={handleToggleFollow}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                  creator.is_following
                    ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-rose-950 hover:text-rose-300'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {creator.is_following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{creator.is_following ? 'Following' : 'Follow Creator'}</span>
              </button>
            )}

            {/* Stats Counter */}
            <div className="flex items-center gap-4 text-center font-mono text-xs text-slate-400">
              <div>
                <strong className="text-slate-100 font-cinzel text-base block">{creator.map_count}</strong> Maps
              </div>
              <div>
                <strong className="text-slate-100 font-cinzel text-base block">{creator.follower_count}</strong> Followers
              </div>
              <div>
                <strong className="text-slate-100 font-cinzel text-base block">{creator.total_likes}</strong> Likes
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {(['maps', 'collections', 'about'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB 1: MAPS */}
        {activeTab === 'maps' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicMaps.map((map) => (
              <div
                key={map.id}
                onClick={() => onViewPublicMap(map.slug)}
                className="glass-card rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer overflow-hidden group flex flex-col justify-between"
              >
                <div className="h-44 bg-slate-950 relative flex items-center justify-center p-4">
                  <Compass className="w-16 h-16 text-slate-800 group-hover:scale-110 transition-transform duration-300" />
                  <span className="absolute top-3 left-3 text-[10px] font-mono font-bold uppercase bg-slate-900/90 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                    {map.map_type}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <h4 className="font-cinzel font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                    {map.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{map.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-500" /> {map.view_count || 140}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" /> 38</span>
                    </div>
                    <span className="text-amber-400 font-semibold">{map.map_style}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: COLLECTIONS */}
        {activeTab === 'collections' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {collections.map((col) => (
              <div key={col.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-300">
                  <Bookmark className="w-5 h-5 text-amber-400" />
                  <h3 className="font-cinzel font-bold text-lg">{col.name}</h3>
                </div>
                <p className="text-xs text-slate-300">{col.description}</p>
                <div className="text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                  {col.item_count} Saved Fantasy Items
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: ABOUT */}
        {activeTab === 'about' && (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4 max-w-2xl">
            <h3 className="font-cinzel font-bold text-xl text-slate-100">About @{creator.username}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{creator.bio}</p>
            <div className="text-xs font-mono text-slate-400 pt-3 border-t border-slate-800 space-y-1">
              <div>Member Since: <span className="text-slate-200">{creator.joined_at}</span></div>
              <div>Public Creations: <span className="text-amber-300">{creator.map_count} Maps & 3 Worlds</span></div>
            </div>
          </div>
        )}
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
