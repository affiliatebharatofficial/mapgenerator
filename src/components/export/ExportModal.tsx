import React, { useState } from 'react';
import { Download, X, Lock, Sparkles, FileText, Image as ImageIcon, FileCode } from 'lucide-react';
import { useSubscription } from '../../lib/supabase/subscriptionStore';
import { exportMapPNG, exportMapToSVG, exportMapToPDF } from '../../lib/map-engine/exporter';
import { PlatformConfigService } from '../../lib/config/platformConfigService';

interface ExportModalProps {
  svgElement: SVGSVGElement | null;
  mapName: string;
  onClose: () => void;
  onNavigatePricing: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  svgElement,
  mapName,
  onClose,
  onNavigatePricing
}) => {
  const { currentPlan, hasEntitlement } = useSubscription();
  const masterConfig = PlatformConfigService.getMasterConfig();

  const isPngEnabled = PlatformConfigService.isExportFormatEnabled('png');
  const isSvgEnabled = PlatformConfigService.isExportFormatEnabled('svg');
  const isPdfEnabled = PlatformConfigService.isExportFormatEnabled('pdf');

  const defaultFormat = isPngEnabled ? 'png' : isSvgEnabled ? 'svg' : 'pdf';
  const [format, setFormat] = useState<'png' | 'svg' | 'pdf'>(defaultFormat);
  const [resolution, setResolution] = useState<'standard' | 'hd' | 'ultra_hd'>('ultra_hd');
  const [isExporting, setIsExporting] = useState(false);

  const canExportSVG = hasEntitlement('svg_export');
  const canExportPDF = hasEntitlement('pdf_export');
  const canExportHD = hasEntitlement('hd_export');
  const canExportUltraHD = hasEntitlement('ultra_hd_export');

  // Check if chosen format/res requires upgrade (Bypassed if Free Launch Mode = ON)
  const isFreeLaunch = masterConfig.freeLaunchMode || !masterConfig.monetizationEnabled;
  const formatLocked = !isFreeLaunch && ((format === 'svg' && !canExportSVG) || (format === 'pdf' && !canExportPDF));
  const resolutionLocked = !isFreeLaunch && ((resolution === 'hd' && !canExportHD) || (resolution === 'ultra_hd' && !canExportUltraHD));
  const requiresUpgrade = formatLocked || resolutionLocked;

  const handleExport = async () => {
    if (!svgElement) return;

    if (requiresUpgrade) {
      onNavigatePricing();
      return;
    }

    setIsExporting(true);

    try {
      const applyWatermark = !isFreeLaunch && currentPlan === 'free';
      if (format === 'png') {
        await exportMapPNG(svgElement, mapName, resolution, applyWatermark);
      } else if (format === 'svg') {
        exportMapToSVG(svgElement, mapName);
      } else if (format === 'pdf') {
        await exportMapToPDF(svgElement, mapName);
      }
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-lg w-full space-y-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-lg text-slate-100">
              Export Fantasy Map
            </h3>
            <p className="text-xs text-slate-400">Download high quality map files for printing or digital use.</p>
          </div>
        </div>

        {/* Export Format Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">File Format</label>
          <div className="grid grid-cols-3 gap-2">
            {isPngEnabled && (
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`p-3 rounded-xl border text-center relative transition-all ${
                  format === 'png'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ImageIcon className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <div className="text-xs font-bold">PNG Image</div>
                <div className="text-[10px] text-slate-500">Raster Image</div>
              </button>
            )}

            {isSvgEnabled && (
              <button
                type="button"
                onClick={() => setFormat('svg')}
                className={`p-3 rounded-xl border text-center relative transition-all ${
                  format === 'svg'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {!isFreeLaunch && !canExportSVG && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
                <FileCode className="w-5 h-5 mx-auto mb-1 text-sky-400" />
                <div className="text-xs font-bold">SVG Vector</div>
                <div className="text-[10px] text-slate-500">Scalable Vector</div>
              </button>
            )}

            {isPdfEnabled && (
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-xl border text-center relative transition-all ${
                  format === 'pdf'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {!isFreeLaunch && !canExportPDF && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
                <FileText className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <div className="text-xs font-bold">PDF Doc</div>
                <div className="text-[10px] text-slate-500">Print Ready</div>
              </button>
            )}
          </div>
        </div>

        {/* Resolution Selector (For PNG) */}
        {format === 'png' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Resolution Quality</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setResolution('standard')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  resolution === 'standard'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Standard (1x)
              </button>

              <button
                type="button"
                onClick={() => setResolution('hd')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center relative transition-all ${
                  resolution === 'hd'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {!canExportHD && (
                  <span className="absolute -top-2 -right-1 text-[9px] font-bold bg-amber-500 text-slate-950 px-1 rounded">
                    PRO
                  </span>
                )}
                HD (2x)
              </button>

              <button
                type="button"
                onClick={() => setResolution('ultra_hd')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center relative transition-all ${
                  resolution === 'ultra_hd'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {!canExportUltraHD && (
                  <span className="absolute -top-2 -right-1 text-[9px] font-bold bg-purple-500 text-slate-100 px-1 rounded">
                    CREATOR
                  </span>
                )}
                Ultra HD (4x)
              </button>
            </div>
          </div>
        )}

        {/* Upgrade Banner Prompt if Locked Option Picked */}
        {requiresUpgrade && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Unlock {format.toUpperCase()} & HD Exports
              </span>
              <p className="text-[11px] text-slate-300">Upgrade to Pro to export vector files and high-res print maps.</p>
            </div>

            <button
              onClick={onNavigatePricing}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-lg shrink-0"
            >
              Upgrade
            </button>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            {requiresUpgrade ? (
              <>
                <Sparkles className="w-4 h-4" /> Unlock & Export
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> {isExporting ? 'Exporting...' : 'Download Map'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
