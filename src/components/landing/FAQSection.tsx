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
      question: 'What is a fantasy map generator?',
      answer: 'A fantasy map generator is a digital tool that proceduralizes or uses AI to generate custom fantasy world maps with continents, mountain ranges, forests, rivers, kingdoms, cities, roads, and points of interest.'
    },
    {
      question: 'Can I create a fantasy map for free?',
      answer: 'Yes! CreateFantasyMap is currently available in Free Launch Mode. You can generate, customize, and export fantasy maps for free during our launch.'
    },
    {
      question: 'Can I use CreateFantasyMap for D&D?',
      answer: 'Yes, CreateFantasyMap is designed for D&D Dungeon Masters and players to generate world, continent, and regional campaign maps with grid overlays, distance scales, and points of interest.'
    },
    {
      question: 'Can I create a fantasy world map?',
      answer: 'Yes. You can generate continents, island realms, archipelagos, regional maps, and kingdoms.'
    },
    {
      question: 'Can I customize generated maps?',
      answer: 'Yes! CreateFantasyMap includes an interactive cartography canvas where you can move cities, paint custom terrain, draw rivers and roads, edit labels, adjust colors, and toggle visibility layers.'
    },
    {
      question: 'Can I add cities and locations?',
      answer: 'Yes, you can place capitals, major cities, towns, villages, ports, fortresses, ruins, dungeons, dragon lairs, and custom points of interest.'
    },
    {
      question: 'Can I download my fantasy map?',
      answer: 'Yes, you can export your finished fantasy map as a high-resolution image ready for printing, worldbuilding documentation, or digital display.'
    },
    {
      question: 'Do I need an account?',
      answer: 'You can start generating and editing maps right in your browser immediately. Creating a free account allows you to save your maps to the cloud.'
    },
    {
      question: 'Can I generate fantasy artwork?',
      answer: 'Yes, CreateFantasyMap features integrated AI worldbuilding tools to generate lore descriptions, character profiles, kingdom histories, and fantasy artwork.'
    },
    {
      question: 'Is CreateFantasyMap free?',
      answer: 'CreateFantasyMap is currently free to use during our launch period.'
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
            Frequently Asked <span className="gold-gradient-text">Questions</span>
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
