import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import {
  Globe,
  Compass,
  Crown,
  Building,
  MapPin,
  Shield,
  Users,
  History,
  Scroll,
  BookOpen,
  Sparkles,
  Send,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Bookmark,
  Heart,
  Image,
  Palette,
  Skull
} from 'lucide-react';
import { WorldService } from '../../lib/supabase/worldService';
import { AIWorldEngine } from '../../lib/ai/aiWorldEngine';
import { AIWorldAgent } from '../../lib/ai/aiWorldAgent';
import { VisualAssetService } from '../../lib/ai/visualAssetService';
import { AICommandBarModal } from '../../components/ai/AICommandBarModal';
import { ImageGenerationModal } from '../../components/visuals/ImageGenerationModal';
import { ImageAssetPicker } from '../../components/visuals/ImageAssetPicker';
import { ImageStudioService } from '../../lib/ai/imageStudioService';
import { ConsistencyCheckerModal } from '../../components/ai/ConsistencyCheckerModal';
import { NamingAssistantModal } from '../../components/ai/NamingAssistantModal';
import { SaveToCollectionModal } from '../../components/community/SaveToCollectionModal';
import { CommentsSection } from '../../components/community/CommentsSection';
import { EntityVisualGallery } from '../../components/visuals/EntityVisualGallery';
import { CreatureGeneratorModal } from '../../components/visuals/CreatureGeneratorModal';
import { WorldbookExportModal } from '../../components/visuals/WorldbookExportModal';
import type { WorldCreature } from '../../types/visualAssets';
import type { ConsistencyIssue } from '../../types/agentTypes';
import type {
  World,
  WorldKingdom,
  WorldCity,
  WorldLocation,
  Faction,
  WorldCharacter,
  TimelineEvent,
  Quest
} from '../../types/world';
import { useSubscription } from '../../lib/supabase/subscriptionStore';

interface WorldExplorerPageProps {
  worldId: string;
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onNavigateMapEditor: (mapId: string) => void;
}

export const WorldExplorerPage: React.FC<WorldExplorerPageProps> = ({
  worldId,
  onNavigateCreate,
  onNavigateHome
}) => {
  const { deductCredits } = useSubscription();

  const [world, setWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'maps' | 'kingdoms' | 'cities' | 'locations' | 'factions' | 'characters' | 'timeline' | 'quests' | 'lore' | 'creatures'
  >('overview');

  // World Data Entities
  const [kingdoms, setKingdoms] = useState<WorldKingdom[]>([]);
  const [cities, setCities] = useState<WorldCity[]>([]);
  const [locations, setLocations] = useState<WorldLocation[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [characters, setCharacters] = useState<WorldCharacter[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [creatures, setCreatures] = useState<WorldCreature[]>([]);

  // AI Command Bar State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);

  // Inspector & Modal States
  const [draftModal, setDraftModal] = useState<{ type: string; item: any } | null>(null);

  // Phase 7 AI World Agent States
  const [showAICommandBar, setShowAICommandBar] = useState(false);
  const [showConsistencyModal, setShowConsistencyModal] = useState<ConsistencyIssue[] | null>(null);
  const [showNamingModal, setShowNamingModal] = useState(false);
  const [showSaveColModal, setShowSaveColModal] = useState(false);
  const [isWorldLiked, setIsWorldLiked] = useState(false);

  // Phase 22 Visual Artwork States
  const [showCreatureModal, setShowCreatureModal] = useState(false);
  const [showWorldbookModal, setShowWorldbookModal] = useState(false);
  const [showWorldCoverGen, setShowWorldCoverGen] = useState(false);
  const [showWorldCoverPicker, setShowWorldCoverPicker] = useState(false);

  // Ctrl+K Global Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setShowAICommandBar((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadWorldData = async () => {
    setLoading(true);
    const w = await WorldService.getWorldById(worldId);
    if (w) {
      setWorld(w);
      const [k, c, l, f, ch, t, q] = await Promise.all([
        WorldService.getKingdoms(w.id),
        WorldService.getCities(w.id),
        WorldService.getLocations(w.id),
        WorldService.getFactions(w.id),
        WorldService.getCharacters(w.id),
        WorldService.getTimelineEvents(w.id),
        WorldService.getQuests(w.id)
      ]);
      setKingdoms(k);
      setCities(c);
      setLocations(l);
      setFactions(f);
      setCharacters(ch);
      setTimeline(t);
      setQuests(q);

      const cr = VisualAssetService.getCreatures(w.id);
      setCreatures(cr);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWorldData();
  }, [worldId]);

  // AI Command Bar Submit
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || !world) return;
    setIsAskingAI(true);
    deductCredits(1, 'AI Ask Your World Query');
    const answer = await AIWorldEngine.askWorldAICommand(
      { world, kingdoms, cities, characters, factions },
      aiQuestion
    );
    setAiAnswer(answer);
    setIsAskingAI(false);
  };

  // AI Character Generator
  const handleGenerateCharacterAI = async () => {
    if (!world) return;
    deductCredits(1, 'AI Character Generation');
    const draft = await AIWorldEngine.generateCharacterAI(world.id, 'Sir Garreth disgraced knight');
    setDraftModal({ type: 'character', item: draft });
  };

  // AI Kingdom Generator
  const handleGenerateKingdomAI = async () => {
    if (!world) return;
    deductCredits(2, 'AI Kingdom Generation');
    const draft = await AIWorldEngine.generateKingdomAI(world.id, 'Coastal Duchy');
    setDraftModal({ type: 'kingdom', item: draft });
  };

  // AI City Generator
  const handleGenerateCityAI = async () => {
    if (!world) return;
    deductCredits(1, 'AI City Generation');
    const draft = await AIWorldEngine.generateCityAI(world.id, 'Oakhaven Port');
    setDraftModal({ type: 'city', item: draft });
  };

  // AI Quests Generator
  const handleGenerateQuestsAI = async () => {
    if (!world) return;
    deductCredits(2, 'AI Quest Batch Generation');
    const batch = await AIWorldEngine.generateQuestsAI(world.id, world.name);
    if (batch.length > 0) {
      const q = batch[0] as Quest;
      q.id = `q_${Date.now().toString(36)}`;
      await WorldService.saveQuest(q);
      loadWorldData();
    }
  };

  const handleSaveDraft = async () => {
    if (!draftModal || !world) return;
    const { type, item } = draftModal;
    item.id = `${type}_${Date.now().toString(36)}`;
    item.worldId = world.id;

    if (type === 'character') await WorldService.saveCharacter(item as WorldCharacter);
    else if (type === 'kingdom') await WorldService.saveKingdom(item as WorldKingdom);
    else if (type === 'city') await WorldService.saveCity(item as WorldCity);

    setDraftModal(null);
    loadWorldData();
  };

  if (loading || !world) {
    return (
      <div className="min-h-screen bg-[#0b0d11] text-slate-100 flex flex-col justify-between">
        <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
        <div className="max-w-xl mx-auto w-full p-12 text-center">
          <Compass className="w-10 h-10 text-amber-400 mx-auto animate-spin" />
          <p className="font-cinzel text-amber-300 mt-4">Loading Fantasy World Archive...</p>
        </div>
        <Footer onNavigateCreate={onNavigateCreate} />
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'maps', label: 'Maps', icon: Compass },
    { id: 'kingdoms', label: `Kingdoms (${kingdoms.length})`, icon: Crown },
    { id: 'cities', label: `Cities (${cities.length})`, icon: Building },
    { id: 'locations', label: `Locations (${locations.length})`, icon: MapPin },
    { id: 'factions', label: `Factions (${factions.length})`, icon: Shield },
    { id: 'characters', label: `Characters (${characters.length})`, icon: Users },
    { id: 'creatures', label: `Creatures (${creatures.length})`, icon: Skull },
    { id: 'timeline', label: `Timeline (${timeline.length})`, icon: History },
    { id: 'quests', label: `Quests (${quests.length})`, icon: Scroll },
    { id: 'lore', label: 'Lore Archive', icon: BookOpen }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 space-y-3">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">ACTIVE WORLD</span>
            <h2 className="font-cinzel font-bold text-xl text-slate-100">{world.name}</h2>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {world.style}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsWorldLiked(!isWorldLiked)}
                  className={`p-1.5 rounded-lg border text-xs ${isWorldLiked ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isWorldLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                </button>
                <button
                  onClick={() => setShowSaveColModal(true)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="glass-panel p-2 rounded-2xl border border-slate-800 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === item.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-amber-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              );
            })}
          </nav>

          {/* AI Quick Generator Shortcuts */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-300 font-cinzel block">AI Tools & Generators</span>
            <button
              onClick={() => {
                const dummyMap: any = { cities: cities as any, kingdoms: kingdoms as any };
                const issues = AIWorldAgent.checkWorldConsistency({ world, kingdoms, cities }, dummyMap);
                setShowConsistencyModal(issues);
              }}
              className="w-full py-2 bg-[#121620] hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Audit Consistency
            </button>
            <button
              onClick={() => setShowNamingModal(true)}
              className="w-full py-2 bg-[#121620] hover:bg-slate-800 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" /> Name Generator
            </button>
            <button
              onClick={handleGenerateCharacterAI}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" /> + Character (1 Cr)
            </button>
            <button
              onClick={handleGenerateCityAI}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Building className="w-3.5 h-3.5 text-sky-400" /> + City (1 Cr)
            </button>
            <button
              onClick={handleGenerateQuestsAI}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Scroll className="w-3.5 h-3.5 text-purple-400" /> + Quests (2 Cr)
            </button>

            <button
              onClick={() => setShowWorldbookModal(true)}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md mt-2"
            >
              <BookOpen className="w-3.5 h-3.5" /> Export Worldbook PDF
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-8 min-w-0">
          {/* Top Search Bar & AI Command Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 space-y-3">
            <form onSubmit={handleAskAI} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Sparkles className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Ask your world... (e.g. 'Who controls Silverkeep Citadel?')"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
                />
              </div>
              <button
                type="submit"
                disabled={isAskingAI || !aiQuestion.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Ask AI
              </button>
            </form>

            {aiAnswer && (
              <div className="p-3.5 bg-slate-950 border border-amber-500/30 rounded-xl text-xs text-amber-200 leading-relaxed font-serif">
                ✨ {aiAnswer}
              </div>
            )}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* World Cover Artwork Card */}
              <div className="glass-panel rounded-3xl border border-amber-500/25 overflow-hidden space-y-0">
                <div className="h-64 relative overflow-hidden bg-slate-950 flex items-center justify-center">
                  <img
                    src={world.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop'}
                    alt={world.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d11] via-slate-950/40 to-transparent" />

                  <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 z-10">
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded uppercase border border-amber-500/30">
                        {world.style} Worldbook
                      </span>
                      <h2 className="font-cinzel font-bold text-3xl text-slate-100 drop-shadow-md">{world.name}</h2>
                    </div>

                    {/* Artwork Controls */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setShowWorldCoverGen(true)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Generate Cover with AI
                      </button>
                      <button
                        onClick={() => setShowWorldCoverPicker(true)}
                        className="px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5"
                      >
                        <Image className="w-3.5 h-3.5 text-amber-400" /> Choose from Library
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-2 bg-[#121620]">
                  <p className="text-xs text-slate-300 leading-relaxed font-serif">{world.description}</p>
                </div>
              </div>

              {/* Major Kingdoms Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-cinzel font-bold text-lg text-slate-100 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" /> Kingdoms
                  </h3>
                  <button onClick={handleGenerateKingdomAI} className="text-xs text-amber-400 hover:underline font-semibold">
                    + Generate Kingdom AI
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {kingdoms.map((k) => (
                    <div key={k.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-cinzel font-bold text-base text-amber-200">{k.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">{k.government}</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{k.description}</p>
                      <div className="text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800">
                        Ruler: <strong className="text-slate-200">{k.ruler}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Characters & Factions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Important Characters */}
                <div className="space-y-4">
                  <h3 className="font-cinzel font-bold text-lg text-slate-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" /> Key Characters
                  </h3>
                  <div className="space-y-3">
                    {characters.map((ch) => (
                      <div key={ch.id} className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-cinzel font-bold text-sm text-slate-100">{ch.name}</h4>
                          <span className="text-[10px] font-mono text-amber-400">{ch.role}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{ch.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quests Overview */}
                <div className="space-y-4">
                  <h3 className="font-cinzel font-bold text-lg text-slate-100 flex items-center gap-2">
                    <Scroll className="w-5 h-5 text-purple-400" /> Active Quests
                  </h3>
                  <div className="space-y-3">
                    {quests.map((q) => (
                      <div key={q.id} className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-cinzel font-bold text-sm text-slate-100">{q.title}</h4>
                          <span className="text-[10px] font-mono text-emerald-400">{q.difficulty}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{q.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KINGDOMS TAB */}
          {activeTab === 'kingdoms' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-cinzel font-bold text-xl text-slate-100">Kingdoms of {world.name}</h3>
                <button onClick={handleGenerateKingdomAI} className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                  + Generate Kingdom AI
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {kingdoms.map((k) => (
                  <div key={k.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="font-cinzel font-bold text-lg text-amber-200">{k.name}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{k.description}</p>
                    <div className="space-y-1 text-xs text-slate-400 font-mono pt-2 border-t border-slate-800">
                      <div>Ruler: <strong className="text-slate-200">{k.ruler}</strong></div>
                      <div>Culture: <span className="text-slate-300">{k.culture}</span></div>
                      <div>Military: <span className="text-slate-300">{k.militaryStrength}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CITIES TAB */}
          {activeTab === 'cities' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-cinzel font-bold text-xl text-slate-100">Cities & Settlements</h3>
                <button onClick={handleGenerateCityAI} className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                  + Generate City AI
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {cities.map((c) => (
                  <div key={c.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-cinzel font-bold text-lg text-slate-100">{c.name}</h4>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{c.cityType}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{c.description}</p>
                    <div className="text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                      Population: <strong className="text-amber-300">{c.population.toLocaleString()}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHARACTERS TAB */}
          {activeTab === 'characters' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-cinzel font-bold text-xl text-slate-100">Characters & Figures</h3>
                <button onClick={handleGenerateCharacterAI} className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                  + Generate Character AI
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {characters.map((ch) => (
                  <div key={ch.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-cinzel font-bold text-lg text-amber-200">{ch.name}</h4>
                        <p className="text-[11px] font-mono text-slate-400">{ch.title}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300">{ch.role}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{ch.description}</p>
                    <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                      <div>Goals: <span className="text-slate-300">{ch.goals}</span></div>
                      <div>Personality: <span className="text-slate-300">{ch.personality}</span></div>
                    </div>

                    {/* Phase 9 AI Character Visual Gallery */}
                    <div className="pt-2 border-t border-slate-800">
                      <EntityVisualGallery entityId={ch.id} entityType="character" entityData={ch} worldId={world.id} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CREATURES TAB */}
          {activeTab === 'creatures' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-cinzel font-bold text-xl text-slate-100">Fantasy Creatures & Bestiary</h3>
                <button onClick={() => setShowCreatureModal(true)} className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                  + Create Creature AI
                </button>
              </div>

              {creatures.length === 0 ? (
                <div className="glass-panel p-12 text-center text-slate-400 font-cinzel rounded-2xl border border-slate-800">
                  No creatures generated yet in this bestiary.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {creatures.map((crt) => (
                    <div key={crt.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                      {crt.imageUrl && (
                        <img src={crt.imageUrl} alt={crt.name} className="w-full h-48 object-cover rounded-xl border border-amber-500/20" />
                      )}
                      <div className="flex justify-between items-start">
                        <h4 className="font-cinzel font-bold text-lg text-amber-200">{crt.name}</h4>
                        <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">{crt.type}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{crt.description}</p>
                      <div className="text-xs text-slate-400 font-mono pt-2 border-t border-slate-800">
                        Habitat: <span className="text-slate-200">{crt.habitat}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="font-cinzel font-bold text-xl text-slate-100">World History Timeline</h3>

              <div className="space-y-4 border-l-2 border-amber-500/30 pl-6 ml-2">
                {timeline.map((tl) => (
                  <div key={tl.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1 relative">
                    <div className="absolute -left-[31px] top-6 w-3 h-3 rounded-full bg-amber-400 border-2 border-[#0b0d11]" />
                    <span className="text-xs font-mono font-bold text-amber-300">{tl.yearDate}</span>
                    <h4 className="font-cinzel font-bold text-base text-slate-100">{tl.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{tl.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTS TAB */}
          {activeTab === 'quests' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-cinzel font-bold text-xl text-slate-100">Quests & Adventures</h3>
                <button onClick={handleGenerateQuestsAI} className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                  + Generate Quests Batch
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {quests.map((q) => (
                  <div key={q.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-cinzel font-bold text-lg text-slate-100">{q.title}</h4>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">{q.questType}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{q.description}</p>
                    <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800 font-mono">
                      <div>Rewards: <span className="text-emerald-400">{q.rewards}</span></div>
                      <div>Consequences: <span className="text-rose-300">{q.consequences}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* AI Draft Confirmation Modal */}
      {draftModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-cinzel font-bold text-lg text-amber-200">
              Review AI Generated {draftModal.type.toUpperCase()}
            </h3>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-300">Name</label>
              <input
                type="text"
                value={draftModal.item.name}
                onChange={(e) => setDraftModal({ ...draftModal, item: { ...draftModal.item, name: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-bold"
              />

              <label className="font-semibold text-slate-300 block pt-1">Description</label>
              <textarea
                value={draftModal.item.description}
                onChange={(e) => setDraftModal({ ...draftModal, item: { ...draftModal.item, description: e.target.value } })}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDraftModal(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl">
                Cancel
              </button>
              <button onClick={handleSaveDraft} className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                Confirm & Save to World
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 7: Global AI Command Bar (Ctrl+K) */}
      {showAICommandBar && (
        <AICommandBarModal
          map={{ width: 1200, height: 800, cities: cities as any, kingdoms: kingdoms as any, rivers: [], mountains: [], pointsOfInterest: [], labels: [] } as any}
          worldData={{ world, kingdoms, cities, characters, factions }}
          onClose={() => setShowAICommandBar(false)}
          onApplyActionPlan={() => setShowAICommandBar(false)}
        />
      )}

      {/* World Consistency Audit Modal */}
      {showConsistencyModal && (
        <ConsistencyCheckerModal
          issues={showConsistencyModal}
          onClose={() => setShowConsistencyModal(null)}
        />
      )}

      {/* Naming Wizard Modal */}
      {showNamingModal && (
        <NamingAssistantModal
          onClose={() => setShowNamingModal(false)}
        />
      )}

      {/* Save to Collection Modal */}
      {showSaveColModal && (
        <SaveToCollectionModal
          worldId={world.id}
          onClose={() => setShowSaveColModal(false)}
        />
      )}

      {/* Phase 9: Creature Generator Modal */}
      {showCreatureModal && (
        <CreatureGeneratorModal
          worldId={world.id}
          onClose={() => setShowCreatureModal(false)}
          onCreatureCreated={(crt) => setCreatures((prev) => [...prev, crt])}
        />
      )}

      {/* Phase 9: Worldbook Export PDF Modal */}
      {showWorldbookModal && (
        <WorldbookExportModal
          world={world}
          kingdoms={kingdoms}
          cities={cities}
          characters={characters}
          creatures={creatures}
          onClose={() => setShowWorldbookModal(false)}
        />
      )}

      {/* Phase 22 AI Image Generation Modal */}
      {showWorldCoverGen && (
        <ImageGenerationModal
          isOpen={showWorldCoverGen}
          onClose={() => setShowWorldCoverGen(false)}
          entityType="world"
          entityId={world.id}
          entityName={world.name}
          usageType="cover"
          onAssetAttached={async (asset) => {
            setWorld({ ...world, coverImage: asset.url });
            await WorldService.saveWorld({ ...world, coverImage: asset.url });
          }}
        />
      )}

      {/* Phase 22 Image Asset Picker Modal */}
      {showWorldCoverPicker && (
        <ImageAssetPicker
          isOpen={showWorldCoverPicker}
          onClose={() => setShowWorldCoverPicker(false)}
          title={`Select Cover Artwork for ${world.name}`}
          entityType="world"
          entityId={world.id}
          entityName={world.name}
          usageType="cover"
          onSelectAsset={async (asset) => {
            setWorld({ ...world, coverImage: asset.url });
            await ImageStudioService.attachAssetToEntity(asset.id, 'user_current', 'world', world.id, world.name, 'cover');
            await WorldService.saveWorld({ ...world, coverImage: asset.url });
          }}
          onRemoveArtwork={async () => {
            setWorld({ ...world, coverImage: undefined });
            await ImageStudioService.removeEntityArtwork('world', world.id, 'cover');
            await WorldService.saveWorld({ ...world, coverImage: undefined });
          }}
        />
      )}

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
