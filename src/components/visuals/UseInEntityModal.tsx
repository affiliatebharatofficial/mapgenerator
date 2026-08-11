import React, { useState, useEffect } from 'react';
import { X, Globe, MapPin, User, Shield, Compass, Check, AlertCircle } from 'lucide-react';
import type { GeneratedImage } from '../../types/visualAssets';
import { ImageStudioService } from '../../lib/ai/imageStudioService';
import { WorldService } from '../../lib/supabase/worldService';
import { CampaignService } from '../../lib/supabase/campaignService';
import { MapService } from '../../lib/supabase/mapService';

interface UseInEntityModalProps {
  image: GeneratedImage | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UseInEntityModal: React.FC<UseInEntityModalProps> = ({
  image,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [targetType, setTargetType] = useState<'world' | 'map' | 'npc' | 'location' | 'adventure' | 'campaign'>('world');
  const [usageType, setUsageType] = useState<'cover' | 'portrait' | 'artwork' | 'lore'>('cover');
  const [entities, setEntities] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadEntities(targetType);
    }
  }, [isOpen, targetType]);

  const loadEntities = async (type: typeof targetType) => {
    setIsLoading(true);
    const userId = image?.userId || 'user_current';
    try {
      if (type === 'world') {
        const worlds = await WorldService.getUserWorlds(userId);
        setEntities(worlds.map((w: any) => ({ id: w.id, name: w.name })));
        if (worlds.length > 0) setSelectedEntityId(worlds[0].id);
      } else if (type === 'campaign') {
        const campaigns = await CampaignService.getUserCampaigns(userId);
        setEntities(campaigns.map((c: any) => ({ id: c.id, name: c.name })));
        if (campaigns.length > 0) setSelectedEntityId(campaigns[0].id);
      } else if (type === 'map') {
        const maps = await MapService.getUserMaps(userId);
        setEntities(maps.map((m: any) => ({ id: m.id, name: m.title })));
        if (maps.length > 0) setSelectedEntityId(maps[0].id);
      } else {
        // Fallback for demo NPC/Location/Adventure
        const worlds = await WorldService.getUserWorlds(userId);
        if (worlds.length > 0) {
          if (type === 'npc') {
            const characters = await WorldService.getCharacters(worlds[0].id);
            setEntities(characters.map((ch: any) => ({ id: ch.id, name: `${ch.name} (${ch.role})` })));
            if (characters.length > 0) setSelectedEntityId(characters[0].id);
          } else if (type === 'location') {
            const locations = await WorldService.getLocations(worlds[0].id);
            setEntities(locations.map((l: any) => ({ id: l.id, name: l.name })));
            if (locations.length > 0) setSelectedEntityId(locations[0].id);
          }
        } else {
          setEntities([{ id: 'demo_entity', name: `Primary ${type.toUpperCase()}` }]);
          setSelectedEntityId('demo_entity');
        }
      }
    } catch {
      setEntities([{ id: 'default_entity', name: `My ${type.toUpperCase()}` }]);
      setSelectedEntityId('default_entity');
    }
    setIsLoading(false);
  };

  if (!isOpen || !image) return null;

  const selectedEntity = entities.find((e) => e.id === selectedEntityId);

  const handleConfirmAttach = async () => {
    if (!selectedEntityId) return;
    setIsSubmitting(true);

    try {
      // 1. Create asset usage reference (no file duplication!)
      await ImageStudioService.attachAssetToEntity(
        image.id,
        image.userId || 'user_current',
        targetType,
        selectedEntityId,
        selectedEntity?.name || targetType,
        usageType
      );

      // 2. Attach reference directly to World / NPC / Campaign entity cover
      if (targetType === 'world') {
        const world = await WorldService.getWorldById(selectedEntityId);
        if (world) {
          await WorldService.saveWorld({
            ...world,
            coverImage: image.url
          });
        }
      }

      setSuccessMessage(`Successfully attached artwork to "${selectedEntity?.name || targetType}"!`);
      setTimeout(() => {
        setSuccessMessage('');
        setIsSubmitting(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (e: any) {
      alert('Failed to attach asset: ' + (e.message || 'Unknown error'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0d1017] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h3 className="font-cinzel font-bold text-lg text-amber-300 flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" /> Use Artwork in Entity
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Image Preview Header */}
        <div className="flex items-center gap-4 p-3 bg-slate-950 rounded-2xl border border-slate-800">
          <img src={image.url} alt={image.name} className="w-16 h-16 object-cover rounded-xl border border-amber-500/30" />
          <div className="flex-1 overflow-hidden">
            <h4 className="font-cinzel font-bold text-sm text-slate-100 truncate">{image.name}</h4>
            <span className="text-[11px] font-mono text-slate-400 block truncate">{image.prompt}</span>
          </div>
        </div>

        {/* Entity Category Selector */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">1. Select Target Category</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { setTargetType('world'); setUsageType('cover'); }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                targetType === 'world'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> World
            </button>
            <button
              type="button"
              onClick={() => { setTargetType('map'); setUsageType('artwork'); }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                targetType === 'map'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> Map
            </button>
            <button
              type="button"
              onClick={() => { setTargetType('npc'); setUsageType('portrait'); }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                targetType === 'npc'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" /> NPC
            </button>
            <button
              type="button"
              onClick={() => { setTargetType('location'); setUsageType('artwork'); }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                targetType === 'location'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> Location
            </button>
            <button
              type="button"
              onClick={() => { setTargetType('adventure'); setUsageType('cover'); }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                targetType === 'adventure'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Adventure
            </button>
            <button
              type="button"
              onClick={() => { setTargetType('campaign'); setUsageType('cover'); }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                targetType === 'campaign'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Campaign
            </button>
          </div>
        </div>

        {/* Entity Selection Dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">2. Choose Specific Entity</label>
          {isLoading ? (
            <div className="p-3 bg-slate-900 text-slate-500 text-xs font-mono rounded-xl animate-pulse">
              Loading {targetType}s...
            </div>
          ) : entities.length === 0 ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono rounded-xl">
              No owned {targetType}s found. Create one first!
            </div>
          ) : (
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50 font-mono"
            >
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Usage Role */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">3. Usage Type</label>
          <div className="flex gap-2">
            {(['cover', 'portrait', 'artwork', 'lore'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setUsageType(type)}
                className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-mono capitalize border transition-all ${
                  usageType === type
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Success Message Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmAttach}
            disabled={!selectedEntityId || isSubmitting}
            className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Attaching...' : 'Attach Artwork'}
          </button>
        </div>
      </div>
    </div>
  );
};
