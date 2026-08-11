import React, { useState } from 'react';
import { Activity, ShieldAlert, CheckCircle2, Wrench, Sparkles } from 'lucide-react';
import { WorldBibleService } from '../../lib/supabase/worldBibleService';
import type { WorldConsistencyIssue } from '../../types/worldBible';

interface ConsistencyAuditPanelProps {
  worldId: string;
}

export const ConsistencyAuditPanel: React.FC<ConsistencyAuditPanelProps> = ({ worldId }) => {
  const [issues, setIssues] = useState<WorldConsistencyIssue[]>(() => WorldBibleService.runConsistencyAudit(worldId));
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);

  const handleReview = (id: string) => {
    setReviewedIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6 font-sans select-none text-xs">
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-400" />
            <h3 className="font-cinzel font-bold text-xl text-slate-100">Canon Consistency Engine</h3>
          </div>
          <p className="text-xs text-slate-400">Automated world health scanner detecting timeline contradictions, unlinked entities, and political state conflicts.</p>
        </div>

        <button
          onClick={() => setIssues(WorldBibleService.runConsistencyAudit(worldId))}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-4 h-4" /> Run Canon Audit
        </button>
      </div>

      <div className="space-y-3">
        {issues.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-2 max-w-md mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="font-cinzel font-bold text-slate-200 text-base">Perfect World Canon Integrity!</p>
            <p className="text-slate-400 text-xs">No political, geographic, or timeline contradictions detected in the World Bible.</p>
          </div>
        ) : (
          issues.map((iss) => {
            const isReviewed = reviewedIds.includes(iss.id);
            return (
              <div key={iss.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                      {iss.severity} • {iss.category}
                    </span>
                    <h4 className="font-cinzel font-bold text-sm text-slate-100">{iss.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{iss.description}</p>
                  <span className="text-[10px] font-mono text-slate-500 block">Suggested Resolution: {iss.suggestedFix}</span>
                </div>

                <button
                  onClick={() => handleReview(iss.id)}
                  disabled={isReviewed}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition-all ${
                    isReviewed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900 text-slate-200 border border-slate-800 hover:text-amber-400'
                  }`}
                >
                  {isReviewed ? 'Canon Approved ✓' : 'Create Canon Decision'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
