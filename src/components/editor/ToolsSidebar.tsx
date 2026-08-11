import React from 'react';
import {
  MousePointer,
  Hand,
  Paintbrush,
  Eraser,
  Waves,
  Milestone,
  MapPin,
  Building,
  Tag,
  Grid,
  Sparkles,
  Image
} from 'lucide-react';
import type { ActiveTool, TerrainBrushType } from '../../types/editorTools';

interface ToolsSidebarProps {
  activeTool: ActiveTool;
  activeTerrainBrush: TerrainBrushType;
  snapToGrid: boolean;
  onSelectTool: (tool: ActiveTool) => void;
  onSelectTerrainBrush: (brush: TerrainBrushType) => void;
  onToggleSnapToGrid: () => void;
  onToggleAIAssistant?: () => void;
  isAIAssistantOpen?: boolean;
  onOpenImageStudioPicker?: () => void;
}

export const ToolsSidebar: React.FC<ToolsSidebarProps> = ({
  activeTool,
  activeTerrainBrush,
  snapToGrid,
  onSelectTool,
  onSelectTerrainBrush,
  onToggleSnapToGrid,
  onToggleAIAssistant,
  isAIAssistantOpen,
  onOpenImageStudioPicker
}) => {
  const terrainTypes: { id: TerrainBrushType; label: string; color: string }[] = [
    { id: 'plains', label: 'Plains', color: '#27ae60' },
    { id: 'hills', label: 'Hills', color: '#2980b9' },
    { id: 'mountains', label: 'Mountains', color: '#7f8c8d' },
    { id: 'desert', label: 'Desert', color: '#f39c12' },
    { id: 'snow', label: 'Snow & Ice', color: '#ecf0f1' },
    { id: 'swamp', label: 'Swamp', color: '#16a085' },
    { id: 'forest', label: 'Deep Woods', color: '#1e8449' },
    { id: 'tundra', label: 'Tundra', color: '#95a5a6' },
    { id: 'volcanic', label: 'Volcanic', color: '#c0392b' },
    { id: 'wasteland', label: 'Wasteland', color: '#8e44ad' }
  ];

  return (
    <div className="w-16 bg-[#121620]/95 backdrop-blur-md border-r border-amber-500/15 h-full flex flex-col items-center py-4 space-y-5 z-20 font-sans select-none relative">
      {/* Primary Selection Tools */}
      <div className="space-y-1">
        <button
          onClick={() => onSelectTool('select')}
          title="Select Tool (V)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'select'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <MousePointer className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSelectTool('pan')}
          title="Pan Tool (H)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'pan'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Hand className="w-5 h-5" />
        </button>
      </div>

      <div className="w-8 border-t border-slate-800" />

      {/* Cartography Drawing Tools */}
      <div className="space-y-1">
        <button
          onClick={() => onSelectTool('terrain_brush')}
          title="Terrain Brush (B)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'terrain_brush'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Paintbrush className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSelectTool('eraser')}
          title="Eraser Tool (E)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'eraser'
              ? 'bg-rose-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Eraser className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSelectTool('river')}
          title="River Path Tool (R)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'river'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Waves className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSelectTool('road')}
          title="Road Path Tool"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'road'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Milestone className="w-5 h-5" />
        </button>
      </div>

      <div className="w-8 border-t border-slate-800" />

      {/* Entity Placement Tools */}
      <div className="space-y-1">
        <button
          onClick={() => onSelectTool('city')}
          title="Add Settlement City"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'city'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Building className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSelectTool('location')}
          title="Add Point of Interest Location"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'location'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <MapPin className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSelectTool('label')}
          title="Add Text Label (L)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'label'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Tag className="w-5 h-5" />
        </button>

        {onOpenImageStudioPicker && (
          <button
            onClick={onOpenImageStudioPicker}
            title="Attach Artwork from Image Studio"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all text-slate-400 hover:text-sky-300 hover:bg-slate-900"
          >
            <Image className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="w-8 border-t border-slate-800" />

      {/* AI World Agent Side Panel Toggle */}
      {onToggleAIAssistant && (
        <button
          onClick={onToggleAIAssistant}
          title="AI World Agent Assistant (Ctrl+K)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isAIAssistantOpen
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-amber-400 hover:text-amber-300 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
        </button>
      )}

      {/* Snap to Grid Toggle */}
      <button
        onClick={onToggleSnapToGrid}
        title={`Snap to Grid (${snapToGrid ? 'ON' : 'OFF'})`}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          snapToGrid
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Grid className="w-5 h-5" />
      </button>

      {/* Popover Brush Color Picker (When Terrain Brush Active) */}
      {activeTool === 'terrain_brush' && (
        <div className="absolute left-16 top-24 bg-[#121620] border border-amber-500/30 p-2 rounded-2xl shadow-2xl space-y-1 z-30">
          <span className="text-[10px] font-mono text-amber-300 font-bold block px-2 py-1">TERRAIN PALETTE</span>
          {terrainTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTerrainBrush(t.id)}
              className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center gap-2 text-xs transition-all ${
                activeTerrainBrush === t.id ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="w-3 h-3 rounded-full border border-slate-700" style={{ backgroundColor: t.color }} />
              <span className="text-[11px] font-mono">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
