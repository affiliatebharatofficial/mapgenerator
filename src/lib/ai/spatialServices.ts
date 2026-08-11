import type { FantasyMap, Position, Settlement, PointOfInterest, MapKingdom, RiverPath } from '../../types/map';

export const SpatialServices = {
  // Euclidean distance between 2 positions
  calculateDistance(p1: Position, p2: Position): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  },

  // Find nearest settlements to a reference point or entity
  findNearestCities(map: FantasyMap, targetPos: Position, count = 3): { city: Settlement; distance: number }[] {
    return map.cities
      .map((city) => ({
        city,
        distance: this.calculateDistance(targetPos, { x: city.x, y: city.y })
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
  },

  // Find cities within a given pixel radius
  findCitiesWithinRadius(map: FantasyMap, centerPos: Position, radius: number): Settlement[] {
    return map.cities.filter((c) => this.calculateDistance(centerPos, { x: c.x, y: c.y }) <= radius);
  },

  // Find directional entities relative to a target (North, South, East, West)
  findEntitiesInDirection(
    map: FantasyMap,
    centerPos: Position,
    direction: 'north' | 'south' | 'east' | 'west'
  ): { type: string; name: string; position: Position }[] {
    const results: { type: string; name: string; position: Position }[] = [];

    // Check cities
    map.cities.forEach((c) => {
      const pos = { x: c.x, y: c.y };
      if (direction === 'north' && pos.y < centerPos.y - 30) results.push({ type: 'city', name: c.name, position: pos });
      else if (direction === 'south' && pos.y > centerPos.y + 30) results.push({ type: 'city', name: c.name, position: pos });
      else if (direction === 'east' && pos.x > centerPos.x + 30) results.push({ type: 'city', name: c.name, position: pos });
      else if (direction === 'west' && pos.x < centerPos.x - 30) results.push({ type: 'city', name: c.name, position: pos });
    });

    // Check points of interest
    map.pointsOfInterest.forEach((p) => {
      const pos = { x: p.x, y: p.y };
      if (direction === 'north' && pos.y < centerPos.y - 30) results.push({ type: 'location', name: p.name, position: pos });
      else if (direction === 'south' && pos.y > centerPos.y + 30) results.push({ type: 'location', name: p.name, position: pos });
      else if (direction === 'east' && pos.x > centerPos.x + 30) results.push({ type: 'location', name: p.name, position: pos });
      else if (direction === 'west' && pos.x < centerPos.x - 30) results.push({ type: 'location', name: p.name, position: pos });
    });

    return results;
  },

  // Find river nearest to a position
  findNearestRiver(map: FantasyMap, pos: Position): { river: RiverPath; minDistance: number } | null {
    if (!map.rivers || map.rivers.length === 0) return null;

    let closestRiver: RiverPath | null = null;
    let minDistance = Infinity;

    map.rivers.forEach((river) => {
      const pts = river.points || river.path || [];
      pts.forEach((pt) => {
        const d = this.calculateDistance(pos, pt);
        if (d < minDistance) {
          minDistance = d;
          closestRiver = river;
        }
      });
    });

    return closestRiver ? { river: closestRiver, minDistance } : null;
  },

  // Calculate non-overlapping positions for N new villages around a reference center
  generateVillageCoordinates(map: FantasyMap, centerPos: Position, count = 3, distance = 60): Position[] {
    const newCoords: Position[] = [];
    const angleStep = (2 * Math.PI) / count;
    const startAngle = Math.random() * Math.PI;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * angleStep;
      let nx = Math.round(centerPos.x + Math.cos(angle) * distance);
      let ny = Math.round(centerPos.y + Math.sin(angle) * distance);

      // Clamp within map bounds with 40px margin
      nx = Math.max(40, Math.min(map.width - 40, nx));
      ny = Math.max(40, Math.min(map.height - 40, ny));

      newCoords.push({ x: nx, y: ny });
    }

    return newCoords;
  },

  // Find kingdom that owns a city or point
  findKingdomAtPosition(map: FantasyMap, pos: Position): MapKingdom | null {
    if (!map.kingdoms || map.kingdoms.length === 0) return null;

    let nearestKingdom: MapKingdom | null = null;
    let minDistance = Infinity;

    map.kingdoms.forEach((k) => {
      if (k.center) {
        const d = this.calculateDistance(pos, k.center);
        if (d < minDistance) {
          minDistance = d;
          nearestKingdom = k;
        }
      }
    });

    return nearestKingdom;
  }
};
