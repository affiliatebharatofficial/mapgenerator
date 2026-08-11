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

  // Compatibility properties
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
    waterColor: '#c8d6e5',
    landColor: '#f4ebd0',
    coastColor: '#b8c6d5',
    mountainColor: '#7f8c8d',
    forestColor: '#27ae60',
    textColor: '#2c3e50',
    fontFamily: 'Cinzel, serif',
    borderColor: '#d4af37',
    coastlineColor: '#b8c6d5',
    cityIconColor: '#d4af37',
    cityNameColor: '#2c3e50',
    labelFontFamily: 'Cinzel, serif',
    landBg: '#f4ebd0',
    mountainStroke: '#7f8c8d',
    riverColor: '#c8d6e5',
    oceanBg: '#c8d6e5',
    borderWidth: 2,
    forestFill: '#27ae60',
    forestStroke: '#1e8449',
    lakeColor: '#c8d6e5',
    mountainFill: '#7f8c8d'
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
    coastlineColor: '#1e293b',
    cityIconColor: '#f59e0b',
    cityNameColor: '#f8fafc',
    labelFontFamily: 'Cinzel, serif',
    landBg: '#171d29',
    mountainStroke: '#475569',
    riverColor: '#0b1325',
    oceanBg: '#0b1325',
    borderWidth: 2,
    forestFill: '#064e3b',
    forestStroke: '#022c22',
    lakeColor: '#0b1325',
    mountainFill: '#475569'
  },
  clean: {
    id: 'clean',
    name: 'Clean Fantasy',
    description: 'Modern crisp vector aesthetic with vibrant pastel biomes and high legibility.',
    background: '#f8fafc',
    waterColor: '#e0f2fe',
    landColor: '#f1f5f9',
    coastColor: '#bae6fd',
    mountainColor: '#64748b',
    forestColor: '#10b981',
    textColor: '#0f172a',
    fontFamily: 'Cinzel, serif',
    borderColor: '#38bdf8',
    coastlineColor: '#bae6fd',
    cityIconColor: '#38bdf8',
    cityNameColor: '#0f172a',
    labelFontFamily: 'Cinzel, serif',
    landBg: '#f1f5f9',
    mountainStroke: '#64748b',
    riverColor: '#e0f2fe',
    oceanBg: '#e0f2fe',
    borderWidth: 2,
    forestFill: '#10b981',
    forestStroke: '#047857',
    lakeColor: '#e0f2fe',
    mountainFill: '#64748b'
  },
  'hand-drawn': {
    id: 'hand-drawn',
    name: 'Hand Drawn Sketch',
    description: 'Monochrome ink sketch style reminiscent of hand-drawn fantasy novels.',
    background: '#fafaf9',
    waterColor: '#e7e5e4',
    landColor: '#fafaf9',
    coastColor: '#d6d3d1',
    mountainColor: '#57534e',
    forestColor: '#292524',
    textColor: '#1c1917',
    fontFamily: 'Cinzel, serif',
    borderColor: '#44403c',
    coastlineColor: '#d6d3d1',
    cityIconColor: '#1c1917',
    cityNameColor: '#1c1917',
    labelFontFamily: 'Cinzel, serif',
    landBg: '#fafaf9',
    mountainStroke: '#57534e',
    riverColor: '#e7e5e4',
    oceanBg: '#e7e5e4',
    borderWidth: 2,
    forestFill: '#292524',
    forestStroke: '#1c1917',
    lakeColor: '#e7e5e4',
    mountainFill: '#57534e'
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
    coastlineColor: '#3b82f6',
    cityIconColor: '#facc15',
    cityNameColor: '#fef08a',
    labelFontFamily: 'Cinzel, serif',
    landBg: '#312e81',
    mountainStroke: '#6366f1',
    riverColor: '#1e3a8a',
    oceanBg: '#1e3a8a',
    borderWidth: 2,
    forestFill: '#047857',
    forestStroke: '#064e3b',
    lakeColor: '#1e3a8a',
    mountainFill: '#6366f1'
  }
};
