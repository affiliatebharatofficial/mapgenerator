import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Star,
  Sparkles,
  Image as ImageIcon,
  Check,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Globe,
  Shield,
  MapPin,
  Maximize2,
  Trash2
} from 'lucide-react';
import type { GeneratedImage, ImageStudioFilter } from '../../types/visualAssets';
import { ImageStudioService } from '../../lib/ai/imageStudioService';
import { ImageGenerationModal } from './ImageGenerationModal';

interface ImageAssetPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: GeneratedImage) => void;
  onRemoveArtwork?: () => void;
  title?: string;
  allowedCategory?: ImageStudioFilter;
  entityType?: 'world' | 'map' | 'location' | 'npc' | 'faction' | 'adventure' | 'campaign';
  entityId?: string;
  entityName?: string;
  usageType?: 'cover' | 'portrait' | 'artwork' | 'lore' | 'map_banner';
  currentAssetId?: string;
}

export const ImageAssetPicker: React.FC<ImageAssetPickerProps> = ({
  isOpen,
  onClose,
  onSelectAsset,
  onRemoveArtwork,
  title = 'Select Image Asset',
  allowedCategory = 'all',
  entityType,
  entityId,
  entityName,
  usageType = 'artwork',
  currentAssetId
}) => {
  const [assets, setAssets] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'my_images' | 'favorites' | 'generated' | 'uploaded'>('my_images');
  const [filterCategory, setFilterCategory] = useState<'all' | 'generated' | 'uploaded' | 'favorites' | 'used' | 'unused'>('all');
  const [selectedAsset, setSelectedAsset] = useState<GeneratedImage | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Generation Modal Launch
  const [showGenModal, setShowGenModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen, search, activeTab, filterCategory]);

  const loadAssets = async () => {
    setLoading(true);
    let filterVal: ImageStudioFilter = allowedCategory;
    let onlyFavs = activeTab === 'favorites' || filterCategory === 'favorites';

    if (activeTab === 'generated' || filterCategory === 'generated') filterVal = 'generated';
    else if (activeTab === 'uploaded' || filterCategory === 'uploaded') filterVal = 'uploaded';

    let data = await ImageStudioService.getUserAssets('user_current', {
      search,
      filter: filterVal,
      onlyFavorites: onlyFavs,
      sort: activeTab === 'recent' ? 'recently_used' : 'newest'
    });

    if (filterCategory === 'used') {
      data = data.filter((a) => a.usages && a.usages.length > 0);
    } else if (filterCategory === 'unused') {
      data = data.filter((a) => !a.usages || a.usages.length === 0);
    }

    setAssets(data);

    // Pre-select current asset if passed
    if (currentAssetId) {
      const found = data.find((a) => a.id === currentAssetId);
      if (found) setSelectedAsset(found);
    } else if (data.length > 0 && !selectedAsset) {
      setSelectedAsset(data[0]);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  const paginatedAssets = assets.slice(0, page * pageSize);
  const hasMore = paginatedAssets.length < assets.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0d1017] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Main Selection Area */}
        <div className="md:w-3/5 flex flex-col border-b md:border-b-0 md:border-r border-slate-800">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <h3 className="font-cinzel font-bold text-base text-amber-300 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" /> {title}
            </h3>
            <button
              onClick={() => setShowGenModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" /> + Generate New with AI
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap gap-1.5 text-xs font-mono">
            {(
              [
                { id: 'my_images', label: 'My Images' },
                { id: 'recent', label: 'Recent' },
                { id: 'favorites', label: 'Favorites' },
                { id: 'generated', label: 'Generated' },
                { id: 'uploaded', label: 'Uploaded' }
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setPage(1); }}
                className={`px-3 py-1 rounded-xl transition-all ${
                  activeTab === t.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, prompt, world..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 font-mono"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value as any); setPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="all">All Assets</option>
              <option value="favorites">Favorites</option>
              <option value="used">Used in Entities</option>
              <option value="unused">Unused Assets</option>
            </select>
          </div>

          {/* Grid View */}
          <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[55vh]">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-slate-500 font-mono text-xs gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Loading artwork library...
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-cinzel text-slate-400">No artwork found matching criteria.</p>
                <button
                  onClick={() => setShowGenModal(true)}
                  className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold font-mono hover:bg-amber-500/30 transition-colors inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate New Artwork
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {paginatedAssets.map((asset) => {
                    const isSelected = selectedAsset?.id === asset.id;
                    return (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`relative rounded-xl overflow-hidden border cursor-pointer group transition-all ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/20 scale-[1.02]'
                            : 'border-slate-800 hover:border-slate-600 bg-slate-950'
                        }`}
                      >
                        <div className="aspect-square relative overflow-hidden bg-slate-900">
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[1px] flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-2 bg-slate-950 border-t border-slate-800/80">
                          <h4 className="font-cinzel text-[11px] font-bold text-slate-200 truncate">{asset.name}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Lazy Load Pagination */}
                {hasMore && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition-colors"
                    >
                      Load More Artwork ({assets.length - paginatedAssets.length} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Preview & Details Side Panel */}
        <div className="md:w-2/5 p-5 bg-slate-950 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h4 className="font-cinzel font-bold text-xs text-amber-300 uppercase tracking-wider">
              Asset Preview & Info
            </h4>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedAsset ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-amber-500/25 bg-slate-900">
                <img src={selectedAsset.url} alt={selectedAsset.name} className="w-full max-h-52 object-contain" />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <h3 className="font-cinzel font-bold text-base text-slate-100">{selectedAsset.name}</h3>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed italic">"{selectedAsset.prompt}"</p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[10px]">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Dimensions</span>
                    <span className="text-slate-200 font-bold">{selectedAsset.width}×{selectedAsset.height}</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Source</span>
                    <span className="text-amber-300 font-bold capitalize">{selectedAsset.source}</span>
                  </div>
                </div>

                {/* Usages List */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-500 block uppercase">Current Usages</span>
                  {selectedAsset.usages && selectedAsset.usages.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedAsset.usages.map((u) => (
                        <span key={u.id} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px]">
                          {u.entityName || u.entityType} ({u.usageType})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic block">Not attached to any entity yet</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs font-mono">
              Select an image from the grid to preview.
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-2 pt-2 border-t border-slate-900">
            <button
              onClick={() => {
                if (selectedAsset) {
                  onSelectAsset(selectedAsset);
                  onClose();
                }
              }}
              disabled={!selectedAsset}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Select Artwork
            </button>

            {onRemoveArtwork && (
              <button
                onClick={() => {
                  onRemoveArtwork();
                  onClose();
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-rose-400 font-semibold text-xs rounded-xl border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Current Artwork
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-mono"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Generation Wizard Launch Modal */}
      {showGenModal && (
        <ImageGenerationModal
          isOpen={showGenModal}
          onClose={() => setShowGenModal(false)}
          entityType={entityType || 'world'}
          entityId={entityId || 'general'}
          entityName={entityName}
          usageType={usageType}
          onAssetAttached={(asset) => {
            onSelectAsset(asset);
            onClose();
          }}
        />
      )}
    </div>
  );
};
