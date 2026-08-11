import React from 'react';
import { Layers, Eye, EyeOff, X, Sliders } from 'lucide-react';
import type { MapLayers } from '../../types/map';

interface CartographyLayersDrawerProps {
  layers: MapLayers;
  opacities: Record<string, number>;
  onToggleLayer: (layerKey: keyof MapLayers) => void;
  onChangeOpacity: (layerKey: string, opacity: number) => void;
  onClose: () => void;
}

export const CartographyLayersDrawer: React.FC<CartographyLayersDrawerProps> = ({
  layers,
  opacities,
  onToggleLayer,
  onChangeOpacity,
  onClose
}) => {
  const layerList: { key: keyof MapLayers; label: string }[] = [
    { key: 'terrain', label: 'Terrain & Landmass' },
    { key: 'mountains', label: 'Mountain Ranges' },
    { key: 'forests', label: 'Forest Clusters' },
    { key: 'rivers', label: 'Rivers & Waterways' },
    { key: 'roads', label: 'Trade Roads' },
    { key: 'cities', label: 'Settlements & Cities' },
    { key: 'kingdoms', label: 'Kingdom Borders' },
    { key: 'labels', label: 'Map Labels & Names' },
    { key: 'grid', label: 'Coordinate Grid' },
    { key: 'compass', label: 'Compass Rose' },
    { key: 'legend', label: 'Map Legend' }
  ];

  return (
    <div className="w-80 glass-panel p-5 rounded-3xl border border-amber-500/20 shadow-2xl space-y-4 font-sans select-none text-xs">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <h3 className="font-cinzel font-bold text-sm text-slate-100">Cartography Layers (20)</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {layerList.map((item) => {
          const isVisible = !!layers[item.key];
          const opacity = opacities[item.key] ?? 100;

          return (
            <div key={item.key} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">{item.label}</span>
                <button
                  onClick={() => onToggleLayer(item.key)}
                  className={`p-1 rounded-lg transition-colors ${isVisible ? 'text-amber-400 hover:text-amber-300' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {isVisible && (
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900">
                  <span className="text-[10px] font-mono text-slate-400">Opacity: {opacity}%</span>
                  <div className="flex items-center gap-1">
                    {[25, 50, 75, 100].map((op) => (
                      <button
                        key={op}
                        onClick={() => onChangeOpacity(item.key, op)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                          opacity === op ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {op}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
