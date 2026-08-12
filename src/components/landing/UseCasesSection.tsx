import React from 'react';
import { Compass, BookOpen, Shield, Dices, Gamepad2 } from 'lucide-react';

export const UseCasesSection: React.FC = () => {
  const useCases = [
    {
      icon: Compass,
      title: 'Worldbuilders',
      description: 'Visualize fictional worlds while developing geography and lore.'
    },
    {
      icon: BookOpen,
      title: 'Writers',
      description: 'Create maps for fantasy novels, stories and fictional settings.'
    },
    {
      icon: Shield,
      title: 'D&D Players & Dungeon Masters',
      description: 'Build maps for campaigns, settings and adventures.'
    },
    {
      icon: Dices,
      title: 'RPG Creators',
      description: 'Create fantasy settings for tabletop role-playing games.'
    },
    {
      icon: Gamepad2,
      title: 'Game Designers',
      description: 'Use maps during early worldbuilding and game development.'
    }
  ];

  return (
    <section className="py-20 bg-[#0b0d11] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
            Who Is CreateFantasyMap <span className="gold-gradient-text">For?</span>
          </h2>
          <p className="text-sm text-slate-400">
            Designed for storytellers, gaming groups, and creative worldbuilders across all media.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {useCases.map((uc, idx) => {
            const IconComp = uc.icon;
            return (
              <div
                key={idx}
                className="glass-card p-5 rounded-2xl border border-slate-800 bg-[#121620]/60 space-y-3 text-center hover:border-amber-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto group-hover:scale-110 transition-transform">
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="font-cinzel font-bold text-base text-slate-100">{uc.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{uc.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
