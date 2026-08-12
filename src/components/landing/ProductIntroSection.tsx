import React from 'react';
import { Compass, Map, Shield, Landmark } from 'lucide-react';

export const ProductIntroSection: React.FC = () => {
  return (
    <section className="py-16 bg-[#0d0f15] border-y border-slate-800/80 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>Fictional Geography & Worldbuilding</span>
        </div>

        <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
          Create Your Own <span className="gold-gradient-text">Fantasy World</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl mx-auto">
          CreateFantasyMap helps authors, Dungeon Masters, and worldbuilders turn raw fantasy concepts into clear, visual world maps. Our online <strong>fantasy world map generator</strong> instantly builds realistic geography across vast <strong>continents</strong>, sprawling <strong>kingdoms</strong>, and distinct political <strong>regions</strong>. From rugged <strong>mountains</strong> and dense <strong>forests</strong> to winding <strong>rivers</strong>, vibrant <strong>cities</strong>, bustling <strong>settlements</strong>, interconnected trade <strong>roads</strong>, and legendary <strong>landmarks</strong>, every element is generated procedurally and remains fully editable in your browser workspace.
        </p>

        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
            <Map className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <span className="text-xs font-bold text-slate-200 block">Continents & Biomes</span>
            <span className="text-[11px] text-slate-400">Realistic coastlines & terrain</span>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
            <Shield className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <span className="text-xs font-bold text-slate-200 block">Kingdoms & Borders</span>
            <span className="text-[11px] text-slate-400">Political realms & rulers</span>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
            <Landmark className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <span className="text-xs font-bold text-slate-200 block">Cities & Settlements</span>
            <span className="text-[11px] text-slate-400">Capitals, towns & ports</span>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
            <Compass className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <span className="text-xs font-bold text-slate-200 block">Landmarks & POIs</span>
            <span className="text-[11px] text-slate-400">Dungeons, ruins & towers</span>
          </div>
        </div>
      </div>
    </section>
  );
};
