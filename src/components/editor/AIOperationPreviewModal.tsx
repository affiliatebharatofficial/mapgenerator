import React, { useState } from 'react';
import { Sparkles, Check, X, ShieldAlert, CheckSquare } from 'lucide-react';
import type { AIOperation } from '../../types/editorPrecision';

interface AIOperationPreviewModalProps {
  operations: AIOperation[];
  onConfirm: (approvedOps: AIOperation[]) => void;
  onClose: () => void;
}

export const AIOperationPreviewModal: React.FC<AIOperationPreviewModalProps> = ({
  operations: initialOps,
  onConfirm,
  onClose
}) => {
  const [ops, setOps] = useState<AIOperation[]>(initialOps);

  const toggleApproval = (id: string) => {
    setOps((prev) => prev.map((o) => (o.id === id ? { ...o, approved: !o.approved } : o)));
  };

  const handleApply = () => {
    const approved = ops.filter((o) => o.approved);
    onConfirm(approved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">AI Proposed Map Operations</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Review proposed AI operations before committing to your map database. Uncheck any changes you wish to discard.
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {ops.map((op) => (
              <div key={op.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {op.type.replace('_', ' ')}
                  </span>
                  <p className="font-semibold text-slate-200">{op.description}</p>
                </div>

                <input
                  type="checkbox"
                  checked={op.approved}
                  onChange={() => toggleApproval(op.id)}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
              Cancel All
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Apply Selected Changes ({ops.filter((o) => o.approved).length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
