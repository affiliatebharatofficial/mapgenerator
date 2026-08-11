import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { SeoFooter } from '../../components/seo/SeoFooter';
import { BreadcrumbNav } from '../../components/seo/BreadcrumbNav';
import { RelatedToolsSection } from '../../components/seo/RelatedToolsSection';
import { Wand2, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
import { FreeToolsEngine } from '../../lib/tools/generators';

interface ToolPageProps {
  toolSlug: string;
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

export const ToolPage: React.FC<ToolPageProps> = ({
  toolSlug,
  onNavigateCreate,
  onNavigateHome
}) => {
  const [results, setResults] = useState<any[]>(() => FreeToolsEngine.generateFantasyNames(5));
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const formattedName = toolSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const handleGenerate = () => {
    if (toolSlug.includes('kingdom')) setResults(FreeToolsEngine.generateKingdomNames(5));
    else if (toolSlug.includes('city')) setResults(FreeToolsEngine.generateCityNames(5));
    else if (toolSlug.includes('character')) setResults(FreeToolsEngine.generateCharacterNames(5));
    else if (toolSlug.includes('faction')) setResults(FreeToolsEngine.generateFactionNames(5));
    else if (toolSlug.includes('location')) setResults(FreeToolsEngine.generateLocationNames(5));
    else if (toolSlug.includes('quest')) setResults(FreeToolsEngine.generateQuests(3));
    else setResults(FreeToolsEngine.generateFantasyNames(6));
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
      <BreadcrumbNav pathname={`/tools/${toolSlug}`} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Main Tool Runner Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-amber-500/20 max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-cinzel font-bold text-3xl text-slate-100">{formattedName}</h1>
            <p className="text-xs text-slate-400">Generate instant fantasy names and lore concepts for your worldbuilding maps and RPG campaigns.</p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerate}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" /> Generate More Names
            </button>
          </div>

          {/* Results Grid */}
          <div className="space-y-3 pt-2">
            {results.map((res, i) => {
              const textVal = typeof res === 'string' ? res : res.name || res.title;
              return (
                <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <strong className="font-cinzel font-bold text-base text-amber-200 block">{textVal}</strong>
                    {res.description && <p className="text-xs text-slate-400">{res.description}</p>}
                    {res.type && <span className="text-[10px] font-mono text-slate-500 capitalize">{res.type}</span>}
                  </div>

                  <button
                    onClick={() => handleCopy(textVal, i)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 text-xs flex items-center gap-1.5 shrink-0"
                  >
                    {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIdx === i ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400 font-serif">Ready to place these names on a map?</span>
            <button
              onClick={onNavigateCreate}
              className="px-5 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Open Map Editor <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <RelatedToolsSection currentSlug={`/tools/${toolSlug}`} category="tools" />
      </main>

      <SeoFooter />
    </div>
  );
};
