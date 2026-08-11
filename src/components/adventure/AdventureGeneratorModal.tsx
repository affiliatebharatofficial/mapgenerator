import React, { useState } from 'react';
import { Sparkles, Wand2, Compass, Check, X, Shield, ArrowRight, BookOpen, Layers } from 'lucide-react';
import type { AdventureType, AdventureLength, StoryTone, AdventureOutline, GroundedAdventurePackage } from '../../types/adventure';
import { AdventureEngine } from '../../lib/ai/adventureEngine';

interface AdventureGeneratorModalProps {
  worldId: string;
  locationName?: string;
  onAdventureGenerated: (pkg: GroundedAdventurePackage) => void;
  onClose: () => void;
}

export const AdventureGeneratorModal: React.FC<AdventureGeneratorModalProps> = ({
  worldId,
  locationName,
  onAdventureGenerated,
  onClose
}) => {
  const [step, setStep] = useState<'inputs' | 'outline_preview' | 'generating'>('inputs');
  const [type, setType] = useState<AdventureType>('main_quest');
  const [tone, setTone] = useState<StoryTone>('epic');
  const [length, setLength] = useState<AdventureLength>('medium');

  const [outline, setOutline] = useState<AdventureOutline | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateOutline = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    const result = await AdventureEngine.generateStoryOutline({
      worldId,
      locationName,
      type,
      tone,
      length
    });
    setOutline(result);
    setIsGenerating(false);
    setStep('outline_preview');
  };

  const handleConfirmFullAdventure = async () => {
    if (!outline) return;
    setIsGenerating(true);
    const fullPkg = await AdventureEngine.generateFullAdventure(
      { worldId, locationName, type, tone, length },
      outline
    );
    setIsGenerating(false);
    onAdventureGenerated(fullPkg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">AI Grounded Adventure Generator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'inputs' && (
          <form onSubmit={handleGenerateOutline} className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              Generate a storyline grounded in the World Bible. {locationName ? `Targeting location: ${locationName}` : ''}
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Adventure Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AdventureType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                >
                  <option value="main_quest">Main Quest</option>
                  <option value="side_quest">Side Quest</option>
                  <option value="investigation">Investigation</option>
                  <option value="political_intrigue">Political Intrigue</option>
                  <option value="dungeon">Dungeon Crawl</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Story Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as StoryTone)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                >
                  <option value="epic">Epic Fantasy</option>
                  <option value="dark">Dark & Grim</option>
                  <option value="political">Political Intrigue</option>
                  <option value="mysterious">Mysterious</option>
                  <option value="horror">Gothic Horror</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Adventure Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value as AdventureLength)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                >
                  <option value="one_shot">One Shot (1 Session)</option>
                  <option value="short">Short (2-3 Sessions)</option>
                  <option value="medium">Medium (4-6 Sessions)</option>
                  <option value="long">Long Campaign (7+)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <Wand2 className="w-4 h-4" /> Generate Story Outline
              </button>
            </div>
          </form>
        )}

        {step === 'outline_preview' && outline && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <span className="font-mono text-[10px] text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                Outline Preview
              </span>
              <h4 className="font-cinzel font-bold text-base text-slate-100">{outline.premise}</h4>
              <p className="text-slate-300">{outline.mainConflict}</p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <strong className="text-slate-400 block mb-1">Key Locations:</strong>
                  <div className="flex flex-wrap gap-1">
                    {outline.locations.map((l, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[10px]">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <strong className="text-slate-400 block mb-1">Featured NPCs:</strong>
                  <div className="flex flex-wrap gap-1">
                    {outline.mainNpcs.map((n, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-amber-300 rounded text-[10px]">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button onClick={() => setStep('inputs')} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
                Tweak Parameters
              </button>
              <button
                onClick={handleConfirmFullAdventure}
                disabled={isGenerating}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Approve & Generate Full Quests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
