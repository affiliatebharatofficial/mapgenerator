import React, { useState } from 'react';
import { Grid, Download, X, Check } from 'lucide-react';

interface TiledMapExportModalProps {
  mapName: string;
  onClose: () => void;
  onExportComplete: () => void;
}

export const TiledMapExportModal: React.FC<TiledMapExportModalProps> = ({ mapName, onClose, onExportComplete }) => {
  const [gridSize, setGridSize] = useState<'2x2' | '3x3' | '4x4'>('2x2');
  const [loading, setLoading] = useState(false);

  const handleExportTiles = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onExportComplete();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">Export Multi-Page Tiled Map</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Split high-resolution map <strong>"{mapName}"</strong> into a multi-page printable PDF grid with overlap margins and tile coordinates.
          </p>

          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">Page Grid Layout</label>
            <div className="grid grid-cols-3 gap-2">
              {(['2x2', '3x3', '4x4'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGridSize(g)}
                  className={`py-2.5 px-3 rounded-xl border text-center font-bold font-mono transition-all ${
                    gridSize === g ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {g} ({g === '2x2' ? '4 Pages' : g === '3x3' ? '9 Pages' : '16 Pages'})
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
            <div>• Tile Overlap Margin: <span className="text-amber-300">10 mm</span></div>
            <div>• Coordinate Indexing: <span className="text-slate-200">A1, A2, B1, B2</span></div>
            <div>• Output Format: <span className="text-emerald-400">Multi-page Printable PDF</span></div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
              Cancel
            </button>
            <button
              onClick={handleExportTiles}
              disabled={loading}
              className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? 'Compiling Grid Tiles...' : 'Export Tiled PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
