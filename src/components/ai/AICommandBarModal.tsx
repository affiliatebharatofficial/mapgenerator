import React, { useState, useEffect } from 'react';
import { Sparkles, X, Send, CornerDownLeft, AlertCircle } from 'lucide-react';
import type { FantasyMap, SelectedObjectRef } from '../../types/map';
import type { AgentResponse } from '../../types/agentTypes';
import { AIWorldAgent } from '../../lib/ai/aiWorldAgent';

interface AICommandBarModalProps {
  map: FantasyMap;
  worldData?: any;
  selectedObject?: SelectedObjectRef | null;
  onClose: () => void;
  onApplyActionPlan: (response: AgentResponse) => void;
}

export const AICommandBarModal: React.FC<AICommandBarModalProps> = ({
  map,
  worldData,
  selectedObject,
  onClose,
  onApplyActionPlan
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);

  const samplePrompts = [
    'Add 3 villages around the capital',
    'Who controls the northern mountains?',
    'Move capital closer to the river',
    'Create a military defense quest',
    'What is north of Silverkeep?'
  ];

  // Esc key listener to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    const agentRes = await AIWorldAgent.processAgentRequest(prompt, map, worldData, selectedObject);
    setResponse(agentRes);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Search Bar Input */}
        <form onSubmit={handleSubmit} className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask your world anything or command changes... (Ctrl+K)"
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {loading ? (
            <span className="text-xs text-amber-400 font-mono animate-pulse">Thinking...</span>
          ) : (
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Suggestion Chips */}
        {!response && (
          <div className="p-4 bg-[#0e1118] space-y-2">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">SUGGESTED AGENT COMMANDS</span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(s)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <span>{s}</span>
                  <CornerDownLeft className="w-3 h-3 opacity-40" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Response Body */}
        {response && (
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Thinking Status Bar */}
            <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400">
              {response.thinkingSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* Answer Result (Ask Mode) */}
            {response.mode === 'answer' && response.answer && (
              <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl text-xs text-amber-200 font-serif leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-cinzel font-bold text-amber-400">
                  <Sparkles className="w-4 h-4" /> Answer Grounded in World Data
                </div>
                <p>{response.answer}</p>
              </div>
            )}

            {/* Proposed Action Plan (Edit Mode) */}
            {response.mode === 'action_plan' && response.actions && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-cinzel font-bold text-sm text-amber-300">Proposed Action Plan</h4>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Est. Cost: {response.estimatedCreditCost} Credit
                  </span>
                </div>

                <div className="space-y-2">
                  {response.actions.map((act) => (
                    <div key={act.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-100">{act.description}</div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">{act.type} • Risk: {act.riskLevel}</div>
                      </div>
                      <span className="text-emerald-400 font-mono text-xs">Ready</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setResponse(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl">
                    Back
                  </button>
                  <button
                    onClick={() => {
                      onApplyActionPlan(response);
                      onClose();
                    }}
                    className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
                  >
                    Confirm & Apply Actions
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
