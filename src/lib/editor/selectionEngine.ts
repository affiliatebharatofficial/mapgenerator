import type { Position } from '../../types/map';
import type { AlignmentMode } from '../../types/editorPrecision';

export const SelectionEngine = {
  // ----------------------------------------------------
  // 1. BULK ALIGNMENT UTILITY
  // ----------------------------------------------------
  alignPositions(positions: Position[], mode: AlignmentMode): Position[] {
    if (positions.length < 2) return positions;

    const xs = positions.map((p) => p.x);
    const ys = positions.map((p) => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const avgX = xs.reduce((a, b) => a + b, 0) / xs.length;
    const avgY = ys.reduce((a, b) => a + b, 0) / ys.length;

    return positions.map((p) => {
      let newX = p.x;
      let newY = p.y;

      if (mode === 'left') newX = minX;
      else if (mode === 'right') newX = maxX;
      else if (mode === 'center-h') newX = avgX;
      else if (mode === 'top') newY = minY;
      else if (mode === 'bottom') newY = maxY;
      else if (mode === 'center-v') newY = avgY;

      return { ...p, x: Math.round(newX), y: Math.round(newY) };
    });
  },

  // ----------------------------------------------------
  // 2. DISTRIBUTION UTILITY
  // ----------------------------------------------------
  distributePositions(positions: Position[], axis: 'h' | 'v'): Position[] {
    if (positions.length < 3) return positions;

    const sorted = [...positions].sort((a, b) => (axis === 'h' ? a.x - b.x : a.y - b.y));
    const startVal = axis === 'h' ? sorted[0].x : sorted[0].y;
    const endVal = axis === 'h' ? sorted[sorted.length - 1].x : sorted[sorted.length - 1].y;
    const step = (endVal - startVal) / (sorted.length - 1);

    return sorted.map((p, idx) => {
      const targetVal = startVal + idx * step;
      return axis === 'h' ? { ...p, x: Math.round(targetVal) } : { ...p, y: Math.round(targetVal) };
    });
  }
};
