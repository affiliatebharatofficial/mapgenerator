import React from 'react';
import { Cpu, Move, Crown, Mountain, Palette, Download, Sparkles } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Cpu,
      title: 'Procedural Map Generation',
      description: 'Generate unique, seedable fantasy landscapes with realistic fractal coastlines, islands, and biomes.'
    },
    {
      icon: Move,
      title: 'Interactive Editing',
      description: 'Fully editable vector canvas. Drag and reposition cities, labels, castles, and points of interest effortlessly.'
    },
    {
      icon: Crown,
      title: 'Kingdoms & Political Borders',
      description: 'Define political territories with Voronoi cellular borders, realm names, capitals, and ruler metadata.'
    },
    {
      icon: Mountain,
      title: 'Rivers & Mountains',
      description: 'Natural geographic erosion algorithms placing mountain ridges, forests, and branching river systems.'
    },
    {
      icon: Palette,
      title: '5 Cartography Map Styles',
      description: 'Switch instantly between Classic Parchment, Hand Drawn, Dark Fantasy, Clean Vector, and RPG Tabletop styles.'
    },
    {
      icon: Download,
      title: 'High Quality PNG Export',
      description: 'Export high-resolution map images ready for digital presentation, VTT gaming, or fantasy printing.'
    }
  ];

  return (
    <section id="features" className="py-24 bg-[#0b0d11] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Creators & Dungeon Masters</span>
          </div>
          <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
            Engineered for <span className="gold-gradient-text">Worldbuilders</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Everything you need to craft immersive fantasy geography without needing a digital art degree.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, idx) => {
            const IconComp = f.icon;
            return (
              <div
                key={idx}
                className="glass-card p-6 rounded-2xl border border-slate-800 bg-[#121620]/60 space-y-4 hover:border-amber-500/40 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="font-cinzel font-bold text-lg text-slate-100">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
