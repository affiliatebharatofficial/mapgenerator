import React from 'react';
import { Globe, Crown, Shield, Dices, Castle, Compass } from 'lucide-react';

export const WhatCanYouCreateSection: React.FC = () => {
  const cards = [
    {
      icon: Globe,
      title: 'Fantasy World Maps',
      description: 'Create maps for fictional worlds and continents.'
    },
    {
      icon: Crown,
      title: 'Kingdom Maps',
      description: 'Visualize kingdoms, territories and political regions.'
    },
    {
      icon: Shield,
      title: 'RPG Maps',
      description: 'Create maps for tabletop RPG campaigns.'
    },
    {
      icon: Dices,
      title: 'D&D Maps',
      description: 'Create fantasy settings for D&D campaigns and adventures.'
    },
    {
      icon: Castle,
      title: 'Medieval Fantasy Maps',
      description: 'Build maps with castles, cities, forests, mountains and medieval-inspired geography.'
    },
    {
      icon: Compass,
      title: 'Adventure Maps',
      description: 'Create regional maps for fictional adventures and stories.'
    }
  ];

  return (
    <section className="py-20 bg-[#0b0d11] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
            What Can You <span className="gold-gradient-text">Create?</span>
          </h2>
          <p className="text-sm text-slate-400">
            Explore the diverse map types you can design with our online <strong>fantasy map creator</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <div
                key={idx}
                className="glass-card p-6 rounded-2xl border border-slate-800 bg-[#121620]/60 space-y-3 hover:border-amber-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="font-cinzel font-bold text-lg text-slate-100">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
