import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Rss, Compass, Heart, GitFork, MessageSquare, Share2 } from 'lucide-react';
import { CommunityService } from '../lib/supabase/communityService';
import type { CloudMapRecord } from '../lib/supabase/mapService';

interface FeedPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onViewPublicMap: (slug: string) => void;
  onNavigateProfile: (username: string) => void;
}

export const FeedPage: React.FC<FeedPageProps> = ({
  onNavigateCreate,
  onNavigateHome,
  onViewPublicMap,
  onNavigateProfile
}) => {
  const [feedItems, setFeedItems] = useState<CloudMapRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CommunityService.getExploreContent({ contentType: 'all', sort: 'newest' }).then((res) => {
      setFeedItems(res.maps);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Feed Header */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rss className="w-6 h-6 text-amber-400" />
            <div>
              <h1 className="font-cinzel font-bold text-2xl text-slate-100">Creator Activity Feed</h1>
              <p className="text-xs text-slate-400">Latest maps & worlds from cartographers you follow.</p>
            </div>
          </div>
        </div>

        {/* Feed Timeline */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-cinzel">Loading Creator Feed...</div>
        ) : feedItems.length === 0 ? (
          <div className="glass-panel p-12 text-center space-y-3 rounded-2xl border border-slate-800">
            <Compass className="w-12 h-12 text-amber-500/40 mx-auto" />
            <h3 className="font-cinzel font-bold text-lg text-slate-200">Your Feed is Empty</h3>
            <p className="text-xs text-slate-400">Follow creators in the Explore section to see their published creations here!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedItems.map((item) => (
              <div key={item.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => onNavigateProfile(item.author_username || 'master_cartographer')}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={item.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'}
                      alt={item.author_name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
                    />
                    <div>
                      <h4 className="font-cinzel font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                        {item.author_name || 'Master Cartographer'}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 block">Published a new fantasy map</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">2 hours ago</span>
                </div>

                {/* Map Content Card */}
                <div
                  onClick={() => onViewPublicMap(item.slug)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 cursor-pointer hover:border-amber-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-cinzel font-bold text-base text-amber-200">{item.title}</h3>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {item.map_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{item.description}</p>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center gap-6 text-xs text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                  <button className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">
                    <Heart className="w-4 h-4" /> <span>Like</span>
                  </button>
                  <button onClick={() => onViewPublicMap(item.slug)} className="flex items-center gap-1.5 hover:text-amber-300 transition-colors">
                    <MessageSquare className="w-4 h-4" /> <span>Comment</span>
                  </button>
                  <button onClick={() => onViewPublicMap(item.slug)} className="flex items-center gap-1.5 hover:text-purple-400 transition-colors">
                    <GitFork className="w-4 h-4" /> <span>Remix</span>
                  </button>
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
