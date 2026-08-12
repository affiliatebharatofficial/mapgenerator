export interface MapIconSymbol {
  id: string;
  name: string;
  category: 'settlement' | 'structure' | 'fantasy' | 'nature';
  svgPath: string;
}

export const MAP_ICON_LIBRARY: MapIconSymbol[] = [
  // Settlements
  {
    id: 'icon_capital',
    name: 'Capital Crown Keep',
    category: 'settlement',
    svgPath: 'M12 2L15 8H9L12 2ZM5 10L7 16H17L19 10H5ZM4 18H20V21H4V18Z'
  },
  {
    id: 'icon_city',
    name: 'Major City Fort',
    category: 'settlement',
    svgPath: 'M4 20H20V12H16V8H12V12H8V8H4V20Z'
  },
  {
    id: 'icon_town',
    name: 'Walled Town',
    category: 'settlement',
    svgPath: 'M3 20h18v-8l-4-4-5 3-5-3-4 4v8zm5-4h3v4H8v-4z'
  },
  {
    id: 'icon_village',
    name: 'Village Cottage',
    category: 'settlement',
    svgPath: 'M12 3L2 12H5V20H19V12H22L12 3Z'
  },
  {
    id: 'icon_port',
    name: 'Port Harbor',
    category: 'settlement',
    svgPath: 'M12 2a2 2 0 0 1 2 2v6h3a1 1 0 0 1 0 2h-3v5.5a2.5 2.5 0 0 0 5 0V16a1 1 0 0 1 2 0v1.5a4.5 4.5 0 0 1-9 0V12H7a1 1 0 0 1 0-2h3V4a2 2 0 0 1 2-2z'
  },
  {
    id: 'icon_fortress',
    name: 'Stronghold Fortress',
    category: 'settlement',
    svgPath: 'M2 20h20V8l-3-3-3 3-4-4-4 4-3-3-3 3v12zm6-4h2v4H8v-4zm6 0h2v4h-2v-4z'
  },

  // Structures
  {
    id: 'icon_castle',
    name: 'Stone Castle',
    category: 'structure',
    svgPath: 'M2 22H22V10L18 6L14 10L10 6L6 10L2 6V22Z'
  },
  {
    id: 'icon_tower',
    name: 'Watch Tower',
    category: 'structure',
    svgPath: 'M8 22H16V6L12 2L8 6V22Z'
  },
  {
    id: 'icon_ruins',
    name: 'Ancient Ruins',
    category: 'structure',
    svgPath: 'M4 22H8V14L12 10L16 14V22H20V6L12 2L4 6V22Z'
  },
  {
    id: 'icon_shrine',
    name: 'Sacred Shrine',
    category: 'structure',
    svgPath: 'M12 2L3 9h3v11h12V9h3L12 2zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6z'
  },
  {
    id: 'icon_mine',
    name: 'Mountain Mine',
    category: 'structure',
    svgPath: 'M14.7 13.3l-3.5 3.5 1.4 1.4 3.5-3.5 3.5 3.5 1.4-1.4-3.5-3.5 3.5-3.5-1.4-1.4-3.5 3.5-3.5-3.5-1.4 1.4 3.5 3.5zM3 20h6v-2H5v-4H3v6z'
  },

  // Fantasy & POIs
  {
    id: 'icon_dungeon',
    name: 'Dungeon Gate',
    category: 'fantasy',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12V22H22V12C22 6.48 17.52 2 12 2ZM12 6C14.21 6 16 7.79 16 10V20H8V10C8 7.79 9.79 6 12 6Z'
  },
  {
    id: 'icon_dragon',
    name: 'Dragon Lair',
    category: 'fantasy',
    svgPath: 'M12 2L15 7L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 7L12 2Z'
  },
  {
    id: 'icon_battlefield',
    name: 'Crossed Swords',
    category: 'fantasy',
    svgPath: 'M6.92 5.51L5.51 6.92l5.08 5.08-1.41 1.41-5.08-5.08L2.69 9.74l-.71-4.95 4.95.72 2.76 2.76zm10.16 0l2.76-2.76 4.95-.72-.71 4.95-2.76-2.76-5.08 5.08-1.41-1.41 5.08-5.08z'
  },
  {
    id: 'icon_magical',
    name: 'Arcane Leyline Star',
    category: 'fantasy',
    svgPath: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4L2 9.4h7.6z'
  },
  {
    id: 'icon_camp',
    name: 'Adventurer Camp',
    category: 'fantasy',
    svgPath: 'M12 3L2 19h20L12 3zm0 4l6 10H6l6-10z'
  },

  // Nature
  {
    id: 'icon_mountain',
    name: 'Mountain Peak',
    category: 'nature',
    svgPath: 'M12 2L1 21H23L12 2ZM12 6L17.5 16H6.5L12 6Z'
  },
  {
    id: 'icon_tree',
    name: 'Ancient Tree',
    category: 'nature',
    svgPath: 'M12 2L5 13H8V22H16V13H19L12 2Z'
  }
];

// Helper to get SVG path for any POI or Settlement type
export function getVectorIconPath(type: string): string {
  switch (type) {
    case 'capital':
      return MAP_ICON_LIBRARY[0].svgPath;
    case 'city':
      return MAP_ICON_LIBRARY[1].svgPath;
    case 'town':
      return MAP_ICON_LIBRARY[2].svgPath;
    case 'village':
      return MAP_ICON_LIBRARY[3].svgPath;
    case 'port':
      return MAP_ICON_LIBRARY[4].svgPath;
    case 'fortress':
      return MAP_ICON_LIBRARY[5].svgPath;
    case 'castle':
      return MAP_ICON_LIBRARY[6].svgPath;
    case 'tower':
      return MAP_ICON_LIBRARY[7].svgPath;
    case 'ruins':
      return MAP_ICON_LIBRARY[8].svgPath;
    case 'shrine':
    case 'temple':
      return MAP_ICON_LIBRARY[9].svgPath;
    case 'mine':
      return MAP_ICON_LIBRARY[10].svgPath;
    case 'dungeon':
      return MAP_ICON_LIBRARY[11].svgPath;
    case 'dragon-lair':
    case 'dragon':
      return MAP_ICON_LIBRARY[12].svgPath;
    case 'battlefield':
      return MAP_ICON_LIBRARY[13].svgPath;
    case 'magical-site':
    case 'magical':
      return MAP_ICON_LIBRARY[14].svgPath;
    case 'camp':
      return MAP_ICON_LIBRARY[15].svgPath;
    default:
      return MAP_ICON_LIBRARY[6].svgPath; // Castle fallback
  }
}
