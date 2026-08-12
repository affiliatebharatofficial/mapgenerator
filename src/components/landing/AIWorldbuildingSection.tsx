import React from 'react';
import { Sparkles, Image, BookOpen, Users, Shield } from 'lucide-react';

export const AIWorldbuildingSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#0d0f15] border-y border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Worldbuilding Suite</span>
            </div>

            <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
              Bring Your <span className="gold-gradient-text">Fantasy World</span> to Life
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              CreateFantasyMap goes beyond traditional map generation by integrating AI worldbuilding tools. Transform your generated map into a living fictional world with AI-assisted lore, character generation, and thematic artwork.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                <Image className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-200">AI-Generated Artwork & Fantasy Illustrations</h3>
                  <p className="text-[11px] text-slate-400">Generate thematic world artwork, location scenery, and map visual assets to accompany your geography.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                <BookOpen className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Lore & Faction Generators</h3>
                  <p className="text-[11px] text-slate-400">Generate detailed history, faction conflicts, regional lore, and quest hooks tied directly to map locations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                <Users className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Character & NPC Profiles</h3>
                  <p className="text-[11px] text-slate-400">Generate kingdom rulers, city councilors, legendary heroes, and NPC portraits to populate your world.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="glass-card p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#121620] to-[#090b0e] space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span className="font-cinzel font-bold text-sm text-slate-100">Integrated World Engine</span>
                </div>
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">Active Engine</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                  <span className="text-amber-400 font-bold">Input:</span> &quot;Ancient mountain kingdom ruled by a fallen high order&quot;
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                  <span className="text-emerald-400 font-bold block">Generated Output:</span>
                  <p className="text-[11px] text-slate-400 leading-normal font-sans">
                    <strong>Kingdom:</strong> High Thane Dominion • <strong>Capital:</strong> Ironpeak Citadel • <strong>Lore:</strong> Guarding the northern frost passes for three centuries against mountain shadows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
