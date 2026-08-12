import React from 'react';
import { Gift, CheckCircle, Sparkles } from 'lucide-react';

interface FreeLaunchSectionProps {
  onNavigateCreate: () => void;
}

export const FreeLaunchSection: React.FC<FreeLaunchSectionProps> = ({ onNavigateCreate }) => {
  return (
    <section className="py-16 bg-[#0d0f15] border-y border-slate-800/80 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Gift className="w-3.5 h-3.5" />
          <span>Launch Announcement</span>
        </div>

        <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
          Free <span className="gold-gradient-text">Fantasy Map Generator</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
          CreateFantasyMap is <strong>currently free during our launch period</strong>. As part of our early release, all creators can access our complete procedural cartography engine, customize map layers, and export high-resolution maps without payment.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2 text-left">
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200">Unlimited Map Generation</span>
          </div>

          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200">Full Editor Customization</span>
          </div>

          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200">Free Image Export</span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={onNavigateCreate}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Your Fantasy Map Now</span>
          </button>
        </div>
      </div>
    </section>
  );
};
