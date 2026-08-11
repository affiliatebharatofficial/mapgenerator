import React from 'react';
import { ShieldCheck, AlertTriangle, Info, X } from 'lucide-react';
import type { ConsistencyIssue } from '../../types/agentTypes';

interface ConsistencyCheckerModalProps {
  issues: ConsistencyIssue[];
  onClose: () => void;
}

export const ConsistencyCheckerModal: React.FC<ConsistencyCheckerModalProps> = ({ issues, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">World Consistency Audit</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Findings */}
        {issues.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-cinzel font-bold text-base text-emerald-300">World Is Completely Consistent!</h4>
            <p className="text-xs text-slate-400">No duplicate names, missing capitals, or orphan entity links detected.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {issues.map((iss) => (
              <div key={iss.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {iss.severity === 'error' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Info className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="font-bold text-xs text-slate-200">{iss.title}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                    {iss.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{iss.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
            Close Audit Report
          </button>
        </div>
      </div>
    </div>
  );
};
