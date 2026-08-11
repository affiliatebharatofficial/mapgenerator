import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Search, Filter, Compass, Eye, Layers, ArrowRight } from 'lucide-react';
import { MapService, type CloudMapRecord } from '../lib/supabase/mapService';
import { useAuth } from '../lib/supabase/authStore';

interface GalleryPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onViewPublicMap: (slug: string) => void;
  onNavigateProfile: (username: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  onNavigateCreate,
  onNavigateHome,
  onViewPublicMap,
  onNavigateProfile
}) => {
  const { user } = useAuth();
  const [maps, setMaps] = useState<CloudMapRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs State
  const [category, setCategory] = useState<'all' | 'featured' | 'popular' | 'latest'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'latest'>('popular');

  const loadGallery = async () => {
    setLoading(true);
    const results = await MapService.getPublicGallery({
      search: searchQuery,
      mapType: selectedType,
      style: selectedStyle,
      category: category === 'all' ? undefined : (category as any),
      sortBy,
      userId: user?.id
    });
    setMaps(results);
    setLoading(false);
  };

  useEffect(() => {
    loadGallery();
  }, [category, searchQuery, selectedType, selectedStyle, sortBy, user?.id]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header Title Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
            <Compass className="w-3.5 h-3.5" />
            <span>Community Cartography Gallery</span>
          </div>

          <h1 className="font-cinzel font-black text-4xl sm:text-5xl text-slate-100">
            Explore <span className="gold-gradient-text">Fantasy Worlds</span>
          </h1>

          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Discover community-created continents, islands, and realms. Click any map to inspect, like, share, or remix it.
          </p>
        </div>

        {/* Search Bar & Category Tabs */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex bg-[#121620] p-1.5 rounded-xl border border-slate-800 w-full md:w-auto">
              {[
                { id: 'all', label: 'All Maps' },
                { id: 'featured', label: '⭐ Featured' },
                { id: 'popular', label: '🔥 Popular' },
                { id: 'latest', label: '✨ Latest' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCategory(tab.id as any)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    category === tab.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search maps, description, or creator..."
                className="w-full bg-[#121620] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
              />
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-[#121620]/60 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold pr-2">
              <Filter className="w-3.5 h-3.5" /> Filter By:
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none"
            >
              <option value="all">All Types</option>
              <option value="continent">Continent</option>
              <option value="island">Island</option>
              <option value="archipelago">Archipelago</option>
              <option value="kingdom">Kingdom</option>
              <option value="region">Region</option>
            </select>

            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none"
            >
              <option value="all">All Map Styles</option>
              <option value="parchment">Classic Parchment</option>
              <option value="hand-drawn">Hand Drawn</option>
              <option value="dark-fantasy">Dark Fantasy</option>
              <option value="clean">Clean Fantasy</option>
              <option value="rpg">RPG / D&D</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none ml-auto"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="latest">Sort: Newest</option>
            </select>
          </div>
        </div>

        {/* Gallery Maps Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-72 bg-[#121620]/60 rounded-2xl border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : maps.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3 max-w-md mx-auto my-12">
            <Compass className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-cinzel font-bold text-lg text-slate-300">No Maps Found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or filter settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {maps.map((map) => (
              <div
                key={map.id}
                onClick={() => onViewPublicMap(map.slug)}
                className="glass-card rounded-2xl border border-slate-800 bg-[#121620]/70 overflow-hidden cursor-pointer group flex flex-col justify-between hover:border-amber-500/50 transition-all"
              >
                {/* Map Graphic Thumbnail Preview */}
                <div className="h-44 bg-[#090b0e] relative overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-transparent to-transparent z-10" />

                  <div className="w-full h-full rounded-lg border border-amber-500/20 bg-[#161a24] flex items-center justify-center relative p-2">
                    <div className="text-center space-y-1 z-20">
                      <span className="text-3xl">{map.map_type === 'island' ? '🏝️' : map.map_type === 'archipelago' ? '🗺️' : '🌍'}</span>
                      <p className="font-cinzel text-[11px] font-bold text-amber-200">{map.title}</p>
                    </div>
                  </div>

                  <span className="absolute top-3 left-3 z-20 text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 capitalize">
                    {map.map_type}
                  </span>
                </div>

                {/* Card Info */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-cinzel font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                      {map.title}
                    </h3>

                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>by</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateProfile(map.author_username || 'creator');
                        }}
                        className="text-amber-400 hover:underline font-semibold"
                      >
                        @{map.author_username || 'creator'}
                      </span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-sky-400" /> {map.view_count}</span>
                      <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-purple-400" /> {map.remix_count}</span>
                    </div>

                    <span className="text-amber-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1 text-[11px]">
                      View Map <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
