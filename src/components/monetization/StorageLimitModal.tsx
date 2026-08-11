import React from 'react';
import { Sparkles, X, Database } from 'lucide-react';

interface StorageLimitModalProps {
  currentCount: number;
  maxCount: number;
  onClose: () => void;
  onNavigatePricing: () => void;
  onNavigateDashboard: () => void;
}

export const StorageLimitModal: React.FC<StorageLimitModalProps> = ({
  currentCount,
  maxCount,
  onClose,
  onNavigatePricing,
  onNavigateDashboard
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl relative text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100">
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400 shadow-xl">
          <Database className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h3 className="font-cinzel font-bold text-xl text-amber-200">
            Saved Map Storage Limit Reached
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            You've reached your maximum saved maps limit (<strong className="text-amber-300 font-mono">{currentCount} / {maxCount} maps</strong>) on the Free plan.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onNavigatePricing}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to Pro for 100 Saved Maps</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigateDashboard();
            }}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            Manage & Delete Old Maps
          </button>
        </div>
      </div>
    </div>
  );
};
