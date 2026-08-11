import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Layers } from 'lucide-react';
import type { MapLayers } from '../../types/map';

interface LayerManagerProps {
  layers: MapLayers;
  onToggleLayer: (layerKey: keyof MapLayers) => void;
  onToggleLayerLock?: (layerKey: string) => void;
  layerLockState?: Record<string, boolean>;
  layerOpacityState?: Record<string, number>;
  onChangeLayerOpacity?: (layerKey: string, opacity: number) => void;
}

export const LayerManager: React.FC<LayerManagerProps> = ({
  layers,
  onToggleLayer,
  onToggleLayerLock,
  layerLockState = {},
  layerOpacityState = {},
  onChangeLayerOpacity
}) => {
  const layerDefinitions: { key: keyof MapLayers; label: string; group: string }[] = [
    { key: 'terrain', label: 'Base Terrain', group: 'Nature' },
    { key: 'elevation', label: 'Elevation Contours', group: 'Nature' },
    { key: 'mountains', label: 'Mountains & Peaks', group: 'Nature' },
    { key: 'forests', label: 'Forests & Woods', group: 'Nature' },
    { key: 'rivers', label: 'Rivers & Waterways', group: 'Water' },
    { key: 'lakes', label: 'Lakes & Bays', group: 'Water' },
    { key: 'roads', label: 'Roads & Routes', group: 'Infrastructure' },
    { key: 'regions', label: 'Geographic Regions', group: 'Political' },
    { key: 'kingdoms', label: 'Kingdom Borders', group: 'Political' },
    { key: 'cities', label: 'Cities & Towns', group: 'Settlements' },
    { key: 'locations', label: 'Locations & Ruins', group: 'Settlements' },
    { key: 'labels', label: 'Typography Labels', group: 'Text' },
    { key: 'decorations', label: 'Cartography Ornaments', group: 'Decorations' },
    { key: 'compass', label: 'Compass Rose', group: 'Decorations' },
    { key: 'legend', label: 'Map Legend', group: 'Decorations' },
    { key: 'grid', label: 'Map Grid', group: 'Grid' },
    { key: 'coordinates', label: 'Map Coordinates', group: 'Grid' }
  ];

  return (
    <div className="space-y-4 font-sans select-none">
      <div className="flex items-center justify-between">
        <h4 className="font-cinzel font-bold text-xs text-amber-200/90 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Layer Architecture</span>
        </h4>
        <span className="text-[10px] font-mono text-slate-400">16 Layers</span>
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {layerDefinitions.map((item) => {
          const isVisible = layers[item.key] !== false;
          const isLocked = !!layerLockState[item.key];
          const opacity = layerOpacityState[item.key] ?? 100;

          return (
            <div
              key={item.key}
              className={`p-2.5 rounded-xl border transition-all ${
                isVisible
                  ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                  : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleLayer(item.key)}
                    className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                  </button>

                  <span className="text-xs font-semibold">{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {onToggleLayerLock && (
                    <button
                      type="button"
                      onClick={() => onToggleLayerLock(item.key)}
                      className="p-1 text-slate-400 hover:text-sky-300 transition-colors"
                    >
                      {isLocked ? <Lock className="w-3.5 h-3.5 text-sky-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-600" />}
                    </button>
                  )}
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {opacity}%
                  </span>
                </div>
              </div>

              {/* Opacity Slider */}
              {isVisible && onChangeLayerOpacity && (
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[9px] text-slate-500 font-mono">Opacity</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => onChangeLayerOpacity(item.key, parseInt(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-950 h-1 rounded appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
