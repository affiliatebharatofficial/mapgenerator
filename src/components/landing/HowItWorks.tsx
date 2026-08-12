import React from 'react';
import { MessageSquare, Sliders, Edit3, Download, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Describe Your World',
      subtitle: 'Tell the generator what kind of fantasy world you want.',
      description: 'Use natural language AI prompts or select custom map parameters like continent style, biome density, and layout.',
      icon: MessageSquare,
      color: 'from-amber-500/20 to-amber-600/5',
      borderColor: 'border-amber-500/30',
      badgeColor: 'bg-amber-500 text-slate-950'
    },
    {
      step: '02',
      title: 'Generate Your Map',
      subtitle: 'Create the initial geography and layout.',
      description: 'Our procedural engine instantly constructs realistic coastlines, mountain ranges, forests, rivers, and kingdom territories.',
      icon: Sliders,
      color: 'from-purple-500/20 to-purple-600/5',
      borderColor: 'border-purple-500/30',
      badgeColor: 'bg-purple-500 text-slate-950'
    },
    {
      step: '03',
      title: 'Customize Your Map',
      subtitle: 'Edit supported regions, locations, labels, roads, rivers, POIs and other map elements.',
      description: 'Drag and reposition settlements, adjust label typography, paint custom terrain, and fine-tune political borders on the editor canvas.',
      icon: Edit3,
      color: 'from-sky-500/20 to-sky-600/5',
      borderColor: 'border-sky-500/30',
      badgeColor: 'bg-sky-500 text-slate-950'
    },
    {
      step: '04',
      title: 'Download Your Map',
      subtitle: 'Save and download your finished fantasy map.',
      description: 'Export high-resolution map files ready for printing, tabletop RPG sessions, novel worldbuilding notes, or digital sharing.',
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
            How to Create a <span className="gold-gradient-text">Fantasy Map</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Turn your worldbuilding concept into a finished visual map with our simple 4-step workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className={`glass-card p-6 rounded-2xl border ${item.borderColor} bg-gradient-to-b ${item.color} relative group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className={`text-xs font-bold font-mono px-3 py-1 rounded-full ${item.badgeColor}`}>
                      STEP {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-cinzel font-bold text-lg text-slate-100 mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs font-semibold text-amber-300/90 mb-2 leading-snug">
                    {item.subtitle}
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Step {item.step} Overview</span>
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
