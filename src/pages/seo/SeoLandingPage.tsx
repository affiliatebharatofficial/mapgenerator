import React from 'react';
import { Header } from '../../components/layout/Header';
import { SeoFooter } from '../../components/seo/SeoFooter';
import { BreadcrumbNav } from '../../components/seo/BreadcrumbNav';
import { RelatedToolsSection } from '../../components/seo/RelatedToolsSection';
import { Compass, Sparkles, ArrowRight, CheckCircle2, HelpCircle, MapPin, Globe } from 'lucide-react';
import { SeoService } from '../../lib/seo/seoService';

interface SeoLandingPageProps {
  slug: string;
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

const LANDING_CONFIGS: Record<string, { h1: string; metaTitle: string; metaDescription: string; intro: string; features: string[]; faq: { question: string; answer: string }[] }> = {
  'fantasy-map-generator': {
    h1: 'Fantasy Map Generator',
    metaTitle: 'Fantasy Map Generator — Create AI & Procedural Fantasy World Maps',
    metaDescription: 'Create detailed fantasy maps for worlds, kingdoms, RPG campaigns, novels and games. AI & procedural cartography editor with interactive tools.',
    intro: 'Design stunning, high-resolution fantasy maps for your worldbuilding lore, D&D campaigns, or fantasy fiction in seconds using our AI and procedural map engine.',
    features: [
      'Procedural coastlines, river networks, and mountain ranges',
      'AI natural-language world map editing (Ctrl+K)',
      'Canva/Figma-style vector map editor with custom terrain painting',
      'Kingdom borders, settlement placement, and heraldry emblem generators',
      'High-resolution HD PNG & PDF exports'
    ],
    faq: [
      { question: 'Is the Fantasy Map Generator free to use?', answer: 'Yes! You can quick generate, edit, and explore fantasy maps for free.' },
      { question: 'Can I export maps for commercial novel or game publishing?', answer: 'Creator tier subscriptions include commercial license rights for published maps.' }
    ]
  },
  'ai-fantasy-map-generator': {
    h1: 'AI Fantasy Map Generator',
    metaTitle: 'AI Fantasy Map Generator — Describe Your World & Render Cartography',
    metaDescription: 'Describe your fantasy world in natural language and let AI generate continents, kingdoms, cities, and terrain maps automatically.',
    intro: 'Turn written descriptions of your world into fully editable vector maps using AI natural language commands.',
    features: [
      'Prompt-driven AI map generation and worldbuilding',
      'Atomic undo (Ctrl+Z) for AI map action plans',
      'Automated geographical consistency checking',
      'AI name generator for cities, rivers, and kingdoms'
    ],
    faq: [
      { question: 'How does AI map editing work?', answer: 'Simply press Ctrl+K or type natural instructions such as "Move the capital to the river delta" or "Add a mountain range in the north".' }
    ]
  },
  'dnd-map-generator': {
    h1: 'D&D Map Generator',
    metaTitle: 'D&D Map Generator — World & Campaign Maps for Dungeon Masters',
    metaDescription: 'Generate custom D&D campaign maps, continent landmasses, kingdom borders, cities, and dungeon keeps for Dungeons & Dragons sessions.',
    intro: 'Create immersive campaign maps for Dungeons & Dragons sessions with party tracking, fog of war, and adventure planning.',
    features: [
      'Tabletop RPG campaign runner and live session workspace',
      'Party location marker and fog-of-war map overlay',
      'NPC relationship trackers and encounter generators',
      'Worldbook PDF export for campaign handouts'
    ],
    faq: [
      { question: 'Is this affiliated with Wizards of the Coast?', answer: 'CreateFantasyMap is an independent system-agnostic cartography tool designed for TTRPG Game Masters.' }
    ]
  }
};

export const SeoLandingPage: React.FC<SeoLandingPageProps> = ({
  slug,
  onNavigateCreate,
  onNavigateHome
}) => {
  const pageSlug = slug.replace('/', '');
  const config = LANDING_CONFIGS[pageSlug] || LANDING_CONFIGS['fantasy-map-generator'];

  const metadata = SeoService.generateMetadata(`/${pageSlug}`, {
    title: config.metaTitle,
    description: config.metaDescription
  }, config.faq);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(metadata.jsonLd) }} />
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
      <BreadcrumbNav pathname={`/${pageSlug}`} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero Section */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-amber-500/20 text-center space-y-6 max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
            Cartography AI Engine
          </span>

          <h1 className="font-cinzel font-bold text-3xl sm:text-5xl text-slate-100 leading-tight">
            {config.h1}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-serif">
            {config.intro}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onNavigateCreate}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Create Your Fantasy Map Free</span>
            </button>
          </div>
        </div>

        {/* Features Checklist Grid */}
        <div className="space-y-6">
          <h2 className="font-cinzel font-bold text-2xl text-slate-100 text-center">
            Powerful Cartography & Worldbuilding Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.features.map((feat, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">{feat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <h2 className="font-cinzel font-bold text-2xl text-slate-100 text-center flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-400" />
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="space-y-4">
            {config.faq.map((faq, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="font-cinzel font-bold text-base text-amber-200">{faq.question}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contextual Internal Links Section */}
        <RelatedToolsSection currentSlug={`/${pageSlug}`} category="all" />
      </main>

      <SeoFooter />
    </div>
  );
};
