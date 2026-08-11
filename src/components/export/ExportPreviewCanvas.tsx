import React from 'react';
import { Compass, BookOpen, Shield, MapPin } from 'lucide-react';
import type { ExportType, PrintSize, PrintOrientation, TemplateStyle, CoverConfig, ExportSelectionConfig } from '../../types/exportStudio';

interface ExportPreviewCanvasProps {
  exportType: ExportType;
  printSize: PrintSize;
  orientation: PrintOrientation;
  templateStyle: TemplateStyle;
  coverConfig: CoverConfig;
  selections: ExportSelectionConfig;
  title: string;
}

export const ExportPreviewCanvas: React.FC<ExportPreviewCanvasProps> = ({
  exportType,
  printSize,
  orientation,
  templateStyle,
  coverConfig,
  selections,
  title
}) => {
  const isLandscape = orientation === 'landscape' || (orientation === 'auto' && exportType === 'map');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#090b0e] border border-amber-500/20 rounded-3xl overflow-hidden font-sans select-none relative">
      {/* Page Header Dimensions Tag */}
      <div className="absolute top-4 left-4 bg-slate-900/90 text-amber-400 font-mono text-[10px] px-3 py-1 rounded-full border border-amber-500/20">
        PRINT PREVIEW: {printSize} ({isLandscape ? 'LANDSCAPE' : 'PORTRAIT'}) • {templateStyle.toUpperCase().replace('-', ' ')}
      </div>

      {/* Simulated Printable Page Boundary Container */}
      <div
        className={`bg-[#0f121a] border border-amber-500/30 rounded-2xl shadow-2xl p-6 flex flex-col justify-between transition-all duration-300 relative ${
          isLandscape ? 'w-[520px] h-[340px]' : 'w-[360px] h-[480px]'
        }`}
      >
        {/* Print Safe Margins Overlay Line */}
        <div className="absolute inset-4 border border-dashed border-amber-500/20 rounded-xl pointer-events-none" />

        {/* Cover / Document Header */}
        <div className="space-y-2 z-10">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-2">
            <span className="text-amber-400 font-bold uppercase">{exportType.replace('_', ' ')}</span>
            <span>CREATEFANTASYMAP.COM</span>
          </div>

          <div className="space-y-1 pt-2">
            <h2 className="font-cinzel font-bold text-xl text-slate-100 leading-tight" style={{ color: coverConfig.accentColor || '#f59e0b' }}>
              {coverConfig.title || title || 'Fantasy Realm'}
            </h2>
            {coverConfig.subtitle && <p className="text-xs text-slate-300 font-serif italic">{coverConfig.subtitle}</p>}
            {coverConfig.author && <p className="text-[10px] font-mono text-amber-300">By {coverConfig.author}</p>}
          </div>
        </div>

        {/* Center Canvas / Content Graphic Preview */}
        <div className="flex-1 flex items-center justify-center my-3 bg-slate-950/80 rounded-xl border border-slate-800 p-4 relative overflow-hidden">
          {exportType === 'map' || exportType === 'poster' ? (
            <div className="text-center space-y-2">
              <Compass className="w-12 h-12 text-amber-400/80 mx-auto animate-pulse" />
              <span className="font-cinzel text-xs font-bold text-amber-200 block">Structured Map Vector Graphic</span>
              {selections.includeCompass && <span className="text-[9px] font-mono text-slate-400 block">[ Compass & Scale Bar Included ]</span>}
            </div>
          ) : (
            <div className="text-center space-y-2">
              <BookOpen className="w-10 h-10 text-amber-400/80 mx-auto" />
              <span className="font-cinzel text-xs font-bold text-slate-200 block">Compiled Document Chapters</span>
              <div className="text-[9px] font-mono text-slate-400 space-x-2">
                {selections.includeKingdoms && <span>Kingdoms ✓</span>}
                {selections.includeCities && <span>Cities ✓</span>}
                {selections.includeCharacters && <span>Characters ✓</span>}
              </div>
            </div>
          )}
        </div>

        {/* Page Footer */}
        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-slate-800 pt-2 z-10">
          <span>Page 1 of {exportType === 'map' ? '1' : '24'}</span>
          {selections.includeLegend && <span className="text-amber-400">Map Legend Included</span>}
        </div>
      </div>
    </div>
  );
};
