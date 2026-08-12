import React from 'react';
import { BookOpen, Map, CheckCircle2, Shield, Mountain, Compass } from 'lucide-react';

export const EducationalSection: React.FC = () => {
  const guideSteps = [
    { num: '1', title: 'Define the World', desc: 'Determine the scale, climate, and tone of your realm.' },
    { num: '2', title: 'Decide Geography', desc: 'Shape continent landmasses, islands, and coastlines.' },
    { num: '3', title: 'Add Mountains & Rivers', desc: 'Establish elevation ridges and natural water drainage.' },
    { num: '4', title: 'Define Regions', desc: 'Partition biomes, wilderness, and climate zones.' },
    { num: '5', title: 'Add Cities & Settlements', desc: 'Place capitals, ports, fortress towns, and villages.' },
    { num: '6', title: 'Add Roads & Landmarks', desc: 'Connect settlements with trade routes and POIs.' },
    { num: '7', title: 'Add Labels', desc: 'Name ocean gulfs, mountain chains, and kingdom realms.' },
    { num: '8', title: 'Customize the Map', desc: 'Adjust color palettes, grid overlays, and visual styles.' },
    { num: '9', title: 'Download the Final Map', desc: 'Export high-res images for tabletop gaming or writing.' }
  ];

  const mapElements = [
    { title: 'Mountains', role: 'Form natural borders, rain shadows, and formidable barriers between kingdoms.' },
    { title: 'Rivers', role: 'Provide freshwater, trade highways, and fertile river valleys for major cities.' },
    { title: 'Lakes', role: 'Create regional water basins, fishing hubs, and sacred inland waters.' },
    { title: 'Forests', role: 'Supply timber, harbor ancient wilderness, and mark elven or wild realms.' },
    { title: 'Cities', role: 'Act as seats of political power, trade centers, and cultural anchors.' },
    { title: 'Kingdoms', role: 'Define political territories, sovereign rule, and international borders.' },
    { title: 'Roads', role: 'Represent trade arteries, military highways, and travel routes.' },
    { title: 'Borders', role: 'Mark territorial jurisdictions, treaty lines, and contested frontiers.' },
    { title: 'Landmarks', role: 'Highlight legendary ruins, mysterious towers, dragon lairs, and shrines.' },
    { title: 'Labels', role: 'Ensure all locations, seas, and regions are clearly readable and organized.' }
  ];

  return (
    <div className="space-y-24 py-20 bg-[#0d0f15] border-y border-slate-800/80">
      {/* 1. What Is a Fantasy Map Generator? */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 sm:p-10 rounded-3xl border border-slate-800 bg-[#121620]/80 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Worldbuilding Knowledge</span>
          </div>

          <h2 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-100">
            What Is a <span className="gold-gradient-text">Fantasy Map Generator?</span>
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            A <strong>fantasy map generator</strong> is a digital tool engineered to generate custom cartographic landscapes for fictional settings. For authors, game designers, and tabletop role-playing enthusiasts, visualizing geographic space is a fundamental step in worldbuilding. Instead of spending dozens of hours learning complex digital painting software or drawing coastlines by hand, a <strong>fantasy map maker online</strong> provides procedural algorithms and AI configuration tools that construct continent outlines, elevation contours, river systems, and political territories automatically.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            By establishing realistic spatial relationships between mountain ranges, trade highways, capital cities, and sovereign borders, generated maps give creators an immediate visual foundation. This accelerates the worldbuilding process, grounds narrative lore in believable geography, and gives players or readers an immersive sense of place across fictional worlds.
          </p>
        </div>
      </section>

      {/* 2. How to Make a Fantasy Map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
            How to Make a <span className="gold-gradient-text">Fantasy Map</span>
          </h2>
          <p className="text-sm text-slate-400">
            Follow this fundamental cartography process when designing fictional world geography.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {guideSteps.map((s, idx) => (
            <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800 bg-[#121620]/60 flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                {s.num}
              </span>
              <div>
                <h3 className="font-cinzel font-bold text-base text-slate-100 mb-1">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. What Should a Fantasy Map Include? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-slate-100">
            What Should a <span className="gold-gradient-text">Fantasy Map Include?</span>
          </h2>
          <p className="text-sm text-slate-400">
            Essential geographical and political layers every worldbuilder should incorporate into their map.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mapElements.map((el, idx) => (
            <div key={idx} className="p-4 bg-[#121620]/60 border border-slate-800 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-cinzel font-bold text-sm text-slate-100">{el.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{el.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Create Maps for D&D and RPG Campaigns */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 sm:p-10 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#121620] to-[#090b0e] space-y-6">
          <div className="flex items-center gap-2 text-amber-400">
            <Shield className="w-6 h-6" />
            <h2 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-100">
              Create Maps for <span className="gold-gradient-text">D&D and RPG Campaigns</span>
            </h2>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            For Dungeon Masters and TTRPG campaign leaders, a clear campaign world map is an invaluable tool for session prep and player immersion. CreateFantasyMap allows you to establish regional <strong>campaign geography</strong>, display <strong>kingdom borders and political territories</strong>, calculate overland <strong>travel distances</strong> with distance scale bars, and mark important <strong>dungeons, ruins, and legendary points of interest</strong>.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            <strong>Note:</strong> CreateFantasyMap is optimized for macro worldbuilding, continent mapping, and regional campaign settings. It serves as your campaign&apos;s strategic world atlas rather than tactical grid battle-map software.
          </p>
        </div>
      </section>
    </div>
  );
};
