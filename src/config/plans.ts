import type { MapStyle } from '../types/map';

export type PlanId = 'free' | 'pro' | 'creator';

export type EntitlementKey =
  | 'basic_generation'
  | 'ai_generation'
  | 'saved_maps'
  | 'hd_export'
  | 'ultra_hd_export'
  | 'svg_export'
  | 'pdf_export'
  | 'premium_styles'
  | 'premium_decorations'
  | 'commercial_use';

export interface PlanConfig {
  id: PlanId;
  name: string;
  slug: string;
  priceMonthly: number;
  priceAnnual: number; // Discounted monthly rate when billed annually
  description: string;
  creditsPerMonth: number;
  maxSavedMaps: number;
  allowedStyles: MapStyle[];
  exportFormats: ('png' | 'svg' | 'pdf')[];
  maxResolution: 'standard' | 'hd' | 'ultra_hd';
  hasWatermark: boolean;
  commercialUse: boolean;
  features: string[];
  entitlements: EntitlementKey[];
  isPopular?: boolean;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free Adventurer',
    slug: 'free',
    priceMonthly: 0,
    priceAnnual: 0,
    description: 'Perfect for casual dungeon masters, writers, and worldbuilders getting started.',
    creditsPerMonth: 5,
    maxSavedMaps: 10,
    allowedStyles: ['parchment', 'clean'],
    exportFormats: ['png'],
    maxResolution: 'standard',
    hasWatermark: false, // Clean user-first experience, limit via resolution & formats
    commercialUse: false,
    features: [
      '5 AI Generations / month',
      'Unlimited Procedural Quick Generate',
      'Up to 10 Saved Cloud Maps',
      'Classic Parchment & Clean Styles',
      'Standard Resolution PNG Export',
      'Full Interactive Map Editor',
      'Community Gallery Access'
    ],
    entitlements: ['basic_generation', 'saved_maps']
  },
  pro: {
    id: 'pro',
    name: 'Pro Cartographer',
    slug: 'pro',
    priceMonthly: 9,
    priceAnnual: 7, // $84/year
    description: 'Ideal for active campaign DMs, authors, and tabletop creators seeking professional maps.',
    creditsPerMonth: 100,
    maxSavedMaps: 100,
    allowedStyles: ['parchment', 'clean', 'dark-fantasy', 'hand-drawn', 'rpg'],
    exportFormats: ['png', 'svg', 'pdf'],
    maxResolution: 'hd',
    hasWatermark: false,
    commercialUse: false,
    features: [
      '100 AI Generations / month',
      '100 Saved Cloud Maps',
      'All 5 Fantasy Map Styles',
      'HD Resolution PNG Export (2x)',
      'Vector SVG File Export',
      'Printable PDF Map Documents',
      'Advanced Map Decorations & Frames',
      'Priority AI Map Processing'
    ],
    entitlements: [
      'basic_generation',
      'ai_generation',
      'saved_maps',
      'hd_export',
      'svg_export',
      'pdf_export',
      'premium_styles',
      'premium_decorations'
    ],
    isPopular: true
  },
  creator: {
    id: 'creator',
    name: 'World Creator',
    slug: 'creator',
    priceMonthly: 19,
    priceAnnual: 15, // $180/year
    description: 'For commercial game developers, publishers, and heavy worldbuilders.',
    creditsPerMonth: 500,
    maxSavedMaps: 500,
    allowedStyles: ['parchment', 'clean', 'dark-fantasy', 'hand-drawn', 'rpg'],
    exportFormats: ['png', 'svg', 'pdf'],
    maxResolution: 'ultra_hd',
    hasWatermark: false,
    commercialUse: true,
    features: [
      '500 AI Generations / month',
      '500 Saved Cloud Maps',
      'Commercial Usage License',
      'Ultra HD Resolution PNG (4x)',
      'Vector SVG & Printable PDF Exports',
      'All Premium Styles & Decorations',
      'Highest Priority AI Queue'
    ],
    entitlements: [
      'basic_generation',
      'ai_generation',
      'saved_maps',
      'hd_export',
      'ultra_hd_export',
      'svg_export',
      'pdf_export',
      'premium_styles',
      'premium_decorations',
      'commercial_use'
    ]
  }
};

export const AI_GENERATION_CREDIT_COST = 1;

export function checkPlanEntitlement(planId: PlanId, entitlement: EntitlementKey): boolean {
  const plan = PLANS[planId] || PLANS.free;
  return plan.entitlements.includes(entitlement);
}
