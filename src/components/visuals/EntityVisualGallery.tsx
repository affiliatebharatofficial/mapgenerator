import React, { useState, useEffect } from 'react';
import { Image, Sparkles, Check, Trash2, Plus } from 'lucide-react';
import type { GeneratedImage, VisualEntityType } from '../../types/visualAssets';
import { VisualAssetService } from '../../lib/ai/visualAssetService';
import { GenerateVisualAssetModal } from './GenerateVisualAssetModal';

interface EntityVisualGalleryProps {
  entityId: string;
  entityType: VisualEntityType;
  entityData: any;
  worldId?: string;
}

export const EntityVisualGallery: React.FC<EntityVisualGalleryProps> = ({
  entityId,
  entityType,
  entityData,
  worldId
}) => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [showGenModal, setShowGenModal] = useState(false);

  const loadGallery = () => {
    const list = VisualAssetService.getImagesForEntity(entityId);
    setImages(list);
  };

  useEffect(() => {
    loadGallery();
  }, [entityId]);

  const handleSetPrimary = (imageId: string) => {
    VisualAssetService.setPrimaryImage(imageId, entityId);
    loadGallery();
  };

  const handleDelete = (imageId: string) => {
    VisualAssetService.deleteImage(imageId);
    loadGallery();
  };

  return (
    <div className="space-y-4 font-sans select-none">
      <div className="flex items-center justify-between">
        <h4 className="font-cinzel font-bold text-sm text-slate-100 flex items-center gap-2">
          <Image className="w-4 h-4 text-amber-400" /> Visual Gallery ({images.length})
        </h4>
        <button
          onClick={() => setShowGenModal(true)}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5" /> + Generate Visual
        </button>
      </div>

      {images.length === 0 ? (
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-2">
          <Image className="w-8 h-8 text-slate-700 mx-auto" />
          <p className="text-xs text-slate-400 font-serif">No AI artwork generated for this entity yet.</p>
          <button
            onClick={() => setShowGenModal(true)}
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            Click to generate portrait / artwork
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={`group relative rounded-xl overflow-hidden border transition-all ${
                img.isPrimary ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <img src={img.url} alt={img.prompt} className="w-full h-32 object-cover" />

              {/* Primary Badge */}
              {img.isPrimary && (
                <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded shadow">
                  PRIMARY
                </span>
              )}

              {/* Hover Controls */}
              <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                {!img.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    title="Set as Primary Portrait"
                    className="p-1.5 bg-amber-500 text-slate-950 rounded-lg font-bold text-[10px]"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(img.id)}
                  title="Delete Visual Asset"
                  className="p-1.5 bg-rose-600 text-slate-100 rounded-lg text-[10px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generation Wizard Modal */}
      {showGenModal && (
        <GenerateVisualAssetModal
          entityType={entityType}
          entityData={entityData}
          worldId={worldId}
          onClose={() => setShowGenModal(false)}
          onGenerated={() => loadGallery()}
        />
      )}
    </div>
  );
};
