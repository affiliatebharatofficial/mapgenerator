import React, { useState } from 'react';
import { Check } from 'lucide-react';
import type { MapStyle } from '../../types/map';
import { MAP_STYLES } from '../../lib/map-engine/styles';

export const MapStylesShowcase: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState<MapStyle>('parchment');

  const styleList: MapStyle[] = ['parchment', 'hand-drawn', 'dark-fantasy', 'clean', 'rpg'];

  return (
    <section className="py-24 bg-[#0e1118] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
          <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
            Choose Your <span className="gold-gradient-text">Aesthetic Style</span>
          </h2>
          <p className="text-sm text-slate-400">
            Instantly switch visual themes to match your book's tone or your tabletop RPG campaign feel.
          </p>
        </div>

        {/* Style Selector Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {styleList.map((stKey) => {
            const st = MAP_STYLES[stKey];
            const isSelected = selectedStyle === stKey;
            return (
              <button
                key={stKey}
                onClick={() => setSelectedStyle(stKey)}
                className={`px-5 py-3 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/30'
                }`}
              >
                {isSelected && <Check className="w-4 h-4" />}
                <span>{st.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Style Description Card */}
        <div className="max-w-3xl mx-auto glass-panel p-8 rounded-2xl border border-amber-500/20 text-center space-y-4">
          <h3 className="font-cinzel font-bold text-2xl text-amber-200">
            {MAP_STYLES[selectedStyle].name}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
            {MAP_STYLES[selectedStyle].description}
          </p>

          <div className="pt-4 flex items-center justify-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-slate-600" style={{ backgroundColor: MAP_STYLES[selectedStyle].oceanBg }} />
              Ocean
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-slate-600" style={{ backgroundColor: MAP_STYLES[selectedStyle].landBg }} />
              Landmass
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-slate-600" style={{ backgroundColor: MAP_STYLES[selectedStyle].cityIconColor }} />
              Accents
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
