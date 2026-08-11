import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Search, Compass, SlidersHorizontal, Eye, Heart, GitFork, User, Sparkles } from 'lucide-react';
import { CommunityService } from '../lib/supabase/communityService';
import type { CloudMapRecord } from '../lib/supabase/mapService';
import type { ExploreFilters, CreatorProfileInfo } from '../types/community';
import type { MapType, MapStyle } from '../types/map';

interface ExplorePageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onViewPublicMap: (slug: string) => void;
  onNavigateProfile: (username: string) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onNavigateCreate,
  onNavigateHome,
  onViewPublicMap,
  onNavigateProfile
}) => {
  const [filters, setFilters] = useState<ExploreFilters>({
    contentType: 'all',
    mapType: 'all',
    style: 'all',
    sort: 'trending',
    searchQuery: ''
  });

  const [maps, setMaps] = useState<CloudMapRecord[]>([]);
  const [creators, setCreators] = useState<CreatorProfileInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const { maps: resMaps } = await CommunityService.getExploreContent(filters);
    setMaps(resMaps);

    if (filters.searchQuery) {
      const res = await CommunityService.globalSearch(filters.searchQuery);
      setCreators(res.creators);
    } else {
      const c1 = await CommunityService.getCreatorProfile('master_cartographer');
      const c2 = await CommunityService.getCreatorProfile('lyra_maps');
      setCreators([c1, c2]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search & Hero Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="font-cinzel font-bold text-3xl sm:text-4xl text-amber-200">
            Explore Fantasy Creations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Discover community-created fantasy maps, trending worlds, and top cartographers.
          </p>

          {/* Global Search Bar */}
          <div className="relative max-w-xl mx-auto pt-2">
            <Search className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search maps, worlds, kingdoms, or creators..."
              className="w-full bg-slate-950 border border-amber-500/30 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-xl"
            />
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {/* Map Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold pr-1">MAP TYPE</span>
            {(['all', 'continent', 'kingdom', 'island', 'region'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilters((prev) => ({ ...prev, mapType: t as MapType }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  (filters.mapType || 'all') === t
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={filters.sort}
              onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value as any }))}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="trending">🔥 Trending</option>
              <option value="popular">⭐ Popular</option>
              <option value="newest">🆕 Newest</option>
              <option value="most_remixed">🌀 Most Remixed</option>
            </select>
          </div>
        </div>

        {/* Featured Creators Section */}
        {creators.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-cinzel font-bold text-lg text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Featured Creators
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {creators.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigateProfile(c.username)}
                  className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer flex items-center gap-4"
                >
                  <img src={c.avatar_url} alt={c.display_name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/30" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-cinzel font-bold text-sm text-slate-100 truncate">{c.display_name}</h4>
                    <span className="text-[11px] font-mono text-amber-400">@{c.username}</span>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{c.bio}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                    {c.follower_count} Followers
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Maps Grid */}
        <div className="space-y-4">
          <h3 className="font-cinzel font-bold text-lg text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" /> Community Maps ({maps.length})
          </h3>

          {loading ? (
            <div className="p-12 text-center text-slate-400 font-cinzel">Loading Explore Gallery...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {maps.map((map) => (
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
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-500" /> {map.view_count || 120}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" /> {map.view_count ? Math.floor(map.view_count / 5) : 24}</span>
                        <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5 text-purple-400" /> {map.remix_count || 3}</span>
                      </div>
                      <span className="text-amber-400 font-semibold">{map.author_name || '@master'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
