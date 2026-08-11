import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Plus, Globe, Trash2, Sparkles } from 'lucide-react';
import { useAuth } from '../../lib/supabase/authStore';
import { WorldService } from '../../lib/supabase/worldService';
import type { World, WorldStyle } from '../../types/world';
import { CreateWorldWizardModal } from '../../components/world/CreateWorldWizardModal';

interface WorldsDashboardPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onOpenWorld: (worldId: string) => void;
}

export const WorldsDashboardPage: React.FC<WorldsDashboardPageProps> = ({
  onNavigateCreate,
  onNavigateHome,
  onOpenWorld
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<World | null>(null);

  const loadWorlds = async () => {
    setLoading(true);
    const userWorlds = await WorldService.getUserWorlds(userId);
    setWorlds(userWorlds);
    setLoading(false);
  };

  useEffect(() => {
    loadWorlds();
  }, [userId]);

  const handleWorldCreated = async (data: { name: string; description: string; style: WorldStyle }) => {
    setShowWizard(false);
    const newWorld = await WorldService.createWorld(userId, data);
    onOpenWorld(newWorld.id);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await WorldService.deleteWorld(deleteTarget.id);
      setDeleteTarget(null);
      loadWorlds();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Top Header Banner */}
        <div className="glass-panel p-8 rounded-2xl border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
              <Globe className="w-3.5 h-3.5" />
              <span>Worldbuilding Archives</span>
            </div>

            <h1 className="font-cinzel font-bold text-3xl text-slate-100">
              My Fantasy <span className="gold-gradient-text">Worlds</span>
            </h1>

            <p className="text-xs text-slate-400 max-w-xl">
              Turn maps into living fantasy universes with kingdoms, cities, factions, characters, history, lore, and quests.
            </p>
          </div>

          <button
            onClick={() => setShowWizard(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New World</span>
          </button>
        </div>

        {/* Worlds Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-[#121620]/60 rounded-2xl border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : worlds.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12">
            <Globe className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="font-cinzel font-bold text-lg text-amber-200">No Fantasy Worlds Built Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create your first world or let the AI World Builder generate kingdoms, cities, factions, and lore for you.
            </p>
            <button
              onClick={() => setShowWizard(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First World</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {worlds.map((world) => (
              <div
                key={world.id}
                className="glass-card rounded-2xl border border-slate-800 bg-[#121620]/70 overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 transition-all"
              >
                {/* Cover Thumbnail Header */}
                <div
                  onClick={() => onOpenWorld(world.id)}
                  className="h-44 bg-[#090b0e] relative overflow-hidden cursor-pointer flex items-center justify-center"
                >
                  <img
                    src={world.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop'}
                    alt={world.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-slate-950/40 to-transparent z-10" />

                  <div className="absolute bottom-3 left-4 right-4 z-20 space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded uppercase border border-amber-500/30">
                      {world.style}
                    </span>
                    <h3 className="font-cinzel font-bold text-lg text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                      {world.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {world.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-amber-400 block font-bold">1</span>
                      <span>Map</span>
                    </div>
                    <div>
                      <span className="text-sky-400 block font-bold">12</span>
                      <span>Characters</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block font-bold">18</span>
                      <span>Locations</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => onOpenWorld(world.id)}
                      className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Open World
                    </button>

                    <button
                      onClick={() => setDeleteTarget(world)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Delete World"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-cinzel font-bold text-lg text-rose-300">
              Delete "{deleteTarget.name}"?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this world? All associated kingdoms, cities, characters, factions, and lore will be removed.
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
                className="px-5 py-2 bg-rose-600 text-slate-950 font-bold text-xs rounded-xl"
              >
                Delete World
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Modal */}
      {showWizard && (
        <CreateWorldWizardModal
          onClose={() => setShowWizard(false)}
          onWorldCreated={handleWorldCreated}
        />
      )}

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
