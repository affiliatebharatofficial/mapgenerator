import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toolbar } from '../components/generator/Toolbar';
import { GeneratorControls } from '../components/generator/GeneratorControls';
import { ToolsSidebar } from '../components/editor/ToolsSidebar';
import { MapCanvas } from '../components/map/MapCanvas';
import { LayerManager } from '../components/editor/LayerManager';
import { PropertyInspector } from '../components/editor/PropertyInspector';
import { Minimap } from '../components/editor/Minimap';
import { FindOnMapModal } from '../components/editor/FindOnMapModal';
import { ContextMenu } from '../components/editor/ContextMenu';
import type { FantasyMap, GeneratorConfig, MapLayers, SelectedObjectRef, Position, MapStyle, MapType } from '../types/map';
import type { ActiveTool, TerrainBrushType } from '../types/editorTools';
import { generateFantasyMap } from '../lib/map-engine/generator';
import { loadMapFromLocalStorage, saveMapToLocalStorage, clearMapFromLocalStorage } from '../lib/storage/mapStorage';
import { useMapHistory } from '../hooks/useMapHistory';
import { useMapTransform } from '../hooks/useMapTransform';
import { SaveMapModal } from '../components/editor/SaveMapModal';
import { GuestMigrationModal } from '../components/editor/GuestMigrationModal';
import { ShareModal } from '../components/social/ShareModal';
import { ExportModal } from '../components/export/ExportModal';
import { GenerationLimitModal } from '../components/monetization/GenerationLimitModal';
import { StorageLimitModal } from '../components/monetization/StorageLimitModal';
import { UpgradePromptModal } from '../components/monetization/UpgradePromptModal';
import { useAuth } from '../lib/supabase/authStore';
import { useSubscription } from '../lib/supabase/subscriptionStore';
import { MapService, type CloudMapRecord } from '../lib/supabase/mapService';
import { PLANS } from '../config/plans';
import { Layers, Sliders, Settings } from 'lucide-react';
import { AICommandBarModal } from '../components/ai/AICommandBarModal';
import { AIAssistantPanel } from '../components/ai/AIAssistantPanel';
import { AgentActionPreviewModal } from '../components/ai/AgentActionPreviewModal';
import { ConsistencyCheckerModal } from '../components/ai/ConsistencyCheckerModal';
import { NamingAssistantModal } from '../components/ai/NamingAssistantModal';
import { ArtisticMapRenderModal } from '../components/visuals/ArtisticMapRenderModal';
import { ImageAssetPicker } from '../components/visuals/ImageAssetPicker';
import { ImageStudioService } from '../lib/ai/imageStudioService';
import { GeographicSettingsModal } from '../components/editor/GeographicSettingsModal';
import { PartialRegenModal } from '../components/editor/PartialRegenModal';
import { MapHealthModal } from '../components/editor/MapHealthModal';
import { StylePickerModal } from '../components/cartography/StylePickerModal';
import { CartographyLayersDrawer } from '../components/cartography/CartographyLayersDrawer';
import { PrecisionToolbar } from '../components/editor/PrecisionToolbar';
import { CommandPaletteModal } from '../components/editor/CommandPaletteModal';
import type { SelectionFilter, TerrainSculptMode, AlignmentMode } from '../types/editorPrecision';
import { SelectionEngine } from '../lib/editor/selectionEngine';
import { CARTOGRAPHY_PRESETS } from '../lib/cartography/cartographyEngine';
import type { CartographicThemeConfig, CartographyStyleId } from '../types/cartography';
import { regeneratePartialSystem } from '../lib/map-engine/generator';
import type { AdvancedGeographyConfig, FeatureLocks } from '../types/mapGeography';
import { AIWorldAgent } from '../lib/ai/aiWorldAgent';
import type { AgentResponse, AgentAction, ConsistencyIssue } from '../types/agentTypes';

interface CreatePageProps {
  onBackToHome: () => void;
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
  onNavigatePricing: () => void;
  onNavigateDashboard: () => void;
  editingMapId?: string | null;
  presetConfig?: { seed: number; type: MapType; style: MapStyle } | null;
}

export const CreatePage: React.FC<CreatePageProps> = ({
  onBackToHome,
  onNavigateLogin,
  onNavigateSignup,
  onNavigatePricing,
  onNavigateDashboard,
  editingMapId,
  presetConfig
}) => {
  const { user, profile, isAuthenticated, hasGuestMap, migrateGuestMapToAccount, dismissGuestMapMigration } = useAuth();
  const { currentPlan, creditsRemaining, creditsUsed, creditsTotal, deductCredits } = useSubscription();

  const planConfig = PLANS[currentPlan] || PLANS.free;

  // Active Tool & Editor Modes
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [activeTerrainBrush, setActiveTerrainBrush] = useState<TerrainBrushType>('plains');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Generator Config State
  const [config, setConfig] = useState<GeneratorConfig>({
    seed: presetConfig?.seed || 123456,
    type: presetConfig?.type || 'continent',
    style: presetConfig?.style || 'parchment',
    width: 1200,
    height: 800,
    mountainDensity: 7,
    forestDensity: 6,
    riverDensity: 5,
    settlementCount: 10,
    kingdomCount: 4,
    showDeserts: true,
    showSwamps: true,
    showSnow: true
  });

  // Initial Map
  const [initialMap] = useState<FantasyMap>(() => {
    if (presetConfig) {
      return generateFantasyMap({
        seed: presetConfig.seed,
        type: presetConfig.type,
        style: presetConfig.style,
        width: 1200,
        height: 800,
        mountainDensity: 7,
        forestDensity: 6,
        riverDensity: 5,
        settlementCount: 10,
        kingdomCount: 4,
        showDeserts: true,
        showSwamps: true,
        showSnow: true
      });
    }
    const saved = loadMapFromLocalStorage();
    if (saved) return saved;
    return generateFantasyMap({
      seed: 123456,
      type: 'continent',
      style: 'parchment',
      width: 1200,
      height: 800,
      mountainDensity: 7,
      forestDensity: 6,
      riverDensity: 5,
      settlementCount: 10,
      kingdomCount: 4,
      showDeserts: true,
      showSwamps: true,
      showSnow: true
    });
  });

  const { currentMap, pushState, undo, redo, canUndo, canRedo, resetHistory } = useMapHistory(initialMap);
  const transformHook = useMapTransform(currentMap.width, currentMap.height);

  // Layers State
  const [layers, setLayers] = useState<MapLayers>({
    terrain: true,
    mountains: true,
    forests: true,
    rivers: true,
    roads: true,
    cities: true,
    kingdoms: true,
    labels: true,
    grid: false,
    compass: true,
    legend: true
  });

  // Editor States
  const [selectedObject, setSelectedObject] = useState<SelectedObjectRef | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'layers' | 'properties'>('layers');
  const [mobileSheet, setMobileSheet] = useState<'none' | 'generator' | 'layers'>('none');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Modals & Context Popup
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFindModal, setShowFindModal] = useState(false);
  const [showGenLimitModal, setShowGenLimitModal] = useState(false);
  const [showStorageLimitModal, setShowStorageLimitModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number; obj: SelectedObjectRef } | null>(null);
  const [currentCloudRecord, setCurrentCloudRecord] = useState<CloudMapRecord | null>(null);

  // Phase 7 & 9 AI States
  const [showAICommandBar, setShowAICommandBar] = useState(false);
  const [showAIAssistantPanel, setShowAIAssistantPanel] = useState(false);
  const [showAgentPreviewModal, setShowAgentPreviewModal] = useState<AgentResponse | null>(null);
  const [showConsistencyModal, setShowConsistencyModal] = useState<ConsistencyIssue[] | null>(null);
  const [showNamingModal, setShowNamingModal] = useState(false);
  const [showArtisticRenderModal, setShowArtisticRenderModal] = useState(false);
  const [showGeoModal, setShowGeoModal] = useState<boolean>(false);
  const [showPartialRegenModal, setShowPartialRegenModal] = useState<boolean>(false);
  const [showMapHealthModal, setShowMapHealthModal] = useState<boolean>(false);
  const [showStylePickerModal, setShowStylePickerModal] = useState<boolean>(false);
  const [showCartographyLayersDrawer, setShowCartographyLayersDrawer] = useState<boolean>(false);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [showImageAssetPicker, setShowImageAssetPicker] = useState<boolean>(false);

  const [selectionFilter, setSelectionFilter] = useState<SelectionFilter>('all');
  const [sculptMode, setSculptMode] = useState<TerrainSculptMode>('raise');
  const [multiSelectedIds, setMultiSelectedIds] = useState<string[]>([]);

  const handleAlignSelected = (mode: AlignmentMode) => {
    if (multiSelectedIds.length < 2) return;
    const cities = currentMap.cities.filter((c) => multiSelectedIds.includes(c.id));
    if (cities.length >= 2) {
      const aligned = SelectionEngine.alignPositions(cities, mode);
      const updatedCities = currentMap.cities.map((c) => {
        const found = aligned.find((a) => a.id === c.id);
        return found ? { ...c, x: found.x, y: found.y } : c;
      });
      pushState({ ...currentMap, cities: updatedCities });
    }
  };

  const [cartographyTheme, setCartographyTheme] = useState<CartographicThemeConfig>(
    () => CARTOGRAPHY_PRESETS[currentMap.style as CartographyStyleId] || CARTOGRAPHY_PRESETS.parchment
  );
  const [layerOpacities, setLayerOpacities] = useState<Record<string, number>>({});

  const handleApplyCartographyTheme = (theme: CartographicThemeConfig) => {
    setCartographyTheme(theme);
    setConfig((prev) => ({ ...prev, style: theme.id as MapStyle }));
  };

  const handleChangeLayerOpacity = (layerKey: string, opacity: number) => {
    setLayerOpacities((prev) => ({ ...prev, [layerKey]: opacity }));
  };

  const [advancedGeoConfig, setAdvancedGeoConfig] = useState<AdvancedGeographyConfig>({
    seed: currentMap.seed || 123456,
    profile: 'balanced-fantasy',
    realismLevel: 75,
    landmassAmount: 6,
    mountainDensity: config.mountainDensity || 6,
    riverDensity: config.riverDensity || 5,
    forestDensity: config.forestDensity || 5,
    settlementDensity: 5,
    rainfallLevel: 5,
    temperatureLevel: 5,
    seaLevel: 0.35,
    rainShadowEffect: true,
    fantasyOverrides: {
      magicalRivers: false,
      floatingIslands: false,
      impossiblePeaks: false
    }
  });

  const handleApplyGeoConfig = (newConfig: AdvancedGeographyConfig) => {
    setAdvancedGeoConfig(newConfig);
    const newMap = generateFantasyMap({
      ...config,
      seed: newConfig.seed,
      mountainDensity: newConfig.mountainDensity,
      riverDensity: newConfig.riverDensity,
      settlementCount: newConfig.settlementDensity * 2
    });
    pushState(newMap);
  };

  const handlePartialRegen = (targetSystem: 'terrain' | 'rivers' | 'biomes' | 'roads' | 'borders', locks: FeatureLocks) => {
    const newMap = regeneratePartialSystem(currentMap, targetSystem, locks, advancedGeoConfig);
    pushState(newMap);
  };

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Apply AI Agent Action Plan in 1 Single Transaction (Atomic Ctrl+Z)
  const handleApplyAgentActionPlan = useCallback(
    (actions: AgentAction[]) => {
      if (!actions || actions.length === 0) return;
      const updatedMap = AIWorldAgent.executeActionPlan(currentMap, actions);
      pushState(updatedMap);
      setShowAgentPreviewModal(null);
      setShowAICommandBar(false);
    },
    [currentMap, pushState]
  );

  // Delete Selected Object
  const handleDeleteSelected = useCallback(() => {
    if (!selectedObject) return;
    const { type, id } = selectedObject;

    if (type === 'city') {
      const cities = currentMap.cities.filter((c) => c.id !== id);
      pushState({ ...currentMap, cities });
    } else if (type === 'kingdom') {
      const kingdoms = currentMap.kingdoms.filter((k) => k.id !== id);
      pushState({ ...currentMap, kingdoms });
    } else if (type === 'label') {
      const labels = currentMap.labels.filter((l) => l.id !== id);
      pushState({ ...currentMap, labels });
    } else if (type === 'poi') {
      const pointsOfInterest = (currentMap.pointsOfInterest || []).filter((p) => p.id !== id);
      pushState({ ...currentMap, pointsOfInterest });
    } else if (type === 'mountain') {
      const mountains = currentMap.mountains.filter((m: any, idx) => (m.id || `m_${idx}`) !== id);
      pushState({ ...currentMap, mountains });
    } else if (type === 'forest') {
      const forests = currentMap.forests.filter((f: any, idx) => (f.id || `f_${idx}`) !== id);
      pushState({ ...currentMap, forests });
    } else if (type === 'user_artwork') {
      const userArtworks = (currentMap.userArtworks || []).filter((art) => art.id !== id);
      pushState({ ...currentMap, userArtworks });
    }

    setSelectedObject(null);
  }, [selectedObject, currentMap, pushState]);

  // Duplicate Selected Map Object (Ctrl+D)
  const handleDuplicateSelected = useCallback(() => {
    if (!selectedObject) return;
    const { type, id } = selectedObject;

    if (type === 'city') {
      const orig = currentMap.cities.find((c) => c.id === id);
      if (orig) {
        const dup = { ...orig, id: `c_${Date.now().toString(36)}`, name: `${orig.name} Copy`, x: orig.x + 25, y: orig.y + 25 };
        pushState({ ...currentMap, cities: [...currentMap.cities, dup] });
      }
    } else if (type === 'label') {
      const orig = currentMap.labels.find((l) => l.id === id);
      if (orig) {
        const dup = { ...orig, id: `l_${Date.now().toString(36)}`, text: `${orig.text} Copy`, x: orig.x + 20, y: orig.y + 20 };
        pushState({ ...currentMap, labels: [...currentMap.labels, dup] });
      }
    }
  }, [selectedObject, currentMap, pushState]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();

      if (key === 'v') setActiveTool('select');
      else if (key === 'h') setActiveTool('pan');
      else if (key === 'b') setActiveTool('terrain_brush');
      else if (key === 'e') setActiveTool('eraser');
      else if (key === 'r') setActiveTool('river');
      else if (key === 'l') setActiveTool('label');
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObject) handleDeleteSelected();
      } else if (e.ctrlKey || e.metaKey) {
        if (key === 'z') {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
        } else if (key === 's') {
          e.preventDefault();
          setShowSaveModal(true);
        } else if (key === 'd') {
          e.preventDefault();
          handleDuplicateSelected();
        } else if (key === 'f') {
          e.preventDefault();
          setShowFindModal(true);
        } else if (key === 'k') {
          e.preventDefault();
          setShowAICommandBar((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObject, undo, redo, handleDeleteSelected, handleDuplicateSelected]);

  const loadedMapIdRef = useRef<string | null>(null);

  // Load Cloud Map when editingMapId is passed (Only once per map ID)
  useEffect(() => {
    if (editingMapId && loadedMapIdRef.current !== editingMapId) {
      loadedMapIdRef.current = editingMapId;
      MapService.getMapBySlug(editingMapId, user?.id).then((record) => {
        if (record) {
          resetHistory(record.map_data);
          setConfig((prev) => ({
            ...prev,
            seed: record.seed,
            type: record.map_type,
            style: record.map_style
          }));
        }
      });
    }
  }, [editingMapId, user?.id, resetHistory]);

  // Load Preset Map when presetConfig is passed or changed
  const lastPresetRef = useRef<string | null>(null);
  useEffect(() => {
    if (presetConfig) {
      const presetKey = `${presetConfig.seed}_${presetConfig.type}_${presetConfig.style}`;
      if (lastPresetRef.current !== presetKey) {
        lastPresetRef.current = presetKey;
        const newMap = generateFantasyMap({
          seed: presetConfig.seed,
          type: presetConfig.type,
          style: presetConfig.style,
          width: 1200,
          height: 800,
          mountainDensity: 7,
          forestDensity: 6,
          riverDensity: 5,
          settlementCount: 10,
          kingdomCount: 4,
          showDeserts: true,
          showSwamps: true,
          showSnow: true
        });
        resetHistory(newMap);
        setConfig((prev) => ({
          ...prev,
          seed: presetConfig.seed,
          type: presetConfig.type,
          style: presetConfig.style
        }));
        setSelectedObject(null);
      }
    }
  }, [presetConfig, resetHistory]);

  // Autosave to LocalStorage
  useEffect(() => {
    saveMapToLocalStorage(currentMap);
    setSaveStatus('unsaved');
  }, [currentMap]);

  // Cloud Save Action with Storage Limit Check
  const handleConfirmCloudSave = async (options: { title: string; description?: string; is_public: boolean }) => {
    if (isAuthenticated && user) {
      const existingMaps = await MapService.getUserMaps(user.id);
      if (existingMaps.length >= planConfig.maxSavedMaps && !existingMaps.some((m) => m.id === currentMap.id)) {
        setShowSaveModal(false);
        setShowStorageLimitModal(true);
        return;
      }
    }

    setShowSaveModal(false);
    setSaveStatus('saving');

    if (isAuthenticated && user) {
      const record = await MapService.saveMap(user.id, currentMap, {
        title: options.title,
        description: options.description,
        is_public: options.is_public,
        authorName: profile?.display_name,
        authorUsername: profile?.username,
        authorAvatar: profile?.avatar_url
      });
      setCurrentCloudRecord(record);
    }

    setTimeout(() => {
      setSaveStatus('saved');
    }, 800);
  };

  // AI Generation Credits Check
  const handleRequireAICredits = (): boolean => {
    if (creditsRemaining < 1) {
      setShowGenLimitModal(true);
      return false;
    }
    const success = deductCredits(1, 'AI World Map Generation');
    if (!success) {
      setShowGenLimitModal(true);
      return false;
    }
    return true;
  };

  // Change Config State without auto-resetting procedural map
  const handleChangeConfig = useCallback(
    (newConfig: GeneratorConfig) => {
      setConfig(newConfig);
      // If visual style theme changed, apply style in-place without resetting terrain/objects
      if (newConfig.style !== currentMap.style) {
        pushState({ ...currentMap, style: newConfig.style });
      }
    },
    [currentMap, pushState]
  );

  // Generate Map Action (Picks brand new seed)
  const handleGenerate = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 899999) + 100000;
    const newConfig = { ...config, seed: newSeed };
    setConfig(newConfig);
    const newMap = generateFantasyMap(newConfig);
    pushState(newMap);
    setSelectedObject(null);
  }, [config, pushState]);

  // Randomize Seed Action
  const handleRandomSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 899999) + 100000;
    const newConfig = { ...config, seed: newSeed };
    setConfig(newConfig);
    const newMap = generateFantasyMap(newConfig);
    pushState(newMap);
    setSelectedObject(null);
  }, [config, pushState]);

  // Layer Visibility Toggle
  const handleToggleLayer = useCallback((layerKey: keyof MapLayers) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  }, []);

  // Update Object Position (Drag & Drop)
  const handleUpdateObjectPosition = useCallback(
    (type: string, id: string, pos: Position) => {
      if (type === 'city') {
        const updatedCities = currentMap.cities.map((c) => (c.id === id ? { ...c, x: pos.x, y: pos.y } : c));
        pushState({ ...currentMap, cities: updatedCities, updatedAt: new Date().toISOString() });
      } else if (type === 'label') {
        const updatedLabels = currentMap.labels.map((l) => (l.id === id ? { ...l, x: pos.x, y: pos.y } : l));
        pushState({ ...currentMap, labels: updatedLabels, updatedAt: new Date().toISOString() });
      } else if (type === 'poi') {
        const updatedPOIs = (currentMap.pointsOfInterest || []).map((p) => (p.id === id ? { ...p, x: pos.x, y: pos.y } : p));
        pushState({ ...currentMap, pointsOfInterest: updatedPOIs, updatedAt: new Date().toISOString() });
      } else if (type === 'mountain') {
        const updatedMountains = currentMap.mountains.map((m: any, idx) => ((m.id || `m_${idx}`) === id ? { ...m, x: pos.x, y: pos.y } : m));
        pushState({ ...currentMap, mountains: updatedMountains, updatedAt: new Date().toISOString() });
      } else if (type === 'forest') {
        const updatedForests = currentMap.forests.map((f: any, idx) => ((f.id || `f_${idx}`) === id ? { ...f, x: pos.x, y: pos.y } : f));
        pushState({ ...currentMap, forests: updatedForests, updatedAt: new Date().toISOString() });
      } else if (type === 'user_artwork') {
        const updatedArtworks = (currentMap.userArtworks || []).map((art) => (art.id === id ? { ...art, x: pos.x, y: pos.y } : art));
        pushState({ ...currentMap, userArtworks: updatedArtworks, updatedAt: new Date().toISOString() });
      }
    },
    [currentMap, pushState]
  );

  // Paint Custom Terrain Cell
  const handlePaintTerrainCell = useCallback(
    (x: number, y: number, type: TerrainBrushType) => {
      const cells = currentMap.terrainCells || [];
      const updatedCells = [...cells, { x, y, type }];
      pushState({ ...currentMap, terrainCells: updatedCells });
    },
    [currentMap, pushState]
  );

  // Canvas Tool Click Placement Handler
  const handleCanvasClick = useCallback(
    (pos: Position) => {
      const { x, y } = pos;

      if (activeTool === 'city') {
        const newCity = {
          id: `city_${Date.now().toString(36)}`,
          name: `New Settlement`,
          x,
          y,
          type: 'town' as const,
          population: 2500
        };
        pushState({ ...currentMap, cities: [...currentMap.cities, newCity] });
        setSelectedObject({ type: 'city', id: newCity.id });
        setRightPanelTab('properties');
      } else if (activeTool === 'location' || activeTool === 'poi_placer') {
        const newPOI = {
          id: `poi_${Date.now().toString(36)}`,
          name: `Ancient Ruins`,
          type: 'ruins' as const,
          x,
          y,
          description: 'A newly discovered landmark.'
        };
        pushState({ ...currentMap, pointsOfInterest: [...(currentMap.pointsOfInterest || []), newPOI] });
        setSelectedObject({ type: 'poi', id: newPOI.id });
        setRightPanelTab('properties');
      } else if (activeTool === 'label') {
        const newLabel = {
          id: `label_${Date.now().toString(36)}`,
          text: `New Region`,
          x,
          y,
          fontSize: 16,
          rotation: 0
        };
        pushState({ ...currentMap, labels: [...currentMap.labels, newLabel] });
        setSelectedObject({ type: 'label', id: newLabel.id });
        setRightPanelTab('properties');
      } else if (activeTool === 'mountain') {
        pushState({ ...currentMap, mountains: [...currentMap.mountains, { x, y }] });
      } else if (activeTool === 'forest') {
        const newForest = {
          id: `forest_${Date.now().toString(36)}`,
          x,
          y,
          radius: 25,
          count: 10
        };
        pushState({ ...currentMap, forests: [...currentMap.forests, newForest] });
      } else if (activeTool === 'river') {
        const rivers = currentMap.rivers || [];
        const lastRiver = rivers[rivers.length - 1];
        if (lastRiver && (lastRiver.points || lastRiver.path || []).length < 5) {
          const updatedRivers = rivers.map((r, i) =>
            i === rivers.length - 1
              ? { ...r, points: [...(r.points || r.path || []), { x, y }] }
              : r
          );
          pushState({ ...currentMap, rivers: updatedRivers });
        } else {
          const newRiver = {
            id: `river_${Date.now().toString(36)}`,
            name: `New River`,
            points: [{ x, y }],
            width: 4
          };
          pushState({ ...currentMap, rivers: [...rivers, newRiver] });
        }
      } else if (activeTool === 'road') {
        const roads = currentMap.roads || [];
        const lastRoad = roads[roads.length - 1];
        if (lastRoad && (lastRoad.points || lastRoad.path || []).length < 5) {
          const updatedRoads = roads.map((rd, i) =>
            i === roads.length - 1
              ? { ...rd, points: [...(rd.points || rd.path || []), { x, y }] }
              : rd
          );
          pushState({ ...currentMap, roads: updatedRoads });
        } else {
          const newRoad = {
            id: `road_${Date.now().toString(36)}`,
            name: `New Road`,
            points: [{ x, y }],
            width: 2
          };
          pushState({ ...currentMap, roads: [...roads, newRoad] });
        }
      } else if (activeTool === 'eraser') {
        const city = currentMap.cities.find((c) => Math.hypot(c.x - x, c.y - y) < 20);
        if (city) {
          pushState({ ...currentMap, cities: currentMap.cities.filter((c) => c.id !== city.id) });
          setSelectedObject(null);
          return;
        }
        const poi = currentMap.pointsOfInterest?.find((p) => Math.hypot(p.x - x, p.y - y) < 20);
        if (poi) {
          pushState({ ...currentMap, pointsOfInterest: currentMap.pointsOfInterest.filter((p) => p.id !== poi.id) });
          setSelectedObject(null);
          return;
        }
        const label = currentMap.labels.find((l) => Math.hypot(l.x - x, l.y - y) < 25);
        if (label) {
          pushState({ ...currentMap, labels: currentMap.labels.filter((l) => l.id !== label.id) });
          setSelectedObject(null);
          return;
        }
        const mountainIdx = currentMap.mountains.findIndex((m) => Math.hypot(m.x - x, m.y - y) < 25);
        if (mountainIdx !== -1) {
          pushState({ ...currentMap, mountains: currentMap.mountains.filter((_, i) => i !== mountainIdx) });
          setSelectedObject(null);
          return;
        }
        const forestIdx = currentMap.forests.findIndex((f: any) => Math.hypot(f.x - x, f.y - y) < Math.max(20, f.radius || 20));
        if (forestIdx !== -1) {
          pushState({ ...currentMap, forests: currentMap.forests.filter((_, i) => i !== forestIdx) });
          setSelectedObject(null);
          return;
        }
      }
    },
    [activeTool, currentMap, pushState]
  );

  // Property Inspector Updates
  const handleUpdateCity = useCallback(
    (id: string, updates: Partial<{ name: string; type: any; population: number; artworkUrl?: string }>) => {
      const updatedCities = currentMap.cities.map((c) => (c.id === id ? { ...c, ...updates } : c));
      pushState({ ...currentMap, cities: updatedCities });
    },
    [currentMap, pushState]
  );

  const handleUpdateKingdom = useCallback(
    (id: string, updates: Partial<{ name: string; color: string; ruler: string; artworkUrl?: string }>) => {
      const updatedKingdoms = currentMap.kingdoms.map((k) => (k.id === id ? { ...k, ...updates } : k));
      pushState({ ...currentMap, kingdoms: updatedKingdoms });
    },
    [currentMap, pushState]
  );

  const handleUpdateLabel = useCallback(
    (id: string, updates: Partial<{ text: string; fontSize: number; rotation: number; artworkUrl?: string }>) => {
      const updatedLabels = currentMap.labels.map((l) => (l.id === id ? { ...l, ...updates } : l));
      pushState({ ...currentMap, labels: updatedLabels });
    },
    [currentMap, pushState]
  );

  const handleUpdatePOI = useCallback(
    (id: string, updates: Partial<{ name: string; description: string; type?: any; artworkUrl?: string }>) => {
      const updatedPOIs = currentMap.pointsOfInterest.map((p) => (p.id === id ? { ...p, ...updates } : p));
      pushState({ ...currentMap, pointsOfInterest: updatedPOIs });
    },
    [currentMap, pushState]
  );

  // Attach AI Image Studio Artwork to Map or Selected Object
  const handleAttachArtworkAsset = useCallback(
    async (asset: any) => {
      setShowImageAssetPicker(false);

      if (selectedObject) {
        const { type, id } = selectedObject;
        if (type === 'city') {
          handleUpdateCity(id, { artworkUrl: asset.url });
        } else if (type === 'poi') {
          handleUpdatePOI(id, { artworkUrl: asset.url });
        } else if (type === 'kingdom') {
          handleUpdateKingdom(id, { artworkUrl: asset.url });
        } else if (type === 'label') {
          handleUpdateLabel(id, { artworkUrl: asset.url });
        }
      }

      // Add to map userArtworks overlay list so artwork image is rendered directly on map canvas
      const newOverlay = {
        id: `art_${Date.now().toString(36)}`,
        url: asset.url,
        name: asset.name || asset.prompt || 'AI Artwork',
        x: selectedObject ? 500 : 600,
        y: selectedObject ? 350 : 400,
        width: 180,
        height: 135
      };

      const currentArtworks = currentMap.userArtworks || [];
      pushState({
        ...currentMap,
        userArtworks: [...currentArtworks, newOverlay]
      });

      setSelectedObject({ type: 'user_artwork', id: newOverlay.id });
      setRightPanelTab('properties');

      await ImageStudioService.attachAssetToEntity(
        asset.id,
        asset.userId || 'user_current',
        'map',
        currentMap.id,
        currentMap.name,
        'artwork'
      );
    },
    [selectedObject, handleUpdateCity, handleUpdatePOI, handleUpdateKingdom, handleUpdateLabel, currentMap, pushState]
  );

  // Rename Map Title
  const handleRenameMap = useCallback(
    (newName: string) => {
      pushState({ ...currentMap, name: newName });
    },
    [currentMap, pushState]
  );

  // Clear Map Action
  const handleConfirmClear = useCallback(() => {
    clearMapFromLocalStorage();
    const freshMap = generateFantasyMap({
      seed: 123456,
      type: 'continent',
      style: 'parchment',
      width: 1200,
      height: 800,
      mountainDensity: 7,
      forestDensity: 6,
      riverDensity: 5,
      settlementCount: 10,
      kingdomCount: 4,
      showDeserts: true,
      showSwamps: true,
      showSnow: true
    });
    resetHistory(freshMap);
    setSelectedObject(null);
    setShowClearModal(false);
  }, [resetHistory]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0c10] text-slate-100 overflow-hidden font-sans select-none">
      {/* Workspace Top Toolbar */}
      <Toolbar
        map={currentMap}
        canUndo={canUndo}
        canRedo={canRedo}
        saveStatus={saveStatus}
        snapToGrid={snapToGrid}
        onUndo={undo}
        onRedo={redo}
        onRandomSeed={handleRandomSeed}
        onSave={() => setShowSaveModal(true)}
        onExport={() => setShowExportModal(true)}
        onClear={() => setShowClearModal(true)}
        onBackToHome={onBackToHome}
        onRenameMap={handleRenameMap}
        onShare={currentCloudRecord ? () => setShowShareModal(true) : undefined}
        onOpenFindOnMap={() => setShowFindModal(true)}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        isFullscreen={isFullscreen}
        onOpenStylePicker={() => setShowStylePickerModal(true)}
        onOpenCartographyLayers={() => setShowCartographyLayersDrawer(!showCartographyLayersDrawer)}
        onTogglePreviewMode={() => setIsPreviewMode(!isPreviewMode)}
        isPreviewMode={isPreviewMode}
      />

      {/* Phase 15 Precision Controls Sub-Bar */}
      <PrecisionToolbar
        selectedCount={multiSelectedIds.length > 0 ? multiSelectedIds.length : selectedObject ? 1 : 0}
        selectionFilter={selectionFilter}
        sculptMode={sculptMode}
        onFilterChange={setSelectionFilter}
        onSculptModeChange={setSculptMode}
        onAlign={handleAlignSelected}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={() => {
          if (selectedObject?.type === 'city') {
            const city = currentMap.cities.find((c) => c.id === selectedObject.id);
            if (city) {
              const dup = { ...city, id: `city_dup_${Date.now()}`, name: `${city.name} II`, x: city.x + 30, y: city.y + 30 };
              pushState({ ...currentMap, cities: [...currentMap.cities, dup] });
            }
          }
        }}
        onToggleLockSelected={() => {
          if (selectedObject?.id) {
            setAdvancedGeoConfig((prev) => ({
              ...prev,
              fantasyOverrides: { ...prev.fantasyOverrides }
            }));
          }
        }}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Cartography Tools Drawer Sidebar */}
        <ToolsSidebar
          activeTool={activeTool}
          activeTerrainBrush={activeTerrainBrush}
          snapToGrid={snapToGrid}
          onSelectTool={setActiveTool}
          onSelectTerrainBrush={setActiveTerrainBrush}
          onToggleSnapToGrid={() => setSnapToGrid(!snapToGrid)}
          onToggleAIAssistant={() => setShowAIAssistantPanel(!showAIAssistantPanel)}
          isAIAssistantOpen={showAIAssistantPanel}
          onOpenImageStudioPicker={() => setShowImageAssetPicker(true)}
        />

        {/* Desktop Left Generator Sidebar */}
        {!isFullscreen && (
          <div className="hidden lg:block h-full z-20">
            <GeneratorControls
              config={config}
              onChangeConfig={handleChangeConfig}
              onGenerate={handleGenerate}
              onSelectLockedStyle={(styleId) => setShowUpgradeModal(`Theme Style: ${styleId}`)}
              onRequireAICredits={handleRequireAICredits}
              onOpenGeoModal={() => setShowGeoModal(true)}
              onOpenPartialRegen={() => setShowPartialRegenModal(true)}
              onOpenMapHealth={() => setShowMapHealthModal(true)}
            />
          </div>
        )}

        {/* Center Interactive Map Canvas Area */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#090b0e] flex items-center justify-center">
          <MapCanvas
            map={currentMap}
            layers={layers}
            opacities={layerOpacities}
            cartographyTheme={cartographyTheme}
            activeTool={activeTool}
            activeTerrainBrush={activeTerrainBrush}
            selectedObject={selectedObject}
            onSelectObject={(obj) => {
              setSelectedObject(obj);
              if (obj) setRightPanelTab('properties');
            }}
            onUpdateObjectPosition={handleUpdateObjectPosition}
            onPaintTerrainCell={handlePaintTerrainCell}
            onCanvasClick={handleCanvasClick}
            onContextMenuAction={(e, obj) => setContextMenuPos({ x: e.clientX, y: e.clientY, obj })}
            transform={transformHook.transform}
            onZoomIn={transformHook.zoomIn}
            onZoomOut={transformHook.zoomOut}
            onReset={transformHook.resetView}
            onFit={transformHook.fitToScreen}
            onWheel={transformHook.handleWheel}
            onMouseDown={transformHook.handleMouseDown}
            onMouseMove={transformHook.handleMouseMove}
            onMouseUp={transformHook.handleMouseUp}
            svgRef={svgRef}
            isPreviewMode={isPreviewMode}
          />

          {/* Bottom Right Interactive Minimap */}
          <div className="absolute bottom-4 right-4 z-30 hidden sm:block">
            <Minimap
              map={currentMap}
              transform={transformHook.transform}
              onNavigateTransform={() => {
                transformHook.zoomIn();
              }}
            />
          </div>

          {/* Mobile Floating Bottom Action Bar */}
          <div className="lg:hidden absolute bottom-4 left-4 right-4 z-30 flex items-center justify-center gap-2">
            <button
              onClick={() => setMobileSheet(mobileSheet === 'generator' ? 'none' : 'generator')}
              className="flex-1 py-2.5 px-4 bg-[#121620]/90 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl shadow-xl flex items-center justify-center gap-1.5"
            >
              <Sliders className="w-4 h-4" />
              <span>Generator</span>
            </button>

            <button
              onClick={() => setMobileSheet(mobileSheet === 'layers' ? 'none' : 'layers')}
              className="flex-1 py-2.5 px-4 bg-[#121620]/90 backdrop-blur-md border border-slate-700 text-slate-200 text-xs font-bold rounded-xl shadow-xl flex items-center justify-center gap-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>Layers & Object</span>
            </button>
          </div>
        </main>

        {/* Phase 7: Right Side AI World Agent Assistant Panel */}
        {showAIAssistantPanel ? (
          <AIAssistantPanel
            map={currentMap}
            selectedObject={selectedObject}
            onClose={() => setShowAIAssistantPanel(false)}
            onApplyActionPlan={(res) => {
              if (res.actions && res.actions.length > 0) {
                setShowAgentPreviewModal(res);
              }
            }}
            onOpenConsistencyChecker={() => {
              const issues = AIWorldAgent.checkWorldConsistency({}, currentMap);
              setShowConsistencyModal(issues);
            }}
            onOpenNamingAssistant={() => setShowNamingModal(true)}
          />
        ) : (
          /* Desktop Right Inspector / Layer Panel */
          !isFullscreen && (
            <aside className="hidden lg:flex flex-col w-80 bg-[#121620]/95 backdrop-blur-md border-l border-amber-500/15 h-full z-20">
              <div className="p-3 border-b border-slate-800 bg-[#0e1118]">
                <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setRightPanelTab('layers')}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      rightPanelTab === 'layers'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Layers</span>
                  </button>

                  <button
                    onClick={() => setRightPanelTab('properties')}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      rightPanelTab === 'properties'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Properties</span>
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-6">
                {rightPanelTab === 'layers' ? (
                  <LayerManager layers={layers} onToggleLayer={handleToggleLayer} />
                ) : (
                  <PropertyInspector
                    map={currentMap}
                    selectedObject={selectedObject}
                    onUpdateCity={handleUpdateCity}
                    onUpdateKingdom={handleUpdateKingdom}
                    onUpdateLabel={handleUpdateLabel}
                    onUpdatePOI={handleUpdatePOI}
                    onDeleteSelected={handleDeleteSelected}
                    onOpenImageStudioPicker={() => setShowImageAssetPicker(true)}
                  />
                )}
              </div>
            </aside>
          )
        )}
      </div>

      {/* Context Menu Popup */}
      {contextMenuPos && (
        <ContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          selectedObject={contextMenuPos.obj}
          onClose={() => setContextMenuPos(null)}
          onDuplicate={handleDuplicateSelected}
          onDelete={handleDeleteSelected}
          onLockToggle={() => {}}
        />
      )}

      {/* Find On Map Search Modal */}
      {showFindModal && (
        <FindOnMapModal
          map={currentMap}
          onClose={() => setShowFindModal(false)}
          onSelectAndFocusObject={(ref) => {
            setSelectedObject(ref);
            setRightPanelTab('properties');
          }}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          svgElement={svgRef.current}
          mapName={currentMap.name}
          onClose={() => setShowExportModal(false)}
          onNavigatePricing={onNavigatePricing}
        />
      )}

      {/* Save Map Modal */}
      {showSaveModal && (
        <SaveMapModal
          map={currentMap}
          onSaveConfirmed={handleConfirmCloudSave}
          onClose={() => setShowSaveModal(false)}
          onNavigateLogin={onNavigateLogin}
          onNavigateSignup={onNavigateSignup}
        />
      )}

      {/* Guest Map Migration Modal */}
      {hasGuestMap && (
        <GuestMigrationModal
          map={currentMap}
          onConfirmMigration={() => {
            const migrated = migrateGuestMapToAccount();
            if (migrated && user) {
              handleConfirmCloudSave({
                title: migrated.name,
                is_public: false
              });
            }
          }}
          onDismiss={dismissGuestMapMigration}
        />
      )}

      {/* Share Modal */}
      {showShareModal && currentCloudRecord && (
        <ShareModal
          mapTitle={currentCloudRecord.title}
          shareUrl={`${window.location.origin}/map/${currentCloudRecord.slug}`}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Generation Limit Modal */}
      {showGenLimitModal && (
        <GenerationLimitModal
          usedCredits={creditsUsed}
          totalCredits={creditsTotal}
          onClose={() => setShowGenLimitModal(false)}
          onNavigatePricing={onNavigatePricing}
          onContinueProcedural={handleGenerate}
        />
      )}

      {/* Storage Limit Modal */}
      {showStorageLimitModal && (
        <StorageLimitModal
          currentCount={planConfig.maxSavedMaps}
          maxCount={planConfig.maxSavedMaps}
          onClose={() => setShowStorageLimitModal(false)}
          onNavigatePricing={onNavigatePricing}
          onNavigateDashboard={onNavigateDashboard}
        />
      )}

      {/* Feature Upgrade Prompt Modal */}
      {showUpgradeModal && (
        <UpgradePromptModal
          featureName={showUpgradeModal}
          onClose={() => setShowUpgradeModal(null)}
          onNavigatePricing={onNavigatePricing}
        />
      )}

      {/* Clear Map Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-cinzel font-bold text-lg text-rose-300">Clear & Reset Map?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to reset this map? All unsaved manual object edits and label positioning will be reset to default.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold text-xs rounded-xl transition-colors"
              >
                Clear Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 7: Global AI Command Bar (Ctrl+K) */}
      {showAICommandBar && (
        <AICommandBarModal
          map={currentMap}
          selectedObject={selectedObject}
          onClose={() => setShowAICommandBar(false)}
          onApplyActionPlan={(res) => {
            if (res.actions && res.actions.length > 0) {
              setShowAgentPreviewModal(res);
            }
          }}
        />
      )}

      {/* Action Plan Preview Modal */}
      {showAgentPreviewModal && (
        <AgentActionPreviewModal
          response={showAgentPreviewModal}
          onConfirm={(enabledActions) => handleApplyAgentActionPlan(enabledActions)}
          onClose={() => setShowAgentPreviewModal(null)}
        />
      )}

      {/* Consistency Checker Audit Modal */}
      {showConsistencyModal && (
        <ConsistencyCheckerModal
          issues={showConsistencyModal}
          onClose={() => setShowConsistencyModal(null)}
        />
      )}

      {/* Naming Assistant Modal */}
      {showNamingModal && (
        <NamingAssistantModal
          onClose={() => setShowNamingModal(false)}
        />
      )}

      {/* Phase 9: Artistic Map Render Modal */}
      {showArtisticRenderModal && (
        <ArtisticMapRenderModal
          map={currentMap}
          onClose={() => setShowArtisticRenderModal(false)}
        />
      )}

      {/* Phase 13: Geographic Settings & Seed Controls Modal */}
      {showGeoModal && (
        <GeographicSettingsModal
          config={advancedGeoConfig}
          onApplyConfig={handleApplyGeoConfig}
          onClose={() => setShowGeoModal(false)}
        />
      )}

      {/* Phase 13: Partial System Regeneration Modal */}
      {showPartialRegenModal && (
        <PartialRegenModal
          map={currentMap}
          onRegenerateSystem={handlePartialRegen}
          onClose={() => setShowPartialRegenModal(false)}
        />
      )}

      {/* Phase 13: Map Health Diagnostics Modal */}
      {showMapHealthModal && (
        <MapHealthModal
          map={currentMap}
          onUpdateMap={(updated) => pushState(updated)}
          onClose={() => setShowMapHealthModal(false)}
        />
      )}

      {/* Phase 14: Style Picker & Cartography Theme Engine Modal */}
      {showStylePickerModal && (
        <StylePickerModal
          currentStyle={cartographyTheme.id}
          onApplyStyle={handleApplyCartographyTheme}
          onClose={() => setShowStylePickerModal(false)}
        />
      )}

      {/* Phase 14: Cartography Layer Opacities Drawer */}
      {showCartographyLayersDrawer && (
        <div className="fixed top-20 right-20 z-50">
          <CartographyLayersDrawer
            layers={layers}
            opacities={layerOpacities}
            onToggleLayer={(k) => setLayers((prev) => ({ ...prev, [k]: !prev[k] }))}
            onChangeOpacity={handleChangeLayerOpacity}
            onClose={() => setShowCartographyLayersDrawer(false)}
          />
        </div>
      )}

      {/* Phase 15: Power User Command Palette Modal (Ctrl+K) */}
      {showCommandPalette && (
        <CommandPaletteModal
          onSelectAction={(actId) => {
            if (actId === 'change_theme') setShowStylePickerModal(true);
            else if (actId === 'geo_settings') setShowGeoModal(true);
            else if (actId === 'map_health') setShowMapHealthModal(true);
            else if (actId === 'export_studio') window.location.pathname = '/export';
          }}
          onClose={() => setShowCommandPalette(false)}
        />
      )}

      {/* Phase 23: Image Studio Asset Integration Modal */}
      {showImageAssetPicker && (
        <ImageAssetPicker
          isOpen={showImageAssetPicker}
          entityType="map"
          entityId={currentMap.id}
          entityName={currentMap.name}
          onSelectAsset={handleAttachArtworkAsset}
          onClose={() => setShowImageAssetPicker(false)}
        />
      )}
    </div>
  );
};
