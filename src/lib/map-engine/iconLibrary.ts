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
    id: 'icon_village',
    name: 'Village Cottage',
    category: 'settlement',
    svgPath: 'M12 3L2 12H5V20H19V12H22L12 3Z'
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

  // Fantasy
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
