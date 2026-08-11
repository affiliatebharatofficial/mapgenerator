import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Shield, CheckCircle, AlertTriangle, Users } from 'lucide-react';

interface CommunityGuidelinesPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

export const CommunityGuidelinesPage: React.FC<CommunityGuidelinesPageProps> = ({
  onNavigateCreate,
  onNavigateHome
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Guidelines Header */}
        <div className="glass-panel p-8 rounded-2xl border border-amber-500/20 text-center space-y-3">
          <Shield className="w-12 h-12 text-amber-400 mx-auto" />
          <h1 className="font-cinzel font-bold text-3xl text-amber-200">Community Guidelines</h1>
          <p className="text-xs text-slate-300 max-w-xl mx-auto">
            CreateFantasyMap is built for creators, Dungeon Masters, and writers. Our goal is a respectful, creative, and inspiring worldbuilding community.
          </p>
        </div>

        {/* Guidelines Sections */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-cinzel font-bold text-lg text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> 1. Respect Fellow Creators
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Support other cartographers, provide constructive feedback on public maps, and preserve remix attributions.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-cinzel font-bold text-lg text-amber-400 flex items-center gap-2">
              <Users className="w-5 h-5" /> 2. Authentic Remixing & Attribution
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When remixing a public map or world, original author credits remain attached. Do not claim another creator's work as original.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-cinzel font-bold text-lg text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> 3. No Harassment, Spam, or Copyright Abuse
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Do not post offensive content, spam comments, or infringe on copyrighted media. Content violating these rules will be removed upon review.
            </p>
          </div>
        </div>
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
