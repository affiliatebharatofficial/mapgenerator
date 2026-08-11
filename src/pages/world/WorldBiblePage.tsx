import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { BreadcrumbNav } from '../../components/seo/BreadcrumbNav';
import {
  Globe,
  BookOpen,
  Share2,
  Activity,
  Plus,
  Shield,
  Users,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { WorldService } from '../../lib/supabase/worldService';
import type { World } from '../../types/world';
import { KnowledgeGraphCanvas } from '../../components/world/KnowledgeGraphCanvas';
import { LoreEditorPanel } from '../../components/world/LoreEditorPanel';
import { ConsistencyAuditPanel } from '../../components/world/ConsistencyAuditPanel';

interface WorldBiblePageProps {
  worldId: string;
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

export const WorldBiblePage: React.FC<WorldBiblePageProps> = ({
  worldId,
  onNavigateCreate,
  onNavigateHome
}) => {
  const [world, setWorld] = useState<World | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'graph' | 'lore' | 'consistency' | 'kingdoms' | 'cities' | 'characters' | 'timeline'
  >('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await WorldService.getWorldById(worldId);
      setWorld(res);
      setLoading(false);
    }
    load();
  }, [worldId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
      <BreadcrumbNav pathname={`/world/${worldId}/bible`} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* World Header Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-amber-400" />
              <h1 className="font-cinzel font-bold text-3xl text-slate-100">{world?.name || 'World Compendium'}</h1>
              <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                World Bible
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl font-serif">{world?.description || 'Central canonical database for fantasy worldbuilding.'}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.location.pathname = `/world/${worldId}`)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl"
            >
              Open World Overview
            </button>
            <button
              onClick={() => (window.location.pathname = '/export')}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" /> Export Worldbook
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview & Stats', icon: Globe },
            { id: 'graph', label: 'Knowledge Graph', icon: Share2 },
            { id: 'lore', label: 'Lore Compendium', icon: BookOpen },
            { id: 'consistency', label: 'Canon Consistency', icon: Activity },
            { id: 'kingdoms', label: 'Kingdoms', icon: Shield },
            { id: 'cities', label: 'Cities & Maps', icon: MapPin },
            { id: 'characters', label: 'Characters', icon: Users },
            { id: 'timeline', label: 'Timeline & Eras', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="font-mono text-2xl font-bold text-amber-400">12</span>
              <span className="text-xs text-slate-400 block font-cinzel font-bold">Canonical Kingdoms</span>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="font-mono text-2xl font-bold text-sky-400">47</span>
              <span className="text-xs text-slate-400 block font-cinzel font-bold">Cities & Towns</span>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="font-mono text-2xl font-bold text-purple-400">86</span>
              <span className="text-xs text-slate-400 block font-cinzel font-bold">Characters</span>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="font-mono text-2xl font-bold text-emerald-400">100%</span>
              <span className="text-xs text-slate-400 block font-cinzel font-bold">Canon Health</span>
            </div>
          </div>
        )}

        {activeTab === 'graph' && <KnowledgeGraphCanvas worldId={worldId} />}
        {activeTab === 'lore' && <LoreEditorPanel worldId={worldId} />}
        {activeTab === 'consistency' && <ConsistencyAuditPanel worldId={worldId} />}
        {activeTab === 'kingdoms' && (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 space-y-2">
            <Shield className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">Canonical Feudal Realms & Rulers</h3>
            <p className="text-xs text-slate-400">High Kingdom of Sunreach, Ironpeak Dominion, Vaeloria Duchy, Shadow Coven Realm.</p>
          </div>
        )}
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
