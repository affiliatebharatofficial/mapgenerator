import { AdminPlatformService } from '../admin/adminPlatformService';
import { MAP_STYLES, type MapThemeStyle } from '../map-engine/styles';
import type { MapStyle } from '../../types/map';

export interface SubscriptionPlanItem {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceAnnual: number;
  creditsPerMonth: number;
  maxSavedMaps: number;
  maxSavedWorlds: number;
  allowedStyles: string[];
  exportFormats: ('png' | 'svg' | 'pdf')[];
  maxResolution: 'standard' | 'hd' | 'ultra_hd';
  commercialUse: boolean;
  enabled: boolean;
  isPopular?: boolean;
}

const CONFIG_CREDIT_COSTS_KEY = 'createfantasymap_config_credit_costs';
const CONFIG_MAP_PROCEDURAL_KEY = 'createfantasymap_config_map_procedural';
const CONFIG_AI_PROMPTS_KEY = 'createfantasymap_config_ai_prompts';
const CONFIG_EMERGENCY_KEY = 'createfantasymap_config_emergency';
const CONFIG_SUBSCRIPTION_PLANS_KEY = 'createfantasymap_config_subscription_plans';

export interface CreditCostCatalogItem {
  key: string;
  name: string;
  creditCost: number;
  enabled: boolean;
  allowedPlans: string[];
}

export interface MapProceduralConfig {
  minWidth: number;
  defaultWidth: number;
  maxWidth: number;
  mountainDensity: number;
  riverDensity: number;
  forestDensity: number;
  islandProbability: number;
  coastRoughness: number;
}

export interface AIPromptTemplateVersion {
  version: number;
  template: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  category: string;
  activeVersion: number;
  versions: AIPromptTemplateVersion[];
}

export interface EmergencyControls {
  aiGenerationsDisabled: boolean;
  registrationDisabled: boolean;
  exportsDisabled: boolean;
  communityDisabled: boolean;
  publicPublishingDisabled: boolean;
}

export const PlatformConfigService = {
  // ----------------------------------------------------
  // 1. FEATURE FLAG EVALUATION
  // ----------------------------------------------------
  getFeatureFlag(flagKey: string): boolean {
    const flags = AdminPlatformService.getFeatureFlags();
    if (flags.maintenanceMode) return false;
    return (flags as any)[flagKey] !== false;
  },

  isEntityArtworkEnabled(entityType: string): boolean {
    const flags = AdminPlatformService.getFeatureFlags();
    if (flags.maintenanceMode || flags.imageGen === false) return false;
    if (entityType === 'world') return flags.worldArtworkGen !== false;
    if (entityType === 'npc') return flags.npcPortraitGen !== false;
    if (entityType === 'location') return flags.locationArtworkGen !== false;
    if (entityType === 'faction') return flags.factionArtworkGen !== false;
    if (entityType === 'adventure') return flags.adventureCoverGen !== false;
    if (entityType === 'campaign') return flags.campaignArtworkGen !== false;
    return true;
  },

  // ----------------------------------------------------
  // 2. DYNAMIC CREDIT COST CATALOG
  // ----------------------------------------------------
  getCreditCosts(): CreditCostCatalogItem[] {
    const data = localStorage.getItem(CONFIG_CREDIT_COSTS_KEY);
    if (data) return JSON.parse(data);
    return [
      { key: 'map_generation', name: 'Map Generation', creditCost: 20, enabled: true, allowedPlans: ['Free', 'Pro', 'Creator'] },
      { key: 'adventure_generation', name: 'AI Adventure Generator', creditCost: 10, enabled: true, allowedPlans: ['Pro', 'Creator'] },
      { key: 'lore_assistant', name: 'World Bible AI Assistant', creditCost: 2, enabled: true, allowedPlans: ['Free', 'Pro', 'Creator'] },
      { key: 'image_generation', name: 'AI Cover & Entity Image', creditCost: 30, enabled: true, allowedPlans: ['Creator'] },
      { key: 'pdf_export', name: 'Worldbook PDF Export', creditCost: 15, enabled: true, allowedPlans: ['Pro', 'Creator'] },
      { key: 'svg_export', name: 'Vector SVG Map Export', creditCost: 10, enabled: true, allowedPlans: ['Pro', 'Creator'] }
    ];
  },

  getCreditCost(actionKey: string): number {
    const catalog = this.getCreditCosts();
    const item = catalog.find((c) => c.key === actionKey);
    return item ? item.creditCost : 0;
  },

  saveCreditCosts(costs: CreditCostCatalogItem[]) {
    localStorage.setItem(CONFIG_CREDIT_COSTS_KEY, JSON.stringify(costs));
    AdminPlatformService.addAuditLog('Update Credit Catalog', 'Platform Config', 'Saved Dynamic Credit Cost Matrix');
  },

  // ----------------------------------------------------
  // 3. MAP GENERATOR & PROCEDURAL PARAMETERS
  // ----------------------------------------------------
  getMapProceduralConfig(): MapProceduralConfig {
    const data = localStorage.getItem(CONFIG_MAP_PROCEDURAL_KEY);
    if (data) return JSON.parse(data);
    return {
      minWidth: 400,
      defaultWidth: 1000,
      maxWidth: 4000,
      mountainDensity: 0.5,
      riverDensity: 0.6,
      forestDensity: 0.5,
      islandProbability: 0.4,
      coastRoughness: 0.5
    };
  },

  saveMapProceduralConfig(config: MapProceduralConfig) {
    // Validate safety bounds
    const safeConfig: MapProceduralConfig = {
      minWidth: Math.max(200, config.minWidth),
      defaultWidth: Math.min(2000, Math.max(600, config.defaultWidth)),
      maxWidth: Math.min(8000, Math.max(1200, config.maxWidth)),
      mountainDensity: Math.min(1, Math.max(0.1, config.mountainDensity)),
      riverDensity: Math.min(1, Math.max(0.1, config.riverDensity)),
      forestDensity: Math.min(1, Math.max(0.1, config.forestDensity)),
      islandProbability: Math.min(1, Math.max(0, config.islandProbability)),
      coastRoughness: Math.min(1, Math.max(0.1, config.coastRoughness))
    };
    localStorage.setItem(CONFIG_MAP_PROCEDURAL_KEY, JSON.stringify(safeConfig));
    AdminPlatformService.addAuditLog('Update Map Generator Settings', 'Procedural Geography', 'Updated Map Size & Procedural Parameters');
  },

  // ----------------------------------------------------
  // 4. VERSIONED AI PROMPT TEMPLATES & ROLLBACK
  // ----------------------------------------------------
  getAIPrompts(): AIPromptTemplate[] {
    const data = localStorage.getItem(CONFIG_AI_PROMPTS_KEY);
    if (data) return JSON.parse(data);
    return [
      {
        id: 'world_gen',
        name: 'World Bible Generator Prompt',
        category: 'Worldbuilding',
        activeVersion: 1,
        versions: [
          {
            version: 1,
            template: 'Generate a cohesive fantasy world with 3 regions, 2 rival kingdoms, 5 major cities, and key lore historical events.',
            updatedAt: '2026-01-01 10:00:00',
            updatedBy: 'affiliatebharatofficial@gmail.com'
          }
        ]
      },
      {
        id: 'adventure_gen',
        name: 'AI Adventure & Quest Prompt',
        category: 'Campaign',
        activeVersion: 1,
        versions: [
          {
            version: 1,
            template: 'Create a multi-act TTRPG adventure outline referencing World Bible entities, locations, NPCs, and major plot twists.',
            updatedAt: '2026-01-01 10:00:00',
            updatedBy: 'affiliatebharatofficial@gmail.com'
          }
        ]
      }
    ];
  },

  saveAIPromptVersion(promptId: string, newTemplateStr: string) {
    const prompts = this.getAIPrompts();
    const idx = prompts.findIndex((p) => p.id === promptId);
    if (idx >= 0) {
      const nextVer = prompts[idx].activeVersion + 1;
      prompts[idx].versions.unshift({
        version: nextVer,
        template: newTemplateStr,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updatedBy: 'affiliatebharatofficial@gmail.com'
      });
      prompts[idx].activeVersion = nextVer;
      localStorage.setItem(CONFIG_AI_PROMPTS_KEY, JSON.stringify(prompts));
      AdminPlatformService.addAuditLog('Update AI Prompt', prompts[idx].name, `Created & Activated Version ${nextVer}`);
    }
  },

  rollbackAIPromptVersion(promptId: string, targetVersion: number) {
    const prompts = this.getAIPrompts();
    const idx = prompts.findIndex((p) => p.id === promptId);
    if (idx >= 0) {
      const verExists = prompts[idx].versions.some((v) => v.version === targetVersion);
      if (verExists) {
        prompts[idx].activeVersion = targetVersion;
        localStorage.setItem(CONFIG_AI_PROMPTS_KEY, JSON.stringify(prompts));
        AdminPlatformService.addAuditLog('Rollback AI Prompt', prompts[idx].name, `Rolled back to Version ${targetVersion}`);
      }
    }
  },

  // ----------------------------------------------------
  // 5. EMERGENCY CONTROLS
  // ----------------------------------------------------
  getEmergencyControls(): EmergencyControls {
    const data = localStorage.getItem(CONFIG_EMERGENCY_KEY);
    if (data) return JSON.parse(data);
    return {
      aiGenerationsDisabled: false,
      registrationDisabled: false,
      exportsDisabled: false,
      communityDisabled: false,
      publicPublishingDisabled: false
    };
  },

  saveEmergencyControls(controls: EmergencyControls) {
    localStorage.setItem(CONFIG_EMERGENCY_KEY, JSON.stringify(controls));
    AdminPlatformService.addAuditLog('Emergency Control Update', 'System Safety', `Emergency Status: ${JSON.stringify(controls)}`);
  },

  // ----------------------------------------------------
  // 6. DYNAMIC SUBSCRIPTION PLANS (ADD / EDIT / REMOVE)
  // ----------------------------------------------------
  getSubscriptionPlans(): SubscriptionPlanItem[] {
    const data = localStorage.getItem(CONFIG_SUBSCRIPTION_PLANS_KEY);
    if (data) return JSON.parse(data);
    return [
      {
        id: 'free',
        name: 'Free Adventurer',
        slug: 'free',
        priceMonthly: 0,
        priceAnnual: 0,
        creditsPerMonth: 50,
        maxSavedMaps: 3,
        maxSavedWorlds: 1,
        allowedStyles: ['parchment', 'clean'],
        exportFormats: ['png'],
        maxResolution: 'standard',
        commercialUse: false,
        enabled: true
      },
      {
        id: 'creator',
        name: 'World Creator',
        slug: 'creator',
        priceMonthly: 12,
        priceAnnual: 9,
        creditsPerMonth: 500,
        maxSavedMaps: 50,
        maxSavedWorlds: 10,
        allowedStyles: ['parchment', 'clean', 'dark-fantasy', 'hand-drawn'],
        exportFormats: ['png', 'svg'],
        maxResolution: 'hd',
        commercialUse: false,
        enabled: true,
        isPopular: true
      },
      {
        id: 'pro',
        name: 'Master Guildmaster (Pro)',
        slug: 'pro',
        priceMonthly: 29,
        priceAnnual: 22,
        creditsPerMonth: 2000,
        maxSavedMaps: 999,
        maxSavedWorlds: 999,
        allowedStyles: ['parchment', 'clean', 'dark-fantasy', 'hand-drawn', 'rpg'],
        exportFormats: ['png', 'svg', 'pdf'],
        maxResolution: 'ultra_hd',
        commercialUse: true,
        enabled: true
      }
    ];
  },

  saveSubscriptionPlans(plans: SubscriptionPlanItem[]) {
    localStorage.setItem(CONFIG_SUBSCRIPTION_PLANS_KEY, JSON.stringify(plans));
    AdminPlatformService.addAuditLog('Update Subscription Plans', 'Monetization Engine', 'Saved Subscription Plans Catalog');
  },

  addOrUpdatePlan(plan: SubscriptionPlanItem) {
    const plans = this.getSubscriptionPlans();
    const idx = plans.findIndex((p) => p.id === plan.id);
    if (idx >= 0) {
      plans[idx] = plan;
    } else {
      plans.push(plan);
    }
    this.saveSubscriptionPlans(plans);
  },

  deletePlan(planId: string) {
    let plans = this.getSubscriptionPlans();
    plans = plans.filter((p) => p.id !== planId);
    this.saveSubscriptionPlans(plans);
  }
};
