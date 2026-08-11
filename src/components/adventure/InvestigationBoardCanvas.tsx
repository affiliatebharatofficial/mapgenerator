import React from 'react';
import { Search, MapPin, User, FileText, Lock } from 'lucide-react';
import type { InvestigationClue } from '../../types/adventure';

interface InvestigationBoardCanvasProps {
  clues: InvestigationClue[];
  gmSecrets?: string[];
}

export const InvestigationBoardCanvas: React.FC<InvestigationBoardCanvasProps> = ({ clues, gmSecrets = [] }) => {
  return (
    <div className="w-full h-96 bg-[#0a0c10] border border-slate-800 rounded-3xl p-6 font-sans select-none relative overflow-hidden flex flex-col justify-between">
      <div className="flex justify-between items-center z-10 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-amber-400" />
          <h4 className="font-cinzel font-bold text-sm text-slate-100">Campaign Investigation Board</h4>
        </div>
        <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          GM View Active
        </span>
      </div>

      {/* Pinboard Evidence Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-auto">
        {clues.map((clue) => (
          <div key={clue.id} className="glass-panel p-4 rounded-2xl border border-amber-500/30 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="font-cinzel font-bold text-xs text-amber-300">{clue.title}</span>
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-300">{clue.actualMeaning}</p>
            <span className="text-[10px] font-mono text-slate-500 block">Location: {clue.foundAtLocation}</span>
          </div>
        ))}

        {gmSecrets.map((sec, idx) => (
          <div key={idx} className="glass-panel p-4 rounded-2xl border border-rose-500/40 bg-rose-950/10 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400">
              <Lock className="w-3.5 h-3.5" />
              <strong className="font-cinzel text-xs">GM Secret #{idx + 1}</strong>
            </div>
            <p className="text-[11px] text-rose-200/80 italic">{sec}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
