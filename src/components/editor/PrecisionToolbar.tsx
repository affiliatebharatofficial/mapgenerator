import React from 'react';
import {
  MousePointer,
  Filter,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Trash2,
  Copy,
  Layers,
  Wand2
} from 'lucide-react';
import type { SelectionFilter, TerrainSculptMode, AlignmentMode } from '../../types/editorPrecision';

interface PrecisionToolbarProps {
  selectedCount: number;
  selectionFilter: SelectionFilter;
  sculptMode: TerrainSculptMode;
  onFilterChange: (filter: SelectionFilter) => void;
  onSculptModeChange: (mode: TerrainSculptMode) => void;
  onAlign: (mode: AlignmentMode) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onToggleLockSelected: () => void;
  onOpenCommandPalette: () => void;
}

export const PrecisionToolbar: React.FC<PrecisionToolbarProps> = ({
  selectedCount,
  selectionFilter,
  sculptMode,
  onFilterChange,
  onSculptModeChange,
  onAlign,
  onDeleteSelected,
  onDuplicateSelected,
  onToggleLockSelected,
  onOpenCommandPalette
}) => {
  return (
    <div className="h-10 bg-[#0e1118]/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between font-sans select-none text-xs text-slate-300">
      {/* Left Selection Filter & Multi-Select Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-400">
          <MousePointer className="w-3.5 h-3.5" />
          <span>{selectedCount > 0 ? `${selectedCount} Selected` : 'Single Select'}</span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* Selection Filter Dropdown */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectionFilter}
            onChange={(e) => onFilterChange(e.target.value as SelectionFilter)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200"
          >
            <option value="all">Filter: All Layers</option>
            <option value="cities">Only Cities</option>
            <option value="rivers">Only Rivers</option>
            <option value="roads">Only Roads</option>
            <option value="labels">Only Labels</option>
            <option value="kingdoms">Only Kingdoms</option>
            <option value="mountains">Only Mountains</option>
          </select>
        </div>
      </div>

      {/* Center Sculpting & Alignment Tools */}
      <div className="flex items-center gap-2">
        {selectedCount >= 2 && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button onClick={() => onAlign('left')} className="p-1 hover:text-amber-400" title="Align Left">
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onAlign('center-h')} className="p-1 hover:text-amber-400" title="Center Horizontally">
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onAlign('right')} className="p-1 hover:text-amber-400" title="Align Right">
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {selectedCount > 0 && (
          <div className="flex items-center gap-1">
            <button onClick={onDuplicateSelected} className="p-1.5 bg-slate-900 border border-slate-800 hover:text-amber-300 rounded-lg" title="Duplicate">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button onClick={onToggleLockSelected} className="p-1.5 bg-slate-900 border border-slate-800 hover:text-amber-300 rounded-lg" title="Toggle Lock">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            </button>
            <button onClick={onDeleteSelected} className="p-1.5 bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/20 rounded-lg" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Right Command Palette Shortcut */}
      <button
        onClick={onOpenCommandPalette}
        className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold rounded-lg flex items-center gap-1.5"
      >
        <Wand2 className="w-3 h-3" />
        <span>Cmd+K</span>
      </button>
    </div>
  );
};
