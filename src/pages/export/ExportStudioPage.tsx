import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import {
  Download,
  BookOpen,
  Compass,
  Shield,
  Palette,
  Check,
  Grid,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import type {
  ExportType,
  ExportFormat,
  PrintSize,
  PrintOrientation,
  TemplateStyle,
  CoverConfig,
  ExportSelectionConfig,
  CampaignEdition
} from '../../types/exportStudio';
import { ExportStudioService } from '../../lib/export/exportStudioService';
import { WorldService } from '../../lib/supabase/worldService';
import type { World } from '../../types/world';
import { useAuth } from '../../lib/supabase/authStore';
import { useSubscription } from '../../lib/supabase/subscriptionStore';
import { ExportPreviewCanvas } from '../../components/export/ExportPreviewCanvas';
import { CoverDesignerPanel } from '../../components/export/CoverDesignerPanel';
import { TiledMapExportModal } from '../../components/export/TiledMapExportModal';

interface ExportStudioPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

export const ExportStudioPage: React.FC<ExportStudioPageProps> = ({
  onNavigateCreate,
  onNavigateHome
}) => {
  const { user } = useAuth();
  const { deductCredits, creditsRemaining } = useSubscription();
  const userId = user?.id || 'user_current';

  const [worlds, setWorlds] = useState<World[]>([]);
  const [selectedWorldId, setSelectedWorldId] = useState<string>('');
  const [exportType, setExportType] = useState<ExportType>('worldbook');
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [printSize, setPrintSize] = useState<PrintSize>('A4');
  const [orientation, setOrientation] = useState<PrintOrientation>('auto');
  const [templateStyle, setTemplateStyle] = useState<TemplateStyle>('classic-fantasy');
  const [campaignEdition, setCampaignEdition] = useState<CampaignEdition>('player_edition');

  const [coverConfig, setCoverConfig] = useState<CoverConfig>({
    title: 'Chronicles of the Realm',
    subtitle: 'A Complete World Compendium',
    author: 'Master Cartographer',
    fontCategory: 'fantasy-serif',
    accentColor: '#f59e0b'
  });

  const [selections, setSelections] = useState<ExportSelectionConfig>({
    includeOverview: true,
    includeMainMap: true,
    includeRegions: true,
    includeKingdoms: true,
    includeCities: true,
    includeLocations: true,
    includeFactions: true,
    includeCharacters: true,
    includeTimeline: true,
    includeLore: true,
    includeQuests: true,
    includeLegend: true,
    includeCompass: true
  });

  const [loading, setLoading] = useState(false);
  const [showTiledModal, setShowTiledModal] = useState(false);

  useEffect(() => {
    async function loadWorlds() {
      const list = await WorldService.getUserWorlds(userId);
      setWorlds(list);
      if (list[0]) {
        setSelectedWorldId(list[0].id);
        setCoverConfig((prev) => ({ ...prev, title: list[0].name }));
      }
    }
    loadWorlds();
  }, [userId]);

  const cost = ExportStudioService.getCreditCost(exportType, format);

  const handleGenerateExport = async () => {
    if (creditsRemaining < cost) {
      alert(`Insufficient Credits. This export requires ${cost} credits.`);
      return;
    }

    setLoading(true);
    deductCredits(cost, `Professional Export (${exportType})`);

    const selectedWorld = worlds.find((w) => w.id === selectedWorldId);

    const job = await ExportStudioService.processExportJob(
      userId,
      exportType,
      coverConfig.title || selectedWorld?.name || 'Fantasy World',
      format,
      templateStyle,
      printSize,
      orientation,
      selectedWorld
    );

    setLoading(false);
    window.location.pathname = '/exports';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title Bar */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h1 className="font-cinzel font-bold text-2xl text-slate-100">Professional Export Studio</h1>
            </div>
            <p className="text-xs text-slate-400">Compile maps, worldbooks, campaign guides, and print packages.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.location.pathname = '/exports')}
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-amber-400" /> View Export History
            </button>
            <button
              onClick={handleGenerateExport}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? 'Compiling Document...' : `Generate Export (${cost} Cr)`}</span>
            </button>
          </div>
        </div>

        {/* 3-Column Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Content Selection (3 cols) */}
          <div className="lg:col-span-3 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 text-xs max-h-[700px] overflow-y-auto">
            <h4 className="font-cinzel font-bold text-sm text-slate-100">1. Content & Target</h4>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Select World</label>
              <select
                value={selectedWorldId}
                onChange={(e) => {
                  setSelectedWorldId(e.target.value);
                  const w = worlds.find((item) => item.id === e.target.value);
                  if (w) setCoverConfig((prev) => ({ ...prev, title: w.name }));
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100"
              >
                {worlds.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Export Document Type</label>
              <div className="space-y-1">
                {[
                  { id: 'map', label: 'Single Map' },
                  { id: 'worldbook', label: 'Worldbook' },
                  { id: 'campaign_book', label: 'Campaign Book' },
                  { id: 'character_guide', label: 'Character Guide' },
                  { id: 'kingdom_guide', label: 'Kingdom Guide' },
                  { id: 'map_pack', label: 'Map Pack (ZIP)' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setExportType(t.id as any)}
                    className={`w-full text-left p-2 rounded-lg text-xs font-semibold transition-all ${
                      exportType === t.id ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Edition Toggle */}
            {exportType === 'campaign_book' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="font-semibold text-amber-300 block">Campaign Edition</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCampaignEdition('player_edition')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold ${
                      campaignEdition === 'player_edition' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Player Safe
                  </button>
                  <button
                    onClick={() => setCampaignEdition('gm_edition')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold ${
                      campaignEdition === 'gm_edition' ? 'bg-rose-600 text-slate-100' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    GM Only
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CENTER: Live Print Preview Canvas (5 cols) */}
          <div className="lg:col-span-5 h-[580px]">
            <ExportPreviewCanvas
              exportType={exportType}
              printSize={printSize}
              orientation={orientation}
              templateStyle={templateStyle}
              coverConfig={coverConfig}
              selections={selections}
              title={coverConfig.title}
            />
          </div>

          {/* RIGHT: Design & Print Settings (4 cols) */}
          <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-slate-800 space-y-5 text-xs max-h-[700px] overflow-y-auto">
            <h4 className="font-cinzel font-bold text-sm text-slate-100">2. Print & Design Settings</h4>

            {/* Print Size & Orientation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Paper Size</label>
                <select
                  value={printSize}
                  onChange={(e) => setPrintSize(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100"
                >
                  <option value="A4">A4 Standard</option>
                  <option value="A3">A3 Large</option>
                  <option value="A2">A2 Poster</option>
                  <option value="Letter">US Letter</option>
                  <option value="Legal">US Legal</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100"
                >
                  <option value="auto">Auto Aspect</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>

            {/* Template Style */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">Document Theme Preset</label>
              <div className="grid grid-cols-2 gap-2">
                {(['classic-fantasy', 'dark-fantasy', 'medieval-chronicle', 'explorers-journal'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTemplateStyle(st)}
                    className={`py-2 px-2.5 rounded-xl border text-center capitalize text-[11px] font-semibold transition-all ${
                      templateStyle === st ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {st.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Designer Controls */}
            <CoverDesignerPanel coverConfig={coverConfig} onChange={(cfg) => setCoverConfig(cfg)} />

            {/* Special Tile Map Button */}
            {exportType === 'map' && (
              <button
                onClick={() => setShowTiledModal(true)}
                className="w-full py-2.5 bg-slate-900 border border-slate-800 text-amber-300 font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Grid className="w-4 h-4 text-amber-400" /> Export Multi-Page Tiled Map Grid
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Tiled Map Export Modal */}
      {showTiledModal && (
        <TiledMapExportModal
          mapName={coverConfig.title}
          onClose={() => setShowTiledModal(false)}
          onExportComplete={() => (window.location.pathname = '/exports')}
        />
      )}

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
