import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Star,
  Layers,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  Globe,
  Plus,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  MapPin,
  Maximize2
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../lib/supabase/authStore';
import { useSubscription } from '../../lib/supabase/subscriptionStore';
import { ImageProviderRouter, type ImageStylePreset } from '../../lib/ai/imageProviderRouter';
import { RunwareImageProvider, type ImageModelConfig } from '../../lib/ai/runwareProvider';
import { PlatformConfigService } from '../../lib/config/platformConfigService';
import { ImageStudioService } from '../../lib/ai/imageStudioService';
import type {
  GeneratedImage,
  ImageStudioTab,
  ImageStudioFilter,
  ImageStudioSort,
  VisualAspectRatio
} from '../../types/visualAssets';
import { ImageDetailModal } from '../../components/visuals/ImageDetailModal';
import { UseInEntityModal } from '../../components/visuals/UseInEntityModal';

interface ImageStudioPageProps {
  initialTab?: ImageStudioTab;
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

export const ImageStudioPage: React.FC<ImageStudioPageProps> = ({
  initialTab = 'generate',
  onNavigateCreate,
  onNavigateHome
}) => {
  const { user, isAuthenticated } = useAuth();
  const { creditsRemaining, creditsUsed, deductCredits, currentPlan } = useSubscription();

  const userId = user?.id || 'user_current';

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<ImageStudioTab>(initialTab);

  // Generator State
  const [prompt, setPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('runware:100@1');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('fantasy_illustration');
  const [aspectRatio, setAspectRatio] = useState<VisualAspectRatio>('16:9');
  const [seed, setSeed] = useState<number | undefined>(undefined);

  // Generation Processing State
  const [generationStatus, setGenerationStatus] = useState<
    'idle' | 'Preparing' | 'Generating' | 'Saving' | 'Complete' | 'Failed'
  >('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<GeneratedImage | null>(null);

  // Library / Filter / Search State
  const [assets, setAssets] = useState<GeneratedImage[]>([]);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<ImageStudioFilter>('all');
  const [sortBy, setSortBy] = useState<ImageStudioSort>('newest');

  // Modals
  const [detailModalImage, setDetailModalImage] = useState<GeneratedImage | null>(null);
  const [useInEntityImage, setUseInEntityImage] = useState<GeneratedImage | null>(null);

  // Dynamic Admin Configurations
  const emergencyControls = PlatformConfigService.getEmergencyControls();
  const dynamicCreditCost = PlatformConfigService.getCreditCost('image_generation') || 5;
  const imageStyles = ImageProviderRouter.getImageStyles().filter((s) => s.enabled);
  const availableModels = RunwareImageProvider.getModels().filter(
    (m) => m.enabled && m.allowedPlans.includes(currentPlan)
  );

  // Sync assets list when tab/filter changes
  useEffect(() => {
    loadAssets();
  }, [activeTab, searchQuery, filterCategory, sortBy]);

  const loadAssets = async () => {
    setLoadingAssets(true);
    const data = await ImageStudioService.getUserAssets(userId, {
      filter: filterCategory,
      sort: sortBy,
      search: searchQuery,
      onlyFavorites: activeTab === 'favorites'
    });
    setAssets(data);
    setLoadingAssets(false);
  };

  // Stat Metrics
  const totalImagesCount = assets.length;
  const favoriteImagesCount = assets.filter((a) => a.isFavorite).length;

  // ----------------------------------------------------
  // GENERATION SUBMISSION & LIFECYCLE
  // ----------------------------------------------------
  const handleGenerate = async () => {
    setGenerationError(null);
    setLatestResult(null);

    // 1. Validation
    if (!isAuthenticated) {
      setGenerationError('Please sign in to generate fantasy artwork.');
      return;
    }

    if (emergencyControls.aiGenerationsDisabled) {
      setGenerationError('Image generation is currently disabled by Platform Emergency Control.');
      return;
    }

    if (!prompt.trim()) {
      setGenerationError('Please enter a descriptive fantasy scene prompt.');
      return;
    }

    if (creditsRemaining < dynamicCreditCost) {
      setGenerationError(`You need ${dynamicCreditCost} credits to generate this image. Your balance: ${creditsRemaining} credits.`);
      return;
    }

    try {
      // Step: Preparing
      setGenerationStatus('Preparing');
      setStatusMessage('Validating prompt and reserving credits...');
      await new Promise((r) => setTimeout(r, 400));

      // Reserve & Deduct Credits
      const deducted = deductCredits(dynamicCreditCost, `AI Image Studio Generation: "${prompt.substring(0, 30)}..."`);
      if (!deducted) {
        throw new Error(`Insufficient credits balance (${creditsRemaining} credits available).`);
      }

      // Step: Generating
      setGenerationStatus('Generating');
      setStatusMessage('Dispatching request to FLUX.1 Schnell AI via Runware Router...');

      // Find Style
      const styleObj = imageStyles.find((s) => s.id === selectedStyleId);
      let finalPrompt = prompt.trim();
      if (styleObj && selectedStyleId !== 'no_style') {
        finalPrompt += styleObj.promptSuffix;
      }

      // Execute via Provider Router
      const res = await ImageProviderRouter.generateImage(
        {
          prompt: finalPrompt,
          model: selectedModel,
          aspectRatio,
          seed
        },
        userId,
        creditsRemaining
      );

      // Step: Saving
      setGenerationStatus('Saving');
      setStatusMessage('Storing asset record & syncing with library...');

      const newAsset: GeneratedImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        name: ImageStudioService.generateDefaultTitle(prompt),
        source: 'generated',
        entityType: 'world_cover',
        provider: res.provider,
        model: res.model,
        prompt: prompt.trim(),
        style: styleObj?.name || 'Custom Prompt',
        storagePath: `generated-images/${userId}/${Date.now()}.webp`,
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

      setLatestResult(savedAsset);
      setGenerationStatus('Complete');
      setStatusMessage('Image successfully generated and saved!');
      loadAssets();
    } catch (err: any) {
      setGenerationStatus('Failed');
      setGenerationError(err.message || 'Image generation failed. Please try again.');
    }
  };

  const handleRetry = () => {
    setGenerationStatus('idle');
    handleGenerate();
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Header
        onNavigateCreate={onNavigateCreate}
        onNavigateHome={onNavigateHome}
      />

      {/* Hero Banner Header */}
      <section className="relative border-b border-amber-500/15 bg-gradient-to-b from-[#0e121b] to-[#07090e] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Visual Engine
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-cinzel font-bold tracking-tight text-slate-100">
              AI Image Studio
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Generate high-resolution fantasy artwork, NPC portraits, location landscapes, and world covers powered by FLUX.1 Schnell.
            </p>
          </div>

          {/* Top Dashboard Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto font-mono text-xs">
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 block text-[10px] uppercase">My Images</span>
              <strong className="text-base text-amber-300 font-bold">{totalImagesCount} Assets</strong>
            </div>
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 block text-[10px] uppercase">Favorites</span>
              <strong className="text-base text-amber-400 font-bold">{favoriteImagesCount} Saved</strong>
            </div>
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 block text-[10px] uppercase">Credits Used</span>
              <strong className="text-base text-sky-400 font-bold">{creditsUsed} Credits</strong>
            </div>
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
              <span className="text-amber-400/80 block text-[10px] uppercase">Your Balance</span>
              <strong className="text-base text-amber-300 font-bold">{creditsRemaining} Credits</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-5 py-2.5 rounded-xl font-cinzel text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'generate'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Generate
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`px-5 py-2.5 rounded-xl font-cinzel text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'library'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> My Images ({totalImagesCount})
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-5 py-2.5 rounded-xl font-cinzel text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'favorites'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <Star className="w-4 h-4" /> Favorites ({favoriteImagesCount})
          </button>

          <button
            onClick={() => setActiveTab('styles')}
            className={`px-5 py-2.5 rounded-xl font-cinzel text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'styles'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> Styles Presets
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`px-5 py-2.5 rounded-xl font-cinzel text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'recent'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" /> Recent History
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: GENERATOR INTERFACE */}
        {/* ==================================================== */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Options Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Emergency Control Notice */}
              {emergencyControls.aiGenerationsDisabled && (
                <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span>Image generation is currently disabled by Platform Emergency Control.</span>
                </div>
              )}

              {/* Textarea Prompt */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
                <label className="text-xs font-cinzel font-bold text-amber-300 flex justify-between items-center">
                  <span>Describe Your Fantasy Artwork Prompt</span>
                  <span className="text-[10px] font-mono text-slate-400">FLUX.1 Schnell Compatible</span>
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the fantasy scene, character, location or artwork you want to create..."
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 leading-relaxed font-sans"
                />
              </div>

              {/* Generator Configuration Options */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
                <h3 className="text-xs font-cinzel font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" /> Generation Options
                </h3>

                {/* Model Selection */}
                {availableModels.length > 1 && (
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 block">AI Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500/50"
                    >
                      {availableModels.map((m) => (
                        <option key={m.id} value={m.modelId}>
                          {m.name} ({m.modelId})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Style Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-mono text-slate-400 block">Visual Style Preset</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedStyleId('no_style')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedStyleId === 'no_style'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-cinzel block">No Style</span>
                      <span className="text-[10px] font-mono text-slate-500 block truncate">Raw custom prompt</span>
                    </button>

                    {imageStyles.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStyleId(st.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedStyleId === st.id
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xs font-cinzel block truncate">{st.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 block truncate">{st.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-3">
                  <label className="text-xs font-mono text-slate-400 block">Aspect Ratio</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['1:1', '16:9', '4:3', '3:2', '9:16'] as VisualAspectRatio[]).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-2.5 rounded-xl border text-xs font-mono font-bold transition-all text-center ${
                          aspectRatio === ratio
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Credit Cost Footer & Generate Action */}
              <div className="glass-panel p-6 rounded-3xl border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <span className="text-xs font-mono text-slate-400 block">Generation Cost</span>
                  <span className="text-xl font-cinzel font-bold text-amber-300 block">
                    {dynamicCreditCost} Credits
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    Your balance: {creditsRemaining} credits
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generationStatus !== 'idle' && generationStatus !== 'Complete' && generationStatus !== 'Failed'}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>
                    {generationStatus === 'idle' || generationStatus === 'Complete' || generationStatus === 'Failed'
                      ? 'Generate Image'
                      : 'Processing...'}
                  </span>
                </button>
              </div>

              {/* Error Alert */}
              {generationError && (
                <div className="p-4 bg-rose-950/50 border border-rose-800/60 rounded-2xl text-rose-300 text-xs font-mono flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{generationError}</span>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-lg text-[11px] font-bold"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* Right Result Preview Area */}
            <div className="lg:col-span-5">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 min-h-[500px] flex flex-col justify-between space-y-6 sticky top-24">
                <h3 className="text-xs font-cinzel font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" /> Generation Preview
                </h3>

                {/* Animated Status Screen */}
                {generationStatus !== 'idle' && generationStatus !== 'Complete' && generationStatus !== 'Failed' && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-16 text-center">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 rounded-3xl border-2 border-amber-500/30 animate-ping" />
                      <div className="w-full h-full rounded-3xl bg-slate-900 border border-amber-500 flex items-center justify-center shadow-2xl">
                        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-cinzel font-bold text-amber-300 text-lg">{generationStatus}</h4>
                      <p className="text-xs font-mono text-slate-400">{statusMessage}</p>
                    </div>
                  </div>
                )}

                {/* Idle Placeholder */}
                {generationStatus === 'idle' && !latestResult && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-20 text-center border-2 border-dashed border-slate-800/80 rounded-2xl">
                    <Sparkles className="w-12 h-12 text-slate-600" />
                    <p className="text-sm font-cinzel text-slate-400">Your generated fantasy artwork will appear here.</p>
                    <p className="text-xs font-mono text-slate-500">Configure prompt and click "Generate Image".</p>
                  </div>
                )}

                {/* Successful Result Card */}
                {latestResult && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div
                      className="relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl group cursor-pointer"
                      onClick={() => setDetailModalImage(latestResult)}
                    >
                      <img
                        src={latestResult.url}
                        alt={latestResult.name}
                        className="w-full h-auto max-h-[380px] object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-slate-900/90 text-amber-300 text-xs font-mono font-bold rounded-xl border border-amber-500/40 flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5" /> Full View
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="font-cinzel font-bold text-slate-200">{latestResult.name}</span>
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {latestResult.creditsCharged} Credits
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] font-sans line-clamp-2">"{latestResult.prompt}"</p>
                      <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                        <span>Model: {latestResult.model}</span>
                        <span>{latestResult.width}×{latestResult.height}</span>
                      </div>
                    </div>

                    {/* Result Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setUseInEntityImage(latestResult)}
                        className="py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5" /> Use in Entity
                      </button>
                      <button
                        onClick={() => setDetailModalImage(latestResult)}
                        className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-amber-400" /> View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2 & 3: LIBRARY GRID & FAVORITES */}
        {/* ==================================================== */}
        {(activeTab === 'library' || activeTab === 'favorites' || activeTab === 'recent') && (
          <div className="space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {(
                  [
                    { id: 'all', label: 'All Artwork' },
                    { id: 'world_artwork', label: 'Worlds' },
                    { id: 'npc_portrait', label: 'NPC Portraits' },
                    { id: 'location_artwork', label: 'Locations' },
                    { id: 'map_artwork', label: 'Map Artwork' }
                  ] as Array<{ id: ImageStudioFilter; label: string }>
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                      filterCategory === cat.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search & Sort */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title, prompt, world, NPC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as ImageStudioSort)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="favorites">Favorites</option>
                  <option value="recently_used">Recently Used</option>
                </select>
              </div>
            </div>

            {/* Asset Cards Grid */}
            {loadingAssets ? (
              <div className="flex items-center justify-center py-20 text-slate-500 font-mono text-xs gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Loading image library...
              </div>
            ) : assets.length === 0 ? (
              <div className="glass-panel p-16 rounded-3xl border border-slate-800 text-center space-y-4">
                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-cinzel font-bold text-slate-200">Your generated artwork will appear here.</h3>
                  <p className="text-xs font-mono text-slate-500">
                    No fantasy assets found matching your active filters.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Create Your First Image
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="glass-panel rounded-2xl border border-slate-800 hover:border-amber-500/40 overflow-hidden group transition-all hover:scale-[1.01] flex flex-col justify-between"
                  >
                    <div
                      className="aspect-square relative overflow-hidden bg-slate-950 cursor-pointer"
                      onClick={() => setDetailModalImage(asset)}
                    >
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await ImageStudioService.toggleFavorite(asset.id);
                            loadAssets();
                          }}
                          className={`p-1.5 rounded-lg backdrop-blur-md border transition-all ${
                            asset.isFavorite
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-amber-300'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${asset.isFavorite ? 'fill-slate-950' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4
                        className="font-cinzel font-bold text-sm text-slate-100 hover:text-amber-300 transition-colors cursor-pointer truncate"
                        onClick={() => setDetailModalImage(asset)}
                      >
                        {asset.name}
                      </h4>
                      <p className="text-[11px] font-sans text-slate-400 line-clamp-2">"{asset.prompt}"</p>

                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900">
                        <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => setUseInEntityImage(asset)}
                          className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          <Globe className="w-3 h-3" /> Use in Entity
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: STYLES PRESETS CATALOG */}
        {/* ==================================================== */}
        {activeTab === 'styles' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800">
              <h3 className="font-cinzel font-bold text-lg text-amber-300 mb-2">Available Image Style Presets</h3>
              <p className="text-xs text-slate-400 font-sans max-w-2xl mb-6">
                Style presets automatically append tuned lighting, medium, and aesthetic suffixes to your prompt for authentic fantasy presentation.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imageStyles.map((st) => (
                  <div key={st.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-cinzel font-bold text-slate-100 text-sm">{st.name}</h4>
                        <p className="text-xs text-slate-400">{st.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedStyleId(st.id);
                          setActiveTab('generate');
                        }}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-mono font-bold"
                      >
                        Use Preset
                      </button>
                    </div>
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-400">
                      <strong className="text-amber-400 block mb-0.5">Prompt Suffix:</strong>
                      {st.promptSuffix}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {detailModalImage && (
        <ImageDetailModal
          image={detailModalImage}
          isOpen={!!detailModalImage}
          onClose={() => setDetailModalImage(null)}
          onUpdate={loadAssets}
          onUseInEntity={(img) => setUseInEntityImage(img)}
          onRegenerate={(img) => {
            setPrompt(img.prompt);
            setActiveTab('generate');
          }}
        />
      )}

      {/* Use in Entity Attachment Modal */}
      {useInEntityImage && (
        <UseInEntityModal
          image={useInEntityImage}
          isOpen={!!useInEntityImage}
          onClose={() => setUseInEntityImage(null)}
          onSuccess={loadAssets}
        />
      )}

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
