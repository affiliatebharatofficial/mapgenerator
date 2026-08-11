import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import {
  Shield,
  Compass,
  Scroll,
  Users,
  MapPin,
  Play,
  BookOpen,
  Eye,
  Plus,
  EyeOff,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { CampaignService } from '../../lib/supabase/campaignService';
import { WorldService } from '../../lib/supabase/worldService';
import type {
  Campaign,
  Adventure,
  Scene,
  Session,
  PlayerCharacter,
  CampaignNPC,
  Encounter,
  Handout,
  CampaignMarker,
  CampaignJournalEntry
} from '../../types/campaign';
import type { World } from '../../types/world';
import { ActiveSessionWorkspace } from '../../components/campaign/ActiveSessionWorkspace';
import { EncounterGeneratorModal } from '../../components/campaign/EncounterGeneratorModal';
import { TravelPlannerModal } from '../../components/campaign/TravelPlannerModal';
import { MapCanvas } from '../../components/map/MapCanvas';
import { useMapTransform } from '../../hooks/useMapTransform';

interface CampaignDashboardPageProps {
  campaignId: string;
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

export const CampaignDashboardPage: React.FC<CampaignDashboardPageProps> = ({
  campaignId,
  onNavigateCreate,
  onNavigateHome
}) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'map' | 'adventures' | 'session' | 'characters' | 'npcs' | 'encounters' | 'handouts' | 'journal'
  >('overview');

  // Sub-entity states
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [playerChars, setPlayerChars] = useState<PlayerCharacter[]>([]);
  const [npcs, setNpcs] = useState<CampaignNPC[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [handouts, setHandouts] = useState<Handout[]>([]);
  const [markers, setMarkers] = useState<CampaignMarker[]>([]);
  const [journals, setJournals] = useState<CampaignJournalEntry[]>([]);

  // Active Session Runner state
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [activeScenes, setActiveScenes] = useState<Scene[]>([]);

  // Modals
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [showTravelModal, setShowTravelModal] = useState(false);

  const transformHook = useMapTransform(1200, 800);

  const loadData = async () => {
    setLoading(true);
    const cmp = CampaignService.getCampaignById(campaignId);
    if (cmp) {
      setCampaign(cmp);
      const wrld = await WorldService.getWorldById(cmp.worldId);
      if (wrld) setWorld(wrld);

      const advs = CampaignService.getAdventures(cmp.id);
      const sess = CampaignService.getSessions(cmp.id);
      const pcs = CampaignService.getPlayerCharacters(cmp.id);
      const npcList = CampaignService.getCampaignNPCs(cmp.id);
      const encs = CampaignService.getEncounters(cmp.id);
      const hnd = CampaignService.getHandouts(cmp.id);
      const mrk = CampaignService.getCampaignMarkers(cmp.id);
      const jrn = CampaignService.getJournals(cmp.id);

      setAdventures(advs);
      setSessions(sess);
      setPlayerChars(pcs);
      setNpcs(npcList);
      setEncounters(encs);
      setHandouts(hnd);
      setMarkers(mrk);
      setJournals(jrn);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [campaignId]);

  const handleStartSession = () => {
    if (!campaign) return;
    const activeAdv = adventures[0];
    const scenes = activeAdv ? CampaignService.getScenes(activeAdv.id) : [];

    const newSession = CampaignService.saveSession({
      campaignId: campaign.id,
      adventureId: activeAdv?.id,
      sessionNumber: sessions.length + 1,
      title: `Session ${sessions.length + 1}: ${activeAdv ? activeAdv.title : 'Uncharted Waters'}`,
      date: new Date().toLocaleDateString(),
      status: 'Active',
      privateNotes: '',
      publicNotes: '',
      elapsedTimeSeconds: 0
    });

    setActiveSession(newSession);
    setActiveScenes(scenes);
    setActiveTab('session');
  };

  if (loading || !campaign) {
    return (
      <div className="min-h-screen bg-[#0b0d11] text-slate-100 flex flex-col justify-between">
        <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
        <div className="p-12 text-center text-amber-300 font-cinzel">Loading Campaign Dashboard...</div>
        <Footer onNavigateCreate={onNavigateCreate} />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'map', label: 'Campaign Map', icon: Compass },
    { id: 'adventures', label: `Adventures (${adventures.length})`, icon: Scroll },
    { id: 'session', label: 'Active Session', icon: Play },
    { id: 'characters', label: `Party (${playerChars.length})`, icon: Users },
    { id: 'npcs', label: `NPCs (${npcs.length})`, icon: Users },
    { id: 'encounters', label: `Encounters (${encounters.length})`, icon: Shield },
    { id: 'handouts', label: `Handouts (${handouts.length})`, icon: BookOpen },
    { id: 'journal', label: `Journal (${journals.length})`, icon: BookOpen }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Campaign Header Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                {campaign.genre}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                World: {world?.name || 'Realm'}
              </span>
            </div>
            <h1 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-100">{campaign.name}</h1>
            <p className="text-xs text-slate-300 max-w-xl">{campaign.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartSession}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <Play className="w-4 h-4" /> Start Live Session
            </button>
            <button
              onClick={() => setShowEncounterModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 font-semibold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-amber-400" /> + Encounter AI
            </button>
            <button
              onClick={() => setShowTravelModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-300 font-semibold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-sky-400" /> Plan Journey AI
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
          {tabs.map((tb) => {
            const Icon = tb.icon;
            return (
              <button
                key={tb.id}
                onClick={() => setActiveTab(tb.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-2 transition-all ${
                  activeTab === tb.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 text-amber-400" />
                <span>{tb.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-cinzel font-bold text-lg text-slate-100">Campaign Objective & Synopsis</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{campaign.description}</p>
              </div>

              {/* Recent Adventures */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-cinzel font-bold text-lg text-slate-100">Active Adventures</h3>
                <div className="space-y-3">
                  {adventures.map((adv) => (
                    <div key={adv.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-cinzel font-bold text-amber-300 text-sm">{adv.title}</h4>
                        <span className="text-[10px] font-mono text-emerald-400">{adv.status}</span>
                      </div>
                      <p className="text-xs text-slate-400">{adv.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Overview Stats */}
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-cinzel font-bold text-sm text-slate-100 uppercase tracking-wider">Party Stats</h3>
                <div className="font-mono text-xs space-y-2 text-slate-400">
                  <div>Game System: <span className="text-slate-200">{campaign.system}</span></div>
                  <div>Sessions Played: <span className="text-amber-300">{sessions.length}</span></div>
                  <div>Active Players: <span className="text-slate-200">{playerChars.length}</span></div>
                  <div>Party Location: <span className="text-emerald-400">{campaign.partyLocation || 'Silverkeep Harbor'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAMPAIGN MAP & FOG OF WAR */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-amber-300">Campaign Map Overlay (Party Location: {campaign.partyLocation || 'Silverkeep'})</span>
              <span className="text-slate-400">World geography remains preserved in canonical state.</span>
            </div>
            <div className="h-[600px] w-full rounded-3xl border border-amber-500/20 overflow-hidden relative bg-[#090b0e]">
              <MapCanvas
                map={{ width: 1200, height: 800, cities: [], kingdoms: [], rivers: [], mountains: [], pointsOfInterest: [], labels: [] } as any}
                layers={{ terrain: true, mountains: true, forests: true, rivers: true, roads: true, cities: true, kingdoms: true, labels: true, grid: false, compass: true, legend: true }}
                selectedObject={null}
                onSelectObject={() => {}}
                onUpdateObjectPosition={() => {}}
                transform={{ x: transformHook.transform.x, y: transformHook.transform.y, k: transformHook.transform.k }}
                onZoomIn={transformHook.zoomIn}
                onZoomOut={transformHook.zoomOut}
                onReset={transformHook.resetView}
                onFit={transformHook.fitToScreen}
                onWheel={transformHook.handleWheel}
                onMouseDown={transformHook.handleMouseDown}
                onMouseMove={transformHook.handleMouseMove}
                onMouseUp={transformHook.handleMouseUp}
                svgRef={React.createRef()}
              />
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVE LIVE SESSION WORKSPACE */}
        {activeTab === 'session' && (
          <div>
            {activeSession ? (
              <ActiveSessionWorkspace
                session={activeSession}
                scenes={activeScenes}
                npcs={npcs}
                encounters={encounters}
                onCloseSession={() => setActiveTab('overview')}
              />
            ) : (
              <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto my-8">
                <Play className="w-12 h-12 text-amber-400 mx-auto" />
                <h3 className="font-cinzel font-bold text-xl text-slate-100">No Active Live Session</h3>
                <p className="text-xs text-slate-400">Start a live session workspace to run tabletop scenes and auto-generate AI recaps.</p>
                <button onClick={handleStartSession} className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                  Start Live Session
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADVENTURES */}
        {activeTab === 'adventures' && (
          <div className="space-y-4">
            <h3 className="font-cinzel font-bold text-xl text-slate-100">Campaign Adventures</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {adventures.map((adv) => (
                <div key={adv.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-cinzel font-bold text-lg text-amber-200">{adv.title}</h4>
                  <p className="text-xs text-slate-300">{adv.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CHARACTERS */}
        {activeTab === 'characters' && (
          <div className="space-y-4">
            <h3 className="font-cinzel font-bold text-xl text-slate-100">Player Characters ({playerChars.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {playerChars.map((pc) => (
                <div key={pc.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-cinzel font-bold text-lg text-amber-200">{pc.name}</h4>
                  <p className="text-xs font-mono text-slate-400">{pc.race} {pc.characterClass} (Lvl {pc.level})</p>
                  <p className="text-xs text-slate-300">{pc.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: NPCS */}
        {activeTab === 'npcs' && (
          <div className="space-y-4">
            <h3 className="font-cinzel font-bold text-xl text-slate-100">Campaign NPCs ({npcs.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {npcs.map((npc) => (
                <div key={npc.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-cinzel font-bold text-lg text-amber-200">{npc.name}</h4>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{npc.relationship}</span>
                  <p className="text-xs text-slate-300">{npc.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ENCOUNTERS */}
        {activeTab === 'encounters' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-cinzel font-bold text-xl text-slate-100">Encounters ({encounters.length})</h3>
              <button onClick={() => setShowEncounterModal(true)} className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                + Generate Encounter AI
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {encounters.map((enc) => (
                <div key={enc.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-cinzel font-bold text-lg text-amber-200">{enc.title}</h4>
                    <span className="text-xs font-mono text-rose-400">{enc.difficulty}</span>
                  </div>
                  <p className="text-xs text-slate-300">{enc.description}</p>
                  {enc.tactics && <p className="text-xs text-slate-400 font-mono pt-2 border-t border-slate-800">Tactics: {enc.tactics}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* AI Encounter Generator Modal */}
      {showEncounterModal && (
        <EncounterGeneratorModal
          campaignId={campaign.id}
          campaignName={campaign.name}
          onClose={() => setShowEncounterModal(false)}
          onEncounterCreated={(enc) => setEncounters((prev) => [...prev, enc])}
        />
      )}

      {/* AI Travel Planner Modal */}
      {showTravelModal && (
        <TravelPlannerModal
          worldName={world?.name || 'Realm'}
          onClose={() => setShowTravelModal(false)}
        />
      )}

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
