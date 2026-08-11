import React from 'react';
import { Sparkles, X, Compass, Zap } from 'lucide-react';

interface GenerationLimitModalProps {
  usedCredits: number;
  totalCredits: number;
  onClose: () => void;
  onNavigatePricing: () => void;
  onContinueProcedural: () => void;
}

export const GenerationLimitModal: React.FC<GenerationLimitModalProps> = ({
  usedCredits,
  totalCredits,
  onClose,
  onNavigatePricing,
  onContinueProcedural
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl relative text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100">
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400 shadow-xl">
          <Zap className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h3 className="font-cinzel font-bold text-xl text-amber-200">
            Monthly AI Limit Reached
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            You've used all <strong className="text-amber-300 font-mono">{usedCredits} / {totalCredits}</strong> AI map generation credits for this monthly billing cycle.
          </p>
        </div>

        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left space-y-1.5 text-xs text-amber-200/90">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Pro Plan Includes:
          </div>
          <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
            <li>100 AI Generation Credits / month</li>
            <li>HD PNG, SVG Vector & PDF Exports</li>
            <li>All 5 Premium Fantasy Map Styles</li>
            <li>100 Saved Cloud Maps</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onNavigatePricing}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to Pro ($9/mo)</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onContinueProcedural();
            }}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Continue with Unlimited Quick Generate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
