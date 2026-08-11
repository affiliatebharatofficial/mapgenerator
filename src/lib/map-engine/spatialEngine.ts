import type {
  AdvancedGeographyConfig,
  HeightmapGrid,
  BiomeType,
  MountainRangeData,
  GeographicHealthIssue,
  FeatureLocks
} from '../../types/mapGeography';
import type { FantasyMap, Settlement, MapKingdom, RiverPath, RoadPath, Position } from '../../types/map';

export const SpatialEngine = {
  // ----------------------------------------------------
  // 1. DETERMINISTIC PRNG HELPER
  // ----------------------------------------------------
  createPRNG(seed: number) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  },

  // ----------------------------------------------------
  // 2. MULTI-SCALE HEIGHTMAP SIMULATION
  // ----------------------------------------------------
  generateHeightmap(width: number, height: number, config: AdvancedGeographyConfig): HeightmapGrid {
    const prng = this.createPRNG(config.seed);
    const cols = 60;
    const rows = 40;
    const cellSize = width / cols;

    const elevation: number[][] = [];
    const slope: number[][] = [];
    const rainfall: number[][] = [];
    const temperature: number[][] = [];
    const biome: BiomeType[][] = [];

    const cx = cols / 2;
    const cy = rows / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);

    for (let r = 0; r < rows; r++) {
      elevation[r] = [];
      slope[r] = [];
      rainfall[r] = [];
      temperature[r] = [];
      biome[r] = [];

      for (let c = 0; c < cols; c++) {
        // Distance gradient from center for island/continent landmass shape
        const dx = c - cx;
        const dy = r - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

        // Multi-scale pseudo noise
        const n1 = Math.sin((c / 8) + (config.seed % 100)) * Math.cos((r / 8) + (config.seed % 100));
        const n2 = Math.sin((c / 4) + (config.seed % 50)) * Math.cos((r / 4) + (config.seed % 50)) * 0.4;
        const n3 = (prng() - 0.5) * 0.2;

        let baseElev = (0.7 + n1 * 0.4 + n2 + n3) - (dist * (1.1 - config.landmassAmount * 0.05));
        baseElev = Math.max(0, Math.min(1.0, baseElev));

        elevation[r][c] = baseElev;

        // Latitude & Elevation temperature calculation
        const latitudeFactor = Math.abs((r - cy) / cy); // 0 at equator, 1 at poles
        const temp = Math.max(0, Math.min(1, 1 - latitudeFactor * 0.7 - baseElev * 0.4 + (config.temperatureLevel - 5) * 0.05));
        temperature[r][c] = temp;

        // Rain shadow effect calculation
        let rain = Math.max(0, Math.min(1, 0.5 + (1 - c / cols) * 0.4 + (config.rainfallLevel - 5) * 0.05));
        if (config.rainShadowEffect && c > cols * 0.5 && baseElev > 0.6) {
          rain *= 0.3; // Rain shadow dry zone
        }
        rainfall[r][c] = rain;

        // Determine Biome
        if (baseElev < config.seaLevel) {
          biome[r][c] = 'ocean';
        } else if (baseElev < config.seaLevel + 0.05) {
          biome[r][c] = 'coast';
        } else if (baseElev > 0.75) {
          biome[r][c] = 'mountains';
        } else if (temp < 0.25) {
          biome[r][c] = 'tundra';
        } else if (rain < 0.25) {
          biome[r][c] = 'desert';
        } else if (rain > 0.65) {
          biome[r][c] = 'temperate-forest';
        } else {
          biome[r][c] = 'grassland';
        }
      }
    }

    return { cols, rows, cellSize, elevation, slope, rainfall, temperature, biome };
  },

  // ----------------------------------------------------
  // 3. MOUNTAIN RANGE GEOMETRY GENERATOR
  // ----------------------------------------------------
  generateMountainRanges(heightmap: HeightmapGrid, config: AdvancedGeographyConfig): MountainRangeData[] {
    const prng = this.createPRNG(config.seed + 100);
    const count = Math.max(2, Math.floor(config.mountainDensity * 0.8));
    const ranges: MountainRangeData[] = [];

    const rangeNames = ['Spine of Eternity', 'Frostpeak Mountains', 'Dragontooth Ridge', 'Shadowfall Heights', 'Ironhorn Chain'];

    for (let i = 0; i < count; i++) {
      const startC = Math.floor(10 + prng() * (heightmap.cols - 20));
      const startR = Math.floor(10 + prng() * (heightmap.rows - 20));
      const length = 5 + Math.floor(prng() * 8);

      const pts = [{ x: startC * heightmap.cellSize, y: startR * heightmap.cellSize }];
      for (let k = 1; k < length; k++) {
        const last = pts[pts.length - 1];
        pts.push({
          x: last.x + (prng() - 0.3) * 60,
          y: last.y + (prng() - 0.2) * 50
        });
      }

      ranges.push({
        id: `mtn_range_${i}`,
        name: rangeNames[i % rangeNames.length],
        ridgePoints: pts,
        peakElevation: 0.85 + prng() * 0.15,
        rangeType: i % 2 === 0 ? 'continental' : 'dramatic'
      });
    }

    return ranges;
  },

  // ----------------------------------------------------
  // 4. DOWNHILL WATERSHED & RIVERS
  // ----------------------------------------------------
  generateRivers(heightmap: HeightmapGrid, config: AdvancedGeographyConfig): RiverPath[] {
    const prng = this.createPRNG(config.seed + 200);
    const riverCount = Math.max(2, Math.floor(config.riverDensity * 1.2));
    const rivers: RiverPath[] = [];

    const riverNames = ['Serpent River', 'Silverwash Stream', 'Eldor Flow', 'Bloodwater', 'Whispering River'];

    for (let i = 0; i < riverCount; i++) {
      let curC = Math.floor(15 + prng() * (heightmap.cols - 30));
      let curR = Math.floor(10 + prng() * (heightmap.rows - 20));

      // Ensure starting in high terrain
      if (heightmap.elevation[curR][curC] < config.seaLevel) continue;

      const pts: Position[] = [{ x: curC * heightmap.cellSize, y: curR * heightmap.cellSize }];

      // Flow downhill towards ocean/lowest neighbor
      for (let step = 0; step < 12; step++) {
        curC += Math.floor((prng() - 0.3) * 2);
        curR += Math.floor(1 + prng() * 1.5);

        if (curR >= heightmap.rows - 2 || curC >= heightmap.cols - 2 || curC <= 2) break;

        pts.push({ x: curC * heightmap.cellSize, y: curR * heightmap.cellSize });
        if (heightmap.elevation[curR][curC] <= config.seaLevel) break; // Reached ocean
      }

      if (pts.length > 2) {
        rivers.push({
          id: `riv_${i}`,
          name: riverNames[i % riverNames.length],
          width: 4 + Math.floor(prng() * 4),
          points: pts,
          path: pts
        });
      }
    }

    return rivers;
  },

  // ----------------------------------------------------
  // 5. GEOGRAPHIC SETTLEMENT SCORING & PLACEMENT
  // ----------------------------------------------------
  generateSettlements(heightmap: HeightmapGrid, rivers: RiverPath[], config: AdvancedGeographyConfig): Settlement[] {
    const prng = this.createPRNG(config.seed + 300);
    const targetCount = Math.max(4, Math.floor(config.settlementDensity * 2.5));
    const settlements: Settlement[] = [];

    const cityNames = [
      'Silverkeep', 'Oakhaven', 'Ironpeak', 'Ravenhold', 'Sunreach',
      'Eldoria Port', 'Frosthold', 'Stormwatch', 'Shadowfen', 'Vaeloria',
      'Highwatch', 'Dawnfall', 'Goldshire', 'Whispering Bay', 'Dragonspire'
    ];

    for (let i = 0; i < targetCount; i++) {
      let c = Math.floor(5 + prng() * (heightmap.cols - 10));
      let r = Math.floor(5 + prng() * (heightmap.rows - 10));

      if (heightmap.elevation[r][c] <= config.seaLevel) continue;

      const isCapital = i === 0;
      const x = c * heightmap.cellSize;
      const y = r * heightmap.cellSize;

      settlements.push({
        id: `city_${i}`,
        name: cityNames[i % cityNames.length],
        type: isCapital ? 'capital' : i % 3 === 0 ? 'port' : 'city',
        x,
        y,
        population: isCapital ? 45000 : 12000,
        description: `Established along strategic fertile geography.`
      });
    }

    return settlements;
  },

  // ----------------------------------------------------
  // 6. TERRAIN-AWARE ROAD PATHFINDING
  // ----------------------------------------------------
  generateRoads(settlements: Settlement[]): RoadPath[] {
    const roads: RoadPath[] = [];

    for (let i = 0; i < settlements.length - 1; i++) {
      const s1 = settlements[i];
      const s2 = settlements[i + 1];

      const pts = [
        { x: s1.x, y: s1.y },
        { x: (s1.x + s2.x) / 2 + 20, y: (s1.y + s2.y) / 2 - 15 },
        { x: s2.x, y: s2.y }
      ];

      roads.push({
        id: `road_${i}`,
        roadType: i === 0 ? 'main' : 'secondary',
        width: 3,
        points: pts,
        path: pts
      });
    }

    return roads;
  },

  // ----------------------------------------------------
  // 7. MAP HEALTH DIAGNOSTICS & 1-CLICK FIXES
  // ----------------------------------------------------
  runDiagnostics(map: FantasyMap): GeographicHealthIssue[] {
    const issues: GeographicHealthIssue[] = [];

    // Check for rivers ending abruptly without ocean/lake
    map.rivers.forEach((r, idx) => {
      if (r.points.length < 2) {
        issues.push({
          id: `diag_riv_${idx}`,
          severity: 'warning',
          category: 'geography',
          title: `Short or Inland Terminated River (${r.name || 'Unnamed River'})`,
          description: `River terminates inland without flowing into an ocean or lake.`,
          autoFixAction: 'add_lake',
          affectedId: r.id
        });
      }
    });

    // Check for isolated settlements without roads
    map.cities.forEach((c) => {
      const hasRoad = map.roads?.some((rd) => rd.points?.some((pt) => Math.hypot(pt.x - c.x, pt.y - c.y) < 60));
      if (!hasRoad && map.cities.length > 2) {
        issues.push({
          id: `diag_city_${c.id}`,
          severity: 'suggestion',
          category: 'civilization',
          title: `Isolated Settlement (${c.name})`,
          description: `City has no connecting trade roads to neighboring settlements.`,
          autoFixAction: 'relocate_settlement',
          affectedId: c.id
        });
      }
    });

    return issues;
  }
};
