import React from 'react';
import { Compass, ArrowRight } from 'lucide-react';
import type { MapStyle, MapType } from '../../types/map';

interface GallerySectionProps {
  onSelectMapPreset: (seed: number, type: MapType, style: MapStyle) => void;
}

interface GalleryPreset {
  id: string;
  title: string;
  seed: number;
  type: MapType;
  style: MapStyle;
  tag: string;
  description: string;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onSelectMapPreset }) => {
  const presets: GalleryPreset[] = [
    {
      id: 'preset_1',
      title: 'The Continent of Eldoria',
      seed: 847291,
      type: 'continent',
      style: 'parchment',
      tag: 'Medieval Continent',
      description: 'A vast landmass with three rival kingdoms, central lakes, and northern mountain barrier.'
    },
    {
      id: 'preset_2',
      title: 'Shadowfall Realm',
      seed: 492103,
      type: 'kingdom',
      style: 'dark-fantasy',
      tag: 'Dark Fantasy Kingdom',
      description: 'Obsidian crags and glowing golden coastlines shrouded in ancient mystery.'
    },
    {
      id: 'preset_3',
      title: 'Isle of Siren\'s Crest',
      seed: 129482,
      type: 'island',
      style: 'hand-drawn',
      tag: 'Island World',
      description: 'Single isolated fantasy island featuring dense ancient woods and coastal fortress.'
    },
    {
      id: 'preset_4',
      title: 'The Iron Peak Passes',
      seed: 731948,
      type: 'region',
      style: 'clean',
      tag: 'Mountain Kingdom',
      description: 'Detailed highland region with strategic fortress passes and alpine villages.'
    },
    {
      id: 'preset_5',
      title: 'Dungeon Master\'s Tabletop Map',
      seed: 391204,
      type: 'region',
      style: 'rpg',
      tag: 'RPG Tabletop Region',
      description: 'High-contrast grid overlay battle map optimized for D&D encounters.'
    },
    {
      id: 'preset_6',
      title: 'Shattered Isles Archipelago',
      seed: 620491,
      type: 'archipelago',
      style: 'clean',
      tag: 'Archipelago',
      description: 'Chain of pirate islands, hidden bays, and coral sea routes.'
    },
    {
      id: 'preset_7',
      title: 'Dragon\'s Tooth Coast',
      seed: 581930,
      type: 'continent',
      style: 'dark-fantasy',
      tag: 'Dark Fantasy Coast',
      description: 'Volcanic mountain peaks housing dragon lairs along a stormy coastline.'
    },
    {
      id: 'preset_8',
      title: 'Silverwood Realm',
      seed: 941029,
      type: 'kingdom',
      style: 'parchment',
      tag: 'High Elf Realm',
      description: 'Ancient elven forests, sprawling river valleys, and pristine capital cities.'
    }
  ];

  return (
    <section id="gallery" className="py-24 bg-[#0b0d11] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Community & Preset Gallery</span>
          </div>
          <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
            Explore <span className="gold-gradient-text">Example Worlds</span>
          </h2>
          <p className="text-sm text-slate-400">
            Click any map preset to immediately open and customize it in the interactive generator.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {presets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onSelectMapPreset(preset.seed, preset.type, preset.style)}
              className="glass-card rounded-2xl border border-slate-800 bg-[#121620]/70 overflow-hidden cursor-pointer group flex flex-col justify-between hover:border-amber-500/50 transition-all"
            >
              {/* Card Header Thumbnail Simulation */}
              <div className="h-44 bg-[#090b0e] relative overflow-hidden flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-transparent to-transparent z-10" />

                {/* Vector Thumbnail Placeholder Graphic */}
                <div className="w-full h-full rounded-lg border border-amber-500/20 bg-[#161a24] flex items-center justify-center relative p-2">
                  <div className="text-center space-y-1 z-20">
                    <span className="text-3xl">{preset.type === 'island' ? '🏝️' : preset.type === 'archipelago' ? '🗺️' : '🌍'}</span>
                    <p className="font-cinzel text-[11px] font-bold text-amber-200">{preset.title}</p>
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Seed #{preset.seed}
                    </span>
                  </div>
                </div>

                <span className="absolute top-3 left-3 z-20 text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
                  {preset.tag}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-cinzel font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Customize Map</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
