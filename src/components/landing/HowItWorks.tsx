import React from 'react';
import { Sliders, Move, Download, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Generate',
      subtitle: 'Create a fantasy map from simple parameters or natural language prompt.',
      description: 'Choose map size, continent or island layout, mountain density, and visual cartography style.',
      icon: Sliders,
      color: 'from-amber-500/20 to-amber-600/5',
      borderColor: 'border-amber-500/30',
      badgeColor: 'bg-amber-500 text-slate-950'
    },
    {
      step: '02',
      title: 'Customize',
      subtitle: 'Edit terrain, cities, rivers, kingdoms and labels directly on the interactive vector canvas.',
      description: 'Drag and drop cities, customize kingdom colors, rename landmarks, and toggle visibility layers.',
      icon: Move,
      color: 'from-purple-500/20 to-purple-600/5',
      borderColor: 'border-purple-500/30',
      badgeColor: 'bg-purple-500 text-slate-950'
    },
    {
      step: '03',
      title: 'Download',
      subtitle: 'Export your finished creation in high-resolution PNG format.',
      description: 'Ready to print for your D&D tabletop session or insert into your fantasy book worldbuilding notes.',
      icon: Download,
      color: 'from-emerald-500/20 to-emerald-600/5',
      borderColor: 'border-emerald-500/30',
      badgeColor: 'bg-emerald-500 text-slate-950'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#0d0f15] border-y border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
            How <span className="gold-gradient-text">Create Fantasy Map</span> Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Build your complete fantasy continent in under 60 seconds with our intuitive 3-step workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className={`glass-card p-8 rounded-2xl border ${item.borderColor} bg-gradient-to-b ${item.color} relative group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-xs font-bold font-mono px-3 py-1 rounded-full ${item.badgeColor}`}>
                      STEP {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="font-cinzel font-bold text-xl text-slate-100 mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs font-semibold text-amber-300/90 mb-3 leading-snug">
                    {item.subtitle}
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Start Step {item.step}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
