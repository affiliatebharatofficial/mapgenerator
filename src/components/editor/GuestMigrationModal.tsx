import React from 'react';
import { Sparkles, X } from 'lucide-react';
import type { FantasyMap } from '../../types/map';

interface GuestMigrationModalProps {
  map: FantasyMap;
  onConfirmMigration: () => void;
  onDismiss: () => void;
}

export const GuestMigrationModal: React.FC<GuestMigrationModalProps> = ({
  map,
  onConfirmMigration,
  onDismiss
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl relative">
        <button onClick={onDismiss} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100">
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="font-cinzel font-bold text-lg text-amber-200">
            Save Device Map to Account?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            We found a map (<strong className="text-amber-300 font-cinzel">{map.name}</strong>) created on this device. Would you like to transfer it to your cloud account?
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onConfirmMigration}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
          >
            Save Map to My Account
          </button>

          <button
            onClick={onDismiss}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};
