import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Shield, Plus, Compass, ArrowRight, BookOpen, Users } from 'lucide-react';
import { CampaignService } from '../../lib/supabase/campaignService';
import { WorldService } from '../../lib/supabase/worldService';
import type { Campaign } from '../../types/campaign';
import type { World } from '../../types/world';
import { useAuth } from '../../lib/supabase/authStore';
import { CreateCampaignWizardModal } from '../../components/campaign/CreateCampaignWizardModal';

interface CampaignsListPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onOpenCampaign: (campaignId: string) => void;
}

export const CampaignsListPage: React.FC<CampaignsListPageProps> = ({
  onNavigateCreate,
  onNavigateHome,
  onOpenCampaign
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'user_current';

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizardModal, setShowWizardModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const cmps = CampaignService.getUserCampaigns(userId);
    const wrlds = await WorldService.getUserWorlds(userId);
    setCampaigns(cmps);
    setWorlds(wrlds);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Header Card */}
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-400" />
              <h1 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-100">Tabletop RPG Campaigns</h1>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Turn your fantasy maps and worlds into tabletop RPG campaign sessions with GM tools, live workspace, and AI session recaps.
            </p>
          </div>

          <button
            onClick={() => setShowWizardModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Campaigns Grid */}
        <div className="space-y-4">
          <h2 className="font-cinzel font-bold text-xl text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" /> Active & Planned Campaigns ({campaigns.length})
          </h2>

          {loading ? (
            <div className="p-12 text-center text-amber-300 font-cinzel">Loading Campaign Archives...</div>
          ) : campaigns.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4 max-w-md mx-auto my-8">
              <Shield className="w-12 h-12 text-slate-700 mx-auto" />
              <div>
                <p className="font-cinzel font-bold text-slate-200 text-base">No Tabletop Campaigns Created Yet</p>
                <p className="text-xs text-slate-400 mt-1">Start a campaign to run tabletop sessions on your fantasy worlds.</p>
              </div>
              <button
                onClick={() => setShowWizardModal(true)}
                className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                + Create First Campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((cmp) => (
                <div
                  key={cmp.id}
                  onClick={() => onOpenCampaign(cmp.id)}
                  className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                        {cmp.genre}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        {cmp.status}
                      </span>
                    </div>

                    <h3 className="font-cinzel font-bold text-lg text-slate-100 group-hover:text-amber-300 transition-colors">
                      {cmp.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{cmp.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-sky-400" /> {cmp.system}</span>
                    <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Open Campaign <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Campaign Setup Wizard Modal */}
      {showWizardModal && (
        <CreateCampaignWizardModal
          worlds={worlds}
          userId={userId}
          onClose={() => setShowWizardModal(false)}
          onCampaignCreated={(cmp) => {
            loadData();
            onOpenCampaign(cmp.id);
          }}
        />
      )}

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
