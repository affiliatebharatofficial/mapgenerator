import React from 'react';
import { Sparkles, Dices, Layers, ShieldCheck, Download } from 'lucide-react';
import type { MapStyle, MapType } from '../../types/map';
import { MAP_STYLES } from '../../lib/map-engine/styles';
import { generateFantasyMap } from '../../lib/map-engine/generator';

interface HeroProps {
  onNavigateCreate: () => void;
  onSelectMapPreset: (seed: number, type: MapType, style: MapStyle) => void;
  onExploreGallery?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onNavigateCreate,
  onSelectMapPreset
}) => {
  // Demo map for Hero Showcase
  const heroMap = generateFantasyMap({
    seed: 884219,
    type: 'continent',
    style: 'dark-fantasy',
    width: 800,
    height: 520,
    mountainDensity: 7,
    forestDensity: 6,
    riverDensity: 5,
    settlementCount: 8,
    kingdomCount: 4,
    showDeserts: true,
    showSwamps: true,
    showSnow: true
  });

  const heroStyle = MAP_STYLES['dark-fantasy'];

  return (
    <section className="relative pt-12 pb-20 overflow-hidden font-sans">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Next-Gen Cartography Engine & Worldbuilding AI</span>
            </div>

            <h1 className="font-cinzel font-black text-4xl sm:text-5xl lg:text-6xl text-slate-100 leading-[1.15] tracking-tight">
              Create Worlds. <br />
              <span className="gold-gradient-text">Build Stories.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Design editable fantasy world maps for your TTRPG campaigns, D&D adventures, novels, and fictional realms with instant procedural cartography.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onNavigateCreate}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>Create Fantasy Map</span>
              </button>

              <button
                onClick={() => onSelectMapPreset(884219, 'continent', 'dark-fantasy')}
                className="w-full sm:w-auto px-6 py-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Dices className="w-5 h-5 text-amber-400" />
                <span>Quick Demo Map</span>
              </button>
            </div>

            {/* Trust Points */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Procedural & AI Powered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>SVG Vector Export</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Download className="w-4 h-4 text-amber-400" />
                <span>4K HD Downloads</span>
              </div>
            </div>
          </div>

          {/* Right Live SVG Map Hero Canvas Card */}
          <div className="lg:col-span-6">
            <div className="glass-card p-3 rounded-3xl border border-amber-500/30 shadow-2xl relative group">
              <div className="bg-[#090b0e] rounded-2xl overflow-hidden aspect-[4/3] relative">
                <svg viewBox={`0 0 ${heroMap.width} ${heroMap.height}`} className="w-full h-full block">
                  <rect width={heroMap.width} height={heroMap.height} fill={heroStyle.waterColor} />
                  <path d={heroMap.coastline} fill={heroStyle.landColor} stroke={heroStyle.coastColor} strokeWidth={2} />
                  {heroMap.islandPaths?.map((ip, i) => (
                    <path key={i} d={ip} fill={heroStyle.landColor} stroke={heroStyle.coastColor} strokeWidth={2} />
                  ))}

                  {/* Mountains */}
                  {heroMap.mountains.map((m, i) => (
                    <g key={i} transform={`translate(${m.x}, ${m.y})`}>
                      <polygon points="0,-16 -12,12 12,12" fill={heroStyle.mountainColor} stroke={heroStyle.textColor} strokeWidth={1} />
                    </g>
                  ))}

                  {/* Cities */}
                  {heroMap.cities.map((c) => (
                    <g key={c.id} transform={`translate(${c.x}, ${c.y})`}>
                      <circle r={c.type === 'capital' ? 8 : 5} fill={c.type === 'capital' ? '#d4af37' : '#e74c3c'} stroke="#000" strokeWidth={1.5} />
                      <text y={14} textAnchor="middle" fill={heroStyle.textColor} fontSize={10} fontWeight="bold" fontFamily={heroStyle.fontFamily}>
                        {c.name}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Live Floating Badge */}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real-time Cartography Engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
