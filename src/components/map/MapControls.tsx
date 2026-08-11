import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
  scale: number;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onFit,
  scale
}) => {
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-[#12161f]/90 backdrop-blur-md p-1.5 rounded-xl border border-amber-500/20 shadow-2xl z-30 select-none">
      <button
        onClick={onZoomIn}
        title="Zoom In (+)"
        className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg transition-colors"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      
      <div className="text-[10px] text-center text-amber-300/70 font-mono font-semibold py-1 border-y border-amber-500/10">
        {Math.round(scale * 100)}%
      </div>

      <button
        onClick={onZoomOut}
        title="Zoom Out (-)"
        className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg transition-colors"
      >
        <ZoomOut className="w-5 h-5" />
      </button>

      <div className="w-full h-px bg-amber-500/10 my-0.5" />

      <button
        onClick={onReset}
        title="Reset View"
        className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <button
        onClick={onFit}
        title="Fit to Screen"
        className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg transition-colors"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
};
