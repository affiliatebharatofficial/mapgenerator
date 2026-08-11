import React from 'react';
import { Header } from '../../components/layout/Header';
import { SeoFooter } from '../../components/seo/SeoFooter';
import { BreadcrumbNav } from '../../components/seo/BreadcrumbNav';
import { RelatedToolsSection } from '../../components/seo/RelatedToolsSection';
import { Palette, Sparkles, ArrowRight } from 'lucide-react';

interface StyleLandingPageProps {
  styleName: string;
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

export const StyleLandingPage: React.FC<StyleLandingPageProps> = ({
  styleName,
  onNavigateCreate,
  onNavigateHome
}) => {
  const formattedStyle = styleName.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
      <BreadcrumbNav pathname={`/styles/${styleName}`} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/20 text-center space-y-4 max-w-3xl mx-auto">
          <Palette className="w-12 h-12 text-amber-400 mx-auto" />
          <h1 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
            {formattedStyle} Fantasy Map Style
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Generate and customize fantasy maps featuring {formattedStyle.toLowerCase()} visual aesthetics, custom palette color schemes, and parchment textures.
          </p>
          <button
            onClick={onNavigateCreate}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Create {formattedStyle} Map
          </button>
        </div>

        <RelatedToolsSection currentSlug={`/styles/${styleName}`} category="styles" />
      </main>

      <SeoFooter />
    </div>
  );
};
