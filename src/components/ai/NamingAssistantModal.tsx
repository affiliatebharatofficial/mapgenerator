import React, { useState } from 'react';
import { Cpu, Copy, Check, X, RefreshCw } from 'lucide-react';
import { AIWorldAgent } from '../../lib/ai/aiWorldAgent';

interface NamingAssistantModalProps {
  onClose: () => void;
  onSelectName?: (name: string) => void;
}

export const NamingAssistantModal: React.FC<NamingAssistantModalProps> = ({ onClose, onSelectName }) => {
  const [category, setCategory] = useState<'kingdom' | 'city' | 'river'>('city');
  const [names, setNames] = useState<string[]>(() => AIWorldAgent.suggestNames('city', 'fantasy', 6));
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const handleGenerate = () => {
    setNames(AIWorldAgent.suggestNames(category, 'fantasy', 6));
  };

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 1500);
    if (onSelectName) onSelectName(name);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">AI Fantasy Naming Wizard</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-3 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
          {(['city', 'kingdom', 'river'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setNames(AIWorldAgent.suggestNames(cat, 'fantasy', 6));
              }}
              className={`py-1.5 capitalize rounded-lg transition-all ${
                category === cat ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Generated Names Grid */}
        <div className="space-y-2">
          {names.map((n, idx) => (
            <div
              key={idx}
              onClick={() => handleCopy(n)}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-xl flex items-center justify-between transition-all cursor-pointer group text-xs"
            >
              <span className="font-cinzel font-bold text-slate-200 group-hover:text-amber-300">{n}</span>
              <button className="text-slate-500 group-hover:text-slate-300">
                {copiedName === n ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>

        {/* Refresh & Close */}
        <div className="flex justify-between items-center pt-2">
          <button onClick={handleGenerate} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Refresh Names
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
