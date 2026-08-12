import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

export const FantasyMapIdeasSection: React.FC = () => {
  const ideas = [
    { title: 'Ancient Fantasy Continent', desc: 'Vast landmass with primordial ruins, elder mountain peaks, and forgotten inland seas.' },
    { title: 'Dark Fantasy Kingdom', desc: 'Grim realm shrouded in shadow, obsidian fortresses, and corrupted wasteland biomes.' },
    { title: 'Island Empire', desc: 'Archipelago of seafaring island territories linked by vital maritime trade channels.' },
    { title: 'Medieval Kingdom', desc: 'Classic feudal realm featuring walled cities, knightly strongholds, and noble fiefdoms.' },
    { title: 'Magical Forest Realm', desc: 'Enchanted woodland wilderness governed by ancient groves and glowing elven sanctuaries.' },
    { title: 'Desert Empire', desc: 'Arid expanse characterized by golden dune oceans, fertile river deltas, and oasis hubs.' },
    { title: 'Mountain Kingdom', desc: 'Formidable highland realm built into steep canyon walls and underground dwarf halls.' },
    { title: 'Pirate Archipelago', desc: 'Treacherous chain of hidden coves, volcanic islands, and smuggler ports.' },
    { title: 'Frozen Northern Kingdom', desc: 'Glacial tundra biome dominated by frost fjords, ice caps, and hardy coastal settlements.' },
    { title: 'Post-War Fantasy World', desc: 'Shattered continent marked by contested border zones, ruined capitals, and rebuilding towns.' }
  ];

  return (
    <section className="py-20 bg-[#0b0d11] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Worldbuilding Inspiration</span>
          </div>
          <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
            Fantasy Map <span className="gold-gradient-text">Ideas</span>
          </h2>
          <p className="text-sm text-slate-400">
            Explore popular worldbuilding themes and geographic concepts to kickstart your next map.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {ideas.map((idea, idx) => (
            <div
              key={idx}
              className="glass-card p-4 rounded-xl border border-slate-800 bg-[#121620]/60 space-y-2 hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <h3 className="font-cinzel font-bold text-xs text-slate-100">{idea.title}</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">{idea.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
