import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Wrench, X, Sparkles } from 'lucide-react';
import type { FantasyMap } from '../../types/map';
import { SpatialEngine } from '../../lib/map-engine/spatialEngine';
import type { GeographicHealthIssue } from '../../types/mapGeography';

interface MapHealthModalProps {
  map: FantasyMap;
  onUpdateMap: (updatedMap: FantasyMap) => void;
  onClose: () => void;
}

export const MapHealthModal: React.FC<MapHealthModalProps> = ({ map, onUpdateMap, onClose }) => {
  const [issues, setIssues] = useState<GeographicHealthIssue[]>(() => SpatialEngine.runDiagnostics(map));
  const [fixedIds, setFixedIds] = useState<string[]>([]);

  const handleFixIssue = (issue: GeographicHealthIssue) => {
    let updated = { ...map };

    if (issue.autoFixAction === 'add_lake') {
      const river = map.rivers.find((r) => r.id === issue.affectedId);
      if (river && river.points.length > 0) {
        const lastPt = river.points[river.points.length - 1];
        const newLake = {
          id: `lake_fix_${Date.now()}`,
          points: [
            { x: lastPt.x - 15, y: lastPt.y - 15 },
            { x: lastPt.x + 15, y: lastPt.y - 15 },
            { x: lastPt.x + 15, y: lastPt.y + 15 },
            { x: lastPt.x - 15, y: lastPt.y + 15 }
          ]
        };
        updated.lakes = [...(updated.lakes || []), newLake];
      }
    } else if (issue.autoFixAction === 'relocate_settlement') {
      const city = map.cities.find((c) => c.id === issue.affectedId);
      if (city && map.cities.length > 1) {
        const c1 = map.cities[0];
        const c2 = city;
        const newRoad = {
          id: `road_fix_${Date.now()}`,
          roadType: 'secondary' as const,
          width: 3,
          points: [{ x: c1.x, y: c1.y }, { x: c2.x, y: c2.y }],
          path: [{ x: c1.x, y: c1.y }, { x: c2.x, y: c2.y }]
        };
        updated.roads = [...(updated.roads || []), newRoad];
      }
    }

    setFixedIds((prev) => [...prev, issue.id]);
    onUpdateMap(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">Geographic Map Diagnostics</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Automated geographical and civilization health audit. Detects river flow issues, isolated cities, and extreme terrain conflicts.
          </p>

          {issues.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="font-cinzel font-bold text-slate-200 text-sm">Perfect Geographic Health!</p>
              <p className="text-slate-400 text-xs">All rivers, watersheds, settlements, and roads adhere to physical rules.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {issues.map((iss) => {
                const isFixed = fixedIds.includes(iss.id);
                return (
                  <div key={iss.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          iss.severity === 'warning' ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'
                        }`}>
                          {iss.severity}
                        </span>
                        <span className="font-cinzel font-bold text-sm text-slate-200">{iss.title}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{iss.description}</p>
                    </div>

                    <button
                      onClick={() => handleFixIssue(iss)}
                      disabled={isFixed}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                        isFixed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow'
                      }`}
                    >
                      {isFixed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
                      <span>{isFixed ? 'Fixed!' : '1-Click Fix'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button onClick={onClose} className="px-5 py-2 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
