import React, { useState } from 'react';
import { Palette, Sparkles, Check, X, Eye, Wand2 } from 'lucide-react';
import type { CartographyStyleId, CartographicThemeConfig } from '../../types/cartography';
import { CARTOGRAPHY_PRESETS, CartographyEngine } from '../../lib/cartography/cartographyEngine';

interface StylePickerModalProps {
  currentStyle: CartographyStyleId;
  onApplyStyle: (theme: CartographicThemeConfig) => void;
  onClose: () => void;
}

export const StylePickerModal: React.FC<StylePickerModalProps> = ({
  currentStyle,
  onApplyStyle,
  onClose
}) => {
  const [selectedId, setSelectedId] = useState<CartographyStyleId>(currentStyle);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const selectedTheme = CARTOGRAPHY_PRESETS[selectedId];

  const handleAiStyle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const matched = CartographyEngine.parseStylePrompt(aiPrompt);
    if (matched.id) setSelectedId(matched.id);
  };

  const handleApply = () => {
    onApplyStyle(selectedTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-3xl max-w-4xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">Cartography Map Style Engine</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Describe a Style Form */}
        <form onSubmit={handleAiStyle} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe a style (e.g. 'Dark obsidian fantasy with glowing rune borders')..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500/40"
          />
          <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0">
            <Wand2 className="w-3.5 h-3.5" /> AI Style
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Style Presets List (7 cols) */}
          <div className="md:col-span-7 space-y-3">
            <h4 className="font-cinzel font-bold text-xs text-slate-300">Choose Preset Cartography Theme</h4>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
              {(Object.keys(CARTOGRAPHY_PRESETS) as CartographyStyleId[]).map((key) => {
                const preset = CARTOGRAPHY_PRESETS[key];
                const isSelected = selectedId === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedId(key)}
                    className={`p-3.5 rounded-2xl border text-left space-y-2 transition-all group ${
                      isSelected ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-cinzel font-bold text-sm text-slate-100 group-hover:text-amber-300">{preset.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{preset.description}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: preset.terrainColor }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: preset.oceanColor }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: preset.borderColor }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Live Preview Details (5 cols) */}
          <div className="md:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h4 className="font-cinzel font-bold text-sm text-amber-300">{selectedTheme.name} Specifications</h4>
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="text-[10px] font-mono text-slate-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Eye className="w-3 h-3" /> {isPreviewMode ? 'Before/After' : 'Preview'}
              </button>
            </div>

            <div className="p-4 rounded-xl border space-y-2 font-mono text-[11px]" style={{ backgroundColor: selectedTheme.terrainColor, color: selectedTheme.textColor, borderColor: selectedTheme.borderColor }}>
              <div className="font-bold font-cinzel text-sm border-b pb-1" style={{ borderColor: selectedTheme.borderColor }}>
                {selectedTheme.name.toUpperCase()} PREVIEW
              </div>
              <div>• Font Family: {selectedTheme.fontCategory}</div>
              <div>• Mountain Variant: {selectedTheme.mountainVariant}</div>
              <div>• Settlement Symbol: {selectedTheme.settlementVariant}</div>
              <div>• Border Variant: {selectedTheme.borderVariant}</div>
              <div>• Relief Shading: {selectedTheme.reliefShadingEnabled ? 'ENABLED' : 'DISABLED'}</div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Apply Cartography Theme
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
