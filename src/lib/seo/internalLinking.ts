export interface InternalLinkItem {
  title: string;
  url: string;
  description?: string;
  icon?: string;
}

export const InternalLinkingEngine = {
  // ----------------------------------------------------
  // 1. GENERATOR LANDING PAGES
  // ----------------------------------------------------
  getGenerators(): InternalLinkItem[] {
    return [
      { title: 'Fantasy Map Generator', url: '/fantasy-map-generator', description: 'Flagship interactive cartography generator.' },
      { title: 'AI Fantasy Map Generator', url: '/ai-fantasy-map-generator', description: 'Describe your world in natural language.' },
      { title: 'D&D Map Generator', url: '/dnd-map-generator', description: 'Custom maps for D&D campaigns.' },
      { title: 'RPG Map Generator', url: '/rpg-map-generator', description: 'Tabletop campaign maps and locations.' },
      { title: 'World Map Generator', url: '/world-map-generator', description: 'Grand global continents and oceans.' },
      { title: 'Kingdom Map Generator', url: '/kingdom-map-generator', description: 'Feudal borders and realm maps.' },
      { title: 'Island Map Generator', url: '/island-map-generator', description: 'Archipelagoes and tropical coastlines.' },
      { title: 'Continent Map Generator', url: '/continent-map-generator', description: 'Large scale continent landmasses.' },
      { title: 'City Map Generator', url: '/city-map-generator', description: 'Urban settlements and capital cities.' },
      { title: 'Dungeon Map Generator', url: '/dungeon-map-generator', description: 'Chambers, catacombs, and dungeon keeps.' }
    ];
  },

  // ----------------------------------------------------
  // 2. FREE GENERATOR TOOLS
  // ----------------------------------------------------
  getTools(): InternalLinkItem[] {
    return [
      { title: 'Fantasy Name Generator', url: '/tools/fantasy-name-generator', description: 'Generate heroic fantasy character and place names.' },
      { title: 'Kingdom Name Generator', url: '/tools/kingdom-name-generator', description: 'Feudal empire and realm names.' },
      { title: 'City Name Generator', url: '/tools/city-name-generator', description: 'Capital city and town names.' },
      { title: 'Village Name Generator', url: '/tools/village-name-generator', description: 'Rustic hamlet and village names.' },
      { title: 'Character Name Generator', url: '/tools/character-name-generator', description: 'Fantasy hero, mage, and villain names.' },
      { title: 'Faction Name Generator', url: '/tools/faction-name-generator', description: 'Guilds, orders, and royal houses.' },
      { title: 'Location Generator', url: '/tools/location-generator', description: 'Ancient ruins, castles, and dungeons.' },
      { title: 'River Name Generator', url: '/tools/river-name-generator', description: 'Rivers, waterways, and estuaries.' },
      { title: 'Mountain Name Generator', url: '/tools/mountain-name-generator', description: 'Mountain ranges and volcanic peaks.' },
      { title: 'Quest Generator', url: '/tools/quest-generator', description: 'Tabletop RPG quests and storylines.' }
    ];
  },

  // ----------------------------------------------------
  // 3. STYLE & USE-CASE PAGES
  // ----------------------------------------------------
  getStyles(): InternalLinkItem[] {
    return [
      { title: 'Dark Fantasy Style', url: '/styles/dark-fantasy' },
      { title: 'High Fantasy Style', url: '/styles/high-fantasy' },
      { title: 'Medieval Parchment Style', url: '/styles/medieval' },
      { title: 'Hand-Drawn Style', url: '/styles/hand-drawn' },
      { title: 'RPG Tabletop Style', url: '/styles/rpg' }
    ];
  },

  getUseCases(): InternalLinkItem[] {
    return [
      { title: 'For D&D Players', url: '/for/dnd' },
      { title: 'For Worldbuilders', url: '/for/worldbuilders' },
      { title: 'For Fantasy Writers', url: '/for/writers' },
      { title: 'For Novelists', url: '/for/novelists' },
      { title: 'For Game Masters', url: '/for/game-masters' },
      { title: 'For RPG Gamers', url: '/for/rpg' }
    ];
  },

  // ----------------------------------------------------
  // 4. BREADCRUMBS BUILDER
  // ----------------------------------------------------
  getBreadcrumbs(pathname: string): { label: string; url: string }[] {
    const parts = pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Home', url: '/' }];

    let accUrl = '';
    parts.forEach((p) => {
      accUrl += `/${p}`;
      const formatted = p.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      crumbs.push({ label: formatted, url: accUrl });
    });

    return crumbs;
  }
};
