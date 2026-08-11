import React, { useState } from 'react';
import { Compass, Sparkles, RefreshCw, X, Sliders, Shield, Zap } from 'lucide-react';
import type { AdvancedGeographyConfig, GenerationProfile } from '../../types/mapGeography';

interface GeographicSettingsModalProps {
  config: AdvancedGeographyConfig;
  onApplyConfig: (config: AdvancedGeographyConfig) => void;
  onClose: () => void;
}

export const GeographicSettingsModal: React.FC<GeographicSettingsModalProps> = ({
  config,
  onApplyConfig,
  onClose
}) => {
  const [localConfig, setLocalConfig] = useState<AdvancedGeographyConfig>({ ...config });

  const handleRandomizeSeed = () => {
    setLocalConfig({
      ...localConfig,
      seed: Math.floor(Math.random() * 900000000) + 100000000
    });
  };

  const handleSelectProfile = (profile: GenerationProfile) => {
    const presetOverrides: Partial<AdvancedGeographyConfig> = { profile };
    if (profile === 'island-world' || profile === 'archipelago') presetOverrides.landmassAmount = 3;
    if (profile === 'mountainous') presetOverrides.mountainDensity = 9;
    if (profile === 'desert-world') presetOverrides.rainfallLevel = 2;
    if (profile === 'frozen-world') presetOverrides.temperatureLevel = 2;

    setLocalConfig({ ...localConfig, ...presetOverrides });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">Realistic Geography & Seed Controls</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6 text-xs">
          {/* Seed Randomizer Section */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-slate-300 block">World Generation Seed</span>
              <span className="font-mono text-amber-400 text-sm font-bold">{localConfig.seed}</span>
            </div>

            <button
              onClick={handleRandomizeSeed}
              className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-bold hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Randomize Seed
            </button>
          </div>

          {/* Realism Slider (0 to 100) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-300">Geographic Realism Rating</label>
              <span className="font-mono text-amber-400 font-bold">{localConfig.realismLevel}% ({localConfig.realismLevel < 40 ? 'Magical Fantasy' : localConfig.realismLevel > 70 ? 'Strict Geography' : 'Balanced'})</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={localConfig.realismLevel}
              onChange={(e) => setLocalConfig({ ...localConfig, realismLevel: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Generation Preset Profiles */}
          <div>
            <label className="font-semibold text-slate-300 block mb-2">Generation Preset Profile</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'balanced-fantasy', label: 'Balanced Fantasy' },
                { id: 'realistic-geography', label: 'Realistic Geography' },
                { id: 'island-world', label: 'Island World' },
                { id: 'archipelago', label: 'Archipelago' },
                { id: 'supercontinent', label: 'Supercontinent' },
                { id: 'mountainous', label: 'Mountainous' },
                { id: 'desert-world', label: 'Desert World' },
                { id: 'frozen-world', label: 'Frozen Tundra' },
                { id: 'dark-fantasy', label: 'Dark Fantasy' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProfile(p.id as any)}
                  className={`py-2 px-3 rounded-xl border text-center font-semibold text-[11px] transition-all ${
                    localConfig.profile === p.id ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Physical Controls */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-cinzel font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" /> Advanced Climate & Environmental Controls
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-400 block mb-1">Mountain Density ({localConfig.mountainDensity})</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={localConfig.mountainDensity}
                  onChange={(e) => setLocalConfig({ ...localConfig, mountainDensity: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-400 block mb-1">River Density ({localConfig.riverDensity})</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={localConfig.riverDensity}
                  onChange={(e) => setLocalConfig({ ...localConfig, riverDensity: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-400 block mb-1">Rainfall Level ({localConfig.rainfallLevel})</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={localConfig.rainfallLevel}
                  onChange={(e) => setLocalConfig({ ...localConfig, rainfallLevel: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-400 block mb-1">Settlement Density ({localConfig.settlementDensity})</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={localConfig.settlementDensity}
                  onChange={(e) => setLocalConfig({ ...localConfig, settlementDensity: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-900">
              <span className="text-slate-300 font-semibold">Enable Rain Shadow Effect (Deserts behind mountains)</span>
              <input
                type="checkbox"
                checked={localConfig.rainShadowEffect}
                onChange={(e) => setLocalConfig({ ...localConfig, rainShadowEffect: e.target.checked })}
                className="accent-amber-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
              Cancel
            </button>
            <button
              onClick={() => {
                onApplyConfig(localConfig);
                onClose();
              }}
              className="px-6 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Apply & Regenerate Geography
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
