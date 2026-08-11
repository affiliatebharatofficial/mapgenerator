import React from 'react';
import { Header } from '../../components/layout/Header';
import { SeoFooter } from '../../components/seo/SeoFooter';
import { Compass, Sparkles, Home } from 'lucide-react';

interface NotFoundPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigateCreate,
  onNavigateHome
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 max-w-md mx-auto">
        <Compass className="w-16 h-16 text-rose-400 animate-pulse" />

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">404 ERROR</span>
          <h1 className="font-cinzel font-bold text-3xl text-slate-100">Lost in the Realm?</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The uncharted territory or map record you are seeking does not exist or has been moved to an unmapped continent.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Go to Home
          </button>
          <button
            onClick={onNavigateCreate}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg"
          >
            <Sparkles className="w-4 h-4" /> Create a Fantasy Map
          </button>
        </div>
      </main>

      <SeoFooter />
    </div>
  );
};
