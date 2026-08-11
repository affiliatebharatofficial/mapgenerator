import React from 'react';
import { ChevronRight } from 'lucide-react';
import { InternalLinkingEngine } from '../../lib/seo/internalLinking';

interface BreadcrumbNavProps {
  pathname: string;
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ pathname }) => {
  const crumbs = InternalLinkingEngine.getBreadcrumbs(pathname);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `https://createfantasymap.com${crumb.url}`
    }))
  };

  return (
    <nav aria-label="Breadcrumb" className="py-2.5 px-4 bg-[#0e1118]/80 border-b border-slate-800/60 font-sans select-none">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="max-w-7xl mx-auto flex items-center gap-1.5 text-xs text-slate-400 font-mono">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={crumb.url} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}
              {isLast ? (
                <span className="text-amber-300 font-semibold">{crumb.label}</span>
              ) : (
                <a href={crumb.url} className="hover:text-amber-400 transition-colors">
                  {crumb.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
