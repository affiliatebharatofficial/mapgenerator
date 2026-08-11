import React from 'react';
import { Palette, Type, Layout } from 'lucide-react';
import type { CoverConfig } from '../../types/exportStudio';

interface CoverDesignerPanelProps {
  coverConfig: CoverConfig;
  onChange: (config: CoverConfig) => void;
}

export const CoverDesignerPanel: React.FC<CoverDesignerPanelProps> = ({ coverConfig, onChange }) => {
  return (
    <div className="space-y-4 font-sans select-none text-xs">
      <h4 className="font-cinzel font-bold text-sm text-slate-100 flex items-center gap-2">
        <Palette className="w-4 h-4 text-amber-400" /> Document Cover & Styling
      </h4>

      <div>
        <label className="font-semibold text-slate-300 block mb-1">Cover Title</label>
        <input
          type="text"
          value={coverConfig.title}
          onChange={(e) => onChange({ ...coverConfig, title: e.target.value })}
          placeholder="e.g. Chronicles of Eldoria"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
        />
      </div>

      <div>
        <label className="font-semibold text-slate-300 block mb-1">Subtitle / Tagline</label>
        <input
          type="text"
          value={coverConfig.subtitle || ''}
          onChange={(e) => onChange({ ...coverConfig, subtitle: e.target.value })}
          placeholder="e.g. A Complete World Compendium"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-slate-300 block mb-1">Author Name</label>
          <input
            type="text"
            value={coverConfig.author || ''}
            onChange={(e) => onChange({ ...coverConfig, author: e.target.value })}
            placeholder="e.g. Master Cartographer"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-300 block mb-1">Typography Font</label>
          <select
            value={coverConfig.fontCategory}
            onChange={(e) => onChange({ ...coverConfig, fontCategory: e.target.value as any })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
          >
            <option value="fantasy-serif">Fantasy Serif (Cinzel)</option>
            <option value="medieval">Medieval Gothic</option>
            <option value="classic-serif">Classic Book Serif</option>
            <option value="modern">Modern Minimal</option>
          </select>
        </div>
      </div>

      <div>
        <label className="font-semibold text-slate-300 block mb-1.5">Accent Color</label>
        <div className="flex items-center gap-3">
          {['#f59e0b', '#38bdf8', '#a855f7', '#10b981', '#f43f5e'].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ ...coverConfig, accentColor: color })}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                coverConfig.accentColor === color ? 'border-slate-100 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
