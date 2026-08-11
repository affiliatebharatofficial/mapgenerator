import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  Globe,
  Shield,
  MapPin,
  Compass,
  User,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../lib/supabase/authStore';
import { useSubscription } from '../../lib/supabase/subscriptionStore';
import { ImageProviderRouter } from '../../lib/ai/imageProviderRouter';
import { RunwareImageProvider } from '../../lib/ai/runwareProvider';
import { PlatformConfigService } from '../../lib/config/platformConfigService';
import { ImageStudioService } from '../../lib/ai/imageStudioService';
import {
  ImageGenerationContextService,
  type EntityImageContext
} from '../../lib/ai/imageGenerationContextService';
import type { GeneratedImage, VisualAspectRatio } from '../../types/visualAssets';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'world' | 'map' | 'location' | 'npc' | 'faction' | 'adventure' | 'campaign';
  entityId: string;
  entityName?: string;
  customContextData?: any;
  usageType?: 'cover' | 'portrait' | 'artwork' | 'lore' | 'map_banner';
  onAssetAttached?: (asset: GeneratedImage) => void;
}

export const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  customContextData,
  usageType = 'artwork',
  onAssetAttached
}) => {
  const { user, isAuthenticated } = useAuth();
  const { creditsRemaining, deductCredits, refundCredits, currentPlan } = useSubscription();

  const userId = user?.id || 'user_current';

  // Context & Options State
  const [contextObj, setContextObj] = useState<EntityImageContext | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('fantasy_illustration');
  const [aspectRatio, setAspectRatio] = useState<VisualAspectRatio>('16:9');
  const [selectedModel, setSelectedModel] = useState<string>('runware:100@1');
  const [isLoadingContext, setIsLoadingContext] = useState<boolean>(true);

  // Generation Lifecycle State
  const [status, setStatus] = useState<'idle' | 'Preparing' | 'Generating' | 'Saving' | 'Complete' | 'Failed'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedAsset, setGeneratedAsset] = useState<GeneratedImage | null>(null);
  const [isAttaching, setIsAttaching] = useState<boolean>(false);

  // Dynamic Admin Configs
  const isFeatureEnabled = PlatformConfigService.isEntityArtworkEnabled(entityType);
  const emergencyControls = PlatformConfigService.getEmergencyControls();
  const dynamicCreditCost = PlatformConfigService.getCreditCost('image_generation') || 5;
  const imageStyles = ImageProviderRouter.getImageStyles().filter((s) => s.enabled);
  const availableModels = RunwareImageProvider.getModels().filter(
    (m) => m.enabled && m.allowedPlans.includes(currentPlan)
  );

  useEffect(() => {
    if (isOpen) {
      loadContext();
    }
  }, [isOpen, entityType, entityId]);

  const loadContext = async () => {
    setIsLoadingContext(true);
    const ctx = await ImageGenerationContextService.getImageGenerationContext(
      entityType,
      entityId,
      customContextData
    );
    setContextObj(ctx);
    setPrompt(ctx.suggestedPrompt);
    setSelectedStyleId(ctx.suggestedStyle || 'fantasy_illustration');
    setAspectRatio(ctx.suggestedAspectRatio || '16:9');
    setIsLoadingContext(false);
  };

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setErrorMessage(null);
    setGeneratedAsset(null);

    // Validation
    if (!isAuthenticated) {
      setErrorMessage('Please sign in to generate fantasy artwork.');
      return;
    }

    if (!isFeatureEnabled) {
      setErrorMessage(`AI artwork generation for ${entityType.toUpperCase()} is currently disabled by Admin configuration.`);
      return;
    }

    if (emergencyControls.aiGenerationsDisabled) {
      setErrorMessage('Image generation is temporarily disabled by Platform Emergency Control.');
      return;
    }

    if (!prompt.trim()) {
      setErrorMessage('Please provide a prompt for your artwork.');
      return;
    }

    if (creditsRemaining < dynamicCreditCost) {
      setErrorMessage(`You need ${dynamicCreditCost} credits to generate this image. Balance: ${creditsRemaining} credits.`);
      return;
    }

    try {
      // 1. Preparing
      setStatus('Preparing');
      setStatusMessage('Extracting entity context and reserving credits...');
      await new Promise((r) => setTimeout(r, 400));

      const deducted = deductCredits(dynamicCreditCost, `AI ${entityType} artwork generation: "${prompt.substring(0, 30)}..."`);
      if (!deducted) {
        throw new Error(`Insufficient credits balance (${creditsRemaining} credits available).`);
      }

      // 2. Generating
      setStatus('Generating');
      setStatusMessage(`Dispatching FLUX.1 Schnell request to Runware Router...`);

      const styleObj = imageStyles.find((s) => s.id === selectedStyleId);
      let finalPrompt = prompt.trim();
      if (styleObj && selectedStyleId !== 'no_style') {
        finalPrompt += styleObj.promptSuffix;
      }

      const res = await ImageProviderRouter.generateImage(
        {
          prompt: finalPrompt,
          model: selectedModel,
          aspectRatio
        },
        userId,
        creditsRemaining
      );

      // 3. Saving Asset
      setStatus('Saving');
      setStatusMessage('Persisting asset to Image Studio library...');

      const newAsset: GeneratedImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        name: contextObj?.defaultAssetName || `${entityName || entityType} — Artwork`,
        source: 'generated',
        entityType: entityType === 'npc' ? 'character' : entityType === 'world' ? 'world_cover' : 'location',
        entityId,
        provider: res.provider,
        model: res.model,
        prompt: prompt.trim(),
        style: styleObj?.name || 'Custom Prompt',
        storagePath: `generated-images/${userId}/${entityType}/${Date.now()}.webp`,
        url: res.imageUrl,
        thumbnailUrl: res.imageUrl,
        width: res.width,
        height: res.height,
        isPrimary: true,
        isFavorite: false,
        isArchived: false,
        creditsCharged: dynamicCreditCost,
        providerCost: res.providerCost,
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      const savedAsset = await ImageStudioService.saveAsset(newAsset);
      setGeneratedAsset(savedAsset);
      setStatus('Complete');
      setStatusMessage('Artwork successfully created and saved to your Image Library!');
    } catch (err: any) {
      refundCredits(dynamicCreditCost, `Refund for failed generation: ${err.message || 'Error'}`);
      setStatus('Failed');
      setErrorMessage(err.message || 'Artwork generation failed. Please try again.');
    }
  };

  const handleAutoAttach = async () => {
    if (!generatedAsset) return;
    setIsAttaching(true);

    try {
      await ImageStudioService.attachAssetToEntity(
        generatedAsset.id,
        userId,
        entityType,
        entityId,
        entityName || contextObj?.title || entityType,
        usageType
      );

      setIsAttaching(false);
      if (onAssetAttached) onAssetAttached(generatedAsset);
      onClose();
    } catch (e: any) {
      alert('Failed to attach artwork: ' + (e.message || 'Unknown error'));
      setIsAttaching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0d1017] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-cinzel font-bold text-lg text-amber-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Generate {entityType.toUpperCase()} Artwork
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Entity: {entityName || contextObj?.title || entityId}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Disabled Warning */}
        {!isFeatureEnabled && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>Artwork generation for {entityType.toUpperCase()} is currently disabled by Admin configuration.</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto space-y-5">
          {isLoadingContext ? (
            <div className="flex items-center justify-center py-16 text-slate-500 font-mono text-xs gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Extracting privacy-cleansed entity context...
            </div>
          ) : (
            <>
              {/* Context Summary Pills */}
              {contextObj && (
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Applied Entity Context (Secrets Omitted)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {contextObj.contextPills.map((pill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 text-[11px] font-mono"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-cinzel font-bold text-slate-200 block">
                  AI Image Generation Prompt (Editable)
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 leading-relaxed font-sans"
                />
              </div>

              {/* Style & Aspect Ratio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 block">Visual Style Preset</label>
                  <select
                    value={selectedStyleId}
                    onChange={(e) => setSelectedStyleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none"
                  >
                    <option value="no_style">No Style Preset (Raw Prompt)</option>
                    {imageStyles.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 block">Aspect Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as VisualAspectRatio)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none"
                  >
                    <option value="16:9">16:9 Landscape (World / Map / Campaign)</option>
                    <option value="3:4">3:4 Portrait (NPC / Adventure Cover)</option>
                    <option value="1:1">1:1 Square (Emblem / Icon)</option>
                    <option value="4:3">4:3 Standard</option>
                    <option value="9:16">9:16 Vertical Story</option>
                  </select>
                </div>
              </div>

              {/* Processing Progress Status */}
              {status !== 'idle' && status !== 'Complete' && status !== 'Failed' && (
                <div className="p-6 bg-slate-950 rounded-2xl border border-amber-500/30 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <h4 className="font-cinzel font-bold text-amber-300 text-sm">{status}</h4>
                  <p className="text-xs font-mono text-slate-400">{statusMessage}</p>
                </div>
              )}

              {/* Result Preview & Auto-Attach Options */}
              {generatedAsset && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/40 space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-4">
                    <img
                      src={generatedAsset.url}
                      alt={generatedAsset.name}
                      className="w-24 h-24 object-cover rounded-xl border border-amber-500/30"
                    />
                    <div className="flex-1 space-y-1">
                      <span className="text-xs font-cinzel font-bold text-amber-300 block">{generatedAsset.name}</span>
                      <p className="text-[11px] font-sans text-slate-400 line-clamp-2">"{generatedAsset.prompt}"</p>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        Saved in Image Library • {generatedAsset.creditsCharged} Credits
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAutoAttach}
                      disabled={isAttaching}
                      className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{isAttaching ? 'Attaching...' : `Use as ${entityType.toUpperCase()} Artwork`}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Credit & Actions Bar */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
          <div className="text-xs font-mono text-slate-400">
            Cost: <strong className="text-amber-300">{dynamicCreditCost} Credits</strong> • Balance: {creditsRemaining} credits
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              Close
            </button>
            {(!generatedAsset || status === 'Failed') && (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!isFeatureEnabled || status === 'Preparing' || status === 'Generating' || status === 'Saving'}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Artwork</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
