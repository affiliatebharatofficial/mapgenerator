import React, { useState } from 'react';
import { AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';
import type { AgentResponse, AgentAction } from '../../types/agentTypes';

interface AgentActionPreviewModalProps {
  response: AgentResponse;
  onConfirm: (enabledActions: AgentAction[]) => void;
  onClose: () => void;
}

export const AgentActionPreviewModal: React.FC<AgentActionPreviewModalProps> = ({
  response,
  onConfirm,
  onClose
}) => {
  const [actions, setActions] = useState<AgentAction[]>(response.actions || []);

  const toggleAction = (id: string) => {
    setActions((prev) => prev.map((act) => (act.id === id ? { ...act, enabled: !act.enabled } : act)));
  };

  const enabledCount = actions.filter((a) => a.enabled).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-xl w-full space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-cinzel font-bold text-lg text-amber-300">Review AI Proposed Action Plan</h3>
            <p className="text-xs text-slate-400">{response.summary || 'Confirm AI modifications before applying to map.'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action List with Checkboxes */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {actions.map((act) => (
            <div
              key={act.id}
              onClick={() => toggleAction(act.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                act.enabled
                  ? 'bg-amber-500/10 border-amber-500/40 text-slate-100'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 line-through'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    act.enabled ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-700'
                  }`}
                >
                  {act.enabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold">{act.description}</div>
                  <div className="text-[10px] font-mono text-slate-400">Risk Level: <span className="uppercase">{act.riskLevel}</span></div>
                </div>
              </div>

              {act.conflictsWithCanon && (
                <div className="flex items-center gap-1 text-[10px] text-rose-400 font-mono">
                  <ShieldAlert className="w-3.5 h-3.5" /> Canon Conflict
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cost & Single Transaction Notice */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Est. Cost: <strong className="text-amber-300">{response.estimatedCreditCost} Credit</strong></span>
          <span className="text-emerald-400 font-semibold">Atomic Single-Undo (Ctrl+Z)</span>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(actions.filter((a) => a.enabled))}
            disabled={enabledCount === 0}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
          >
            Apply {enabledCount} Action{enabledCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
