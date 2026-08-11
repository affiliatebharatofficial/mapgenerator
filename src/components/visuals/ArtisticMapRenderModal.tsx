import React, { useState } from 'react';
import { Palette, Sparkles, X, Download, AlertCircle } from 'lucide-react';
import type { FantasyMap } from '../../types/map';
import type { VisualStyle } from '../../types/visualAssets';
import { VisualAssetService } from '../../lib/ai/visualAssetService';
import { useSubscription } from '../../lib/supabase/subscriptionStore';

interface ArtisticMapRenderModalProps {
  map: FantasyMap;
  onClose: () => void;
}

export const ArtisticMapRenderModal: React.FC<ArtisticMapRenderModalProps> = ({ map, onClose }) => {
  const { creditsRemaining, deductCredits } = useSubscription();

  const [style, setStyle] = useState<VisualStyle>('old-parchment');
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateRender = async () => {
    if (creditsRemaining < 5) {
      alert('Artistic Map Render requires 5 AI Credits.');
      return;
    }

    setLoading(true);
    const success = deductCredits(5, 'Artistic AI Map Render');
    if (!success) {
      setLoading(false);
      return;
    }

    const prompt = VisualAssetService.buildEntityPrompt('artistic_map_render', map, { visualStyle: style });
    const result = await VisualAssetService.generateEntityVisual({
      entityType: 'artistic_map_render',
      entityId: map.id,
      prompt,
      style,
      aspectRatio: '16:9',
      creditCost: 5
    });

    setRenderedUrl(result.url);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-2xl w-full space-y-5 shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">Generate Artistic Map Render</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>The structured vector map remains your editable source of truth. Artistic renders are stylized visual presentations.</span>
        </div>

        {/* Render Preview Area */}
        {renderedUrl ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <img src={renderedUrl} alt="Artistic Map Render" className="w-full h-72 object-cover rounded-xl border border-amber-500/30 shadow-2xl" />
            <div className="flex justify-end gap-3">
              <a
                href={renderedUrl}
                download={`${map.name}-artistic-render.png`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download HD Render
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-xs text-slate-300 block mb-2">Select Presentation Style</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['old-parchment', 'dark-fantasy', 'painterly', 'storybook', 'concept-art'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`py-2 px-3 rounded-xl border text-center capitalize font-semibold transition-all ${
                      style === s ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleGenerateRender}
                disabled={loading}
                className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Rendering...' : 'Generate Render (5 Credits)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
