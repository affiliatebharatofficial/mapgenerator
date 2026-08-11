import React from 'react';
import { Compass, Sparkles, ArrowRight, Wand2, Shield, Globe } from 'lucide-react';
import { InternalLinkingEngine, type InternalLinkItem } from '../../lib/seo/internalLinking';

interface RelatedToolsSectionProps {
  currentSlug?: string;
  category?: 'generators' | 'tools' | 'styles' | 'all';
}

export const RelatedToolsSection: React.FC<RelatedToolsSectionProps> = ({ currentSlug, category = 'all' }) => {
  let items: InternalLinkItem[] = [];

  if (category === 'generators') items = InternalLinkingEngine.getGenerators();
  else if (category === 'tools') items = InternalLinkingEngine.getTools();
  else if (category === 'styles') items = InternalLinkingEngine.getStyles();
  else items = [...InternalLinkingEngine.getGenerators().slice(0, 4), ...InternalLinkingEngine.getTools().slice(0, 4)];

  const filtered = items.filter((it) => it.url !== currentSlug).slice(0, 6);

  return (
    <section className="space-y-4 py-8 font-sans select-none border-t border-slate-800">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h3 className="font-cinzel font-bold text-xl text-slate-100">Related Map Generators & Worldbuilding Tools</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <a
            key={item.url}
            href={item.url}
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all group flex flex-col justify-between space-y-2"
          >
            <div>
              <h4 className="font-cinzel font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                {item.title}
              </h4>
              {item.description && <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>}
            </div>

            <div className="pt-2 flex items-center justify-end text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform gap-1">
              <span>Try Generator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
