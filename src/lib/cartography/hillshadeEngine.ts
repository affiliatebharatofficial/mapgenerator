import type { HeightmapGrid } from '../../types/mapGeography';

export const HillshadeEngine = {
  // ----------------------------------------------------
  // 1. CALCULATE DIRECTIONAL HILLSHADING
  // ----------------------------------------------------
  calculateHillshade(heightmap: HeightmapGrid, lightAngleDeg = 315, intensity = 0.5): number[][] {
    const rows = heightmap.rows;
    const cols = heightmap.cols;
    const shade: number[][] = [];

    const lightRad = (lightAngleDeg * Math.PI) / 180;
    const lx = Math.cos(lightRad);
    const ly = Math.sin(lightRad);

    for (let r = 0; r < rows; r++) {
      shade[r] = [];
      for (let c = 0; c < cols; c++) {
        // Calculate slope gradient vector dz/dx and dz/dy
        const dzdx = (c < cols - 1 ? heightmap.elevation[r][c + 1] : heightmap.elevation[r][c]) -
                     (c > 0 ? heightmap.elevation[r][c - 1] : heightmap.elevation[r][c]);

        const dzdy = (r < rows - 1 ? heightmap.elevation[r + 1][c] : heightmap.elevation[r][c]) -
                     (r > 0 ? heightmap.elevation[r - 1][c] : heightmap.elevation[r][c]);

        // Dot product with light direction vector
        const dot = dzdx * lx + dzdy * ly;
        const val = 0.5 + dot * intensity * 2;
        shade[r][c] = Math.max(0, Math.min(1.0, val));
      }
    }

    return shade;
  },

  // ----------------------------------------------------
  // 2. GENERATE CONTOUR LINE PATHS
  // ----------------------------------------------------
  generateContourPaths(heightmap: HeightmapGrid, width: number, height: number, interval = 0.2): string[] {
    const paths: string[] = [];
    const rows = heightmap.rows;
    const cols = heightmap.cols;

    for (let target = interval; target < 1.0; target += interval) {
      let pathStr = '';
      for (let r = 0; r < rows - 1; r += 2) {
        for (let c = 0; c < cols - 1; c += 2) {
          const elev = heightmap.elevation[r][c];
          if (Math.abs(elev - target) < 0.05) {
            const x = c * heightmap.cellSize;
            const y = r * heightmap.cellSize;
            pathStr += ` M ${x} ${y} L ${x + heightmap.cellSize * 1.5} ${y + heightmap.cellSize * 0.5}`;
          }
        }
      }
      if (pathStr) paths.push(pathStr);
    }

    return paths;
  }
};
