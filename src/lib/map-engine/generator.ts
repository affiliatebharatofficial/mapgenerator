import type {
  FantasyMap,
  GeneratorConfig,
  Settlement,
  MapKingdom,
  MapLabel,
  PointOfInterest,
  RiverPath,
  RoadPath
} from '../../types/map';
import type { AdvancedGeographyConfig, FeatureLocks } from '../../types/mapGeography';
import { SpatialEngine } from './spatialEngine';

export function generateFantasyMap(config: GeneratorConfig): FantasyMap {
  const seed = config.seed || Math.floor(Math.random() * 899999) + 100000;
  const width = config.width || 1200;
  const height = config.height || 800;
  const mapType = config.type || 'continent';
  const mapStyle = config.style || 'parchment';

  let seaLevel = 0.35;
  let landmassAmount = 6;

  if (mapType === 'island') {
    seaLevel = 0.55;
    landmassAmount = 2;
  } else if (mapType === 'archipelago') {
    seaLevel = 0.50;
    landmassAmount = 14;
  } else if (mapType === 'continent') {
    seaLevel = 0.32;
    landmassAmount = 6;
  } else if (mapType === 'kingdom') {
    seaLevel = 0.28;
    landmassAmount = 8;
  } else if (mapType === 'region') {
    seaLevel = 0.22;
    landmassAmount = 10;
  }

  const geoConfig: AdvancedGeographyConfig = {
    seed,
    profile: 'balanced-fantasy',
    realismLevel: 75,
    landmassAmount,
    mountainDensity: config.mountainDensity || 6,
    riverDensity: config.riverDensity || 5,
    forestDensity: config.forestDensity || 5,
    settlementDensity: Math.min(10, Math.max(1, Math.floor((config.settlementCount || 10) / 2))),
    rainfallLevel: 5,
    temperatureLevel: 5,
    seaLevel,
    rainShadowEffect: true,
    fantasyOverrides: {
      magicalRivers: false,
      floatingIslands: false,
      impossiblePeaks: false
    }
  };

  const heightmap = SpatialEngine.generateHeightmap(width, height, geoConfig);
  const mtnRanges = SpatialEngine.generateMountainRanges(heightmap, geoConfig);
  const rivers = SpatialEngine.generateRivers(heightmap, geoConfig);
  const cities = SpatialEngine.generateSettlements(heightmap, rivers, geoConfig);
  const roads = SpatialEngine.generateRoads(cities);

  const cx = width / 2;
  const cy = height / 2;

  // Generate Type-specific Coastlines
  let coastline = '';
  let customSeaName = 'THE GREAT SEA';
  let customRealmName = config.name || `${mapType.toUpperCase()} OF ELDORIA`;

  if (mapType === 'india') {
    customSeaName = 'INDIAN OCEAN (ARABIAN SEA & BAY OF BENGAL)';
    customRealmName = config.name || 'GREAT REALM OF BHARAT (INDIA)';
    // Accurate Detailed Indian Subcontinent SVG path with Kashmir Crown, Gujarat Peninsula & Islands
    coastline = `M 580 60 L 630 70 L 650 120 L 710 160 L 770 170 L 830 150 L 920 180 L 940 230 L 890 280 L 810 270 L 770 320 L 760 380 L 700 460 L 640 560 L 590 730 L 570 730 L 520 600 L 480 480 L 450 380 L 380 370 L 340 330 L 400 290 L 430 310 L 440 240 L 500 160 Z M 840 560 A 8 8 0 1 1 840 576 A 8 8 0 1 1 840 560 M 850 620 A 10 10 0 1 1 850 640 A 10 10 0 1 1 850 620 M 460 640 A 6 6 0 1 1 460 652 A 6 6 0 1 1 460 640`;
  } else if (mapType === 'usa') {
    customSeaName = 'ATLANTIC & PACIFIC OCEANS';
    customRealmName = config.name || 'UNITED REALMS OF AMERICA';
    coastline = `M 150 160 Q 450 140 750 160 L 980 200 Q 1060 400 1020 540 L 900 580 L 860 700 L 780 580 L 480 560 L 280 620 L 120 420 Z`;
  } else if (mapType === 'europe') {
    customSeaName = 'MEDITERRANEAN & NORTH SEA';
    customRealmName = config.name || 'REALMS OF EUROPE';
    coastline = `M 200 180 Q 550 120 900 150 Q 1020 320 920 520 Q 750 680 520 620 Q 320 660 180 480 Z`;
  } else if (mapType === 'japan') {
    customSeaName = 'PACIFIC OCEAN & SEA OF JAPAN';
    customRealmName = config.name || 'JAPANESE ARCHIPELAGO';
    coastline = `M 780 140 Q 860 120 920 180 Q 880 240 820 220 Z M 520 280 Q 720 200 780 340 Q 620 480 480 400 Z M 340 460 Q 440 440 420 560 Q 320 540 340 460 Z`;
  } else if (mapType === 'uk') {
    customSeaName = 'NORTH SEA & IRISH SEA';
    customRealmName = config.name || 'THE BRITISH ISLES';
    coastline = `M 580 140 Q 720 120 700 320 Q 780 480 640 680 Q 520 520 560 380 Z M 320 320 Q 440 300 420 480 Q 300 520 320 320 Z`;
  } else if (mapType === 'australia') {
    customSeaName = 'SOUTHERN & INDIAN OCEANS';
    customRealmName = config.name || 'COMMONWEALTH REALM OF AUSTRALIA';
    coastline = `M 420 180 Q 520 140 560 220 Q 640 120 700 240 Q 860 220 920 360 Q 980 500 880 600 Q 680 640 520 620 Q 320 640 220 520 Q 180 340 320 260 Z M 720 660 Q 760 660 740 700 Q 700 700 720 660 Z`;
  } else if (mapType === 'canada') {
    customSeaName = 'ARCTIC & ATLANTIC OCEANS';
    customRealmName = config.name || 'DOMINION REALM OF CANADA';
    coastline = `M 150 180 L 450 140 L 620 220 L 780 160 L 980 180 L 1050 340 L 950 500 L 750 480 L 450 520 L 180 480 Z M 650 280 Q 750 260 720 380 Q 620 360 650 280 Z`;
  } else if (mapType === 'brazil') {
    customSeaName = 'ATLANTIC OCEAN & AMAZON BASIN';
    customRealmName = config.name || 'FEDERATIVE REALM OF BRAZIL';
    coastline = `M 350 180 Q 650 140 850 220 Q 950 380 820 540 Q 680 680 520 660 Q 400 520 280 380 Z`;
  } else if (mapType === 'italy') {
    customSeaName = 'MEDITERRANEAN & ADRIATIC SEAS';
    customRealmName = config.name || 'REPUBLIC REALM OF ITALY';
    coastline = `M 380 160 Q 620 140 680 220 L 620 340 L 740 480 L 820 560 L 780 620 L 680 560 L 580 420 L 520 320 Z M 580 640 Q 660 620 640 700 Q 560 680 580 640 Z M 360 380 Q 420 360 400 500 Q 340 480 360 380 Z`;
  } else if (mapType === 'egypt') {
    customSeaName = 'MEDITERRANEAN & RED SEA';
    customRealmName = config.name || 'ANCIENT REALM OF EGYPT';
    coastline = `M 280 180 Q 520 160 820 180 L 850 440 L 780 640 L 320 640 Z`;
  } else if (mapType === 'island') {
    const rx = width * 0.25;
    const ry = height * 0.25;
    coastline = `M ${cx + rx} ${cy}`;
    for (let i = 1; i <= 36; i++) {
      const angle = (i * Math.PI * 2) / 36;
      const noise = 1 + Math.sin(i * 2 + seed % 100) * 0.25;
      const x = cx + Math.cos(angle) * rx * noise;
      const y = cy + Math.sin(angle) * ry * noise;
      coastline += ` Q ${cx + Math.cos(angle - 0.1) * rx * noise} ${cy + Math.sin(angle - 0.1) * ry * noise}, ${x} ${y}`;
    }
    coastline += ' Z';
  } else if (mapType === 'archipelago') {
    // Multiple distinct island clusters
    const islands = [
      { x: cx - 220, y: cy - 120, rx: 110, ry: 80 },
      { x: cx + 180, y: cy - 90, rx: 130, ry: 90 },
      { x: cx - 100, y: cy + 130, rx: 140, ry: 100 },
      { x: cx + 200, y: cy + 140, rx: 90, ry: 70 },
      { x: cx + 20, y: cy - 20, rx: 100, ry: 85 }
    ];
    coastline = islands
      .map((isl, idx) => {
        let path = `M ${isl.x + isl.rx} ${isl.y}`;
        for (let i = 1; i <= 24; i++) {
          const angle = (i * Math.PI * 2) / 24;
          const noise = 1 + Math.sin(i * 1.8 + seed + idx) * 0.22;
          const x = isl.x + Math.cos(angle) * isl.rx * noise;
          const y = isl.y + Math.sin(angle) * isl.ry * noise;
          path += ` L ${x} ${y}`;
        }
        return path + ' Z';
      })
      .join(' ');
  } else {
    // Continent / Kingdom / Region landmass
    const rx = mapType === 'continent' ? width * 0.42 : width * 0.46;
    const ry = mapType === 'continent' ? height * 0.40 : height * 0.44;
    coastline = `M ${cx + rx} ${cy}`;
    for (let i = 1; i <= 40; i++) {
      const angle = (i * Math.PI * 2) / 40;
      const noise = 1 + Math.sin(i * 1.5 + (seed % 100)) * 0.20 + Math.cos(i * 3 + seed) * 0.08;
      const x = cx + Math.cos(angle) * rx * noise;
      const y = cy + Math.sin(angle) * ry * noise;
      coastline += ` Q ${cx + Math.cos(angle - 0.08) * rx * noise} ${cy + Math.sin(angle - 0.08) * ry * noise}, ${x} ${y}`;
    }
    coastline += ' Z';
  }

  // Mountains list
  const mountains: any[] = [];
  mtnRanges.forEach((range) => {
    range.ridgePoints.forEach((pt) => {
      mountains.push({
        id: `m_${pt.x}_${pt.y}`,
        x: pt.x,
        y: pt.y,
        height: 25,
        size: 16
      });
    });
  });

  // Forests list
  const forestCount = Math.max(1, Math.floor((config.forestDensity || 5) / 2));
  const forests = Array.from({ length: forestCount }).map((_, idx) => ({
    id: `f_${idx}_${seed}`,
    x: cx + Math.sin(idx * 2 + seed) * 220,
    y: cy + Math.cos(idx * 2.5 + seed) * 140,
    radius: 35 + (idx % 3) * 15,
    count: 10 + idx * 4
  }));

  // Kingdoms list
  const kingdomCount = Math.min(8, Math.max(1, config.kingdomCount || 4));
  const masterKingdoms: MapKingdom[] = [
    { id: 'k_sunreach', name: 'High Kingdom of Sunreach', color: '#d4af37', ruler: 'King Aldren IV' },
    { id: 'k_ironpeak', name: 'Ironpeak Dominion', color: '#c0392b', ruler: 'High Thane Thrain' },
    { id: 'k_vaeloria', name: 'Vaeloria Duchy', color: '#2980b9', ruler: 'Duchess Katherine Vael' },
    { id: 'k_shadow', name: 'Shadow Coven Realm', color: '#8e44ad', ruler: 'Archmage Morvath' },
    { id: 'k_sylvan', name: 'Sylvan Glade Realm', color: '#27ae60', ruler: 'Lord Oberon' },
    { id: 'k_frosthold', name: 'Frosthold Barony', color: '#16a085', ruler: 'Baron Frost' }
  ];
  const kingdoms = masterKingdoms.slice(0, kingdomCount);

  // POIs
  const pointsOfInterest: PointOfInterest[] = [
    { id: `poi_1_${seed}`, name: 'Whispering Ruins', type: 'ruins', x: cx + 100, y: cy - 80, description: 'Ancient magical ruins' },
    { id: `poi_2_${seed}`, name: 'Obsidian Dragon Lair', type: 'dragon-lair', x: cx - 120, y: cy + 100, description: 'Lair of the dark titan dragon' }
  ];

  // Labels
  const labels: MapLabel[] = [
    { id: `l_sea_${seed}`, text: customSeaName, x: cx - width * 0.38, y: cy, fontSize: 20, rotation: -90, color: '#3b82f6', category: 'ocean' },
    { id: `l_realm_${seed}`, text: customRealmName, x: cx, y: cy - height * 0.35, fontSize: 24, category: 'region' }
  ];

  return {
    id: `map_${Date.now().toString(36)}`,
    seed,
    name: config.name || 'The Realms of Eldoria',
    type: mapType,
    style: mapStyle,
    width,
    height,
    viewBox: { x: 0, y: 0, width, height },
    coastline,
    coastlinePath: coastline,
    mountains,
    forests,
    rivers,
    roads,
    cities,
    kingdoms,
    pointsOfInterest,
    labels,
    terrainCells: [],
    customRegions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function regeneratePartialSystem(
  existingMap: FantasyMap,
  targetSystem: 'terrain' | 'rivers' | 'biomes' | 'roads' | 'borders',
  locks: FeatureLocks,
  config: AdvancedGeographyConfig
): FantasyMap {
  const newSeed = Math.floor(Math.random() * 900000) + 100000;
  const updatedGeoConfig = { ...config, seed: newSeed };
  const heightmap = SpatialEngine.generateHeightmap(existingMap.width, existingMap.height, updatedGeoConfig);

  const resultMap: FantasyMap = { ...existingMap, seed: newSeed, updatedAt: new Date().toISOString() };

  if (targetSystem === 'rivers') {
    const freshRivers = SpatialEngine.generateRivers(heightmap, updatedGeoConfig);
    const lockedRivers = existingMap.rivers.filter((r) => locks.lockedRiverIds.includes(r.id));
    resultMap.rivers = [...lockedRivers, ...freshRivers];
  } else if (targetSystem === 'roads') {
    resultMap.roads = SpatialEngine.generateRoads(existingMap.cities);
  } else if (targetSystem === 'terrain') {
    const mtnRanges = SpatialEngine.generateMountainRanges(heightmap, updatedGeoConfig);
    const newMtns = mtnRanges.flatMap((r) => r.ridgePoints.map((pt) => ({ id: `m_${pt.x}_${pt.y}`, x: pt.x, y: pt.y, height: 25, size: 16 })));
    const lockedMtns = existingMap.mountains.filter((m) => locks.lockedMountainIds.includes(m.id || ''));
    resultMap.mountains = [...lockedMtns, ...newMtns];
  }

  return resultMap;
}
