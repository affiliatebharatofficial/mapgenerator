import React, { useState } from 'react';
import { Sparkles, X, Send, CornerDownLeft, ShieldCheck, Cpu } from 'lucide-react';
import type { FantasyMap, SelectedObjectRef } from '../../types/map';
import type { AgentResponse } from '../../types/agentTypes';
import { AIWorldAgent } from '../../lib/ai/aiWorldAgent';

interface AIAssistantPanelProps {
  map: FantasyMap;
  worldData?: any;
  selectedObject?: SelectedObjectRef | null;
  onClose: () => void;
  onApplyActionPlan: (response: AgentResponse) => void;
  onOpenConsistencyChecker?: () => void;
  onOpenNamingAssistant?: () => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  map,
  worldData,
  selectedObject,
  onClose,
  onApplyActionPlan,
  onOpenConsistencyChecker,
  onOpenNamingAssistant
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    const agentRes = await AIWorldAgent.processAgentRequest(prompt, map, worldData, selectedObject);
    setResponse(agentRes);
    setLoading(false);
  };

  return (
    <aside className="w-80 bg-[#121620]/95 backdrop-blur-md border-l border-amber-500/20 h-full flex flex-col z-30 font-sans select-none">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0e1118] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <h3 className="font-cinzel font-bold text-sm text-slate-100">AI World Agent</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Selection Context Awareness */}
      {selectedObject && (
        <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
          <span className="font-mono text-[11px]">Primary Context: <strong>{selectedObject.type.toUpperCase()} #{selectedObject.id}</strong></span>
          <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">Auto-Linked</span>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-5">
        {/* Quick Tools Shortcuts */}
        <div className="grid grid-cols-2 gap-2">
          {onOpenConsistencyChecker && (
            <button
              onClick={onOpenConsistencyChecker}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors space-y-1"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-[11px] font-bold text-slate-200">Audit Consistency</div>
            </button>
          )}
          {onOpenNamingAssistant && (
            <button
              onClick={onOpenNamingAssistant}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors space-y-1"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <div className="text-[11px] font-bold text-slate-200">Name Generator</div>
            </button>
          )}
        </div>

        {/* Response Result Box */}
        {response ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Thinking Status List */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
              {response.thinkingSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-amber-400">✓</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* Answer Display */}
            {response.mode === 'answer' && (
              <div className="p-3.5 bg-slate-950 border border-amber-500/30 rounded-xl text-xs text-amber-200 font-serif leading-relaxed space-y-2">
                <span className="font-cinzel font-bold text-amber-400 block text-xs">✨ Agent Answer</span>
                <p>{response.answer}</p>
              </div>
            )}

            {/* Action Plan Display */}
            {response.mode === 'action_plan' && response.actions && (
              <div className="space-y-3">
                <span className="font-cinzel font-bold text-xs text-amber-300 block">Proposed Action Plan</span>
                <div className="space-y-2">
                  {response.actions.map((act) => (
                    <div key={act.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-slate-200">{act.description}</div>
                      <div className="text-[10px] font-mono text-slate-400">Risk: <span className="text-amber-400 uppercase">{act.riskLevel}</span></div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onApplyActionPlan(response)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  Apply Action Plan
                </button>
              </div>
            )}

            <button onClick={() => setResponse(null)} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs rounded-xl font-mono">
              Reset Query
            </button>
          </div>
        ) : (
          <div className="text-center py-6 space-y-2 text-slate-400">
            <Sparkles className="w-8 h-8 text-amber-500/40 mx-auto" />
            <p className="text-xs font-serif leading-relaxed px-4">
              "Tell the AI agent to move cities, paint mountain ranges, create quests, or ask spatial questions."
            </p>
          </div>
        )}
      </div>

      {/* Panel Bottom Input */}
      <form onSubmit={handleAsk} className="p-3 border-t border-slate-800 bg-[#0e1118] flex items-center gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Command AI Agent..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="p-2 bg-amber-500 text-slate-950 rounded-xl disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
};
