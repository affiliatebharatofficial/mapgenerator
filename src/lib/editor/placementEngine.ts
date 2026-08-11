import type { HeightmapGrid } from '../../types/mapGeography';
import type { RiverPath, Settlement } from '../../types/map';

export interface LocationScoreResult {
  score: number; // 0 to 100
  verdict: 'Excellent Location' | 'Favorable Location' | 'Suboptimal Location' | 'Extreme Terrain';
  details: string[];
}

export const PlacementEngine = {
  // ----------------------------------------------------
  // 1. GEOGRAPHIC LOCATION SCORE CALCULATOR
  // ----------------------------------------------------
  evaluateLocationScore(x: number, y: number, heightmap: HeightmapGrid, rivers: RiverPath[]): LocationScoreResult {
    const c = Math.floor((x / (heightmap.cols * heightmap.cellSize)) * heightmap.cols);
    const r = Math.floor((y / (heightmap.rows * heightmap.cellSize)) * heightmap.rows);

    const safeC = Math.max(0, Math.min(heightmap.cols - 1, c));
    const safeR = Math.max(0, Math.min(heightmap.rows - 1, r));

    const elev = heightmap.elevation[safeR][safeC];
    const biome = heightmap.biome[safeR][safeC];

    let score = 50;
    const details: string[] = [];

    // Distance to nearest river
    let minDistToRiver = 9999;
    rivers.forEach((riv) => {
      riv.points?.forEach((pt) => {
        const dist = Math.hypot(pt.x - x, pt.y - y);
        if (dist < minDistToRiver) minDistToRiver = dist;
      });
    });

    if (minDistToRiver < 80) {
      score += 25;
      details.push('Fresh water access via nearby river network (+25)');
    } else {
      score -= 10;
      details.push('Distant from natural rivers (-10)');
    }

    if (biome === 'coast') {
      score += 20;
      details.push('Strategic maritime harbor access (+20)');
    } else if (biome === 'temperate-forest' || biome === 'grassland') {
      score += 15;
      details.push('Fertile agricultural land (+15)');
    } else if (biome === 'mountains' || elev > 0.8) {
      score -= 20;
      details.push('High elevation & steep terrain obstacle (-20)');
    }

    const clamped = Math.max(10, Math.min(100, score));
    let verdict: LocationScoreResult['verdict'] = 'Favorable Location';
    if (clamped >= 80) verdict = 'Excellent Location';
    else if (clamped <= 35) verdict = 'Suboptimal Location';

    return { score: clamped, verdict, details };
  }
};
