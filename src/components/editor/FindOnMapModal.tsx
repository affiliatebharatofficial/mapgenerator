import React, { useState } from 'react';
import { Search, X, MapPin, Building, Crown, Tag } from 'lucide-react';
import type { FantasyMap, SelectedObjectRef } from '../../types/map';

interface FindOnMapModalProps {
  map: FantasyMap;
  onClose: () => void;
  onSelectAndFocusObject: (ref: SelectedObjectRef, x: number, y: number) => void;
}

export const FindOnMapModal: React.FC<FindOnMapModalProps> = ({
  map,
  onClose,
  onSelectAndFocusObject
}) => {
  const [query, setQuery] = useState('');

  const q = query.toLowerCase().trim();

  // Search across cities, kingdoms, labels, POIs
  const cityResults = map.cities.filter((c) => c.name.toLowerCase().includes(q));
  const kingdomResults = map.kingdoms.filter((k) => k.name.toLowerCase().includes(q));
  const poiResults = map.pointsOfInterest.filter((p) => p.name.toLowerCase().includes(q));
  const labelResults = map.labels.filter((l) => l.text.toLowerCase().includes(q));

  const hasResults =
    cityResults.length > 0 || kingdomResults.length > 0 || poiResults.length > 0 || labelResults.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="font-cinzel font-bold text-lg text-slate-100 flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-400" /> Find on Map
          </h3>
          <p className="text-xs text-slate-400">Search settlements, kingdoms, points of interest, or text labels.</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Silverkeep, Ironpeak, Dragon Lair..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
          />
        </div>

        {/* Results List */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {!q ? (
            <p className="text-xs text-slate-500 text-center py-6">Type a name above to search your map.</p>
          ) : !hasResults ? (
            <p className="text-xs text-rose-400 text-center py-6">No matching objects found on map.</p>
          ) : (
            <>
              {cityResults.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectAndFocusObject({ type: 'city', id: c.id }, c.x, c.y);
                    onClose();
                  }}
                  className="w-full p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-slate-200">{c.name}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Settlement • {c.type}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400">Focus &rarr;</span>
                </button>
              ))}

              {kingdomResults.map((k) => (
                <button
                  key={k.id}
                  onClick={() => {
                    const pos = k.center || { x: map.width / 2, y: map.height / 2 };
                    onSelectAndFocusObject({ type: 'kingdom', id: k.id }, pos.x, pos.y);
                    onClose();
                  }}
                  className="w-full p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-slate-200">{k.name}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Kingdom Realm</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400">Focus &rarr;</span>
                </button>
              ))}

              {poiResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectAndFocusObject({ type: 'poi', id: p.id }, p.x, p.y);
                    onClose();
                  }}
                  className="w-full p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    <div>
                      <span className="font-bold text-slate-200">{p.name}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Location • {p.type}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400">Focus &rarr;</span>
                </button>
              ))}

              {labelResults.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    onSelectAndFocusObject({ type: 'label', id: l.id }, l.x, l.y);
                    onClose();
                  }}
                  className="w-full p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-slate-200">{l.text}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Text Label</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400">Focus &rarr;</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
