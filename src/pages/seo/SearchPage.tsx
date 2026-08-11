import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { SeoFooter } from '../../components/seo/SeoFooter';
import { Search, Compass, Globe, Users, Wand2, ArrowRight } from 'lucide-react';
import { CommunityService } from '../../lib/supabase/communityService';
import type { SearchResultItem } from '../../types/community';

interface SearchPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onViewPublicMap: (slug: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onNavigateCreate,
  onNavigateHome,
  onViewPublicMap
}) => {
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setLoading(true);
      const res = CommunityService.searchPublicContent(initialQuery);
      setResults(res);
      setLoading(false);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(query)}`);
    setLoading(true);
    const res = CommunityService.searchPublicContent(query);
    setResults(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Search Header Form */}
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/20 max-w-3xl mx-auto space-y-4">
          <h1 className="font-cinzel font-bold text-2xl text-slate-100 text-center">Search Fantasy Worlds & Cartography</h1>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search maps, worlds, creators, and tools..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500/40"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl">
              Search
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h2 className="font-cinzel font-bold text-lg text-slate-200">
            Search Results {query && `for "${query}"`} ({results.length})
          </h2>

          {loading ? (
            <div className="p-12 text-center text-amber-300 font-cinzel">Searching Public Archives...</div>
          ) : results.length === 0 ? (
            <div className="glass-panel p-12 text-center space-y-3 rounded-2xl border border-slate-800">
              <Search className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="font-cinzel font-bold text-slate-300">No public content matches your search.</p>
              <p className="text-xs text-slate-500">Try searching for "Eldoria", "Kingdom", or "Island".</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((res) => (
                <div
                  key={res.id}
                  onClick={() => res.url && (window.location.pathname = res.url)}
                  className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {res.type}
                    </span>
                    <h3 className="font-cinzel font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{res.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <SeoFooter />
    </div>
  );
};
