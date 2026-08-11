import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'What is Create Fantasy Map?',
      answer: 'Create Fantasy Map (createfantasymap.com) is an AI & procedural fantasy worldbuilding cartography platform. It allows fantasy writers, Dungeons & Dragons players, Dungeon Masters, and RPG creators to instantly generate and customize high-quality fantasy world maps.'
    },
    {
      question: 'Can I customize my fantasy map after generation?',
      answer: 'Yes! Unlike flat static AI image generators, Create Fantasy Map produces fully interactive vector objects. You can drag and reposition cities, edit kingdom borders, modify landmark lore, change font sizes, toggle layers, and customize visual styles.'
    },
    {
      question: 'Can I create maps for D&D and tabletop RPG campaigns?',
      answer: 'Absolutely. We include a specialized "RPG / D&D Inspired" tabletop style with grid overlays, legend markers, distance scale bars, and points of interest (dungeons, castles, dragon lairs, battlefields) specifically tailored for Dungeon Masters.'
    },
    {
      question: 'Can I download and export my map?',
      answer: 'Yes, Phase 1 includes free high-resolution PNG image export. You can export your customized map with visible grid overlays, legends, scale bars, and decorative frames ready for printing or VTT integration.'
    },
    {
      question: 'Will AI text-to-world generation be available?',
      answer: 'Yes! In upcoming roadmap phases, our server-side AI World Parser will allow you to type complex natural language descriptions (e.g., "A cold northern continent with three kingdoms and a ruined coastal castle") and convert them into structured editable map parameters.'
    },
    {
      question: 'Do I need to create an account or pay to build a map?',
      answer: 'No! You can generate, customize, and save maps locally in your browser immediately without signing up. Authentication and cloud saving will be introduced in future updates.'
    }
  ];

  return (
    <section id="faq" className="py-24 bg-[#0d0f15] border-t border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
            Got <span className="gold-gradient-text">Questions?</span>
          </h2>
          <p className="text-sm text-slate-400">
            Everything you need to know about creating fantasy maps with our platform.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-cinzel font-bold text-base sm:text-lg text-slate-100 hover:text-amber-300 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
