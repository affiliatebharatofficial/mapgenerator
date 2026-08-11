import React, { useState } from 'react';
import { UserCheck, Check, X, MessageSquare, Send } from 'lucide-react';
import type { PlayerDecision } from '../../types/campaignWorkspace';
import { CampaignWorkspaceService } from '../../lib/campaign/campaignWorkspaceService';

interface PlayerDecisionPanelProps {
  campaignId: string;
}

export const PlayerDecisionPanel: React.FC<PlayerDecisionPanelProps> = ({ campaignId }) => {
  const [decisions, setDecisions] = useState<PlayerDecision[]>(() => CampaignWorkspaceService.getPlayerDecisions(campaignId));
  const [newText, setNewText] = useState('');
  const [playerName, setPlayerName] = useState('Alex');
  const [charName, setCharName] = useState('Kaelen');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const added = CampaignWorkspaceService.submitPlayerDecision({
      campaignId,
      playerId: `p_${Date.now()}`,
      playerName,
      characterName: charName,
      decisionText: newText
    });

    setDecisions((prev) => [...prev, added]);
    setNewText('');
  };

  const handleReview = (id: string, status: PlayerDecision['status']) => {
    CampaignWorkspaceService.reviewPlayerDecision(id, status, 'Decision accepted into Campaign State.');
    setDecisions(CampaignWorkspaceService.getPlayerDecisions(campaignId));
  };

  return (
    <div className="space-y-6 font-sans select-none text-xs">
      <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="font-cinzel font-bold text-sm text-slate-100 flex items-center gap-2">
          <Send className="w-4 h-4 text-amber-400" /> Submit Asynchronous Player Intent
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Player Name"
            className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
          />
          <input
            type="text"
            value={charName}
            onChange={(e) => setCharName(e.target.value)}
            placeholder="Character Name"
            className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
          />
        </div>

        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Describe your character's intended action or choice between sessions..."
          rows={2}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
        />

        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow">
            Submit Decision to GM
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h4 className="font-cinzel font-bold text-sm text-slate-100">Player Submissions & GM Approvals</h4>
        {decisions.map((d) => (
          <div key={d.id} className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <strong className="font-cinzel text-slate-200">{d.playerName} ({d.characterName})</strong>
                <span className="text-[9px] font-mono uppercase bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">
                  {d.status}
                </span>
              </div>
              <p className="text-slate-300">{d.decisionText}</p>
            </div>

            {d.status === 'pending' && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleReview(d.id, 'accepted')}
                  className="p-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-xl font-bold"
                  title="Accept Decision"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReview(d.id, 'rejected')}
                  className="p-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-xl font-bold"
                  title="Reject Decision"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
