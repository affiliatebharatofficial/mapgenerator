import React, { useState } from 'react';
import { Sparkles, X, Wand2, ShieldCheck, Check } from 'lucide-react';
import type { VisualEntityType, VisualStyle, VisualFraming, VisualAspectRatio, GeneratedImage } from '../../types/visualAssets';
import { VisualAssetService } from '../../lib/ai/visualAssetService';
import { useSubscription } from '../../lib/supabase/subscriptionStore';

interface GenerateVisualAssetModalProps {
  entityType: VisualEntityType;
  entityData: any;
  worldId?: string;
  onClose: () => void;
  onGenerated: (image: GeneratedImage) => void;
}

export const GenerateVisualAssetModal: React.FC<GenerateVisualAssetModalProps> = ({
  entityType,
  entityData,
  worldId,
  onClose,
  onGenerated
}) => {
  const { creditsRemaining, deductCredits } = useSubscription();

  const [style, setStyle] = useState<VisualStyle>('dark-fantasy');
  const [framing, setFraming] = useState<VisualFraming>(entityType === 'character' ? 'bust' : 'wide-landscape');
  const [aspectRatio, setAspectRatio] = useState<VisualAspectRatio>(entityType === 'character' ? '1:1' : '16:9');
  const [customInstructions, setCustomInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusStep, setStatusStep] = useState('');

  const getCreditCost = (): number => {
    if (entityType === 'character') return 2;
    if (entityType === 'city' || entityType === 'kingdom') return 3;
    if (entityType === 'world_cover') return 4;
    if (entityType === 'artistic_map_render') return 5;
    return 2;
  };

  const cost = getCreditCost();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creditsRemaining < cost) {
      alert(`Insufficient AI Credits. This generation requires ${cost} credits.`);
      return;
    }

    setLoading(true);
    setStatusStep('1. Validating entitlement & reserving credits...');

    const success = deductCredits(cost, `AI Visual Asset Generation (${entityType})`);
    if (!success) {
      setLoading(false);
      alert('Credit deduction failed.');
      return;
    }

    setStatusStep('2. Constructing prompt from world entity lore...');

    const prompt = VisualAssetService.buildEntityPrompt(
      entityType,
      entityData,
      { visualStyle: style },
      customInstructions
    );

    setStatusStep('3. Rendering artwork via AI provider pipeline...');

    try {
      const generated = await VisualAssetService.generateEntityVisual({
        entityType,
        entityId: entityData.id,
        worldId,
        prompt,
        style,
        framing,
        aspectRatio,
        creditCost: cost
      });

      setStatusStep('4. Asset stored & attached to entity!');
      onGenerated(generated);
      setTimeout(() => onClose(), 600);
    } catch (err) {
      alert('Image generation failed. Credits refunded.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-lg w-full space-y-5 shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">
              Generate AI {entityType.toUpperCase().replace('_', ' ')} Visual
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          {/* Target Entity Title */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <span className="font-bold text-amber-300 block">{entityData.name || 'Entity Asset'}</span>
              <span className="text-[10px] font-mono text-slate-400">{entityData.role || entityData.type || entityType}</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
              Cost: {cost} Credits
            </span>
          </div>

          {/* Visual Style Selection */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">Visual Art Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(['dark-fantasy', 'painterly', 'high-fantasy', 'medieval', 'grimdark', 'storybook'] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`py-2 px-2.5 rounded-xl border text-center capitalize text-[11px] font-semibold transition-all ${
                    style === s
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Framing & Aspect Ratio */}
          <div className="grid grid-cols-2 gap-4">
            {entityType === 'character' && (
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Framing</label>
                <select
                  value={framing}
                  onChange={(e) => setFraming(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                >
                  <option value="bust">Bust (Shoulders Up)</option>
                  <option value="headshot">Headshot Close-Up</option>
                  <option value="full-body">Full Body Standing</option>
                </select>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              >
                <option value="1:1">1:1 Square</option>
                <option value="16:9">16:9 Landscape</option>
                <option value="3:4">3:4 Portrait</option>
              </select>
            </div>
          </div>

          {/* Custom Instructions */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">Custom Prompt Additions (Optional)</label>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              rows={2}
              placeholder="e.g. 'Wearing ceremonial silver plate armor holding a glowing staff...'"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Loading Progress State */}
          {loading && (
            <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-[11px] font-mono text-amber-300 space-y-1">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{statusStep}</span>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate ({cost} Cr)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
