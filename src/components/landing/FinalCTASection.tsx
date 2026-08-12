import React from 'react';
import { Sparkles, Map } from 'lucide-react';

interface FinalCTASectionProps {
  onNavigateCreate: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onNavigateCreate }) => {
  return (
    <section className="py-24 bg-gradient-to-b from-[#0b0d11] to-[#07090c] relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <Map className="w-7 h-7" />
        </div>

        <h2 className="font-cinzel font-bold text-3xl sm:text-5xl text-slate-100 leading-tight">
          Start Building Your <span className="gold-gradient-text">Fantasy World</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Turn your worldbuilding ideas into a detailed fantasy map. Generate, customize, and export high-resolution cartography for your stories and RPG campaigns.
        </p>

        <div className="pt-4">
          <button
            onClick={onNavigateCreate}
            className="px-9 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-base rounded-xl shadow-2xl shadow-amber-500/25 hover:scale-105 transition-all inline-flex items-center gap-2.5"
          >
            <Sparkles className="w-5 h-5" />
            <span>Create Your Fantasy Map</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 font-mono">
          Free during launch • No credit card required
        </p>
      </div>
    </section>
  );
};
