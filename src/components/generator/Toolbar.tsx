import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  Dices,
  Save,
  Download,
  Share2,
  ArrowLeft,
  Search,
  Maximize,
  Minimize,
  Edit2,
  Check,
  Palette,
  Layers,
  Eye
} from 'lucide-react';
import type { FantasyMap } from '../../types/map';

interface ToolbarProps {
  map: FantasyMap;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  snapToGrid?: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRandomSeed: () => void;
  onSave: () => void;
  onExport: () => void;
  onClear: () => void;
  onBackToHome: () => void;
  onRenameMap: (newName: string) => void;
  onShare?: () => void;
  onOpenFindOnMap?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  onOpenStylePicker?: () => void;
  onOpenCartographyLayers?: () => void;
  onTogglePreviewMode?: () => void;
  isPreviewMode?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  map,
  canUndo,
  canRedo,
  saveStatus,
  onUndo,
  onRedo,
  onRandomSeed,
  onSave,
  onExport,
  onBackToHome,
  onRenameMap,
  onShare,
  onOpenFindOnMap,
  onToggleFullscreen,
  isFullscreen,
  onOpenStylePicker,
  onOpenCartographyLayers,
  onTogglePreviewMode,
  isPreviewMode = false
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(map.name);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      onRenameMap(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-16 bg-[#0b0d11]/95 backdrop-blur-md border-b border-amber-500/15 px-4 flex items-center justify-between z-30 font-sans select-none">
      {/* Left Navigation & Map Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBackToHome}
          className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-900 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </button>

        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

        {/* Map Editable Title */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="bg-slate-950 border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs font-cinzel font-bold text-slate-100 focus:outline-none"
              />
              <button type="submit" className="p-1 text-amber-400 hover:text-amber-300">
                <Check className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-cinzel font-bold text-slate-100 hover:text-amber-300 transition-colors"
            >
              <span>{map.name}</span>
              <Edit2 className="w-3 h-3 text-slate-500 hover:text-amber-400" />
            </button>
          )}

          {/* Save Status Badge */}
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all ${
              saveStatus === 'saved'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : saveStatus === 'saving'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
          </span>
        </div>
      </div>

      {/* Center Command Actions (Undo, Redo, Find) */}
      <div className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 text-slate-400 hover:text-amber-300 disabled:opacity-30 rounded-lg transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 text-slate-400 hover:text-amber-300 disabled:opacity-30 rounded-lg transition-colors"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {onOpenFindOnMap && (
          <button
            onClick={onOpenFindOnMap}
            className="p-2 text-slate-400 hover:text-amber-300 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Find on Map (Ctrl+F)"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span>Find</span>
          </button>
        )}

        {onOpenStylePicker && (
          <button
            onClick={onOpenStylePicker}
            className="p-2 text-slate-400 hover:text-amber-300 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Change Map Style Theme"
          >
            <Palette className="w-4 h-4 text-amber-400" />
            <span>Theme</span>
          </button>
        )}

        {onOpenCartographyLayers && (
          <button
            onClick={onOpenCartographyLayers}
            className="p-2 text-slate-400 hover:text-amber-300 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Cartography Layers & Opacities"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Layers</span>
          </button>
        )}

        {onTogglePreviewMode && (
          <button
            onClick={onTogglePreviewMode}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              isPreviewMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-300'
            }`}
            title="Toggle Clean Preview Mode"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>
        )}

        <button
          onClick={onRandomSeed}
          className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Generate New Random Fantasy Map"
        >
          <Dices className="w-4 h-4 text-amber-400" />
          <span>New Map</span>
        </button>
      </div>

      {/* Right Primary Buttons (Save, Share, Export, Fullscreen) */}
      <div className="flex items-center gap-2">
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-xl transition-colors hidden sm:block"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Viewport'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        )}

        {onShare && (
          <button
            onClick={onShare}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Share</span>
          </button>
        )}

        <button
          onClick={onSave}
          className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          onClick={onExport}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
