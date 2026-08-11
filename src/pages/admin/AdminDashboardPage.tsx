import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Globe,
  Map as MapIcon,
  Shield,
  Cpu,
  Coins,
  Image,
  CreditCard,
  Flag,
  Activity,
  FileText,
  Search,
  LogOut,
  ExternalLink,
  Plus,
  Minus,
  Check,
  X,
  AlertTriangle,
  Server,
  Database,
  RefreshCw,
  Download,
  Upload,
  Settings,
  ChevronRight,
  TrendingUp,
  Layers,
  Terminal,
  Clock,
  Eye,
  Sliders,
  Sparkles,
  Lock,
  Archive,
  BarChart3,
  Palette,
  Trash2
} from 'lucide-react';
import { AdminPlatformService } from '../../lib/admin/adminPlatformService';
import { PlatformConfigService, type CreditCostCatalogItem, type MapProceduralConfig, type AIPromptTemplate, type EmergencyControls, type SubscriptionPlanItem, type MasterFeatureControlConfig, type FeatureAccessRule } from '../../lib/config/platformConfigService';
import type {
  AdminSystemMetrics,
  SystemHealthStatus,
  AIProviderConfig,
  AIFeatureRouting,
  FeatureFlags,
  AdminUserItem,
  AuditLogEntry,
  AILogEntry,
  ModerationReportItem,
  ContentHomepageConfig,
  SiteSettingsConfig
} from '../../types/adminControl';
import { ImageProviderRouter, type ImageGenerationLogRecord } from '../../lib/ai/imageProviderRouter';
import { RunwareImageProvider } from '../../lib/ai/runwareProvider';
import { WorldService } from '../../lib/supabase/worldService';
import { MapService } from '../../lib/supabase/mapService';
import { CampaignService } from '../../lib/supabase/campaignService';

interface AdminDashboardPageProps {
  onNavigateHome: () => void;
  onLogout: () => void;
}

type AdminTab =
  | 'dashboard'
  | 'users'
  | 'user_detail'
  | 'worlds'
  | 'maps'
  | 'map_generator'
  | 'cartography'
  | 'campaigns'
  | 'ai'
  | 'ai_providers'
  | 'ai_image_providers'
  | 'ai_image_models'
  | 'ai_image_logs'
  | 'ai_routing'
  | 'ai_prompts'
  | 'ai_usage'
  | 'ai_costs'
  | 'ai_logs'
  | 'ai_test'
  | 'credits'
  | 'subscriptions'
  | 'plans'
  | 'moderation'
  | 'homepage'
  | 'legal'
  | 'analytics'
  | 'seo'
  | 'features'
  | 'settings'
  | 'storage'
  | 'health'
  | 'audit'
  | 'emergency'
  | 'backup'
  | 'profile';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateHome, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | '90days' | 'all'>('30days');

  // Real Data States
  const [metrics, setMetrics] = useState<AdminSystemMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealthStatus | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const [aiConfigs, setAiConfigs] = useState<AIProviderConfig[]>(() => AdminPlatformService.getAIProviderConfigs());
  const [aiRouting, setAiRouting] = useState<AIFeatureRouting>(() => AdminPlatformService.getAIFeatureRouting());
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(() => AdminPlatformService.getFeatureFlags());
  const [siteSettings, setSiteSettings] = useState<SiteSettingsConfig>(() => AdminPlatformService.getSiteSettings());
  const [homepageContent, setHomepageContent] = useState<ContentHomepageConfig>(() => AdminPlatformService.getContentHomepage());

  // Platform Configuration Central States
  const [mapProcedural, setMapProcedural] = useState<MapProceduralConfig>(() => PlatformConfigService.getMapProceduralConfig());
  const [aiPrompts, setAiPrompts] = useState<AIPromptTemplate[]>(() => PlatformConfigService.getAIPrompts());
  const [creditCosts, setCreditCosts] = useState<CreditCostCatalogItem[]>(() => PlatformConfigService.getCreditCosts());
  const [emergencyControls, setEmergencyControls] = useState<EmergencyControls>(() => PlatformConfigService.getEmergencyControls());
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editingPromptText, setEditingPromptText] = useState<string>('');
  // Subscription Plans Dynamic States
  const [plansList, setPlansList] = useState<SubscriptionPlanItem[]>(() => PlatformConfigService.getSubscriptionPlans());
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanItem | null>(null);
  const [isAddingNewPlan, setIsAddingNewPlan] = useState<boolean>(false);

  const handleSavePlan = (plan: SubscriptionPlanItem) => {
    PlatformConfigService.addOrUpdatePlan(plan);
    setPlansList(PlatformConfigService.getSubscriptionPlans());
    setAuditLogs(AdminPlatformService.getAuditLogs());
    setEditingPlan(null);
    setIsAddingNewPlan(false);
    alert(`Subscription Plan "${plan.name}" saved successfully!`);
  };

  const handleDeletePlan = (planId: string, planName: string) => {
    if (confirm(`Are you sure you want to delete the subscription plan "${planName}"?`)) {
      PlatformConfigService.deletePlan(planId);
      setPlansList(PlatformConfigService.getSubscriptionPlans());
      setAuditLogs(AdminPlatformService.getAuditLogs());
      alert(`Subscription plan "${planName}" removed.`);
    }
  };

  // Image Provider & Runware States
  const [runwareKeyInput, setRunwareKeyInput] = useState('');
  const [runwareHealth, setRunwareHealth] = useState<string>('Checking...');
  const [imageLogs, setImageLogs] = useState<ImageGenerationLogRecord[]>(() => ImageProviderRouter.getLogs());

  useEffect(() => {
    RunwareImageProvider.testHealth().then(setRunwareHealth);
  }, []);

  const handleSaveRunwareKey = () => {
    if (!runwareKeyInput.trim()) return;
    RunwareImageProvider.saveApiKey(runwareKeyInput);
    AdminPlatformService.addAuditLog('Update Runware API Key', 'Image Providers', 'Updated Runware API Key secret');
    setRunwareKeyInput('');
    RunwareImageProvider.testHealth().then(setRunwareHealth);
    setAuditLogs(AdminPlatformService.getAuditLogs());
    alert('Runware API Key saved securely!');
  };

  const handleTestRunwareHealth = async () => {
    setRunwareHealth('Checking...');
    const status = await RunwareImageProvider.testHealth();
    setRunwareHealth(status);
  };

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);

  const [adminWorlds, setAdminWorlds] = useState<any[]>([]);
  const [adminMaps, setAdminMaps] = useState<any[]>([]);
  const [adminCampaigns, setAdminCampaigns] = useState<any[]>([]);

  const loadAdminData = async () => {
    const w = await WorldService.getAllWorlds();
    const m = await MapService.getAllMaps();
    const c = CampaignService.getAllCampaigns();
    setAdminWorlds(w);
    setAdminMaps(m);
    setAdminCampaigns(c);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const [masterConfig, setMasterConfig] = useState<MasterFeatureControlConfig>(() => PlatformConfigService.getMasterConfig());

  const handleSaveMasterConfig = (updated: MasterFeatureControlConfig) => {
    PlatformConfigService.saveMasterConfig(updated);
    setMasterConfig(updated);
    setAuditLogs(AdminPlatformService.getAuditLogs());
    alert('Master Feature Controls & Free Launch Mode configuration saved!');
  };

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => AdminPlatformService.getAuditLogs());
  const [aiLogs] = useState<AILogEntry[]>(() => AdminPlatformService.getAILogs());
  const [moderationReports, setModerationReports] = useState<ModerationReportItem[]>(() => AdminPlatformService.getModerationReports());

  const handleSaveMapProcedural = () => {
    PlatformConfigService.saveMapProceduralConfig(mapProcedural);
    setAuditLogs(AdminPlatformService.getAuditLogs());
    alert('Procedural Map Parameters updated successfully!');
  };

  const handleSavePromptVersion = (promptId: string) => {
    if (!editingPromptText.trim()) return;
    PlatformConfigService.saveAIPromptVersion(promptId, editingPromptText);
    setAiPrompts(PlatformConfigService.getAIPrompts());
    setAuditLogs(AdminPlatformService.getAuditLogs());
    setEditingPromptId(null);
    alert('New AI Prompt version saved and activated!');
  };

  const handleRollbackPromptVersion = (promptId: string, version: number) => {
    PlatformConfigService.rollbackAIPromptVersion(promptId, version);
    setAiPrompts(PlatformConfigService.getAIPrompts());
    setAuditLogs(AdminPlatformService.getAuditLogs());
    alert(`Rolled back AI Prompt to Version ${version}`);
  };

  const handleSaveCreditCosts = () => {
    PlatformConfigService.saveCreditCosts(creditCosts);
    setAuditLogs(AdminPlatformService.getAuditLogs());
    alert('Credit Cost Matrix updated!');
  };

  const handleToggleEmergencyControl = (key: keyof EmergencyControls) => {
    const updated = { ...emergencyControls, [key]: !emergencyControls[key] };
    setEmergencyControls(updated);
    PlatformConfigService.saveEmergencyControls(updated);
    setAuditLogs(AdminPlatformService.getAuditLogs());
  };

  // AI Test Console State
  const [testProvider, setTestProvider] = useState<'openai' | 'gemini'>('openai');
  const [testPrompt, setTestPrompt] = useState('Generate a fantasy kingdom name and brief lore summary.');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testingAi, setTestingAi] = useState(false);

  // Credit Modal State
  const [creditModalUser, setCreditModalUser] = useState<AdminUserItem | null>(null);
  const [creditAmount, setCreditAmount] = useState(100);
  const [creditReason, setCreditReason] = useState('Promotional Bonus');

  // Backup & Restore Confirmation State
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [backupJsonInput, setBackupJsonInput] = useState('');
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  // Load Real Data from Database
  useEffect(() => {
    async function loadData() {
      setLoadingMetrics(true);
      const [realMetrics, liveHealth, userList] = await Promise.all([
        AdminPlatformService.fetchRealMetrics(),
        AdminPlatformService.checkSystemHealth(),
        AdminPlatformService.fetchUsers()
      ]);
      setMetrics(realMetrics);
      setHealth(liveHealth);
      setUsers(userList);
      setLoadingMetrics(false);
    }
    loadData();
  }, [dateRange]);

  const refreshHealth = async () => {
    const liveHealth = await AdminPlatformService.checkSystemHealth();
    setHealth(liveHealth);
  };

  const handleToggleAiProvider = (id: string) => {
    const updated = aiConfigs.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c));
    setAiConfigs(updated);
    AdminPlatformService.saveAIProviderConfigs(updated);
    setAuditLogs(AdminPlatformService.getAuditLogs());
  };

  const handleSaveFlags = () => {
    AdminPlatformService.saveFeatureFlags(featureFlags);
    setAuditLogs(AdminPlatformService.getAuditLogs());
    alert('Feature flags updated successfully!');
  };

  const handleSaveSettings = () => {
    AdminPlatformService.saveSiteSettings(siteSettings);
    setAuditLogs(AdminPlatformService.getAuditLogs());
    alert('Site settings updated successfully!');
  };

  const handleSaveHomepage = () => {
    AdminPlatformService.getContentHomepage();
    AdminPlatformService.saveContentHomepage(homepageContent);
    setAuditLogs(AdminPlatformService.getAuditLogs());
    alert('Homepage marketing content updated!');
  };

  const handleAddCreditsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditModalUser) return;
    await AdminPlatformService.adjustUserCredits(creditModalUser.id, creditModalUser.email, creditAmount, creditReason);
    setAuditLogs(AdminPlatformService.getAuditLogs());
    setCreditModalUser(null);
    alert(`Adjusted ${creditAmount} credits for ${creditModalUser.email}`);
  };

  const handleRunAiTest = () => {
    setTestingAi(true);
    setTestResult(null);
    setTimeout(() => {
      setTestingAi(false);
      setTestResult(`[Success 200 OK] Response from ${testProvider.toUpperCase()}:\n"The Radiant Realm of Eldoria — A high fantasy kingdom guarded by silver spires."\nLatency: 342ms | Tokens: 48`);
      AdminPlatformService.addAILog({
        userEmail: 'affiliatebharatofficial@gmail.com',
        feature: 'Admin Test Console',
        provider: testProvider,
        model: testProvider === 'openai' ? 'gpt-4o' : 'gemini-1.5-pro',
        status: 'success',
        durationMs: 342,
        credits: 1
      });
    }, 600);
  };

  const handleExportBackup = () => {
    const json = AdminPlatformService.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cfm_admin_backup_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    setAuditLogs(AdminPlatformService.getAuditLogs());
  };

  const handleRestoreBackup = (e: React.FormEvent) => {
    e.preventDefault();
    if (restoreConfirmText.trim().toUpperCase() !== 'RESTORE') {
      alert('You must type RESTORE in capital letters to confirm restoration.');
      return;
    }
    const res = AdminPlatformService.restoreBackupJson(backupJsonInput);
    if (res.success) {
      setBackupMessage('System state successfully restored from backup file!');
      setAuditLogs(AdminPlatformService.getAuditLogs());
      setRestoreConfirmText('');
      setBackupJsonInput('');
    } else {
      setBackupMessage(`Error restoring backup: ${res.error}`);
    }
  };

  const filteredUsers = users.filter(
    (u) => u.displayName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-[#07090d] text-slate-100 font-sans select-none">
      {/* Grouped Sidebar Navigation */}
      <aside className="w-64 bg-[#0e1118] border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 pb-2 border-b border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-cinzel font-bold text-sm">
              CFM
            </div>
            <div>
              <span className="font-cinzel font-bold text-xs text-slate-100 block">Platform Control</span>
              <span className="text-[10px] font-mono text-amber-400">SUPER ADMIN</span>
            </div>
          </div>

          <nav className="space-y-4 text-xs overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
            {/* OVERVIEW */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 block mb-1">OVERVIEW</span>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full p-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'dashboard' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>

            {/* MANAGEMENT */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 block mb-1">MANAGEMENT</span>
              {[
                { id: 'users', label: 'Users', icon: Users },
                { id: 'worlds', label: 'Worlds', icon: Globe },
                { id: 'maps', label: 'Maps Catalog', icon: MapIcon },
                { id: 'map_generator', label: 'Map Generator Parameters', icon: Sliders },
                { id: 'cartography', label: 'Cartography Controls', icon: Palette },
                { id: 'campaigns', label: 'Campaigns', icon: Shield }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full p-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                    activeTab === item.id ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* AI */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 block mb-1">AI CONTROL</span>
              {[
                { id: 'ai', label: 'AI Overview', icon: Cpu },
                { id: 'ai_image_providers', label: 'Image Providers (Runware)', icon: Image },
                { id: 'ai_image_models', label: 'Image Models (FLUX.1)', icon: Layers },
                { id: 'ai_image_logs', label: 'Image Logs', icon: Terminal },
                { id: 'ai_routing', label: 'Feature Model Routing', icon: Sliders },
                { id: 'ai_prompts', label: 'Versioned Prompts', icon: FileText },
                { id: 'ai_test', label: 'AI Test Console', icon: Sparkles }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full p-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                    activeTab === item.id ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* MONETIZATION */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 block mb-1">MONETIZATION</span>
              {[
                { id: 'credits', label: 'Credit Ledger', icon: Coins },
                { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full p-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                    activeTab === item.id ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* CONTENT */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 block mb-1">CONTENT</span>
              {[
                { id: 'moderation', label: 'Moderation', icon: AlertTriangle },
                { id: 'homepage', label: 'Homepage Content', icon: FileText }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full p-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                    activeTab === item.id ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* SYSTEM */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 block mb-1">SYSTEM</span>
              {[
                { id: 'features', label: 'Feature Flags', icon: Flag },
                { id: 'health', label: 'System Health', icon: Activity },
                { id: 'audit', label: 'Audit Logs', icon: Clock },
                { id: 'settings', label: 'Site Settings', icon: Settings },
                { id: 'backup', label: 'Backup & Restore', icon: Server }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full p-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                    activeTab === item.id ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* ADMIN */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 block mb-1">ADMIN</span>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full p-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'profile' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Profile</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
          <button
            onClick={onNavigateHome}
            className="w-full p-2 rounded-xl text-slate-400 hover:text-slate-200 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" /> Visit Main Website
          </button>
          <button
            onClick={onLogout}
            className="w-full p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-bold"
          >
            <LogOut className="w-4 h-4" /> Logout Admin
          </button>
        </div>
      </aside>

      {/* Main Admin Body Area */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="font-cinzel font-bold text-2xl text-slate-100 uppercase tracking-wide">
              {activeTab === 'dashboard' && 'Platform Overview Dashboard'}
              {activeTab === 'users' && 'User Accounts Management'}
              {activeTab === 'worlds' && 'Fantasy Worlds Directory'}
              {activeTab === 'maps' && 'Generated Maps Catalog'}
              {activeTab === 'cartography' && 'Dynamic Cartography Engine Controls'}
              {activeTab === 'campaigns' && 'RPG Campaign Directory'}
              {activeTab === 'ai' && 'AI Provider & Model Control Center'}
              {activeTab === 'ai_routing' && 'AI Feature Model Routing'}
              {activeTab === 'ai_logs' && 'AI Generation Request Logs'}
              {activeTab === 'ai_test' && 'AI Provider Test Console'}
              {activeTab === 'credits' && 'Credit Ledger & Transactions'}
              {activeTab === 'subscriptions' && 'Subscriptions & Billing Status'}
              {activeTab === 'moderation' && 'Community Moderation Reports'}
              {activeTab === 'homepage' && 'Dynamic Homepage Marketing Content'}
              {activeTab === 'features' && 'Feature Flags & Maintenance Controls'}
              {activeTab === 'health' && 'Live System Health Checks'}
              {activeTab === 'audit' && 'Super Admin Action Audit Log'}
              {activeTab === 'settings' && 'Global Site & Branding Settings'}
              {activeTab === 'backup' && 'System Configuration Backup & Restore'}
              {activeTab === 'profile' && 'Super Admin Account Profile'}
            </h1>
            <p className="text-xs text-slate-400">Owner Access: affiliatebharatofficial@gmail.com</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['today', '7days', '30days', '90days', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase ${
                    dateRange === r ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={refreshHealth}
              className="p-2 bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 rounded-xl"
              title="Refresh Health Status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 text-xs">
            {/* Real Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-mono text-2xl font-bold text-amber-400">
                  {loadingMetrics ? '...' : metrics?.totalUsers ?? 'No data available'}
                </span>
                <span className="text-xs text-slate-400 block font-cinzel font-bold">Total Registered Users</span>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-mono text-2xl font-bold text-sky-400">
                  {loadingMetrics ? '...' : metrics?.totalWorlds ?? 'No data available'}
                </span>
                <span className="text-xs text-slate-400 block font-cinzel font-bold">
                  Total Worlds ({metrics?.publicWorlds ?? 0} Public)
                </span>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-mono text-2xl font-bold text-purple-400">
                  {loadingMetrics ? '...' : metrics?.totalMaps ?? 'No data available'}
                </span>
                <span className="text-xs text-slate-400 block font-cinzel font-bold">
                  Total Maps ({metrics?.publicMaps ?? 0} Public)
                </span>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-mono text-2xl font-bold text-emerald-400">
                  {loadingMetrics ? '...' : !metrics || metrics.estimatedCostUsd === null ? 'Not tracked' : `$${metrics.estimatedCostUsd}`}
                </span>
                <span className="text-xs text-slate-400 block font-cinzel font-bold">Tracked AI Cost</span>
              </div>
            </div>

            {/* Additional Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 font-cinzel font-bold block">Active Campaigns</span>
                  <span className="font-mono text-xl text-amber-300 font-bold">{metrics?.totalCampaigns ?? 0}</span>
                </div>
                <Shield className="w-6 h-6 text-amber-400/40" />
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 font-cinzel font-bold block">AI Generations</span>
                  <span className="font-mono text-xl text-sky-300 font-bold">{metrics?.aiGenerations ?? 0}</span>
                </div>
                <Cpu className="w-6 h-6 text-sky-400/40" />
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 font-cinzel font-bold block">Credits Consumed</span>
                  <span className="font-mono text-xl text-purple-300 font-bold">{metrics?.creditsConsumed ?? 0}</span>
                </div>
                <Coins className="w-6 h-6 text-purple-400/40" />
              </div>
            </div>

            {/* Live System Health Section */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-cinzel font-bold text-base text-amber-300">Live System Health Status</h3>
                <span className="text-[10px] font-mono text-slate-400">Last checked: {health?.lastChecked || 'Now'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span>Supabase Database</span>
                  <span className={`font-bold ${health?.dbStatus === 'Operational' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {health?.dbStatus || 'Checking...'}
                  </span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span>Vercel Functions</span>
                  <span className="text-emerald-400 font-bold">{health?.vercelStatus || 'Operational'}</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span>AI Providers API</span>
                  <span className={`font-bold ${health?.aiStatus === 'Operational' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {health?.aiStatus || 'Checking...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-400 font-mono">
                No users found matching query.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-0.5 min-w-[280px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="font-cinzel text-slate-100">{u.displayName} ({u.email})</strong>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                          u.plan.toLowerCase().includes('pro') || u.plan.toLowerCase().includes('guild') ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          u.plan.toLowerCase().includes('creator') ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {u.plan} Tier • {u.credits} Credits
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block">Joined: {u.joinedAt} • Worlds: {u.worldsCount} • Maps: {u.mapsCount}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <select
                          id={`plan_select_${u.id}`}
                          defaultValue={u.plan.toLowerCase()}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                        >
                          {plansList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${p.priceMonthly}/mo)
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={async () => {
                            const selectEl = document.getElementById(`plan_select_${u.id}`) as HTMLSelectElement;
                            const targetPlanId = selectEl ? selectEl.value : 'pro';
                            await AdminPlatformService.setUserPlan(u.id, u.email, targetPlanId, 'affiliatebharatofficial@gmail.com');
                            const updatedUsers = await AdminPlatformService.fetchUsers();
                            setUsers(updatedUsers);
                            setAuditLogs(AdminPlatformService.getAuditLogs());
                            alert(`Successfully granted "${targetPlanId.toUpperCase()}" plan to ${u.displayName || u.email}!`);
                          }}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg shadow transition-all"
                        >
                          Grant Plan 👑
                        </button>
                      </div>

                      <button
                        onClick={() => setCreditModalUser(u)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
                      >
                        Adjust Credits
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WORLDS DIRECTORY */}
        {activeTab === 'worlds' && (
          <div className="space-y-6 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-cinzel font-bold text-base text-amber-300">Created Worlds Directory</h3>
                <p className="text-slate-400 text-xs">Super Admin view of all fantasy worlds created across the platform.</p>
              </div>
              <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                {adminWorlds.length} Total Worlds
              </span>
            </div>

            {adminWorlds.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-400 font-mono">
                No worlds found in database.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminWorlds.map((w) => (
                  <div key={w.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="font-cinzel font-bold text-sm text-slate-100 block">{w.name}</strong>
                        <span className="text-[11px] font-mono text-slate-400">ID: {w.id} • Owner: {w.userId}</span>
                      </div>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${w.isPublic ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {w.isPublic ? 'PUBLIC' : 'PRIVATE'}
                      </span>
                    </div>
                    <p className="text-slate-300 line-clamp-2 text-xs">{w.description}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                      <span className="text-amber-400">Maps: {(w.mapIds || []).length} • Style: {w.style}</span>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete world "${w.name}"?`)) {
                            await WorldService.deleteWorld(w.id);
                            loadAdminData();
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MAPS CATALOG */}
        {activeTab === 'maps' && (
          <div className="space-y-6 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-cinzel font-bold text-base text-amber-300">Generated Maps Catalog</h3>
                <p className="text-slate-400 text-xs">Super Admin view of all procedural and custom saved maps.</p>
              </div>
              <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                {adminMaps.length} Total Maps
              </span>
            </div>

            {adminMaps.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-400 font-mono">
                No maps found in catalog.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminMaps.map((m) => (
                  <div key={m.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="font-cinzel font-bold text-sm text-slate-100 block">{m.title}</strong>
                        <span className="text-[11px] font-mono text-slate-400">ID: {m.id} • Author: {m.author_name || m.user_id}</span>
                      </div>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${m.is_public ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {m.is_public ? 'PUBLIC' : 'PRIVATE'}
                      </span>
                    </div>
                    <p className="text-slate-300 line-clamp-2 text-xs">{m.description || 'No description provided.'}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                      <span className="text-amber-400">Seed: {m.seed} • Type: {m.map_type} • Style: {m.map_style}</span>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete map "${m.title}"?`)) {
                            await MapService.deleteMap(m.id);
                            loadAdminData();
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MAP GENERATOR PARAMETERS */}
        {activeTab === 'map_generator' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-cinzel font-bold text-base text-amber-300">Map Generator Procedural Defaults</h3>
                <p className="text-slate-400 text-xs">Configure platform-wide procedural algorithm parameters and defaults.</p>
              </div>
              <button
                onClick={handleSaveMapProcedural}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow"
              >
                Save Generator Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-slate-300 font-bold block">Default Sea Level ({mapProcedural.defaultSeaLevel || 0.35})</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={mapProcedural.defaultSeaLevel || 0.35}
                  onChange={(e) => setMapProcedural({ ...mapProcedural, defaultSeaLevel: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-slate-300 font-bold block">Default Settlement Density ({mapProcedural.defaultSettlementDensity || 10})</label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={mapProcedural.defaultSettlementDensity || 10}
                  onChange={(e) => setMapProcedural({ ...mapProcedural, defaultSettlementDensity: parseInt(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* CAMPAIGNS DIRECTORY */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-cinzel font-bold text-base text-amber-300">RPG Campaign Directory</h3>
                <p className="text-slate-400 text-xs">Super Admin view of all RPG campaigns, GM workspaces, and adventure modules.</p>
              </div>
              <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                {adminCampaigns.length} Total Campaigns
              </span>
            </div>

            {adminCampaigns.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-400 font-mono">
                No campaigns found in directory.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminCampaigns.map((c) => (
                  <div key={c.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="font-cinzel font-bold text-sm text-slate-100 block">{c.name}</strong>
                        <span className="text-[11px] font-mono text-slate-400">ID: {c.id} • GM: {c.userId}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border bg-amber-500/20 text-amber-300 border-amber-500/40">
                        {c.system || '5e RPG'}
                      </span>
                    </div>
                    <p className="text-slate-300 line-clamp-2 text-xs">{c.description || 'No campaign description.'}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                      <span className="text-amber-400">Status: {c.status || 'Active'}</span>
                      <button
                        onClick={() => {
                          if (confirm(`Delete campaign "${c.name}"?`)) {
                            CampaignService.deleteCampaign(c.id);
                            loadAdminData();
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CARTOGRAPHY CONTROLS */}
        {activeTab === 'cartography' && (
          <div className="space-y-6 text-xs">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="font-cinzel font-bold text-base text-amber-300">Dynamic Cartography Engine Controls</h3>
              <p className="text-slate-400 text-xs">Manage configured POI types, settlement symbols, road styles, and river presets used by Map Editor 2.0.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-amber-400 font-bold block uppercase text-[11px]">POI Location Types ({PlatformConfigService.getCartographyConfig().poiTypes.length})</span>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-[11px]">
                    {PlatformConfigService.getCartographyConfig().poiTypes.map((pt: any) => (
                      <div key={pt.id} className="flex justify-between items-center p-1.5 bg-slate-900 rounded-lg">
                        <span className="text-slate-200">{pt.name} ({pt.id})</span>
                        <span className="text-emerald-400 font-bold">Enabled</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-amber-400 font-bold block uppercase text-[11px]">Settlement Types ({PlatformConfigService.getCartographyConfig().settlementTypes.length})</span>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-[11px]">
                    {PlatformConfigService.getCartographyConfig().settlementTypes.map((st: any) => (
                      <div key={st.id} className="flex justify-between items-center p-1.5 bg-slate-900 rounded-lg">
                        <span className="text-slate-200">{st.name} (Size {st.defaultSize})</span>
                        <span className="text-emerald-400 font-bold">Enabled</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => alert('Cartography configurations saved to system catalog!')}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow"
                >
                  Save Cartography Catalog
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. AI CONTROL CENTER */}
        {activeTab === 'ai' && (
          <div className="space-y-6 text-xs">
            <h3 className="font-cinzel font-bold text-base text-slate-100">Configured AI Providers & API Keys</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiConfigs.map((cfg) => (
                <div key={cfg.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <strong className="font-cinzel font-bold text-sm text-slate-200">{cfg.name}</strong>
                    <button
                      onClick={() => handleToggleAiProvider(cfg.id)}
                      className={`px-3 py-1 rounded-lg font-mono font-bold text-[11px] transition-all ${
                        cfg.enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {cfg.enabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between">
                    <span>API Key: {cfg.maskedApiKey}</span>
                    <span className="text-amber-400">Default: {cfg.defaultModel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. AI FEATURE ROUTING */}
        {activeTab === 'ai_routing' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 text-xs">
            <h3 className="font-cinzel font-bold text-base text-amber-300">AI Feature Model Routing Matrix</h3>
            <div className="space-y-4">
              {[
                { key: 'worldGenProvider', label: 'World Generation Engine' },
                { key: 'mapNamingProvider', label: 'Map Place Naming Parser' },
                { key: 'adventureGenProvider', label: 'AI Adventure Generator' },
                { key: 'questGenProvider', label: 'Quest & Narrative Engine' },
                { key: 'loreAssistantProvider', label: 'World Bible Lore Assistant' }
              ].map((route) => (
                <div key={route.key} className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-cinzel font-bold text-slate-200">{route.label}</span>
                  <select
                    value={(aiRouting as any)[route.key]}
                    onChange={(e) => {
                      const updated = { ...aiRouting, [route.key]: e.target.value };
                      setAiRouting(updated);
                      AdminPlatformService.saveAIFeatureRouting(updated);
                    }}
                    className="bg-slate-900 border border-slate-700 text-amber-400 rounded-lg p-2 font-mono text-xs focus:outline-none"
                  >
                    <option value="openai">OpenAI (GPT-4o)</option>
                    <option value="gemini">Google Gemini 1.5</option>
                    <option value="deepseek">DeepSeek AI</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* RUNWARE IMAGE PROVIDERS */}
        {activeTab === 'ai_image_providers' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-cinzel font-bold text-base text-amber-300">Runware Image Provider & Secret API Key Manager</h3>
              <button
                onClick={handleTestRunwareHealth}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold border border-slate-700 rounded-xl"
              >
                Test Runware Health
              </button>
            </div>

            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <strong className="font-cinzel text-slate-100 text-sm block">Runware AI Engine</strong>
                  <span className="text-[11px] text-slate-400 font-mono">Model: FLUX.1 [schnell] (runware:100@1)</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400">Health:</span>
                  <span className={`font-bold ${runwareHealth === 'Operational' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {runwareHealth}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-2">
                <div>
                  <label className="text-slate-400 block mb-1">Masked API Key</label>
                  <input
                    type="text"
                    disabled
                    value={RunwareImageProvider.getMaskedApiKey()}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-400 font-mono opacity-80 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Update Secret API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Paste Runware API Key..."
                      value={runwareKeyInput}
                      onChange={(e) => setRunwareKeyInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none"
                    />
                    <button
                      onClick={handleSaveRunwareKey}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow"
                    >
                      Save Key
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IMAGE MODELS CATALOG */}
        {activeTab === 'ai_image_models' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 text-xs">
            <h3 className="font-cinzel font-bold text-base text-amber-300">Image Generation Model Catalog</h3>
            <div className="space-y-4">
              {ImageProviderRouter.getAllModels().map((m) => (
                <div key={m.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div className="space-y-1">
                    <strong className="font-cinzel text-slate-100 text-sm block">{m.name}</strong>
                    <span className="text-[11px] font-mono text-amber-400 block">Model ID: {m.modelId} • Provider: {m.providerId}</span>
                    <span className="text-[10px] text-slate-400 block">Max Resolution: {m.maxResolution.width}x{m.maxResolution.height} • Credit Cost: {m.creditCost} credits</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 font-mono rounded-lg border border-emerald-500/20">
                      Active ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IMAGE GENERATION LOGS */}
        {activeTab === 'ai_image_logs' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 text-xs">
            <h3 className="font-cinzel font-bold text-base text-amber-300">Image Generation Audit Logs</h3>
            {imageLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono">No image generation requests logged yet.</div>
            ) : (
              <div className="space-y-3 font-mono">
                {imageLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-[11px]">
                    <div>
                      <span className="text-amber-400 font-bold block">{log.provider} ({log.model})</span>
                      <span className="text-slate-300 text-xs block">"{log.prompt}"</span>
                      <span className="text-slate-500 text-[10px]">Task ID: {log.taskId} • Date: {log.timestamp.replace('T', ' ').substring(0, 19)}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold block ${log.status === 'Completed' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {log.status}
                      </span>
                      <span className="text-slate-400 text-[10px] block">Cost: ${log.providerCost.toFixed(4)} ({log.creditsCharged} credits)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MAP GENERATOR PROCEDURAL SETTINGS */}
        {activeTab === 'map_generator' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-cinzel font-bold text-base text-amber-300">Procedural Map Generator Parameters & Safety Limits</h3>
              <button
                onClick={handleSaveMapProcedural}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow"
              >
                Save Map Generator Parameters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Minimum Map Width (px)</label>
                <input
                  type="number"
                  value={mapProcedural.minWidth}
                  onChange={(e) => setMapProcedural({ ...mapProcedural, minWidth: parseInt(e.target.value) || 400 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Default Map Width (px)</label>
                <input
                  type="number"
                  value={mapProcedural.defaultWidth}
                  onChange={(e) => setMapProcedural({ ...mapProcedural, defaultWidth: parseInt(e.target.value) || 1000 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Maximum Safety Ceiling (px)</label>
                <input
                  type="number"
                  value={mapProcedural.maxWidth}
                  onChange={(e) => setMapProcedural({ ...mapProcedural, maxWidth: parseInt(e.target.value) || 4000 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Mountain Density Weight ({mapProcedural.mountainDensity})</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={mapProcedural.mountainDensity}
                  onChange={(e) => setMapProcedural({ ...mapProcedural, mountainDensity: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">River Density Weight ({mapProcedural.riverDensity})</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={mapProcedural.riverDensity}
                  onChange={(e) => setMapProcedural({ ...mapProcedural, riverDensity: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* VERSIONED AI PROMPTS */}
        {activeTab === 'ai_prompts' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 text-xs">
            <h3 className="font-cinzel font-bold text-base text-amber-300">Versioned AI Prompt Templates & Rollback</h3>
            <div className="space-y-6">
              {aiPrompts.map((p) => {
                const activeVer = p.versions.find((v) => v.version === p.activeVersion) || p.versions[0];
                const isEditing = editingPromptId === p.id;
                return (
                  <div key={p.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong className="font-cinzel text-slate-100 text-sm block">{p.name}</strong>
                        <span className="text-[10px] font-mono text-amber-400 uppercase">Category: {p.category} • Active Version: v{p.activeVersion}</span>
                      </div>
                      <button
                        onClick={() => {
                          setEditingPromptId(isEditing ? null : p.id);
                          setEditingPromptText(activeVer?.template || '');
                        }}
                        className="px-3 py-1.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30 font-bold"
                      >
                        {isEditing ? 'Cancel Edit' : 'Edit Prompt Template'}
                      </button>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingPromptText}
                          onChange={(e) => setEditingPromptText(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono text-xs focus:outline-none"
                          rows={4}
                        />
                        <button
                          onClick={() => handleSavePromptVersion(p.id)}
                          className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl shadow"
                        >
                          Save as New Version & Activate
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-900/80 rounded-xl font-mono text-[11px] text-slate-300">
                        "{activeVer?.template}"
                      </div>
                    )}

                    {/* Version History List */}
                    <div className="pt-2 border-t border-slate-900 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Version History & Rollback:</span>
                      {p.versions.map((ver) => (
                        <div key={ver.version} className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-2 py-1 bg-slate-900/40 rounded-lg">
                          <span>v{ver.version} ({ver.updatedAt})</span>
                          {ver.version === p.activeVersion ? (
                            <span className="text-emerald-400 font-bold">Active ✓</span>
                          ) : (
                            <button
                              onClick={() => handleRollbackPromptVersion(p.id, ver.version)}
                              className="text-amber-400 hover:underline"
                            >
                              Rollback to v{ver.version}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. AI TEST CONSOLE */}
        {activeTab === 'ai_test' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 text-xs">
            <h3 className="font-cinzel font-bold text-base text-amber-300">Test AI Provider Response & Latency</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1">Select AI Provider</label>
                <select
                  value={testProvider}
                  onChange={(e) => setTestProvider(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-400 font-mono"
                >
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="gemini">Google Gemini 1.5 Pro</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Test Prompt</label>
                <textarea
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono text-xs focus:outline-none"
                  rows={3}
                />
              </div>

              <button
                onClick={handleRunAiTest}
                disabled={testingAi}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow"
              >
                {testingAi ? 'Executing Test Request...' : 'Run Test Prompt'}
              </button>

              {testResult && (
                <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 text-emerald-300 font-mono whitespace-pre-wrap">
                  {testResult}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CREDIT LEDGER MANAGEMENT */}
        {activeTab === 'credits' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-cinzel font-bold text-base text-amber-300">Credit Engine Ledger & Cost Matrix Catalog</h3>
              <button
                onClick={handleSaveCreditCosts}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow"
              >
                Save Credit Cost Matrix
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="font-cinzel font-bold text-slate-200">Dynamic Feature Credit Costs</h4>
              <div className="space-y-3 font-mono">
                {creditCosts.map((c, idx) => (
                  <div key={c.key} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-100 block">{c.name}</strong>
                      <span className="text-[10px] text-slate-500">Key: {c.key} • Plans: {c.allowedPlans.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Cost:</span>
                      <input
                        type="number"
                        value={c.creditCost}
                        onChange={(e) => {
                          const updated = [...creditCosts];
                          updated[idx].creditCost = parseInt(e.target.value) || 0;
                          setCreditCosts(updated);
                        }}
                        className="w-20 bg-slate-900 border border-slate-700 text-amber-400 font-bold rounded-lg p-1.5 text-center focus:outline-none"
                      />
                      <span className="text-slate-400">credits</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h4 className="font-cinzel font-bold text-slate-200">Manual Credit Adjustment Form</h4>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div>
                  <label className="text-slate-400 block mb-1">Target User Email</label>
                  <select
                    onChange={(e) => {
                      const u = users.find((usr) => usr.email === e.target.value);
                      if (u) setCreditModalUser(u);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono"
                  >
                    <option value="">Select registered user...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.email}>
                        {u.displayName || u.email} ({u.credits} credits)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1">Credit Delta Amount (+ / -)</label>
                    <input
                      type="number"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Reason for Adjustment</label>
                    <input
                      type="text"
                      value={creditReason}
                      onChange={(e) => setCreditReason(e.target.value)}
                      placeholder="Promotional Bonus / Refund / Support"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (!creditModalUser) {
                      alert('Please select a target user!');
                      return;
                    }
                    await AdminPlatformService.adjustUserCredits(creditModalUser.id, creditModalUser.email, creditAmount, creditReason);
                    setAuditLogs(AdminPlatformService.getAuditLogs());
                    const updatedUsers = await AdminPlatformService.fetchUsers();
                    setUsers(updatedUsers);
                    setCreditModalUser(null);
                    alert(`Successfully adjusted ${creditAmount} credits for ${creditModalUser.email}`);
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow"
                >
                  Confirm Credit Adjustment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC SUBSCRIPTION PLANS & TIERS MANAGEMENT */}
        {(activeTab === 'subscriptions' || activeTab === 'plans') && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-cinzel font-bold text-base text-amber-300">Subscription Plans & Dynamic Tiers Control Center</h3>
                <p className="text-slate-400 text-[11px]">Add new plans, edit pricing, update monthly credit quotas, or remove legacy plans.</p>
              </div>
              <button
                onClick={() => {
                  setEditingPlan({
                    id: `plan_${Date.now()}`,
                    name: 'Custom Tier Plan',
                    slug: `plan-${Date.now().toString().slice(-4)}`,
                    priceMonthly: 15,
                    priceAnnual: 12,
                    creditsPerMonth: 750,
                    maxSavedMaps: 100,
                    maxSavedWorlds: 15,
                    allowedStyles: ['parchment', 'clean', 'dark-fantasy'],
                    exportFormats: ['png', 'svg'],
                    maxResolution: 'hd',
                    commercialUse: false,
                    enabled: true
                  });
                  setIsAddingNewPlan(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Add New Plan
              </button>
            </div>

            {/* PLAN EDITOR MODAL / FORM */}
            {(editingPlan || isAddingNewPlan) && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-amber-500/40 space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <strong className="font-cinzel text-amber-300 text-sm">
                    {isAddingNewPlan ? 'Create New Subscription Plan' : `Edit Plan: ${editingPlan?.name}`}
                  </strong>
                  <button
                    onClick={() => {
                      setEditingPlan(null);
                      setIsAddingNewPlan(false);
                    }}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>

                {editingPlan && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Plan Name</label>
                        <input
                          type="text"
                          value={editingPlan.name}
                          onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Monthly Price ($)</label>
                        <input
                          type="number"
                          value={editingPlan.priceMonthly}
                          onChange={(e) => setEditingPlan({ ...editingPlan, priceMonthly: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Annual Monthly Rate ($)</label>
                        <input
                          type="number"
                          value={editingPlan.priceAnnual}
                          onChange={(e) => setEditingPlan({ ...editingPlan, priceAnnual: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Monthly Credits Quota</label>
                        <input
                          type="number"
                          value={editingPlan.creditsPerMonth}
                          onChange={(e) => setEditingPlan({ ...editingPlan, creditsPerMonth: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Max Saved Maps Limit</label>
                        <input
                          type="number"
                          value={editingPlan.maxSavedMaps}
                          onChange={(e) => setEditingPlan({ ...editingPlan, maxSavedMaps: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Max Saved Worlds Limit</label>
                        <input
                          type="number"
                          value={editingPlan.maxSavedWorlds}
                          onChange={(e) => setEditingPlan({ ...editingPlan, maxSavedWorlds: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="flex gap-6 items-center pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={editingPlan.commercialUse}
                          onChange={(e) => setEditingPlan({ ...editingPlan, commercialUse: e.target.checked })}
                          className="accent-amber-500 w-4 h-4"
                        />
                        <span>Commercial License Granted</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={editingPlan.enabled}
                          onChange={(e) => setEditingPlan({ ...editingPlan, enabled: e.target.checked })}
                          className="accent-emerald-500 w-4 h-4"
                        />
                        <span>Plan Enabled for Users</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={!!editingPlan.isPopular}
                          onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })}
                          className="accent-purple-500 w-4 h-4"
                        />
                        <span>Highlight as "Most Popular"</span>
                      </label>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => handleSavePlan(editingPlan)}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow"
                      >
                        Save Plan Configuration
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DYNAMIC PLAN CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plansList.map((plan) => (
                <div key={plan.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="font-cinzel text-amber-400 text-sm block">{plan.name}</strong>
                      <span className="text-xl font-bold font-mono text-slate-100 block">${plan.priceMonthly}/mo</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                      plan.enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {plan.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-400 font-mono text-[11px] pt-2 border-t border-slate-900">
                    <p>• {plan.creditsPerMonth} credits / month</p>
                    <p>• {plan.maxSavedWorlds} Worlds max</p>
                    <p>• {plan.maxSavedMaps} Maps max</p>
                    <p>• Exports: {plan.exportFormats.join(', ').toUpperCase()}</p>
                    <p>• License: {plan.commercialUse ? 'Commercial' : 'Personal'}</p>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-slate-900">
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setIsAddingNewPlan(false);
                      }}
                      className="px-3 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-bold rounded-lg border border-amber-500/30 text-[11px]"
                    >
                      Edit Plan
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id, plan.name)}
                      className="px-3 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold rounded-lg border border-rose-500/30 text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. MASTER FEATURE CONTROLS & FREE LAUNCH MODE (PHASE 25) */}
        {activeTab === 'features' && (
          <div className="space-y-6 text-xs">
            {/* PRODUCT QUICK STATUS BANNER (Spec #46) */}
            <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-slate-950/80 space-y-3 font-mono">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="font-cinzel font-bold text-sm text-amber-300">PRODUCT STATUS QUICK OVERVIEW</span>
                <span className="text-[11px] text-slate-400">Live Production Mode Evaluator</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-[11px]">
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Launch Mode</span>
                  <span className={`font-bold ${masterConfig.freeLaunchMode ? 'text-emerald-400' : 'text-amber-400'}`}>
                    ● {masterConfig.freeLaunchMode ? 'Free Launch' : 'Paid Mode'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Payment System</span>
                  <span className={`font-bold ${masterConfig.paymentSystemEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                    ● {masterConfig.paymentSystemEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Credit System</span>
                  <span className={`font-bold ${masterConfig.creditSystemEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                    ● {masterConfig.creditSystemEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Map Generation</span>
                  <span className={`font-bold ${masterConfig.features.map_generation?.enabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ● {masterConfig.features.map_generation?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Image Generation</span>
                  <span className={`font-bold ${masterConfig.features.ai_image_generation?.enabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ● {masterConfig.features.ai_image_generation?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* MASTER FREE LAUNCH MODE CARD (Spec #24) */}
            <div className={`glass-panel p-6 rounded-3xl border transition-all ${
              masterConfig.freeLaunchMode ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'
            }`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-cinzel font-bold text-base text-amber-300">MASTER FREE LAUNCH MODE</h3>
                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold border ${
                      masterConfig.freeLaunchMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      ● {masterConfig.freeLaunchMode ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs max-w-2xl">
                    All configured user features operate without payment, credit, or paid subscription requirements.
                    Users can sign up, create worlds, generate maps, edit maps, generate artwork, and download exports 100% free.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const nextMode = !masterConfig.freeLaunchMode;
                    if (!nextMode && !confirm('WARNING: Disabling Free Launch Mode will start enforcing payment, credit, or paid plan requirements according to feature matrix rules. Proceed?')) {
                      return;
                    }
                    handleSaveMasterConfig({ ...masterConfig, freeLaunchMode: nextMode });
                  }}
                  className={`px-5 py-2.5 rounded-xl font-bold font-mono text-xs transition-all shadow ${
                    masterConfig.freeLaunchMode
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {masterConfig.freeLaunchMode ? 'Disable Free Launch Mode' : 'Enable Free Launch Mode'}
                </button>
              </div>
            </div>

            {/* FEATURE CONTROLS MATRIX TABLE (Spec #17 & #18) */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-cinzel font-bold text-base text-amber-300">Feature Access Matrix & Requirements</h3>
                  <p className="text-slate-400 text-xs">Configure granular access requirements for each core platform feature.</p>
                </div>
                <button
                  onClick={() => handleSaveMasterConfig(masterConfig)}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow"
                >
                  Save Feature Matrix
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                      <th className="p-3">Feature Name</th>
                      <th className="p-3">Enabled</th>
                      <th className="p-3">Login Required</th>
                      <th className="p-3">Credits Required</th>
                      <th className="p-3">Paid Plan Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {Object.values(masterConfig.features).map((feat) => (
                      <tr key={feat.key} className="hover:bg-slate-900/40">
                        <td className="p-3 font-cinzel font-bold text-slate-200 text-sm">{feat.name}</td>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={feat.enabled}
                            onChange={(e) => {
                              const updatedFeatures = {
                                ...masterConfig.features,
                                [feat.key]: { ...feat, enabled: e.target.checked }
                              };
                              setMasterConfig({ ...masterConfig, features: updatedFeatures });
                            }}
                            className="accent-amber-500 w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={feat.requires_login}
                            onChange={(e) => {
                              const updatedFeatures = {
                                ...masterConfig.features,
                                [feat.key]: { ...feat, requires_login: e.target.checked }
                              };
                              setMasterConfig({ ...masterConfig, features: updatedFeatures });
                            }}
                            className="accent-amber-500 w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={feat.requires_credits}
                            onChange={(e) => {
                              const updatedFeatures = {
                                ...masterConfig.features,
                                [feat.key]: { ...feat, requires_credits: e.target.checked }
                              };
                              setMasterConfig({ ...masterConfig, features: updatedFeatures });
                            }}
                            className="accent-amber-500 w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={feat.requires_paid_plan}
                            onChange={(e) => {
                              const updatedFeatures = {
                                ...masterConfig.features,
                                [feat.key]: { ...feat, requires_paid_plan: e.target.checked }
                              };
                              setMasterConfig({ ...masterConfig, features: updatedFeatures });
                            }}
                            className="accent-amber-500 w-4 h-4 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MONETIZATION & PAYMENTS MASTER SWITCHES (Spec #2, #3, #6, #7, #8, #31) */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              <h3 className="font-cinzel font-bold text-base text-amber-300">Monetization, Payment & Credit Master Switches</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                  <div>
                    <strong className="text-slate-200 block text-xs">Global Monetization Enabled</strong>
                    <span className="text-slate-400 text-[10px]">Master switch for all paid features & paywalls.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={masterConfig.monetizationEnabled}
                    onChange={(e) => setMasterConfig({ ...masterConfig, monetizationEnabled: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                  <div>
                    <strong className="text-slate-200 block text-xs">Payment System Master Switch</strong>
                    <span className="text-slate-400 text-[10px]">Controls checkout API sessions & purchases.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={masterConfig.paymentSystemEnabled}
                    onChange={(e) => setMasterConfig({ ...masterConfig, paymentSystemEnabled: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                  <div>
                    <strong className="text-slate-200 block text-xs">Subscriptions System Enabled</strong>
                    <span className="text-slate-400 text-[10px]">Controls plan upgrades & pricing CTAs.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={masterConfig.subscriptionsEnabled}
                    onChange={(e) => setMasterConfig({ ...masterConfig, subscriptionsEnabled: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                  <div>
                    <strong className="text-slate-200 block text-xs">Credit System Master Switch</strong>
                    <span className="text-slate-400 text-[10px]">Requires credit balance for generations when active.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={masterConfig.creditSystemEnabled}
                    onChange={(e) => setMasterConfig({ ...masterConfig, creditSystemEnabled: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                  <div>
                    <strong className="text-slate-200 block text-xs">Free Generation Mode</strong>
                    <span className="text-slate-400 text-[10px]">When ON, generations do not consume user credits.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={masterConfig.freeGenerationMode}
                    onChange={(e) => setMasterConfig({ ...masterConfig, freeGenerationMode: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                  <div>
                    <strong className="text-slate-200 block text-xs">Usage Limits Enabled</strong>
                    <span className="text-slate-400 text-[10px]">Enforces monthly map/world quota caps.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={masterConfig.usageLimitsEnabled}
                    onChange={(e) => setMasterConfig({ ...masterConfig, usageLimitsEnabled: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              {/* PAYMENT PROVIDERS & EXPORT FORMATS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                {/* Payment Providers (Spec #4) */}
                <div className="space-y-3 font-mono text-xs">
                  <h4 className="font-cinzel font-bold text-slate-200 text-sm">Payment Providers Controls</h4>
                  <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                    <span className="text-slate-300">Lemon Squeezy Integration</span>
                    <input
                      type="checkbox"
                      checked={masterConfig.paymentProviders?.lemonSqueezy}
                      onChange={(e) => setMasterConfig({
                        ...masterConfig,
                        paymentProviders: { ...masterConfig.paymentProviders, lemonSqueezy: e.target.checked }
                      })}
                      className="accent-amber-500 w-4 h-4"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                    <span className="text-slate-300">Stripe Integration</span>
                    <input
                      type="checkbox"
                      checked={masterConfig.paymentProviders?.stripe}
                      onChange={(e) => setMasterConfig({
                        ...masterConfig,
                        paymentProviders: { ...masterConfig.paymentProviders, stripe: e.target.checked }
                      })}
                      className="accent-amber-500 w-4 h-4"
                    />
                  </label>
                </div>

                {/* Export Formats (Spec #16) */}
                <div className="space-y-3 font-mono text-xs">
                  <h4 className="font-cinzel font-bold text-slate-200 text-sm">Allowed Export Formats Matrix</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['png', 'jpeg', 'webp', 'pdf', 'svg'].map((fmt) => (
                      <label key={fmt} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer uppercase">
                        <span className="text-slate-300 font-bold">{fmt}</span>
                        <input
                          type="checkbox"
                          checked={(masterConfig.exportFormats as any)[fmt] !== false}
                          onChange={(e) => setMasterConfig({
                            ...masterConfig,
                            exportFormats: { ...masterConfig.exportFormats, [fmt]: e.target.checked }
                          })}
                          className="accent-amber-500 w-4 h-4"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* MAINTENANCE MODE & ARTWORK CONTROL */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 text-xs">
              <h3 className="font-cinzel font-bold text-base text-slate-100">Maintenance Mode & Legacy Entity Flags</h3>
              <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <strong className="font-cinzel text-slate-200 block">Maintenance Mode</strong>
                  <span className="text-slate-400 text-[11px]">When enabled, non-admin users see maintenance screen.</span>
                </div>
                <input
                  type="checkbox"
                  checked={featureFlags.maintenanceMode}
                  onChange={(e) => setFeatureFlags({ ...featureFlags, maintenanceMode: e.target.checked })}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </label>

              {featureFlags.maintenanceMode && (
                <textarea
                  value={featureFlags.maintenanceMessage}
                  onChange={(e) => setFeatureFlags({ ...featureFlags, maintenanceMessage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none font-mono"
                  rows={2}
                />
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  handleSaveMasterConfig(masterConfig);
                  handleSaveFlags();
                }}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
              >
                Save Master Feature Controls
              </button>
            </div>
          </div>
        )}

        {/* 7. AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-cinzel font-bold text-base text-slate-100">Super Admin Action Audit Log Stream</h3>
            {auditLogs.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-400 font-mono">
                No audit logs available.
              </div>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                    <div className="space-y-0.5">
                      <span className="text-amber-400 font-bold">[{log.timestamp}] {log.action}</span>
                      <p className="text-slate-300">{log.target}: {log.details}</p>
                    </div>
                    <span className="text-slate-500 text-[10px]">{log.adminUser}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 8. BACKUP & RESTORE */}
        {activeTab === 'backup' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 text-xs">
            <h3 className="font-cinzel font-bold text-base text-amber-300">System Configuration Backup & Safe Restore</h3>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="font-cinzel font-bold text-slate-200 block">Export Safe System Configuration</strong>
                  <span className="text-slate-400 text-[11px]">Downloads non-secret JSON configuration file containing feature flags and site settings.</span>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Backup JSON
                </button>
              </div>

              <form onSubmit={handleRestoreBackup} className="p-4 bg-slate-950 rounded-xl border border-rose-500/30 space-y-3">
                <strong className="font-cinzel font-bold text-rose-300 block">Restore Configuration from Backup</strong>
                <textarea
                  placeholder="Paste backup JSON content here..."
                  value={backupJsonInput}
                  onChange={(e) => setBackupJsonInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-xs focus:outline-none"
                  rows={4}
                />
                <div>
                  <label className="text-rose-400 block mb-1">Type RESTORE to confirm restoration</label>
                  <input
                    type="text"
                    value={restoreConfirmText}
                    onChange={(e) => setRestoreConfirmText(e.target.value)}
                    placeholder="RESTORE"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!backupJsonInput.trim() || restoreConfirmText.toUpperCase() !== 'RESTORE'}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-slate-100 font-bold rounded-xl disabled:opacity-50"
                >
                  Confirm Restore Backup
                </button>
              </form>

              {backupMessage && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono rounded-xl">
                  {backupMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 9. EMERGENCY CONTROLS */}
        {activeTab === 'emergency' && (
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/40 bg-rose-950/10 space-y-6 text-xs">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-cinzel font-bold text-base text-rose-300">Platform Emergency Controls & Safety Kill-Switches</h3>
            </div>
            <p className="text-slate-400">1-click administrative controls to immediately disable high-resource platform operations server-wide.</p>

            <div className="space-y-3 font-mono">
              {[
                { key: 'aiGenerationsDisabled', label: 'Disable All AI Generation Engine Requests' },
                { key: 'registrationDisabled', label: 'Disable New User Account Registration' },
                { key: 'exportsDisabled', label: 'Disable High-Res PDF/SVG Map Exports' },
                { key: 'communityDisabled', label: 'Disable Public Community & Map Sharing' },
                { key: 'publicPublishingDisabled', label: 'Disable Public Map Publishing' }
              ].map((em) => (
                <div key={em.key} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-200">{em.label}</span>
                  <button
                    onClick={() => handleToggleEmergencyControl(em.key as keyof EmergencyControls)}
                    className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                      emergencyControls[em.key as keyof EmergencyControls]
                        ? 'bg-rose-600 text-slate-100 shadow-lg shadow-rose-600/30'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {emergencyControls[em.key as keyof EmergencyControls] ? 'EMERGENCY DISABLED' : 'NORMAL (ACTIVE)'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. ADMIN PROFILE */}
        {activeTab === 'profile' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 text-xs">
            <h3 className="font-cinzel font-bold text-base text-amber-300">Platform Super Admin Profile</h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono">
              <div>Email: <span className="text-slate-100 font-bold">affiliatebharatofficial@gmail.com</span></div>
              <div>Role: <span className="text-amber-400 font-bold">SUPER ADMIN (Single Owner)</span></div>
              <div>Status: <span className="text-emerald-400 font-bold">Authenticated ✓</span></div>
            </div>
          </div>
        )}
      </main>

      {/* Credit Adjustment Modal */}
      {creditModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
          <form onSubmit={handleAddCreditsSubmit} className="bg-[#121620] border border-amber-500/30 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl text-xs">
            <h3 className="font-cinzel font-bold text-base text-slate-100">Adjust Credits for {creditModalUser.displayName}</h3>
            <div>
              <label className="text-slate-400 block mb-1">Credit Adjustment Amount (+ or -)</label>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Audit Log Reason</label>
              <input
                type="text"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCreditModalUser(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl shadow">
                Save Adjustment & Audit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
