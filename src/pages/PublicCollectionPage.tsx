import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Bookmark, Compass, Eye, Heart, GitFork } from 'lucide-react';
import { CommunityService } from '../lib/supabase/communityService';
import type { Collection } from '../types/community';
import type { CloudMapRecord } from '../lib/supabase/mapService';

interface PublicCollectionPageProps {
  slug: string;
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onViewPublicMap: (slug: string) => void;
}

export const PublicCollectionPage: React.FC<PublicCollectionPageProps> = ({
  slug,
  onNavigateCreate,
  onNavigateHome,
  onViewPublicMap
}) => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<CloudMapRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CommunityService.getCollectionBySlug(slug).then((res) => {
      if (res) {
        setCollection(res.collection);
        setItems(res.items as CloudMapRecord[]);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0d11] text-slate-100 flex flex-col justify-between">
        <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
        <div className="p-12 text-center text-amber-400 font-cinzel">Loading Collection Archive...</div>
        <Footer onNavigateCreate={onNavigateCreate} />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#0b0d11] text-slate-100 flex flex-col justify-between">
        <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
        <div className="p-12 text-center text-rose-300 font-cinzel">Collection Not Found</div>
        <Footer onNavigateCreate={onNavigateCreate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Collection Hero Header */}
        <div className="glass-panel p-8 rounded-2xl border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-amber-400" />
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block">PUBLIC COLLECTION</span>
              <h1 className="font-cinzel font-bold text-3xl text-slate-100">{collection.name}</h1>
            </div>
          </div>
          {collection.description && <p className="text-xs text-slate-300 max-w-2xl">{collection.description}</p>}
          <div className="text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
            Curated by <strong className="text-amber-300">{collection.author_name || 'Master Cartographer'}</strong> • {items.length} Saved Items
          </div>
        </div>

        {/* Collection Grid */}
        <div className="space-y-4">
          <h3 className="font-cinzel font-bold text-lg text-slate-100">Saved Fantasy Maps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((map) => (
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
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" /> 34</span>
                    </div>
                    <span className="text-amber-400 font-semibold">{map.author_name || '@master'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
