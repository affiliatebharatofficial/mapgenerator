import React, { useState } from 'react';
import { Shield, Sparkles, X, Wand2 } from 'lucide-react';
import type { Encounter } from '../../types/campaign';
import { AICampaignEngine } from '../../lib/ai/aiCampaignEngine';
import { CampaignService } from '../../lib/supabase/campaignService';
import { useSubscription } from '../../lib/supabase/subscriptionStore';

interface EncounterGeneratorModalProps {
  campaignId: string;
  campaignName: string;
  onClose: () => void;
  onEncounterCreated: (enc: Encounter) => void;
}

export const EncounterGeneratorModal: React.FC<EncounterGeneratorModalProps> = ({
  campaignId,
  campaignName,
  onClose,
  onEncounterCreated
}) => {
  const { deductCredits } = useSubscription();

  const [location, setLocation] = useState('Ruined Castle Keep');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Deadly'>('Hard');
  const [promptText, setPromptText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    deductCredits(1, 'AI Encounter Generation');

    const result = await AICampaignEngine.generateEncounterWithAI(campaignName, location, difficulty, promptText);
    const created = CampaignService.saveEncounter({
      ...result,
      campaignId
    });

    setLoading(false);
    onEncounterCreated(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">AI Tactical Encounter Generator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Encounter Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Abandoned Shrine in Dark Forest"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Difficulty Level</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Easy', 'Medium', 'Hard', 'Deadly'] as const).map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 rounded-xl border text-center font-semibold transition-all ${
                    difficulty === d ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Custom Scenario Details (Optional)</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={3}
              placeholder="e.g. 'Four experienced heroes entering a trapped hallway guarded by spectral knights...'"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 disabled:opacity-40"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Generating Encounter...' : 'Generate (1 Credit)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
