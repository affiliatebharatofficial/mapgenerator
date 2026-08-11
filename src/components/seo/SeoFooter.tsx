import React from 'react';
import { Compass, Sparkles, Shield, Heart } from 'lucide-react';
import { InternalLinkingEngine } from '../../lib/seo/internalLinking';

export const SeoFooter: React.FC = () => {
  const generators = InternalLinkingEngine.getGenerators().slice(0, 6);
  const tools = InternalLinkingEngine.getTools().slice(0, 6);
  const styles = InternalLinkingEngine.getStyles();
  const usecases = InternalLinkingEngine.getUseCases();

  return (
    <footer className="bg-[#08090d] border-t border-slate-800 text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-400" />
              <span className="font-cinzel font-bold text-lg text-slate-100">CreateFantasyMap</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Professional AI & procedural fantasy map generator workspace for worldbuilders, RPG game masters, authors, and cartographers.
            </p>
          </div>

          {/* Generators */}
          <div className="space-y-2">
            <h4 className="font-cinzel font-bold text-slate-100 text-sm">Generators</h4>
            <ul className="space-y-1.5">
              {generators.map((g) => (
                <li key={g.url}>
                  <a href={g.url} className="hover:text-amber-300 transition-colors">
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Free Tools */}
          <div className="space-y-2">
            <h4 className="font-cinzel font-bold text-slate-100 text-sm">Free Tools</h4>
            <ul className="space-y-1.5">
              {tools.map((t) => (
                <li key={t.url}>
                  <a href={t.url} className="hover:text-amber-300 transition-colors">
                    {t.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Map Styles */}
          <div className="space-y-2">
            <h4 className="font-cinzel font-bold text-slate-100 text-sm">Map Styles</h4>
            <ul className="space-y-1.5">
              {styles.map((s) => (
                <li key={s.url}>
                  <a href={s.url} className="hover:text-amber-300 transition-colors">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases & Legal */}
          <div className="space-y-2">
            <h4 className="font-cinzel font-bold text-slate-100 text-sm">Use Cases</h4>
            <ul className="space-y-1.5">
              {usecases.map((u) => (
                <li key={u.url}>
                  <a href={u.url} className="hover:text-amber-300 transition-colors">
                    {u.title}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a href="/community-guidelines" className="text-amber-400 font-semibold hover:underline">
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>© {new Date().getFullYear()} CreateFantasyMap.com. All cartography rights reserved.</div>
          <div className="flex items-center gap-1">
            <span>Built for worldbuilders & RPG adventurers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
