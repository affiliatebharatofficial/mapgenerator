import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, ChevronLeft, ChevronRight, Wand2, BookOpen, Shield, Users, Scroll } from 'lucide-react';
import type { Session, Scene, CampaignNPC, Encounter } from '../../types/campaign';
import { CampaignService } from '../../lib/supabase/campaignService';
import { AICampaignEngine } from '../../lib/ai/aiCampaignEngine';

interface ActiveSessionWorkspaceProps {
  session: Session;
  scenes: Scene[];
  npcs: CampaignNPC[];
  encounters: Encounter[];
  onCloseSession: () => void;
}

export const ActiveSessionWorkspace: React.FC<ActiveSessionWorkspaceProps> = ({
  session,
  scenes,
  npcs,
  encounters,
  onCloseSession
}) => {
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(session.elapsedTimeSeconds || 0);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [notes, setNotes] = useState(session.privateNotes || '');
  const [recapModal, setRecapModal] = useState<string | null>(null);
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false);

  // Timer Ticker
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Auto-save notes & elapsed time
  const handleSaveSessionState = () => {
    CampaignService.saveSession({
      ...session,
      privateNotes: notes,
      elapsedTimeSeconds: elapsedSeconds,
      status: 'Active'
    });
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentScene = scenes[currentSceneIdx] || { title: 'Preparation & Free Play', description: 'Open roleplay & session setup.' };

  const handleGenerateRecap = async () => {
    setIsGeneratingRecap(true);
    const result = await AICampaignEngine.generateSessionSummaryWithAI(
      session.title,
      notes,
      scenes.map((s) => s.title)
    );
    setRecapModal(result.recap);
    setIsGeneratingRecap(false);

    CampaignService.saveSession({
      ...session,
      summary: result.recap,
      privateNotes: notes,
      status: 'Completed'
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-[#0b0d11] text-slate-100 rounded-3xl border border-amber-500/20 overflow-hidden font-sans select-none">
      {/* Top Session Runner Header */}
      <div className="bg-[#121620] px-6 py-4 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">ACTIVE SESSION #{session.sessionNumber}</span>
            <h3 className="font-cinzel font-bold text-lg text-slate-100">{session.title}</h3>
          </div>
        </div>

        {/* Live Timer Controls */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <span className="font-mono font-bold text-amber-300 text-sm tracking-widest">{formatTime(elapsedSeconds)}</span>
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className="p-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400"
          >
            {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setElapsedSeconds(0)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateRecap}
            disabled={isGeneratingRecap}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{isGeneratingRecap ? 'Recapping...' : 'End Session & AI Recap'}</span>
          </button>
          <button onClick={onCloseSession} className="px-3 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl">
            Close
          </button>
        </div>
      </div>

      {/* Main Session Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Column: Scene Navigation */}
        <div className="w-full md:w-72 bg-[#0e1118] border-r border-slate-800 p-4 space-y-4 shrink-0 overflow-y-auto">
          <h4 className="font-cinzel font-bold text-xs uppercase text-amber-400 tracking-wider">Session Scenes ({scenes.length})</h4>
          {scenes.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No scenes created for this adventure yet.</p>
          ) : (
            <div className="space-y-2">
              {scenes.map((sc, i) => (
                <button
                  key={sc.id}
                  onClick={() => setCurrentSceneIdx(i)}
                  className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition-all ${
                    currentSceneIdx === i
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-mono text-[10px] text-slate-500 uppercase block">{sc.sceneType}</span>
                    <strong className="font-semibold text-slate-200">{sc.title}</strong>
                  </div>
                  {currentSceneIdx === i && <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center Column: Current Scene Runner & Live Notes */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto flex flex-col justify-between">
          {/* Active Scene Description Card */}
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/20 uppercase">
                Scene {currentSceneIdx + 1} of {Math.max(1, scenes.length)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentSceneIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentSceneIdx === 0}
                  className="p-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSceneIdx((prev) => Math.min(scenes.length - 1, prev + 1))}
                  disabled={currentSceneIdx >= scenes.length - 1}
                  className="p-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h2 className="font-cinzel font-bold text-xl text-slate-100">{currentScene.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{currentScene.description}</p>
          </div>

          {/* Live GM Scratchpad Notes */}
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="font-semibold text-slate-300">Live GM Session Scratchpad Notes (Auto-saved)</label>
              <button onClick={handleSaveSessionState} className="text-[11px] font-mono text-amber-400 hover:underline">
                Save Notes
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveSessionState}
              placeholder="Record player actions, discoveries, loot, NPC reactions..."
              className="flex-1 w-full min-h-[160px] bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
            />
          </div>
        </div>

        {/* Right Column: Quick Reference Panel */}
        <div className="w-full md:w-80 bg-[#0e1118] border-l border-slate-800 p-4 space-y-5 shrink-0 overflow-y-auto">
          {/* Quick NPCs */}
          <div className="space-y-2">
            <h4 className="font-cinzel font-bold text-xs uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Campaign NPCs ({npcs.length})
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
              {npcs.map((npc) => (
                <div key={npc.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <strong className="block font-semibold text-slate-200">{npc.name}</strong>
                    <span className="text-[10px] font-mono text-slate-400">{npc.role}</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300">{npc.relationship}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Encounters */}
          <div className="space-y-2">
            <h4 className="font-cinzel font-bold text-xs uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Encounters ({encounters.length})
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
              {encounters.map((enc) => (
                <div key={enc.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="font-semibold text-slate-200">{enc.title}</strong>
                    <span className="text-[9px] font-mono text-rose-400">{enc.difficulty}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{enc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Session Recap Modal */}
      {recapModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-lg w-full space-y-4">
            <h3 className="font-cinzel font-bold text-lg text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" /> AI Session Recap Narrative
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">{recapModal}</p>
            <div className="flex justify-end">
              <button onClick={() => setRecapModal(null)} className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                Close & Save to Journal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
