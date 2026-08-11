import React from 'react';
import { Header } from '../../components/layout/Header';
import { SeoFooter } from '../../components/seo/SeoFooter';
import { BreadcrumbNav } from '../../components/seo/BreadcrumbNav';
import { RelatedToolsSection } from '../../components/seo/RelatedToolsSection';
import { Compass, Sparkles, BookOpen, Users, Shield } from 'lucide-react';

interface UseCaseLandingPageProps {
  useCase: string;
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

export const UseCaseLandingPage: React.FC<UseCaseLandingPageProps> = ({
  useCase,
  onNavigateCreate,
  onNavigateHome
}) => {
  const formattedUseCase = useCase.toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
      <BreadcrumbNav pathname={`/for/${useCase}`} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/20 text-center space-y-4 max-w-3xl mx-auto">
          <BookOpen className="w-12 h-12 text-amber-400 mx-auto" />
          <h1 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
            Fantasy Map Generator for {formattedUseCase}
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Tailored cartography and worldbuilding tools designed specifically for {formattedUseCase.toLowerCase()} to build worlds, track characters, and map adventures.
          </p>
          <button
            onClick={onNavigateCreate}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Start Building
          </button>
        </div>

        <RelatedToolsSection currentSlug={`/for/${useCase}`} category="tools" />
      </main>

      <SeoFooter />
    </div>
  );
};
