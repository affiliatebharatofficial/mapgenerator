export interface AdminSystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalWorlds: number;
  publicWorlds: number;
  totalMaps: number;
  publicMaps: number;
  totalCampaigns: number;
  activeCampaigns: number;
  aiGenerations: number;
  creditsConsumed: number;
  estimatedCostUsd: number | null; // null = Not tracked
}

export interface SystemHealthStatus {
  dbStatus: 'Operational' | 'Degraded' | 'Unavailable' | 'Not Configured';
  vercelStatus: 'Operational' | 'Degraded' | 'Unavailable';
  storageStatus: 'Operational' | 'Degraded' | 'Unavailable' | 'Not Configured';
  aiStatus: 'Operational' | 'Degraded' | 'Unavailable' | 'Not Configured';
  paymentsStatus: 'Operational' | 'Degraded' | 'Unavailable' | 'Not Configured';
  lastChecked: string;
}

export interface AIProviderConfig {
  id: 'openai' | 'gemini' | 'openrouter' | 'deepseek';
  name: string;
  enabled: boolean;
  maskedApiKey: string;
  defaultModel: string;
  fastModel: string;
  lastError?: string;
  lastSuccess?: string;
}

export interface AIFeatureRouting {
  mapNamingProvider: string;
  adventureGenProvider: string;
  loreAssistantProvider: string;
  imageGenProvider: string;
  worldGenProvider: string;
  questGenProvider: string;
}

export interface FeatureFlags {
  worldGen: boolean;
  mapEditor: boolean;
  aiAdventureGen: boolean;
  campaigns: boolean;
  community: boolean;
  publicMaps: boolean;
  imageGen: boolean;
  exports: boolean;
  worldArtworkGen?: boolean;
  npcPortraitGen?: boolean;
  locationArtworkGen?: boolean;
  factionArtworkGen?: boolean;
  adventureCoverGen?: boolean;
  campaignArtworkGen?: boolean;
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminUser: string;
  action: string;
  target: string;
  details: string;
}

export interface AdminUserItem {
  id: string;
  email: string;
  displayName: string;
  plan: string;
  credits: number;
  worldsCount: number;
  mapsCount: number;
  campaignsCount: number;
  isSuspended: boolean;
  joinedAt: string;
  lastActive: string;
}

export interface AILogEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  feature: string;
  provider: string;
  model: string;
  status: 'success' | 'failure';
  durationMs: number;
  credits: number;
  error?: string;
}

export interface ModerationReportItem {
  id: string;
  mapId: string;
  mapTitle: string;
  reporterEmail: string;
  reason: string;
  details: string;
  status: 'Pending' | 'Reviewed' | 'Resolved' | 'Dismissed';
  createdAt: string;
}

export interface ContentHomepageConfig {
  heroTitle: string;
  heroDescription: string;
  ctaText: string;
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink: string;
}

export interface SiteSettingsConfig {
  siteName: string;
  supportEmail: string;
  defaultLanguage: string;
  defaultCurrency: string;
  logoUrl: string;
  faviconUrl: string;
}
