import React, { useState } from 'react';
import { RefreshCw, Lock, Unlock, X, ShieldAlert, Check } from 'lucide-react';
import type { FantasyMap } from '../../types/map';
import type { FeatureLocks } from '../../types/mapGeography';

interface PartialRegenModalProps {
  map: FantasyMap;
  onRegenerateSystem: (targetSystem: 'terrain' | 'rivers' | 'biomes' | 'roads' | 'borders', locks: FeatureLocks) => void;
  onClose: () => void;
}

export const PartialRegenModal: React.FC<PartialRegenModalProps> = ({ map, onRegenerateSystem, onClose }) => {
  const [selectedSystem, setSelectedSystem] = useState<'terrain' | 'rivers' | 'biomes' | 'roads' | 'borders'>('rivers');
  const [lockedCities, setLockedCities] = useState<string[]>([]);
  const [lockedRivers, setLockedRivers] = useState<string[]>([]);

  const toggleCityLock = (id: string) => {
    setLockedCities((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleRiverLock = (id: string) => {
    setLockedRivers((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleExecute = () => {
    onRegenerateSystem(selectedSystem, {
      lockedCityIds: lockedCities,
      lockedRiverIds: lockedRivers,
      lockedMountainIds: [],
      lockedKingdomIds: []
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">Modular System Regeneration</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 leading-relaxed">
            Regenerate specific map layers without deleting your world lore, characters, factions, or quest data.
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">Target Layer System to Regenerate</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'rivers', label: 'Rivers Only' },
                { id: 'roads', label: 'Roads Only' },
                { id: 'terrain', label: 'Terrain Only' },
                { id: 'biomes', label: 'Biomes Only' },
                { id: 'borders', label: 'Borders Only' }
              ].map((sys) => (
                <button
                  key={sys.id}
                  onClick={() => setSelectedSystem(sys.id as any)}
                  className={`py-2 px-3 rounded-xl border text-center font-bold text-[11px] transition-all ${
                    selectedSystem === sys.id ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {sys.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Lock Checkboxes */}
          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" /> Lock Features from Regeneration
            </h4>
            <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-slate-950 rounded-xl border border-slate-800">
              {map.cities.map((city) => (
                <div key={city.id} className="flex items-center justify-between p-1.5 hover:bg-slate-900 rounded-lg">
                  <span className="text-slate-300 font-semibold">{city.name} ({city.type})</span>
                  <button
                    onClick={() => toggleCityLock(city.id)}
                    className={`p-1 rounded text-[10px] font-bold flex items-center gap-1 ${
                      lockedCities.includes(city.id) ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {lockedCities.includes(city.id) ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                    <span>{lockedCities.includes(city.id) ? 'Locked' : 'Unlocked'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
              Cancel
            </button>
            <button
              onClick={handleExecute}
              className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Regenerate {selectedSystem.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
