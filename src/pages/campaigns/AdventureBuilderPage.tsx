import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { BreadcrumbNav } from '../../components/seo/BreadcrumbNav';
import { Compass, Eye, EyeOff, Sparkles, BookOpen, Layers } from 'lucide-react';
import type { GroundedAdventurePackage } from '../../types/adventure';
import { InvestigationBoardCanvas } from '../../components/adventure/InvestigationBoardCanvas';
import { QuestDependencyGraph } from '../../components/adventure/QuestDependencyGraph';
import { AdventureGeneratorModal } from '../../components/adventure/AdventureGeneratorModal';

interface AdventureBuilderPageProps {
  campaignId: string;
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

export const AdventureBuilderPage: React.FC<AdventureBuilderPageProps> = ({
  campaignId,
  onNavigateCreate,
  onNavigateHome
}) => {
  const [isGmView, setIsGmView] = useState(true);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [activePackage, setActivePackage] = useState<GroundedAdventurePackage | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
      <BreadcrumbNav pathname={`/campaigns/${campaignId}/adventure`} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-400" />
              <h1 className="font-cinzel font-bold text-3xl text-slate-100">AI Campaign Adventure Engine</h1>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl font-serif">Grounded storylines, investigation boards, and branching quest management.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGmView(!isGmView)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              {isGmView ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-sky-400" />}
              <span>{isGmView ? 'GM View Active' : 'Player View Active'}</span>
            </button>
            <button
              onClick={() => setShowGeneratorModal(true)}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Generate Grounded Adventure
            </button>
          </div>
        </div>

        {activePackage ? (
          <div className="space-y-8">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-mono text-[10px] text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                Active Adventure: {activePackage.type.replace('_', ' ')}
              </span>
              <h2 className="font-cinzel font-bold text-xl text-slate-100">{activePackage.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed font-serif">{activePackage.summary}</p>
            </div>

            <QuestDependencyGraph objectives={activePackage.objectives} />
            <InvestigationBoardCanvas clues={activePackage.clues} gmSecrets={isGmView ? activePackage.gmSecrets : []} />
          </div>
        ) : (
          <div className="glass-panel p-16 text-center rounded-3xl border border-slate-800 space-y-3 max-w-md mx-auto">
            <Compass className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">No Active Adventure Loaded</h3>
            <p className="text-xs text-slate-400">Generate a new storyline grounded in your World Bible context.</p>
            <button
              onClick={() => setShowGeneratorModal(true)}
              className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow"
            >
              Launch Adventure Generator
            </button>
          </div>
        )}
      </main>

      {showGeneratorModal && (
        <AdventureGeneratorModal
          worldId="world_default"
          onAdventureGenerated={(pkg) => setActivePackage(pkg)}
          onClose={() => setShowGeneratorModal(false)}
        />
      )}

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
