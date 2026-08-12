import React from 'react';
import { Mountain, Trees, Waves, Building, Crown, Milestone, MapPin, Tag, Sparkles } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Mountain,
      title: 'Mountains',
      description: 'Create dramatic mountain ranges and peaks.'
    },
    {
      icon: Trees,
      title: 'Forests',
      description: 'Add forests and wilderness regions.'
    },
    {
      icon: Waves,
      title: 'Rivers & Lakes',
      description: 'Create natural water features.'
    },
    {
      icon: Building,
      title: 'Cities & Settlements',
      description: 'Place important cities, towns and settlements.'
    },
    {
      icon: Crown,
      title: 'Regions & Kingdoms',
      description: 'Organize your world into territories and regions.'
    },
    {
      icon: Milestone,
      title: 'Roads & Routes',
      description: 'Connect important locations.'
    },
    {
      icon: MapPin,
      title: 'Points of Interest',
      description: 'Mark important landmarks and locations.'
    },
    {
      icon: Tag,
      title: 'Labels',
      description: 'Keep important places readable and organized.'
    }
  ];

  return (
    <section id="features" className="py-24 bg-[#0b0d11] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Cartography Features</span>
          </div>
          <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
            Build Detailed <span className="gold-gradient-text">Fantasy Maps</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Customize every geographic and political detail of your world map with supported vector editing tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => {
            const IconComp = f.icon;
            return (
              <div
                key={idx}
                className="glass-card p-6 rounded-2xl border border-slate-800 bg-[#121620]/60 space-y-3 hover:border-amber-500/40 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <IconComp className="w-5 h-5" />
                </div>
                <h3 className="font-cinzel font-bold text-base text-slate-100">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
