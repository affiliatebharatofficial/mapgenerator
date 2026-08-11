import type { MapLabel, Settlement } from '../../types/map';

export interface PositionedLabel {
  label: MapLabel;
  priority: number; // 1 (highest) to 10 (lowest)
  visible: boolean;
  bBox: { x: number; y: number; width: number; height: number };
}

export const LabelLayoutEngine = {
  // ----------------------------------------------------
  // 1. ASSIGN PRIORITY RANK
  // ----------------------------------------------------
  getPriorityRank(label: MapLabel, settlement?: Settlement): number {
    if (label.category === 'ocean') return 1;
    if (label.category === 'kingdom') return 2;
    if (label.category === 'region') return 3;
    if (label.category === 'mountain') return 4;
    if (label.category === 'river') return 5;
    if (settlement?.type === 'capital') return 6;
    if (settlement?.type === 'city') return 7;
    if (settlement?.type === 'town') return 8;
    return 9; // Minor location / village
  },

  // ----------------------------------------------------
  // 2. SPATIAL COLLISION FILTERING
  // ----------------------------------------------------
  filterVisibleLabels(labels: MapLabel[], settlements: Settlement[], density: 'low' | 'medium' | 'high'): MapLabel[] {
    const positioned: PositionedLabel[] = labels.map((l) => {
      const matchCity = settlements.find((s) => s.name === l.text);
      const prio = this.getPriorityRank(l, matchCity);
      const estWidth = l.text.length * (l.fontSize * 0.6);
      const estHeight = l.fontSize * 1.2;

      return {
        label: l,
        priority: prio,
        visible: true,
        bBox: {
          x: l.x - estWidth / 2,
          y: l.y - estHeight / 2,
          width: estWidth,
          height: estHeight
        }
      };
    });

    // Sort by Priority ascending (highest priority 1 evaluated first)
    positioned.sort((a, b) => a.priority - b.priority);

    const activeBoxes: { x: number; y: number; width: number; height: number }[] = [];

    // Density threshold caps
    const maxLabels = density === 'low' ? 12 : density === 'medium' ? 25 : 60;

    const results: MapLabel[] = [];

    for (const item of positioned) {
      if (results.length >= maxLabels) break;

      // Check collision against placed higher priority labels
      const collides = activeBoxes.some((box) => {
        return !(
          item.bBox.x + item.bBox.width < box.x ||
          item.bBox.x > box.x + box.width ||
          item.bBox.y + item.bBox.height < box.y ||
          item.bBox.y > box.y + box.height
        );
      });

      if (!collides) {
        activeBoxes.push(item.bBox);
        results.push(item.label);
      }
    }

    return results;
  }
};
