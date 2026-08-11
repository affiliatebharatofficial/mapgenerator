import React, { useState } from 'react';
import { Sparkles, X, Wand2 } from 'lucide-react';
import { VisualAssetService } from '../../lib/ai/visualAssetService';
import type { WorldCreature } from '../../types/visualAssets';
import { useSubscription } from '../../lib/supabase/subscriptionStore';

interface CreatureGeneratorModalProps {
  worldId: string;
  onClose: () => void;
  onCreatureCreated: (creature: WorldCreature) => void;
}

export const CreatureGeneratorModal: React.FC<CreatureGeneratorModalProps> = ({
  worldId,
  onClose,
  onCreatureCreated
}) => {
  const { deductCredits } = useSubscription();

  const [name, setName] = useState('');
  const [type, setType] = useState('Magical Beast');
  const [habitat, setHabitat] = useState('Northern Mountains');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;

    setLoading(true);
    deductCredits(2, 'AI Creature & Concept Artwork Generation');

    const prompt = VisualAssetService.buildEntityPrompt('creature', { name, type, habitat, description });
    const img = await VisualAssetService.generateEntityVisual({
      entityType: 'creature',
      prompt,
      style: 'dark-fantasy',
      aspectRatio: '1:1',
      creditCost: 2
    });

    const creature = await VisualAssetService.createCreature(worldId, {
      worldId,
      name,
      type,
      habitat,
      description,
      behavior: 'Hostile when provoked',
      lore: 'Hunted for crystal essence.',
      imageId: img.id,
      imageUrl: img.url
    });

    setLoading(false);
    onCreatureCreated(creature);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">AI Fantasy Creature Generator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Creature Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Frostbite Direwolf"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Creature Type</label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Habitat</label>
              <input
                type="text"
                value={habitat}
                onChange={(e) => setHabitat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Description & Visual Features</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="A giant wolf with icy fur and glowing blue eyes..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 disabled:opacity-40"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Generating Concept...' : 'Generate Creature (2 Credits)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
