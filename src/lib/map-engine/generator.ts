import type {
  FantasyMap,
  GeneratorConfig,
  Settlement,
  MapKingdom,
  MapLabel,
  PointOfInterest,
  Position
} from '../../types/map';
import type { AdvancedGeographyConfig, FeatureLocks } from '../../types/mapGeography';
import { SpatialEngine } from './spatialEngine';

// Pseudo-Random Number Generator based on Seed
function createPRNG(seed: number) {
  let s = Math.abs(seed) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const REALM_NAME_PREFIXES = [
  'Eldoria', 'Valoria', 'Solaria', 'Frostveil', 'Ironpeak', 'Aethelgard',
  'Mythgard', 'Silvermoon', 'Shadowfen', 'Dragonspire', 'Sunreach', 'Highpeak',
  'Stormhaven', 'Duskwood', 'Grimhold', 'Whiterock', 'Ravencrest', 'Ambervale'
];

const REALM_TITLES = [
  'The Realms of', 'The Grand Dominion of', 'The High Kingdom of',
  'The Sovereign Empire of', 'The Lands of', 'The Chronicles of'
];

const KINGDOM_PROFILES = [
  { name: 'High Kingdom of Sunreach', color: '#d4af37', ruler: 'King Aldren IV' },
  { name: 'Ironpeak Dominion', color: '#c0392b', ruler: 'High Thane Thrain' },
  { name: 'Vaeloria Duchy', color: '#2980b9', ruler: 'Duchess Katherine Vael' },
  { name: 'Shadow Coven Realm', color: '#8e44ad', ruler: 'Archmage Morvath' },
  { name: 'Sylvan Glade Realm', color: '#27ae60', ruler: 'Lord Oberon' },
  { name: 'Frosthold Barony', color: '#16a085', ruler: 'Baron Frost' },
  { name: 'Golden Coast League', color: '#f39c12', ruler: 'Merchant Prince Marcus' },
  { name: 'Ashen Waste Clan', color: '#7f8c8d', ruler: 'Warlord Azgoth' }
];

const SEA_NAMES = [
  'THE GREAT SEA', 'OCEAN OF WHISPERS', 'THE SAPPHIRE REACH',
  'THE FORBIDDEN DEEPS', 'THE CELESTIAL OCEAN', 'THE ENDLESS EXPANSE',
  'THE SUNKEN DEPTHS', 'THE MISTY OCEAN'
];

const POI_TEMPLATES = [
  { name: 'Whispering Ruins', type: 'ruins' as const, description: 'Ancient magical sanctum from the First Age.' },
  { name: 'Obsidian Dragon Lair', type: 'dragon-lair' as const, description: 'Lair of the dark titan dragon.' },
  { name: 'Sunken Citadel', type: 'dungeon' as const, description: 'Submerged halls filled with forbidden relics.' },
  { name: 'Astral Beacon', type: 'tower' as const, description: 'Mystic stargazing spire channelled to the cosmos.' },
  { name: 'Spire of Eternity', type: 'castle' as const, description: 'High fortress towering above the mountain clouds.' },
  { name: 'Forgotten Shrine', type: 'shrine' as const, description: 'Sacred grove blessed by the earth spirits.' },
  { name: 'Mithril Deep Mine', type: 'mine' as const, description: 'Subterranean tunnels rich in arcane ores.' }
];

export function generateFantasyMap(config: GeneratorConfig): FantasyMap {
  const seed = config.seed || Math.floor(Math.random() * 899999) + 100000;
  const width = config.width || 1200;
  const height = config.height || 800;
  const mapType = config.type || 'continent';
  const mapStyle = config.style || 'parchment';

  const prng = createPRNG(seed);

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

  // Generate Type-specific Coastlines & Offshore Islands
  let coastline = '';
  const islandPaths: string[] = [];

  const randomRealmPrefix = REALM_NAME_PREFIXES[Math.floor(prng() * REALM_NAME_PREFIXES.length)];
  const randomTitle = REALM_TITLES[Math.floor(prng() * REALM_TITLES.length)];
  let customSeaName = SEA_NAMES[Math.floor(prng() * SEA_NAMES.length)];
  let customRealmName = config.name || `${randomTitle} ${randomRealmPrefix}`.toUpperCase();

  if (mapType === 'india') {
    customSeaName = 'INDIAN OCEAN (ARABIAN SEA & BAY OF BENGAL)';
    customRealmName = config.name || 'GREAT REALM OF BHARAT (INDIA)';
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
    const rx = width * 0.28;
    const ry = height * 0.28;
    const numPoints = 48;
    const pts: { x: number; y: number }[] = [];

    for (let i = 0; i < numPoints; i++) {
      const angle = (i * Math.PI * 2) / numPoints;
      const noise =
        1.0 +
        Math.sin(angle * 3 + (seed % 47)) * 0.25 +
        Math.cos(angle * 7 + (seed % 61)) * 0.12 +
        (prng() - 0.5) * 0.08;
      pts.push({
        x: cx + Math.cos(angle) * rx * noise,
        y: cy + Math.sin(angle) * ry * noise
      });
    }

    coastline = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[i];
      const p1 = pts[(i + 1) % pts.length];
      coastline += ` Q ${p0.x} ${p0.y}, ${(p0.x + p1.x) / 2} ${(p0.y + p1.y) / 2}`;
    }
    coastline += ' Z';
  } else if (mapType === 'archipelago') {
    const islandClusters = [
      { x: cx - 240 + prng() * 60, y: cy - 140 + prng() * 50, rx: 120 + prng() * 30, ry: 90 + prng() * 20 },
      { x: cx + 180 + prng() * 60, y: cy - 100 + prng() * 50, rx: 140 + prng() * 30, ry: 95 + prng() * 25 },
      { x: cx - 110 + prng() * 60, y: cy + 130 + prng() * 50, rx: 135 + prng() * 30, ry: 105 + prng() * 25 },
      { x: cx + 210 + prng() * 60, y: cy + 140 + prng() * 50, rx: 100 + prng() * 25, ry: 75 + prng() * 20 },
      { x: cx + 10 + prng() * 40, y: cy - 20 + prng() * 40, rx: 110 + prng() * 25, ry: 90 + prng() * 20 }
    ];

    coastline = islandClusters
      .map((isl, idx) => {
        const pts: { x: number; y: number }[] = [];
        for (let i = 0; i < 28; i++) {
          const angle = (i * Math.PI * 2) / 28;
          const noise = 1.0 + Math.sin(angle * 3 + seed + idx * 7) * 0.22 + (prng() - 0.5) * 0.1;
          pts.push({
            x: isl.x + Math.cos(angle) * isl.rx * noise,
            y: isl.y + Math.sin(angle) * isl.ry * noise
          });
        }
        let p = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length; i++) {
          const p0 = pts[i];
          const p1 = pts[(i + 1) % pts.length];
          p += ` Q ${p0.x} ${p0.y}, ${(p0.x + p1.x) / 2} ${(p0.y + p1.y) / 2}`;
        }
        return p + ' Z';
      })
      .join(' ');
  } else {
    // Dynamic Continent / Kingdom / Region with high organic variety
    const rx = mapType === 'continent' ? width * 0.40 : mapType === 'kingdom' ? width * 0.44 : width * 0.46;
    const ry = mapType === 'continent' ? height * 0.38 : mapType === 'kingdom' ? height * 0.42 : height * 0.44;
    const numPoints = 56;
    const pts: { x: number; y: number }[] = [];

    for (let i = 0; i < numPoints; i++) {
      const angle = (i * Math.PI * 2) / numPoints;
      // Multi-octave organic harmonic noise
      const oct1 = Math.sin(angle * 2.5 + (seed % 89)) * 0.26;
      const oct2 = Math.cos(angle * 5.0 + ((seed * 3) % 97)) * 0.15;
      const oct3 = Math.sin(angle * 10.0 + ((seed * 7) % 113)) * 0.08;
      const noise = Math.max(0.45, 1.0 + oct1 + oct2 + oct3 + (prng() - 0.5) * 0.06);

      pts.push({
        x: cx + Math.cos(angle) * rx * noise,
        y: cy + Math.sin(angle) * ry * noise
      });
    }

    coastline = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[i];
      const p1 = pts[(i + 1) % pts.length];
      coastline += ` Q ${p0.x} ${p0.y}, ${(p0.x + p1.x) / 2} ${(p0.y + p1.y) / 2}`;
    }
    coastline += ' Z';

    // Generate 3-5 offshore islands for rich cartography
    const islandCount = 3 + Math.floor(prng() * 3);
    for (let isl = 0; isl < islandCount; isl++) {
      const islAngle = prng() * Math.PI * 2;
      const islDist = Math.min(rx, ry) * (1.05 + prng() * 0.2);
      const islCx = cx + Math.cos(islAngle) * islDist;
      const islCy = cy + Math.sin(islAngle) * islDist;
      const islRx = 22 + prng() * 25;
      const islRy = 16 + prng() * 20;

      const islPts: { x: number; y: number }[] = [];
      for (let k = 0; k < 18; k++) {
        const a = (k * Math.PI * 2) / 18;
        const n = 1.0 + Math.sin(a * 3 + seed + isl * 11) * 0.24;
        islPts.push({ x: islCx + Math.cos(a) * islRx * n, y: islCy + Math.sin(a) * islRy * n });
      }
      let islPath = `M ${islPts[0].x} ${islPts[0].y}`;
      for (let k = 0; k < islPts.length; k++) {
        const p0 = islPts[k];
        const p1 = islPts[(k + 1) % islPts.length];
        islPath += ` Q ${p0.x} ${p0.y}, ${(p0.x + p1.x) / 2} ${(p0.y + p1.y) / 2}`;
      }
      islPath += ' Z';
      islandPaths.push(islPath);
    }
  }

  // Mountains list
  const mountains: Position[] = [];
  mtnRanges.forEach((range) => {
    range.ridgePoints.forEach((pt) => {
      mountains.push({
        id: `m_${pt.x}_${pt.y}`,
        x: pt.x,
        y: pt.y,
        height: 22 + Math.floor(prng() * 10),
        size: 16
      });
    });
  });

  // Forests list
  const forestCount = Math.max(2, Math.floor((config.forestDensity || 5) * 0.8));
  const forests = Array.from({ length: forestCount }).map((_, idx) => ({
    id: `f_${idx}_${seed}`,
    x: cx + Math.sin(idx * 2.3 + seed) * (width * 0.28),
    y: cy + Math.cos(idx * 2.7 + seed) * (height * 0.28),
    radius: 32 + (idx % 3) * 14,
    count: 10 + idx * 4
  }));

  // Kingdoms list with distinct border regions
  const kingdomCount = Math.min(8, Math.max(1, config.kingdomCount || 4));
  const selectedProfiles = [...KINGDOM_PROFILES].sort(() => prng() - 0.5).slice(0, kingdomCount);

  const kingdoms: MapKingdom[] = selectedProfiles.map((kp, idx) => {
    const kAngle = (idx * Math.PI * 2) / kingdomCount + 0.3;
    const kDist = 140 + prng() * 80;
    const kx = cx + Math.cos(kAngle) * kDist;
    const ky = cy + Math.sin(kAngle) * kDist;
    const kr = 100 + prng() * 40;

    // Build organic regional territory border path
    const borderPts: { x: number; y: number }[] = [];
    for (let b = 0; b < 16; b++) {
      const bAngle = (b * Math.PI * 2) / 16;
      const bNoise = 1.0 + Math.sin(bAngle * 3 + idx * 5 + seed) * 0.22;
      borderPts.push({
        x: kx + Math.cos(bAngle) * kr * bNoise,
        y: ky + Math.sin(bAngle) * kr * bNoise
      });
    }
    let borderPath = `M ${borderPts[0].x} ${borderPts[0].y}`;
    for (let b = 0; b < borderPts.length; b++) {
      const p0 = borderPts[b];
      const p1 = borderPts[(b + 1) % borderPts.length];
      borderPath += ` Q ${p0.x} ${p0.y}, ${(p0.x + p1.x) / 2} ${(p0.y + p1.y) / 2}`;
    }
    borderPath += ' Z';

    return {
      id: `k_${idx}_${seed}`,
      name: kp.name,
      color: kp.color,
      ruler: kp.ruler,
      center: { x: kx, y: ky },
      borderPath
    };
  });

  // Dynamic POIs
  const poiCount = Math.min(4, Math.max(2, Math.floor(prng() * 3) + 2));
  const pointsOfInterest: PointOfInterest[] = POI_TEMPLATES.slice(0, poiCount).map((tpl, idx) => ({
    id: `poi_${idx}_${seed}`,
    name: tpl.name,
    type: tpl.type,
    x: cx + Math.sin(idx * 3.1 + seed + 5) * (width * 0.22),
    y: cy + Math.cos(idx * 3.7 + seed + 7) * (height * 0.22),
    description: tpl.description
  }));

  // Dynamic Labels
  const labels: MapLabel[] = [
    {
      id: `l_sea_${seed}`,
      text: customSeaName,
      x: cx - width * 0.36,
      y: cy,
      fontSize: 18,
      rotation: -90,
      color: '#3b82f6',
      category: 'ocean'
    },
    {
      id: `l_realm_${seed}`,
      text: customRealmName,
      x: cx,
      y: cy - height * 0.34,
      fontSize: 22,
      category: 'region'
    }
  ];

  return {
    id: `map_${Date.now().toString(36)}_${seed}`,
    seed,
    name: config.name || customRealmName,
    titleBannerText: customRealmName,
    type: mapType,
    style: mapStyle,
    width,
    height,
    viewBox: { x: 0, y: 0, width, height },
    coastline,
    coastlinePath: coastline,
    islandPaths,
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
    const newMtns = mtnRanges.flatMap((r) =>
      r.ridgePoints.map((pt) => ({ id: `m_${pt.x}_${pt.y}`, x: pt.x, y: pt.y, height: 25, size: 16 }))
    );
    const lockedMtns = existingMap.mountains.filter((m) => locks.lockedMountainIds.includes(m.id || ''));
    resultMap.mountains = [...lockedMtns, ...newMtns];
  }

  return resultMap;
}
