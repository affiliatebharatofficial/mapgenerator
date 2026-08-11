import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Plus, Globe, Lock, Eye, Copy, Trash2, Edit, Share2, Compass, Layers } from 'lucide-react';
import { useAuth } from '../lib/supabase/authStore';
import { MapService, type CloudMapRecord } from '../lib/supabase/mapService';
import { ShareModal } from '../components/social/ShareModal';

interface DashboardPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onEditMap: (mapId: string) => void;
  onViewPublicMap: (slug: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateCreate,
  onNavigateHome,
  onEditMap,
  onViewPublicMap
}) => {
  const { user, profile } = useAuth();
  const [maps, setMaps] = useState<CloudMapRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [deleteTarget, setDeleteTarget] = useState<CloudMapRecord | null>(null);
  const [shareTarget, setShareTarget] = useState<CloudMapRecord | null>(null);

  const loadMaps = async () => {
    if (user) {
      setLoading(true);
      const userMaps = await MapService.getUserMaps(user.id);
      setMaps(userMaps);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaps();
  }, [user]);

  const handleDuplicate = async (map: CloudMapRecord) => {
    if (!user) return;
    const copyTitle = `${map.title} Copy`;
    await MapService.saveMap(user.id, { ...map.map_data, id: `map_${Date.now().toString(36)}`, name: copyTitle }, {
      title: copyTitle,
      description: map.description,
      is_public: false,
      authorName: profile?.display_name,
      authorUsername: profile?.username,
      authorAvatar: profile?.avatar_url
    });
    loadMaps();
  };

  const handleTogglePublish = async (map: CloudMapRecord) => {
    if (!user) return;
    await MapService.saveMap(user.id, map.map_data, {
      title: map.title,
      description: map.description,
      is_public: !map.is_public,
      authorName: profile?.display_name,
      authorUsername: profile?.username,
      authorAvatar: profile?.avatar_url
    });
    loadMaps();
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget && user) {
      await MapService.deleteMap(deleteTarget.id, user.id);
      setDeleteTarget(null);
      loadMaps();
    }
  };

  const totalMaps = maps.length;
  const publicMaps = maps.filter((m) => m.is_public).length;
  const totalViews = maps.reduce((acc, m) => acc + (m.view_count || 0), 0);
  const totalRemixes = maps.reduce((acc, m) => acc + (m.remix_count || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* User Welcome & Stats Header */}
        <div className="glass-panel p-8 rounded-2xl border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'user'}`}
              alt={profile?.display_name}
              className="w-16 h-16 rounded-2xl border-2 border-amber-500/40 bg-slate-900 shadow-xl"
            />
            <div>
              <h1 className="font-cinzel font-bold text-2xl text-slate-100">
                Welcome, <span className="gold-gradient-text">{profile?.display_name || 'Cartographer'}</span>
              </h1>
              <p className="text-xs text-amber-300/80 font-mono mt-0.5">@{profile?.username || 'explorer'}</p>
            </div>
          </div>

          <button
            onClick={onNavigateCreate}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Map</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#121620]/80 p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Worlds</span>
            <div className="font-cinzel font-bold text-2xl text-amber-300">{totalMaps}</div>
          </div>
          <div className="bg-[#121620]/80 p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Public Maps</span>
            <div className="font-cinzel font-bold text-2xl text-emerald-400">{publicMaps}</div>
          </div>
          <div className="bg-[#121620]/80 p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Views</span>
            <div className="font-cinzel font-bold text-2xl text-sky-400">{totalViews}</div>
          </div>
          <div className="bg-[#121620]/80 p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Remixes</span>
            <div className="font-cinzel font-bold text-2xl text-purple-400">{totalRemixes}</div>
          </div>
        </div>

        {/* My Maps Grid Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-cinzel font-bold text-xl text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <span>My Saved Worlds</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">{maps.length} Saved Maps</span>
          </div>

          {loading ? (
            /* Skeleton Loading State */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-[#121620]/60 rounded-2xl border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : maps.length === 0 ? (
            /* Empty State */
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="font-cinzel font-bold text-lg text-amber-200">Your World is Waiting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create your first fantasy map, add mountains, forests, kingdoms and cities, and save it to your cloud account.
              </p>
              <button
                onClick={onNavigateCreate}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Map</span>
              </button>
            </div>
          ) : (
            /* Maps Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {maps.map((map) => (
                <div
                  key={map.id}
                  className="glass-card rounded-2xl border border-slate-800 bg-[#121620]/70 overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 transition-all"
                >
                  {/* Thumbnail Card Header */}
                  <div
                    onClick={() => (map.is_public ? onViewPublicMap(map.slug) : onEditMap(map.id))}
                    className="h-44 bg-[#090b0e] relative overflow-hidden cursor-pointer flex items-center justify-center p-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-transparent to-transparent z-10" />

                    <div className="w-full h-full rounded-lg border border-amber-500/20 bg-[#161a24] flex items-center justify-center relative p-2">
                      <div className="text-center space-y-1 z-20">
                        <span className="text-3xl">{map.map_type === 'island' ? '🏝️' : map.map_type === 'archipelago' ? '🗺️' : '🌍'}</span>
                        <p className="font-cinzel text-xs font-bold text-amber-200">{map.title}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`absolute top-3 left-3 z-20 text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                        map.is_public
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {map.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{map.is_public ? 'Public' : 'Private'}</span>
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3
                          onClick={() => onEditMap(map.id)}
                          className="font-cinzel font-bold text-base text-slate-100 hover:text-amber-300 cursor-pointer transition-colors"
                        >
                          {map.title}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500 capitalize bg-slate-900 px-2 py-0.5 rounded">
                          {map.map_style}
                        </span>
                      </div>

                      {map.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {map.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-3">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-sky-400" /> {map.view_count}</span>
                        <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-purple-400" /> {map.remix_count}</span>
                      </div>
                    </div>

                    {/* Card Actions Bar */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onEditMap(map.id)}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicate(map)}
                          title="Duplicate Map"
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleTogglePublish(map)}
                          title={map.is_public ? 'Make Private' : 'Publish Map'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            map.is_public ? 'text-emerald-400 hover:bg-emerald-950/30' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                          }`}
                        >
                          <Globe className="w-4 h-4" />
                        </button>

                        {map.is_public && (
                          <button
                            onClick={() => setShareTarget(map)}
                            title="Share Map"
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteTarget(map)}
                          title="Delete Map"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-cinzel font-bold text-lg text-rose-300">
              Delete "{deleteTarget.title}"?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this map? This action cannot be undone and will remove it permanently.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Delete Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareTarget && (
        <ShareModal
          mapTitle={shareTarget.title}
          shareUrl={`${window.location.origin}/map/${shareTarget.slug}`}
          onClose={() => setShareTarget(null)}
        />
      )}

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
