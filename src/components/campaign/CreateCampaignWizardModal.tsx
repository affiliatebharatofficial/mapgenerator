import React, { useState } from 'react';
import { Shield, Sparkles, X, Wand2, ArrowRight, ArrowLeft } from 'lucide-react';
import type { World } from '../../types/world';
import type { CampaignGenre, Campaign } from '../../types/campaign';
import { CampaignService } from '../../lib/supabase/campaignService';
import { AICampaignEngine } from '../../lib/ai/aiCampaignEngine';
import { useSubscription } from '../../lib/supabase/subscriptionStore';

interface CreateCampaignWizardModalProps {
  worlds: World[];
  userId: string;
  onClose: () => void;
  onCampaignCreated: (campaign: Campaign) => void;
}

export const CreateCampaignWizardModal: React.FC<CreateCampaignWizardModalProps> = ({
  worlds,
  userId,
  onClose,
  onCampaignCreated
}) => {
  const { deductCredits } = useSubscription();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [selectedWorldId, setSelectedWorldId] = useState<string>(worlds[0]?.id || '');
  const [genre, setGenre] = useState<CampaignGenre>('Dark Fantasy');
  const [system, setSystem] = useState('System Agnostic');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateAI = async () => {
    const targetWorld = worlds.find((w) => w.id === selectedWorldId);
    setLoading(true);
    deductCredits(3, 'AI Campaign Generation');

    const result = await AICampaignEngine.generateCampaignWithAI(targetWorld?.name || 'Fantasy World', genre, name || 'New Campaign');
    setDescription(result.description);

    const createdCampaign = CampaignService.saveCampaign({
      name: name || `Campaign of ${targetWorld?.name || 'Realm'}`,
      slug: (name || 'campaign').toLowerCase().replace(/\s+/g, '-'),
      worldId: selectedWorldId,
      userId,
      description: result.description,
      genre,
      system,
      status: 'Active'
    });

    // Save generated sample adventures
    result.adventures.forEach((adv) => {
      CampaignService.saveAdventure({
        ...adv,
        campaignId: createdCampaign.id
      });
    });

    setLoading(false);
    onCampaignCreated(createdCampaign);
    onClose();
  };

  const handleManualCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const createdCampaign = CampaignService.saveCampaign({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      worldId: selectedWorldId,
      userId,
      description: description || `RPG Campaign set in ${worlds.find((w) => w.id === selectedWorldId)?.name || 'World'}.`,
      genre,
      system,
      status: 'Active'
    });

    onCampaignCreated(createdCampaign);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-lg w-full space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">Create RPG Campaign (Step {step} of 4)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: Campaign Name */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Campaign Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Fall of Eldoria"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-40"
              >
                Next: Select World <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select World */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">Select World Foundation</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {worlds.map((w) => (
                  <button
                    type="button"
                    key={w.id}
                    onClick={() => setSelectedWorldId(w.id)}
                    className={`w-full text-left p-3 rounded-xl border flex justify-between items-center transition-all ${
                      selectedWorldId === w.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <strong className="block text-sm">{w.name}</strong>
                      <span className="text-[10px] font-mono text-slate-400 capitalize">{w.style}</span>
                    </div>
                    {selectedWorldId === w.id && <span className="text-xs font-bold text-amber-400">Selected</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(1)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(3)} className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-1.5">
                Next: Campaign Style <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Genre & System */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">Campaign Genre</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Epic Fantasy', 'Dark Fantasy', 'Mystery', 'Political Intrigue', 'Exploration', 'War'] as const).map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGenre(g)}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                      genre === g ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(2)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(4)} className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-1.5">
                Next: AI Setup <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Finalize or AI Setup */}
        {step === 4 && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-cinzel font-bold text-amber-300 text-sm">Campaign Summary</h4>
              <div className="font-mono text-slate-300 space-y-1">
                <div>Name: <span className="text-slate-100">{name}</span></div>
                <div>Genre: <span className="text-amber-400">{genre}</span></div>
                <div>World: <span className="text-slate-100">{worlds.find((w) => w.id === selectedWorldId)?.name}</span></div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>{loading ? 'Building AI Campaign Structure...' : 'Generate Campaign With AI (3 Credits)'}</span>
              </button>

              <button
                type="button"
                onClick={handleManualCreate}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl"
              >
                Create Blank Campaign (Manual Setup)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
