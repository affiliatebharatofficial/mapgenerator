import type { MapStyle } from '../../types/map';

export interface MapThemeStyle {
  id: MapStyle;
  name: string;
  description: string;
  background: string;
  waterColor: string;
  landColor: string;
  coastColor: string;
  mountainColor: string;
  forestColor: string;
  textColor: string;
  fontFamily: string;
  borderColor: string;

  // Cartographic Detail Properties
  roadColor: string;
  textHaloColor: string;
  coastlineColor?: string;
  cityIconColor?: string;
  cityNameColor?: string;
  labelFontFamily?: string;
  landBg?: string;
  mountainStroke?: string;
  riverColor?: string;
  oceanBg?: string;
  borderWidth?: number;
  forestFill?: string;
  forestStroke?: string;
  lakeColor?: string;
  mountainFill?: string;
}

export const MAP_STYLES: Record<MapStyle, MapThemeStyle> = {
  parchment: {
    id: 'parchment',
    name: 'Classic Parchment',
    description: 'Traditional antique cartography style with warm parchment texture tones.',
    background: '#f4ebd0',
    waterColor: '#b0c4de',
    landColor: '#f4ebd0',
    coastColor: '#9bb0c7',
    mountainColor: '#5c4d41',
    forestColor: '#2d6a4f',
    textColor: '#2c3e50',
    fontFamily: 'Cinzel, serif',
    borderColor: '#d4af37',
    roadColor: '#6b5b45',
    textHaloColor: '#f4ebd0',
    coastlineColor: '#9bb0c7',
    cityIconColor: '#d4af37',
    cityNameColor: '#2c3e50',
    labelFontFamily: 'Cinzel, serif',
    landBg: '#f4ebd0',
    mountainStroke: '#3a2e2b',
    riverColor: '#7b9bb4',
    oceanBg: '#b0c4de',
    borderWidth: 2,
    forestFill: '#2d6a4f',
    forestStroke: '#1b4332',
    lakeColor: '#7b9bb4',
    mountainFill: '#5c4d41'
  },
  'dark-fantasy': {
    id: 'dark-fantasy',
    name: 'Dark Fantasy',
    description: 'Grim obsidian realms with glowing rune borders and shadow ocean depths.',
    background: '#090b0e',
    waterColor: '#0b1325',
    landColor: '#171d29',
    coastColor: '#1e293b',
    mountainColor: '#475569',
    forestColor: '#064e3b',
    textColor: '#f8fafc',
    fontFamily: 'Cinzel, serif',
    borderColor: '#f59e0b',
    roadColor: '#64748b',
    textHaloColor: '#090b0e',
    coastlineColor: '#1e293b',
    cityIconColor: '#f59e0b',
    cityNameColor: '#f8fafc',
    labelFontFamily: 'Cinzel, serif',
    landBg: '#171d29',
    mountainStroke: '#334155',
    riverColor: '#1e293b',
    oceanBg: '#0b1325',
    borderWidth: 2,
    forestFill: '#064e3b',
    forestStroke: '#022c22',
    lakeColor: '#1e293b',
    mountainFill: '#475569'
  },
  clean: {
    id: 'clean',
    name: 'Clean Fantasy',
    description: 'Modern crisp vector aesthetic with vibrant pastel biomes and high legibility.',
    background: '#f8fafc',
    waterColor: '#93c5fd',
    landColor: '#f1f5f9',
    coastColor: '#60a5fa',
    mountainColor: '#475569',
    forestColor: '#10b981',
    textColor: '#0f172a',
    fontFamily: 'Cinzel, serif',
    borderColor: '#38bdf8',
    roadColor: '#475569',
    textHaloColor: '#ffffff',
    coastlineColor: '#60a5fa',
    cityIconColor: '#38bdf8',
    cityNameColor: '#0f172a',
    labelFontFamily: 'Cinzel, serif',
    landBg: '#f1f5f9',
    mountainStroke: '#334155',
    riverColor: '#60a5fa',
    oceanBg: '#93c5fd',
    borderWidth: 2,
    forestFill: '#10b981',
    forestStroke: '#047857',
    lakeColor: '#60a5fa',
    mountainFill: '#475569'
  },
  'hand-drawn': {
    id: 'hand-drawn',
    name: 'Hand Drawn Sketch',
    description: 'Monochrome ink sketch style reminiscent of hand-drawn fantasy novels.',
    background: '#fafaf9',
    waterColor: '#d6d3d1',
    landColor: '#fafaf9',
    coastColor: '#a8a29e',
    mountainColor: '#44403c',
    forestColor: '#292524',
    textColor: '#1c1917',
    fontFamily: 'Cinzel, serif',
    borderColor: '#44403c',
    roadColor: '#57534e',
    textHaloColor: '#fafaf9',
    coastlineColor: '#a8a29e',
    cityIconColor: '#1c1917',
    cityNameColor: '#1c1917',
    labelFontFamily: 'Cinzel, serif',
    landBg: '#fafaf9',
    mountainStroke: '#1c1917',
    riverColor: '#a8a29e',
    oceanBg: '#d6d3d1',
    borderWidth: 2,
    forestFill: '#292524',
    forestStroke: '#1c1917',
    lakeColor: '#a8a29e',
    mountainFill: '#44403c'
  },
  rpg: {
    id: 'rpg',
    name: 'RPG Campaign',
    description: 'Tabletop D&D campaign map style optimized for grid combat and region exploration.',
    background: '#1e1b4b',
    waterColor: '#1e3a8a',
    landColor: '#312e81',
    coastColor: '#3b82f6',
    mountainColor: '#6366f1',
    forestColor: '#047857',
    textColor: '#fef08a',
    fontFamily: 'Cinzel, serif',
    borderColor: '#facc15',
    roadColor: '#d97706',
    textHaloColor: '#1e1b4b',
    coastlineColor: '#3b82f6',
    cityIconColor: '#facc15',
    cityNameColor: '#fef08a',
    labelFontFamily: 'Cinzel, serif',
    landBg: '#312e81',
    mountainStroke: '#4338ca',
    riverColor: '#2563eb',
    oceanBg: '#1e3a8a',
    borderWidth: 2,
    forestFill: '#047857',
    forestStroke: '#064e3b',
    lakeColor: '#2563eb',
    mountainFill: '#6366f1'
  }
};
