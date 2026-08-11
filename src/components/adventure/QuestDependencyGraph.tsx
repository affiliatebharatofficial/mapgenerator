import React from 'react';
import { GitCommit, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import type { QuestObjective } from '../../types/adventure';

interface QuestDependencyGraphProps {
  objectives: QuestObjective[];
}

export const QuestDependencyGraph: React.FC<QuestDependencyGraphProps> = ({ objectives }) => {
  return (
    <div className="w-full bg-[#090b0e] border border-slate-800 rounded-3xl p-6 font-sans select-none space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <GitCommit className="w-5 h-5 text-amber-400" />
        <h4 className="font-cinzel font-bold text-sm text-slate-100">Quest Objective & Choice Tree</h4>
      </div>

      <div className="space-y-4">
        {objectives.map((obj, idx) => (
          <div key={obj.id} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-[10px]">
                  {idx + 1}
                </span>
                <h5 className="font-cinzel font-bold text-xs text-slate-100">{obj.title}</h5>
              </div>
              <span className="text-[10px] font-mono text-slate-400 capitalize">{obj.status}</span>
            </div>

            <p className="text-xs text-slate-300 pl-7">{obj.description}</p>

            {obj.branches && obj.branches.length > 0 && (
              <div className="pl-7 pt-2 space-y-1.5">
                <span className="text-[10px] font-mono text-amber-400 block font-semibold">Branching Outcomes:</span>
                {obj.branches.map((b) => (
                  <div key={b.id} className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between">
                    <span className="text-slate-300">Choice: {b.choiceText}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
