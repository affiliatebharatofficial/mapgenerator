import React from 'react';
import { Tag, Building, Globe, Trash2, Sliders, MapPin, Crown, Sparkles, Mountain, Trees } from 'lucide-react';
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
  onOpenImageStudioPicker?: () => void;
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
  onCreateWorldEntry,
  onOpenImageStudioPicker
}) => {
  if (!selectedObject) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 font-sans space-y-2">
        <Sliders className="w-8 h-8 mx-auto text-slate-600" />
        <p className="font-semibold text-slate-400">No Object Selected</p>
        <p className="text-[11px] leading-relaxed">Click any settlement, kingdom, POI, label, mountain, forest, or artwork overlay on the map to inspect properties.</p>
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

        {/* Attached AI Artwork Section */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="font-semibold text-slate-300 flex items-center justify-between">
            <span>AI Artwork Illustration</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </label>

          {city.artworkUrl ? (
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950 aspect-video">
                <img src={city.artworkUrl} alt={city.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onOpenImageStudioPicker}
                  className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-[11px] font-semibold rounded-lg"
                >
                  Change Artwork
                </button>
                <button
                  onClick={() => onUpdateCity(id, { artworkUrl: undefined })}
                  className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold rounded-lg"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenImageStudioPicker}
              className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Attach AI Artwork from Image Studio
            </button>
          )}
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

        {/* Attached AI Artwork Section */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="font-semibold text-slate-300 flex items-center justify-between">
            <span>AI Artwork Illustration</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </label>

          {poi.artworkUrl ? (
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950 aspect-video">
                <img src={poi.artworkUrl} alt={poi.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onOpenImageStudioPicker}
                  className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-[11px] font-semibold rounded-lg"
                >
                  Change Artwork
                </button>
                <button
                  onClick={() => onUpdatePOI && onUpdatePOI(id, { artworkUrl: undefined })}
                  className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold rounded-lg"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenImageStudioPicker}
              className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Attach AI Artwork from Image Studio
            </button>
          )}
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

        {/* Attached AI Artwork Section */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="font-semibold text-slate-300 flex items-center justify-between">
            <span>Kingdom Crest / AI Artwork</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </label>

          {kng.artworkUrl ? (
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950 aspect-video">
                <img src={kng.artworkUrl} alt={kng.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onOpenImageStudioPicker}
                  className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-[11px] font-semibold rounded-lg"
                >
                  Change Artwork
                </button>
                <button
                  onClick={() => onUpdateKingdom && onUpdateKingdom(id, { artworkUrl: undefined })}
                  className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold rounded-lg"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenImageStudioPicker}
              className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Attach AI Artwork from Image Studio
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === 'user_artwork') {
    const art = map.userArtworks?.find((a) => a.id === id);
    if (!art) return null;

    return (
      <div className="space-y-4 font-sans text-xs">
        <div className="flex justify-between items-start pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="font-cinzel font-bold text-sm text-slate-100">AI Artwork Overlay</h4>
          </div>
          <button onClick={onDeleteSelected} className="p-1 text-slate-500 hover:text-rose-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950 aspect-video">
          <img src={art.url} alt={art.name || 'AI Artwork'} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">Artwork Name</label>
          <p className="font-bold text-slate-100 bg-slate-950 p-2 rounded-lg border border-slate-800">{art.name || 'AI Artwork'}</p>
        </div>

        <button
          onClick={onDeleteSelected}
          className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40 flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Remove Artwork from Map
        </button>
      </div>
    );
  }

  if (type === 'mountain') {
    return (
      <div className="space-y-4 font-sans text-xs">
        <div className="flex justify-between items-start pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Mountain className="w-4 h-4 text-amber-400" />
            <h4 className="font-cinzel font-bold text-sm text-slate-100">Mountain Peak</h4>
          </div>
          <button onClick={onDeleteSelected} className="p-1 text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px] font-semibold bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
            <Trash2 className="w-3.5 h-3.5" /> Delete Peak
          </button>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Mountain peak selected. You can drag it to move across the terrain or click <strong>Delete Peak</strong> to remove it from the map.
        </p>
        <button
          onClick={onDeleteSelected}
          className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40 flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Delete Mountain Peak
        </button>
      </div>
    );
  }

  if (type === 'forest') {
    return (
      <div className="space-y-4 font-sans text-xs">
        <div className="flex justify-between items-start pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Trees className="w-4 h-4 text-emerald-400" />
            <h4 className="font-cinzel font-bold text-sm text-slate-100">Forest Cluster</h4>
          </div>
          <button onClick={onDeleteSelected} className="p-1 text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px] font-semibold bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
            <Trash2 className="w-3.5 h-3.5" /> Delete Cluster
          </button>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Forest cluster selected. You can drag it to move across the terrain or click <strong>Delete Cluster</strong> to remove it from the map.
        </p>
        <button
          onClick={onDeleteSelected}
          className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40 flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Delete Forest Cluster
        </button>
      </div>
    );
  }

  return null;
};
