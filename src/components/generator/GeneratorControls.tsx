import React, { useState } from 'react';
import { Sparkles, Dices, Layers, Mountain, Trees, Compass, Shield, Lock, Zap } from 'lucide-react';
import type { GeneratorConfig, MapStyle, MapType } from '../../types/map';
import { MAP_STYLES } from '../../lib/map-engine/styles';
import { useSubscription } from '../../lib/supabase/subscriptionStore';

interface GeneratorControlsProps {
  config: GeneratorConfig;
  onChangeConfig: (config: GeneratorConfig) => void;
  onGenerate: () => void;
  onSelectLockedStyle?: (styleId: MapStyle) => void;
  onRequireAICredits?: () => boolean;
  onOpenGeoModal?: () => void;
  onOpenPartialRegen?: () => void;
  onOpenMapHealth?: () => void;
}

export const GeneratorControls: React.FC<GeneratorControlsProps> = ({
  config,
  onChangeConfig,
  onGenerate,
  onSelectLockedStyle,
  onRequireAICredits,
  onOpenGeoModal,
  onOpenPartialRegen,
  onOpenMapHealth
}) => {
  const { creditsRemaining, creditsTotal, hasEntitlement } = useSubscription();

  const [activeTab, setActiveTab] = useState<'quick' | 'prompt'>('quick');
  const [promptText, setPromptText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const canUsePremiumStyles = hasEntitlement('premium_styles');

  const mapTypes: { id: MapType; label: string; icon: string; desc: string }[] = [
    { id: 'continent', label: 'Continent', icon: '🌍', desc: 'Vast landmass with kingdoms & seas' },
    { id: 'island', label: 'Island', icon: '🏝️', desc: 'Isolated sea realm' },
    { id: 'archipelago', label: 'Archipelago', icon: '🗺️', desc: 'Cluster of smaller islands' },
    { id: 'kingdom', label: 'Kingdom', icon: '🏰', desc: 'Detailed sovereign borders' },
    { id: 'region', label: 'Region', icon: '⛰️', desc: 'Highland passes & valleys' }
  ];

  const handleStyleSelect = (styleId: MapStyle) => {
    onChangeConfig({ ...config, style: styleId });
  };

  const handleAIPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    if (onRequireAICredits && !onRequireAICredits()) {
      return;
    }

    setIsParsing(true);

    setTimeout(() => {
      const text = promptText.toLowerCase();
      let type: MapType = config.type;
      let style: MapStyle = config.style;

      if (text.includes('island')) type = 'island';
      else if (text.includes('archipelago')) type = 'archipelago';
      else if (text.includes('kingdom')) type = 'kingdom';
      else if (text.includes('region')) type = 'region';
      else if (text.includes('continent')) type = 'continent';

      if (text.includes('dark') || text.includes('shadow') || text.includes('gothic') || text.includes('evil')) style = 'dark-fantasy';
      else if (text.includes('sketch') || text.includes('hand') || text.includes('ink')) style = 'hand-drawn';
      else if (text.includes('clean') || text.includes('modern') || text.includes('pastel')) style = 'clean';
      else if (text.includes('rpg') || text.includes('hex') || text.includes('campaign')) style = 'rpg';
      else if (text.includes('parchment') || text.includes('ancient') || text.includes('vintage')) style = 'parchment';

      const hasDeserts = text.includes('desert') || text.includes('dune') || text.includes('sand') || text.includes('wasteland');
      const hasSwamps = text.includes('swamp') || text.includes('marsh') || text.includes('bog') || text.includes('mire');
      const hasSnow = text.includes('snow') || text.includes('ice') || text.includes('frost') || text.includes('tundra');

      const mountainVal = text.includes('mountain') || text.includes('peak') || text.includes('ridge') ? 8 : text.includes('flat') ? 3 : 6;
      const forestVal = text.includes('wood') || text.includes('forest') || text.includes('jungle') ? 8 : text.includes('barren') ? 2 : 5;
      const riverVal = text.includes('river') || text.includes('stream') || text.includes('delta') ? 8 : 5;
      const settlementVal = text.includes('city') || text.includes('town') || text.includes('capital') || text.includes('empire') ? 14 : 8;

      onChangeConfig({
        ...config,
        seed: Math.floor(Math.random() * 899999) + 100000,
        type,
        style,
        mountainDensity: mountainVal,
        forestDensity: forestVal,
        riverDensity: riverVal,
        settlementCount: settlementVal,
        showDeserts: hasDeserts || config.showDeserts,
        showSwamps: hasSwamps || config.showSwamps,
        showSnow: hasSnow || config.showSnow
      });

      setIsParsing(false);
      onGenerate();
    }, 500);
  };

  return (
    <div className="w-80 bg-[#121620]/95 backdrop-blur-md border-r border-amber-500/15 h-full flex flex-col z-20 font-sans select-none">
      {/* Mode Tabs */}
      <div className="p-3 border-b border-slate-800 bg-[#0e1118]">
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('quick')}
            className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'quick'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quick Generate
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
              activeTab === 'prompt'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>AI World Prompt</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        {activeTab === 'quick' ? (
          <>
            {/* Map Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-amber-200/90 flex items-center gap-1.5 uppercase tracking-wider font-cinzel">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Map Type</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {mapTypes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChangeConfig({ ...config, type: item.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      config.type === item.id
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      <span>{item.icon}</span>
                      <span className="text-xs">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Map Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-amber-200/90 flex items-center gap-1.5 uppercase tracking-wider font-cinzel">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Visual Theme</span>
              </label>
              <div className="space-y-1.5">
                {Object.values(MAP_STYLES).map((st) => {
                  const isPremium = ['dark-fantasy', 'hand-drawn', 'rpg'].includes(st.id);
                  const isLocked = isPremium && !canUsePremiumStyles;

                  return (
                    <button
                      key={st.id}
                      onClick={() => handleStyleSelect(st.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        config.style === st.id
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{st.name}</span>
                          {isLocked && (
                            <span className="text-[9px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> PRO
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{st.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Mountain className="w-3.5 h-3.5 text-amber-400" /> Mountains
                  </span>
                  <span className="font-mono text-amber-300">{config.mountainDensity}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={config.mountainDensity}
                  onChange={(e) => onChangeConfig({ ...config, mountainDensity: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Trees className="w-3.5 h-3.5 text-amber-400" /> Forests
                  </span>
                  <span className="font-mono text-amber-300">{config.forestDensity}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={config.forestDensity}
                  onChange={(e) => onChangeConfig({ ...config, forestDensity: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-amber-400" /> Kingdoms
                  </span>
                  <span className="font-mono text-amber-300">{config.kingdomCount}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={config.kingdomCount}
                  onChange={(e) => onChangeConfig({ ...config, kingdomCount: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </>
        ) : (
          /* AI World Prompt Mode */
          <form onSubmit={handleAIPromptSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-amber-200 flex items-center gap-1 font-cinzel">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Describe Your World
                </label>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <Zap className="w-2.5 h-2.5 inline mr-1" /> {creditsRemaining} / {creditsTotal} AI Credits
                </span>
              </div>

              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="A continent with three rival kingdoms, jagged northern mountains, dense elven woods, and a central lake..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isParsing || !promptText.trim()}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isParsing ? 'Generating AI Map...' : 'Generate AI Map (1 Credit)'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Phase 13 Geography Action Buttons */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
        <button
          onClick={onOpenGeoModal}
          className="w-full py-2 bg-slate-900 border border-slate-800 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-800"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" /> Geography & Seed Controls
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenPartialRegen}
            className="py-1.5 bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-[11px] rounded-lg hover:text-amber-300"
          >
            Partial Regen
          </button>
          <button
            onClick={onOpenMapHealth}
            className="py-1.5 bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-[11px] rounded-lg hover:text-amber-300"
          >
            Diagnostics
          </button>
        </div>
      </div>

      {/* Generate Primary Button */}
      {activeTab === 'quick' && (
        <div className="p-4 border-t border-slate-800 bg-[#0e1118]">
          <button
            onClick={onGenerate}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Dices className="w-4 h-4" />
            <span>Generate Map</span>
          </button>
        </div>
      )}
    </div>
  );
};
