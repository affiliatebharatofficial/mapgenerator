import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Plus, Wand2, Shield, Eye, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import type { SessionEvent, SessionEventType } from '../../types/campaignWorkspace';
import { CampaignWorkspaceService } from '../../lib/campaign/campaignWorkspaceService';

interface SessionManagerPanelProps {
  campaignId: string;
  worldId: string;
  sessionNumber: number;
}

export const SessionManagerPanel: React.FC<SessionManagerPanelProps> = ({ campaignId, worldId, sessionNumber }) => {
  const sessionId = `sess_${campaignId}_${sessionNumber}`;
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [events, setEvents] = useState<SessionEvent[]>(() => CampaignWorkspaceService.getSessionEvents(sessionId));

  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState<SessionEventType>('discovery');
  const [isSecret, setIsSecret] = useState(false);
  const [recapText, setRecapText] = useState('');
  const [showRecapModal, setShowRecapModal] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isSessionActive) {
      timer = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionActive]);

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDesc.trim()) return;

    const added = CampaignWorkspaceService.addSessionEvent({
      sessionId,
      campaignId,
      eventType,
      description: eventDesc,
      isGmSecret: isSecret
    });

    setEvents((prev) => [...prev, added]);
    setEventDesc('');
  };

  const handleGenerateRecap = () => {
    const summary = events.map((e) => `[${e.timestamp}] (${e.eventType.toUpperCase()}) ${e.description}`).join('\n');
    setRecapText(`Session #${sessionNumber} Summary:\n${summary}`);
    setShowRecapModal(true);
  };

  return (
    <div className="space-y-6 font-sans select-none text-xs">
      {/* Session Runner Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSessionActive(!isSessionActive)}
            className={`p-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all ${
              isSessionActive ? 'bg-rose-500 hover:bg-rose-400 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isSessionActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isSessionActive ? 'Pause Session' : `Start Session #${sessionNumber}`}</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-sm font-bold text-amber-400">
            <Clock className="w-4 h-4" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateRecap}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Compile Session Recap
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Event Quick Recorder Form (5 cols) */}
        <form onSubmit={handleAddEvent} className="md:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="font-cinzel font-bold text-sm text-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" /> Record Live Session Event
          </h4>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Event Category</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as SessionEventType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
            >
              <option value="discovery">Discovery / Investigation</option>
              <option value="battle">Combat Encounter</option>
              <option value="conversation">NPC Conversation</option>
              <option value="decision">Player Decision</option>
              <option value="travel">Travel / Movement</option>
              <option value="faction_change">Faction Standing Shift</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Event Description</label>
            <textarea
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
              placeholder="e.g. Party negotiated a truce with Captain Varik at the harbor..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-500/40"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} className="accent-rose-500" />
              <span>Mark as GM Secret</span>
            </label>

            <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow">
              Record Event
            </button>
          </div>
        </form>

        {/* Live Session Timeline Stream (7 cols) */}
        <div className="md:col-span-7 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h4 className="font-cinzel font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">Session Timeline Feed</h4>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {events.map((e) => (
              <div key={e.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${e.isGmSecret ? 'bg-rose-950/20 border-rose-500/30' : 'bg-slate-950 border-slate-800'}`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-amber-400">{e.timestamp}</span>
                    <span className="text-[9px] font-mono uppercase bg-amber-500/10 px-1.5 rounded text-slate-300">{e.eventType}</span>
                  </div>
                  <p className="text-slate-200">{e.description}</p>
                </div>
                {e.isGmSecret && <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" title="GM Secret" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
