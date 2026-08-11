import React from 'react';
import { Tag, Building, Globe, Trash2, Sliders, MapPin, Crown, Compass, Sparkles } from 'lucide-react';
import type { FantasyMap, SelectedObjectRef } from '../../types/map';
import { PlatformConfigService } from '../../lib/config/platformConfigService';

interface PropertyInspectorProps {
  map: FantasyMap;
  selectedObject: SelectedObjectRef | null;
  onUpdateCity: (id: string, updates: any) => void;
  onUpdateKingdom?: (id: string, updates: any) => void;
  onUpdateLabel: (id: string, updates: any) => void;
  onUpdatePOI?: (id: string, updates: any) => void;
  onDeleteSelected: () => void;
  onOpenWorldLink?: (entityId: string) => void;
  onCreateWorldEntry?: (obj: SelectedObjectRef) => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  map,
  selectedObject,
  onUpdateCity,
  onUpdateKingdom,
  onUpdateLabel,
  onUpdatePOI,
  onDeleteSelected,
  onOpenWorldLink,
  onCreateWorldEntry
}) => {
  if (!selectedObject) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 font-sans space-y-2">
        <Sliders className="w-8 h-8 mx-auto text-slate-600" />
        <p className="font-semibold text-slate-400">No Object Selected</p>
        <p className="text-[11px] leading-relaxed">Click any settlement, kingdom, POI, label, river, or road on the map to inspect properties.</p>
      </div>
    );
  }

  const cartoConfig = PlatformConfigService.getCartographyConfig();
  const { type, id } = selectedObject;

  if (type === 'city') {
    const city = map.cities.find((c) => c.id === id);
    if (!city) return null;

    return (
      <div className="space-y-4 font-sans text-xs">
        <div className="flex justify-between items-start pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Building className="w-4 h-4 text-amber-400" />
            <h4 className="font-cinzel font-bold text-sm text-slate-100">Settlement Properties</h4>
          </div>
          <button onClick={onDeleteSelected} className="p-1 text-slate-500 hover:text-rose-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* World Entity Status Badge */}
        {city.worldCityId ? (
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-[11px] text-emerald-300">
            <span className="flex items-center gap-1 font-semibold">
              <Globe className="w-3.5 h-3.5" /> Linked to World
            </span>
            {onOpenWorldLink && (
              <button onClick={() => onOpenWorldLink(city.worldCityId!)} className="font-bold underline">
                View &rarr;
              </button>
            )}
          </div>
        ) : (
          onCreateWorldEntry && (
            <button
              onClick={() => onCreateWorldEntry(selectedObject)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" /> + Create World Entry
            </button>
          )
        )}

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">Settlement Name</label>
          <input
            type="text"
            value={city.name}
            onChange={(e) => onUpdateCity(id, { name: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-500/40"
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">Settlement Type</label>
          <select
            value={city.type}
            onChange={(e) => onUpdateCity(id, { type: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none capitalize"
          >
            {cartoConfig.settlementTypes.filter((st: any) => st.enabled !== false).map((st: any) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">Population</label>
          <input
            type="number"
            value={city.population || 10000}
            onChange={(e) => onUpdateCity(id, { population: parseInt(e.target.value) || 0 })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
          />
        </div>
      </div>
    );
  }

  if (type === 'poi') {
    const poi = map.pointsOfInterest.find((p) => p.id === id);
    if (!poi) return null;

    return (
      <div className="space-y-4 font-sans text-xs">
        <div className="flex justify-between items-start pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-sky-400" />
            <h4 className="font-cinzel font-bold text-sm text-slate-100">Point of Interest Properties</h4>
          </div>
          <button onClick={onDeleteSelected} className="p-1 text-slate-500 hover:text-rose-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">POI Name</label>
          <input
            type="text"
            value={poi.name}
            onChange={(e) => onUpdatePOI && onUpdatePOI(id, { name: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-bold focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">Location Type</label>
          <select
            value={poi.type}
            onChange={(e) => onUpdatePOI && onUpdatePOI(id, { type: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none capitalize"
          >
            {cartoConfig.poiTypes.filter((pt: any) => pt.enabled !== false).map((pt: any) => (
              <option key={pt.id} value={pt.id}>
                {pt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">Description</label>
          <textarea
            rows={3}
            value={poi.description || ''}
            onChange={(e) => onUpdatePOI && onUpdatePOI(id, { description: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
          />
        </div>
      </div>
    );
  }

  if (type === 'label') {
    const label = map.labels.find((l) => l.id === id);
    if (!label) return null;

    return (
      <div className="space-y-4 font-sans text-xs">
        <div className="flex justify-between items-start pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-emerald-400" />
            <h4 className="font-cinzel font-bold text-sm text-slate-100">Typography Properties</h4>
          </div>
          <button onClick={onDeleteSelected} className="p-1 text-slate-500 hover:text-rose-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">Label Text</label>
          <input
            type="text"
            value={label.text}
            onChange={(e) => onUpdateLabel(id, { text: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-500/40"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <label className="font-semibold text-slate-300">Font Size</label>
            <span className="font-mono text-amber-400">{label.fontSize}px</span>
          </div>
          <input
            type="range"
            min="8"
            max="48"
            value={label.fontSize}
            onChange={(e) => onUpdateLabel(id, { fontSize: parseInt(e.target.value) })}
            className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <label className="font-semibold text-slate-300">Rotation Angle</label>
            <span className="font-mono text-amber-400">{label.rotation || 0}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            value={label.rotation || 0}
            onChange={(e) => onUpdateLabel(id, { rotation: parseInt(e.target.value) })}
            className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    );
  }

  if (type === 'kingdom') {
    const kng = map.kingdoms.find((k) => k.id === id);
    if (!kng) return null;

    return (
      <div className="space-y-4 font-sans text-xs">
        <div className="flex justify-between items-start pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <h4 className="font-cinzel font-bold text-sm text-slate-100">Kingdom Realm Properties</h4>
          </div>
          <button onClick={onDeleteSelected} className="p-1 text-slate-500 hover:text-rose-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">Kingdom Name</label>
          <input
            type="text"
            value={kng.name}
            onChange={(e) => onUpdateKingdom && onUpdateKingdom(id, { name: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-bold focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">Ruler / Monarch</label>
          <input
            type="text"
            value={kng.ruler || ''}
            onChange={(e) => onUpdateKingdom && onUpdateKingdom(id, { ruler: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
          />
        </div>
      </div>
    );
  }

  return null;
};
