import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, ArrowLeft, Check, Compass } from 'lucide-react';
import type { WorldStyle, WorldPlanSummary } from '../../types/world';
import { AIWorldEngine } from '../../lib/ai/aiWorldEngine';
import { useSubscription } from '../../lib/supabase/subscriptionStore';

interface CreateWorldWizardModalProps {
  onClose: () => void;
  onWorldCreated: (data: { name: string; description: string; style: WorldStyle; aiPlan?: WorldPlanSummary }) => void;
}

export const CreateWorldWizardModal: React.FC<CreateWorldWizardModalProps> = ({
  onClose,
  onWorldCreated
}) => {
  const { deductCredits, creditsRemaining } = useSubscription();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState<WorldStyle>('dark-fantasy');
  const [useAI, setUseAI] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [aiPlan, setAiPlan] = useState<WorldPlanSummary | null>(null);

  const styleOptions: { id: WorldStyle; label: string; desc: string }[] = [
    { id: 'dark-fantasy', label: 'Dark Fantasy', desc: 'Obsidian realms, blood magic, ancient curses' },
    { id: 'classic', label: 'Classic Fantasy', desc: 'Chivalric medieval kingdoms & elven woods' },
    { id: 'high-fantasy', label: 'High Fantasy', desc: 'Floating archipelagos & vibrant magic towers' },
    { id: 'medieval', label: 'Historical Medieval', desc: 'Feudal politics, lords & realistic heraldry' },
    { id: 'grim-fantasy', label: 'Grim Fantasy', desc: 'War-torn lands, mud, steel & perilous ruins' },
    { id: 'mythic-fantasy', label: 'Mythic Fantasy', desc: 'Gods, titans & legendary monster lairs' }
  ];

  const handleNextStep = async () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (useAI) {
        setIsGeneratingPlan(true);
        // Deduct 1 credit for AI World Plan
        deductCredits(1, 'AI World Plan Generation');
        const plan = await AIWorldEngine.generateWorldPlan(aiPrompt || description || name, style);
        setAiPlan(plan);
        setIsGeneratingPlan(false);
        setStep(4);
      } else {
        onWorldCreated({ name, description, style });
      }
    }
  };

  const handleConfirmFinal = () => {
    onWorldCreated({
      name: aiPlan ? aiPlan.worldName : name,
      description,
      style,
      aiPlan: aiPlan || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-amber-500/30 p-6 sm:p-8 rounded-3xl max-w-xl w-full space-y-6 shadow-2xl relative font-sans">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-100">
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Step Progress Bar */}
        <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-3">
          <span className="text-amber-400 font-bold">STEP {step} OF {useAI ? 4 : 3}</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  step >= i ? 'bg-amber-500 w-6' : 'bg-slate-800 w-2'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: WORLD NAME */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-cinzel font-bold text-2xl text-slate-100">
                Name Your <span className="gold-gradient-text">World</span>
              </h3>
              <p className="text-xs text-slate-400">Give your fantasy universe a distinct title.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">World Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="The Kingdoms of Eldoria"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 font-cinzel font-bold placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
              />
            </div>
          </div>
        )}

        {/* STEP 2: DESCRIPTION */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-cinzel font-bold text-2xl text-slate-100">
                World <span className="gold-gradient-text">Background & Lore</span>
              </h3>
              <p className="text-xs text-slate-400">Describe the setting, conflicts, or high concept of your world.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Summary Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="A dark medieval world divided by ancient wars, noble houses, sorcery, and forgotten magical ruins..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/40 resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* STEP 3: WORLD STYLE & OPTIONAL AI GENERATOR */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="font-cinzel font-bold text-2xl text-slate-100">
                Choose <span className="gold-gradient-text">World Theme</span>
              </h3>
              <p className="text-xs text-slate-400">Select a thematic aesthetic and optional AI world builder.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {styleOptions.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStyle(st.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    style === st.id
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-200">{st.label}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{st.desc}</div>
                </button>
              ))}
            </div>

            {/* AI World Builder Toggle */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-200 font-cinzel">Generate World Plan With AI</span>
                </div>
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {useAI && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={2}
                    placeholder="Create 5 warring kingdoms with northern mountain passes and a cursed eastern forest..."
                    className="w-full bg-[#121620] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-amber-400 font-mono">⚡ Consumes 1 AI Credit ({creditsRemaining} remaining)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: AI WORLD PLAN PREVIEW */}
        {step === 4 && (
          <div className="space-y-5">
            {isGeneratingPlan ? (
              <div className="py-12 text-center space-y-3">
                <Compass className="w-10 h-10 text-amber-400 mx-auto animate-spin" />
                <p className="font-cinzel text-amber-300 font-bold">AI World Planner Synthesizing World Blueprint...</p>
              </div>
            ) : aiPlan ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">AI World Plan Blueprint</span>
                  <h3 className="font-cinzel font-bold text-2xl text-amber-200">{aiPlan.worldName}</h3>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Kingdoms</span>
                    <strong className="text-amber-300 text-sm font-cinzel">{aiPlan.kingdomCount}</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Cities</span>
                    <strong className="text-amber-300 text-sm font-cinzel">{aiPlan.cityCount}</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Factions</span>
                    <strong className="text-amber-300 text-sm font-cinzel">{aiPlan.factionCount}</strong>
                  </div>
                </div>

                <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <span className="font-bold text-slate-300 block font-cinzel">Kingdom Blueprint Preview:</span>
                  <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                    {aiPlan.sampleKingdoms.map((k, idx) => (
                      <li key={idx}>{k}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              disabled={!name.trim()}
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmFinal}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Create World Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
