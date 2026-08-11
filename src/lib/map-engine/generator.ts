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
  const seed = config.seed || 123456;
  const width = config.width || 1200;
  const height = config.height || 800;

  const geoConfig: AdvancedGeographyConfig = {
    seed,
    profile: 'balanced-fantasy',
    realismLevel: 75,
    landmassAmount: 6,
    mountainDensity: config.mountainDensity || 6,
    riverDensity: config.riverDensity || 5,
    forestDensity: config.forestDensity || 5,
    settlementDensity: Math.min(10, Math.max(1, Math.floor((config.settlementCount || 10) / 2))),
    rainfallLevel: 5,
    temperatureLevel: 5,
    seaLevel: 0.35,
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

  // Coastline SVG path
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.38;
  const ry = height * 0.38;

  let coastline = `M ${cx + rx} ${cy}`;
  for (let i = 1; i <= 36; i++) {
    const angle = (i * Math.PI * 2) / 36;
    const rNoise = 1 + (Math.sin(i * 1.5 + seed % 100) * 0.15);
    const x = cx + Math.cos(angle) * rx * rNoise;
    const y = cy + Math.sin(angle) * ry * rNoise;
    coastline += ` Q ${cx + Math.cos(angle - 0.1) * rx * rNoise} ${cy + Math.sin(angle - 0.1) * ry * rNoise}, ${x} ${y}`;
  }
  coastline += ' Z';

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
  const forests = [
    { id: 'f_1', x: cx - 180, y: cy - 120, radius: 45, count: 12 },
    { id: 'f_2', x: cx + 140, y: cy + 90, radius: 55, count: 16 }
  ];

  // Kingdoms list
  const kingdomCount = config.kingdomCount || 4;
  const kingdoms: MapKingdom[] = [
    { id: 'k_sunreach', name: 'High Kingdom of Sunreach', color: '#d4af37', ruler: 'King Aldren IV' },
    { id: 'k_ironpeak', name: 'Ironpeak Dominion', color: '#c0392b', ruler: 'High Thane Thrain' },
    { id: 'k_vaeloria', name: 'Vaeloria Duchy', color: '#2980b9', ruler: 'Duchess Katherine Vael' },
    { id: 'k_shadow', name: 'Shadow Coven Realm', color: '#8e44ad', ruler: 'Archmage Morvath' }
  ].slice(0, kingdomCount);

  // POIs
  const pointsOfInterest: PointOfInterest[] = [
    { id: 'poi_1', name: 'Whispering Ruins', type: 'ruins', x: cx + 100, y: cy - 80, description: 'Ancient magical ruins' },
    { id: 'poi_2', name: 'Obsidian Dragon Lair', type: 'dragon-lair', x: cx - 120, y: cy + 100, description: 'Lair of the dark titan dragon' }
  ];

  // Labels
  const labels: MapLabel[] = [
    { id: 'l_sea', text: 'THE GREAT SEA', x: cx - rx - 40, y: cy, fontSize: 20, rotation: -90, color: '#3b82f6', category: 'ocean' },
    { id: 'l_realm', text: config.name || 'THE REALMS OF ELDORIA', x: cx, y: cy - ry - 20, fontSize: 24, category: 'region' }
  ];

  return {
    id: `map_${Date.now().toString(36)}`,
    seed,
    name: config.name || 'The Realms of Eldoria',
    type: config.type || 'continent',
    style: config.style || 'parchment',
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
