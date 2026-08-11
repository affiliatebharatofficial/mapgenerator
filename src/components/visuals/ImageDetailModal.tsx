import React, { useState } from 'react';
import {
  X,
  Star,
  Download,
  Trash2,
  Edit2,
  Copy,
  Check,
  Globe,
  Sparkles,
  Shield,
  Layers,
  MapPin,
  RefreshCw,
  ExternalLink,
  Tag
} from 'lucide-react';
import type { GeneratedImage } from '../../types/visualAssets';
import { ImageStudioService } from '../../lib/ai/imageStudioService';

interface ImageDetailModalProps {
  image: GeneratedImage;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onUseInEntity: (image: GeneratedImage) => void;
  onRegenerate?: (image: GeneratedImage) => void;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  image,
  isOpen,
  onClose,
  onUpdate,
  onUseInEntity,
  onRegenerate
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(image.name || '');
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(!!image.isFavorite);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleSaveName = async () => {
    if (nameInput.trim()) {
      await ImageStudioService.renameAsset(image.id, nameInput.trim());
      setIsEditingName(false);
      onUpdate();
    }
  };

  const handleToggleFavorite = async () => {
    const newState = await ImageStudioService.toggleFavorite(image.id);
    setIsFavorite(newState);
    onUpdate();
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${(image.name || 'fantasy-asset').toLowerCase().replace(/\s+/g, '-')}.${(image.url.endsWith('.png') ? 'png' : 'webp')}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(image.url, '_blank');
    }
  };

  const handleDelete = async () => {
    let warningMsg = 'Are you sure you want to delete this fantasy artwork?';
    if (image.usages && image.usages.length > 0) {
      const usageList = image.usages.map((u) => `${u.entityName || u.entityType} (${u.usageType})`).join(', ');
      warningMsg = `This artwork is currently used by: ${usageList}.\n\nDeleting will archive the asset and return entity display to placeholders. Are you sure you want to proceed?`;
    }

    if (confirm(warningMsg)) {
      setIsDeleting(true);
      await ImageStudioService.deleteAsset(image.id);
      setIsDeleting(false);
      onUpdate();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0d1017] border border-amber-500/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-100 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Preview Section */}
        <div className="md:w-3/5 bg-slate-950/90 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800/80 relative min-h-[300px] md:min-h-[500px]">
          <div className="relative max-w-full max-h-[65vh] flex items-center justify-center rounded-2xl overflow-hidden border border-amber-500/20 shadow-2xl group">
            <img
              src={image.url}
              alt={image.name}
              className="max-h-[60vh] w-auto object-contain rounded-2xl"
            />
            {/* Quick Floating Actions */}
            <div className="absolute top-3 left-3 flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
                  isFavorite
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-amber-400'
                }`}
                title="Favorite"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-slate-950' : ''}`} />
              </button>
              <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-[10px] font-mono text-amber-300 backdrop-blur-md flex items-center gap-1">
                {image.source === 'generated' ? '⚡ AI Generated' : '📁 User Upload'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Info & Actions Sidebar */}
        <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
          {/* Header Title */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {isEditingName ? (
                <div className="flex items-center gap-2 w-full pr-8">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-1.5 text-sm text-slate-100 font-cinzel font-bold focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                  <h2 className="text-xl font-cinzel font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                    {image.name}
                  </h2>
                  <Edit2 className="w-4 h-4 text-slate-500 group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              )}
            </div>

            <p className="text-[11px] font-mono text-slate-400">
              Created {new Date(image.createdAt).toLocaleDateString()} at {new Date(image.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Prompt Section */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-cinzel font-semibold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Prompt
              </span>
              <button
                onClick={handleCopyPrompt}
                className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 font-mono transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Prompt'}
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans select-all">
              "{image.prompt}"
            </p>
          </div>

          {/* Technical Metadata Matrix */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Model</span>
              <span className="text-amber-200 font-bold block truncate">{image.model}</span>
            </div>
            <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Provider</span>
              <span className="text-slate-200 font-bold block truncate">{image.provider}</span>
            </div>
            <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Dimensions</span>
              <span className="text-slate-200 font-bold block">{image.width} × {image.height}</span>
            </div>
            <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Credits Used</span>
              <span className="text-amber-400 font-bold block">{image.creditsCharged || 5} Credits</span>
            </div>
          </div>

          {/* Used In Entities Section */}
          <div className="space-y-2">
            <span className="text-xs font-cinzel font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Used In Entities
            </span>
            {image.usages && image.usages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {image.usages.map((u) => (
                  <span
                    key={u.id}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono flex items-center gap-1"
                  >
                    {u.entityType === 'world' && <Globe className="w-3 h-3 text-sky-400" />}
                    {u.entityType === 'npc' && <Shield className="w-3 h-3 text-emerald-400" />}
                    {u.entityType === 'map' && <MapPin className="w-3 h-3 text-amber-400" />}
                    <span>{u.entityName || u.entityType} ({u.usageType})</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 font-mono italic p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
                Not attached to any entity yet.
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUseInEntity(image)}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Globe className="w-4 h-4" /> Use in Entity
              </button>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-amber-400" /> Download
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {onRegenerate && (
                <button
                  onClick={() => {
                    onRegenerate(image);
                    onClose();
                  }}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-medium text-xs rounded-xl border border-amber-500/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full py-2 px-3 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 font-medium text-xs rounded-xl border border-rose-800/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Asset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
