import React, { useState, useEffect } from 'react';
import { X, Search, Star, Sparkles, Image as ImageIcon, Upload, Check, RefreshCw } from 'lucide-react';
import type { GeneratedImage, ImageStudioFilter } from '../../types/visualAssets';
import { ImageStudioService } from '../../lib/ai/imageStudioService';

interface ImageAssetPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: GeneratedImage) => void;
  title?: string;
  allowedCategory?: ImageStudioFilter;
}

export const ImageAssetPicker: React.FC<ImageAssetPickerProps> = ({
  isOpen,
  onClose,
  onSelectAsset,
  title = 'Select Image Asset',
  allowedCategory = 'all'
}) => {
  const [assets, setAssets] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'my_images' | 'favorites' | 'recent'>('my_images');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen, search, activeTab]);

  const loadAssets = async () => {
    setLoading(true);
    const data = await ImageStudioService.getUserAssets('user_current', {
      search,
      filter: allowedCategory,
      onlyFavorites: activeTab === 'favorites',
      sort: activeTab === 'recent' ? 'recently_used' : 'newest'
    });
    setAssets(data);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0d1017] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h3 className="font-cinzel font-bold text-lg text-amber-300 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" /> {title}
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('my_images')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                activeTab === 'my_images'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              My Images
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono flex items-center gap-1 transition-all ${
                activeTab === 'favorites'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Star className="w-3.5 h-3.5" /> Favorites
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                activeTab === 'recent'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              Recently Used
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search artwork..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Asset Grid */}
        <div className="flex-1 p-6 overflow-y-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-500 font-mono text-xs gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Loading asset library...
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-cinzel text-slate-400">No artwork found matching your criteria.</p>
              <button
                onClick={() => {
                  onClose();
                  window.location.pathname = '/image-studio';
                }}
                className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold font-mono hover:bg-amber-500/30 transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Open Image Studio to Generate Artwork
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {assets.map((asset) => {
                const isSelected = selectedAssetId === asset.id;
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`relative rounded-2xl overflow-hidden border cursor-pointer group transition-all ${
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
                          <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                            <Check className="w-5 h-5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 space-y-0.5">
                      <h4 className="font-cinzel text-xs font-bold text-slate-200 truncate">{asset.name}</h4>
                      <p className="text-[10px] font-mono text-slate-500 truncate">{asset.model}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => {
              onClose();
              window.location.pathname = '/image-studio';
            }}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-mono"
          >
            <Sparkles className="w-3.5 h-3.5" /> Need new artwork? Open Image Studio
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const found = assets.find((a) => a.id === selectedAssetId);
                if (found) {
                  onSelectAsset(found);
                  onClose();
                }
              }}
              disabled={!selectedAssetId}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              Select Artwork
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
