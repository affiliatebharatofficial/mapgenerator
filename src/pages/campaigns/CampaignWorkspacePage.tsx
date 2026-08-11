import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { BreadcrumbNav } from '../../components/seo/BreadcrumbNav';
import { Shield, Play, Users, MapPin, BookOpen, Clock, Layers, Sparkles, MessageSquare, Activity } from 'lucide-react';
import { CampaignService } from '../../lib/supabase/campaignService';
import type { Campaign } from '../../types/campaign';
import { SessionManagerPanel } from '../../components/campaign/SessionManagerPanel';
import { PlayerDecisionPanel } from '../../components/campaign/PlayerDecisionPanel';

interface CampaignWorkspacePageProps {
  campaignId: string;
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

export const CampaignWorkspacePage: React.FC<CampaignWorkspacePageProps> = ({
  campaignId,
  onNavigateCreate,
  onNavigateHome
}) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sessions' | 'decisions' | 'quests' | 'characters' | 'factions' | 'settings'
  >('sessions');

  useEffect(() => {
    async function load() {
      const res = await CampaignService.getCampaignById(campaignId);
      setCampaign(res || null);
    }
    load();
  }, [campaignId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
      <BreadcrumbNav pathname={`/campaign/${campaignId}`} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-400" />
              <h1 className="font-cinzel font-bold text-3xl text-slate-100">{campaign?.name || 'Campaign Workspace'}</h1>
              <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                GM Workspace
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl font-serif">{campaign?.description || 'Central digital workspace for TTRPG session management.'}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.location.pathname = `/campaigns/${campaignId}/adventure`)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Launch AI Adventure
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'sessions', label: 'Session Manager', icon: Clock },
            { id: 'decisions', label: 'Player Decisions', icon: MessageSquare },
            { id: 'overview', label: 'Campaign Overview', icon: Shield },
            { id: 'characters', label: 'Player Characters', icon: Users },
            { id: 'factions', label: 'Faction Standing', icon: Activity }
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

        {/* Content */}
        {activeTab === 'sessions' && (
          <SessionManagerPanel campaignId={campaignId} worldId={campaign?.worldId || 'world_default'} sessionNumber={1} />
        )}
        {activeTab === 'decisions' && <PlayerDecisionPanel campaignId={campaignId} />}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <strong className="font-cinzel font-bold text-amber-400 block text-sm">Campaign Status</strong>
              <p className="text-slate-300">Active Campaign running under system: {campaign?.system || 'D&D 5e'}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <strong className="font-cinzel font-bold text-sky-400 block text-sm">Active Party Members</strong>
              <p className="text-slate-300">4 Player Characters assigned to campaign state.</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <strong className="font-cinzel font-bold text-purple-400 block text-sm">World Bible Reference</strong>
              <p className="text-slate-300">Connected to World Bible ID: {campaign?.worldId || 'world_default'}</p>
            </div>
          </div>
        )}
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
