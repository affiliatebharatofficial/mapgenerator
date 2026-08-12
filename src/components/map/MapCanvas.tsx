import React, { useState, useMemo } from 'react';
import type {
  FantasyMap,
  MapLayers,
  SelectedObjectRef,
  Position,
  MapKingdom,
  Settlement,
  PointOfInterest
} from '../../types/map';
import { MAP_STYLES } from '../../lib/map-engine/styles';
import { getVectorIconPath } from '../../lib/map-engine/iconLibrary';
import { isRenderableLabel, type BoundingBox, checkLabelOverlap } from '../../lib/map-engine/labelUtils';
import type { ActiveTool, TerrainBrushType } from '../../types/editorTools';
import type { CartographicThemeConfig } from '../../types/cartography';

interface MapCanvasProps {
  map: FantasyMap;
  layers: MapLayers;
  opacities?: Record<string, number>;
  cartographyTheme?: CartographicThemeConfig;
  activeTool?: ActiveTool;
  activeTerrainBrush?: TerrainBrushType;
  selectedObject: SelectedObjectRef | null;
  onSelectObject: (obj: SelectedObjectRef | null) => void;
  onUpdateObjectPosition: (type: string, id: string, pos: Position) => void;
  onPaintTerrainCell?: (x: number, y: number, type: TerrainBrushType) => void;
  onCanvasClick?: (coords: Position) => void;
  onAddPointToRiver?: (x: number, y: number) => void;
  onContextMenuAction?: (e: React.MouseEvent, obj: SelectedObjectRef) => void;
  transform: { x: number; y: number; k: number };
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
  onWheel: (e: React.WheelEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  isPreviewMode?: boolean;
}

// Pseudo-random helper based on seed to ensure 100% deterministic rendering
function getDeterministicRandom(seed: number, index: number) {
  const x = Math.sin(seed * 9999 + index * 1337) * 10000;
  return x - Math.floor(x);
}

// Helper to convert point sequence to smooth Bezier curve string
function getSmoothBezierPath(pts: Position[]): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const xc = (pts[i].x + pts[i + 1].x) / 2;
    const yc = (pts[i].y + pts[i + 1].y) / 2;
    path += ` Q ${pts[i].x} ${pts[i].y}, ${xc} ${yc}`;
  }
  path += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
  return path;
}

// Helper to generate organic irregular woodland boundary path from center + radius (No green circles!)
function getOrganicForestPath(cx: number, cy: number, radius: number, seed: number, index: number): string {
  const steps = 14;
  let path = '';
  for (let i = 0; i < steps; i++) {
    const angle = (i * Math.PI * 2) / steps;
    const noise = 0.75 + getDeterministicRandom(seed, index * 30 + i) * 0.45;
    const r = radius * noise;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      const prevAngle = ((i - 1) * Math.PI * 2) / steps;
      const prevNoise = 0.75 + getDeterministicRandom(seed, index * 30 + (i - 1)) * 0.45;
      const prevR = radius * prevNoise;
      const cpAngle = (angle + prevAngle) / 2;
      const cpR = (r + prevR) / 2 * 1.15;
      const cpx = cx + Math.cos(cpAngle) * cpR;
      const cpy = cy + Math.sin(cpAngle) * cpR;
      path += ` Q ${cpx} ${cpy}, ${x} ${y}`;
    }
  }
  return path + ' Z';
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  map,
  layers,
  opacities = {},
  cartographyTheme,
  activeTool = 'select',
  activeTerrainBrush = 'plains',
  selectedObject,
  onSelectObject,
  onUpdateObjectPosition,
  onPaintTerrainCell,
  onCanvasClick,
  onContextMenuAction,
  transform,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  svgRef,
  isPreviewMode = false
}) => {
  const baseStyle = MAP_STYLES[map.style] || MAP_STYLES.parchment;
  const styleConfig = {
    waterColor: cartographyTheme?.oceanColor || baseStyle.waterColor,
    landColor: cartographyTheme?.terrainColor || baseStyle.landColor,
    coastColor: cartographyTheme?.coastColor || baseStyle.coastColor,
    mountainColor: cartographyTheme?.mountainColor || baseStyle.mountainColor,
    forestColor: cartographyTheme?.forestColor || baseStyle.forestColor,
    textColor: cartographyTheme?.textColor || baseStyle.textColor,
    fontFamily: cartographyTheme?.fontCategory || baseStyle.fontFamily,
    borderColor: cartographyTheme?.borderColor || baseStyle.borderColor,
    roadColor: baseStyle.roadColor || '#6b5b45',
    textHaloColor: baseStyle.textHaloColor || '#f4ebd0'
  };
  const isDark = map.style === 'dark-fantasy' || cartographyTheme?.id === 'dark-fantasy';

  const [draggingObj, setDraggingObj] = useState<{ type: string; id: string } | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // SVG coordinate transformation helper
  const getSVGCoordinates = (e: React.MouseEvent<SVGSVGElement>): Position => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const mapX = (clientX - transform.x) / transform.k;
    const mapY = (clientY - transform.y) / transform.k;

    return { x: Math.round(mapX), y: Math.round(mapY) };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsMouseDown(true);
    const coords = getSVGCoordinates(e);
    if (activeTool === 'terrain_brush' && onPaintTerrainCell) {
      onPaintTerrainCell(coords.x, coords.y, activeTerrainBrush);
      return;
    }
    if (activeTool !== 'select' && activeTool !== 'pan' && onCanvasClick) {
      onCanvasClick(coords);
      return;
    }
    onMouseDown(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isMouseDown && activeTool === 'terrain_brush' && onPaintTerrainCell) {
      const coords = getSVGCoordinates(e);
      onPaintTerrainCell(coords.x, coords.y, activeTerrainBrush);
      return;
    }
    if (draggingObj) {
      const coords = getSVGCoordinates(e);
      onUpdateObjectPosition(draggingObj.type, draggingObj.id, coords);
      return;
    }
    onMouseMove(e);
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsMouseDown(false);
    setDraggingObj(null);
    onMouseUp(e);
  };

  // Pre-calculate organic forest paths & tree scatter (No green circles!)
  const forestData = useMemo(() => {
    if (!map.forests) return [];
    return map.forests.map((f, fIdx) => {
      const radius = f.radius || 28;
      const organicPath = getOrganicForestPath(f.x, f.y, radius, map.seed, fIdx);
      const treeCount = Math.min(22, Math.max(10, Math.floor(radius / 2.2)));
      const trees = [];

      for (let tIdx = 0; tIdx < treeCount; tIdx++) {
        const r1 = getDeterministicRandom(map.seed, fIdx * 100 + tIdx * 2);
        const r2 = getDeterministicRandom(map.seed, fIdx * 100 + tIdx * 2 + 1);
        const angle = r1 * Math.PI * 2;
        const dist = Math.sqrt(r2) * (radius * 0.72);
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        const scale = 0.55 + getDeterministicRandom(map.seed, fIdx * 50 + tIdx) * 0.45;
        trees.push({ tx, ty, scale });
      }
      return { forest: f, organicPath, trees };
    });
  }, [map.forests, map.seed]);

  // Compute Mountain Range chain ridge connections & center for label
  const mountainRangeData = useMemo(() => {
    if (!map.mountains || map.mountains.length === 0) return { ridgeConnections: '', rangeLabel: null };

    // Sort mountain points by X coordinate to build continuous ridge path
    const sorted = [...map.mountains].sort((a, b) => a.x - b.x);
    let ridgeConnections = '';
    if (sorted.length >= 2) {
      ridgeConnections = sorted.reduce((acc, m, i) => (i === 0 ? `M ${m.x} ${m.y}` : `${acc} Q ${(sorted[i - 1].x + m.x) / 2} ${((sorted[i - 1].y + m.y) / 2) + 5}, ${m.x} ${m.y}`), '');
    }

    let sumX = 0;
    let sumY = 0;
    map.mountains.forEach((m) => {
      sumX += m.x;
      sumY += m.y;
    });
    const avgX = sumX / map.mountains.length;
    const avgY = sumY / map.mountains.length;

    const rangeLabelName = 'DRAGONSPINE MOUNTAINS';
    const rangeLabel = isRenderableLabel(rangeLabelName) ? { x: avgX, y: avgY - 32, text: rangeLabelName } : null;

    return { ridgeConnections, rangeLabel };
  }, [map.mountains]);

  // Calculate subtle terrain hillocks for empty geography areas
  const terrainHillocks = useMemo(() => {
    const hillocks = [];
    const seed = map.seed || 12345;
    const count = 12;
    const width = map.width || 1200;
    const height = map.height || 800;

    for (let i = 0; i < count; i++) {
      const hx = 100 + getDeterministicRandom(seed, i * 11) * (width - 200);
      const hy = 100 + getDeterministicRandom(seed, i * 17) * (height - 200);
      const scale = 0.5 + getDeterministicRandom(seed, i * 23) * 0.4;
      hillocks.push({ hx, hy, scale });
    }
    return hillocks;
  }, [map.width, map.height, map.seed]);

  // Lightweight label collision detection memory
  const renderedLabelBoxes = useMemo(() => {
    const boxes: BoundingBox[] = [];
    return boxes;
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#090b0e] cursor-crosshair select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${map.width} ${map.height}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        className="w-full h-full block"
      >
        <defs>
          {/* Parchment & Grid Textures */}
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDark ? '#334155' : '#d1d5db'} strokeWidth="0.5" opacity="0.4" />
          </pattern>

          {/* Vignette Gradient overlay */}
          <radialGradient id="vignette-grad" cx="50%" cy="50%" r="70%">
            <stop offset="60%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity={isDark ? '0.6' : '0.2'} />
          </radialGradient>
        </defs>

        {/* Scaled & Panned Group Container */}
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          
          {/* 1. OCEAN WATER BACKGROUND */}
          <rect width={map.width} height={map.height} fill={styleConfig.waterColor} />

          {/* 1b. COASTAL WATER RIPPLES (Concentric Cartographic Echo Rings) */}
          {layers.terrain && (
            <g id="coastal-hatching-rings" pointerEvents="none">
              <path d={map.coastline} fill="none" stroke={styleConfig.coastColor} strokeWidth={8} opacity={0.22} />
              <path d={map.coastline} fill="none" stroke={styleConfig.coastColor} strokeWidth={4.5} opacity={0.32} />
              <path d={map.coastline} fill="none" stroke={styleConfig.coastColor} strokeWidth={2} opacity={0.45} />
              {map.islandPaths?.map((ip, idx) => (
                <g key={`island_ring_${idx}`}>
                  <path d={ip} fill="none" stroke={styleConfig.coastColor} strokeWidth={5} opacity={0.22} />
                  <path d={ip} fill="none" stroke={styleConfig.coastColor} strokeWidth={2} opacity={0.4} />
                </g>
              ))}
            </g>
          )}

          {/* 2. LANDMASS LAYER */}
          {layers.terrain && (
            <g id="landmass-layer">
              <path
                d={map.coastline}
                fill={styleConfig.landColor}
                stroke={styleConfig.coastColor}
                strokeWidth={1.8}
                className="transition-colors duration-300"
              />
              {map.islandPaths?.map((ip, idx) => (
                <path
                  key={`island_${idx}`}
                  d={ip}
                  fill={styleConfig.landColor}
                  stroke={styleConfig.coastColor}
                  strokeWidth={1.6}
                />
              ))}
            </g>
          )}

          {/* 2b. SUBTLE TERRAIN HILLOCKS & GEOGRAPHIC TEXTURE IN EMPTY AREAS */}
          {layers.terrain && (
            <g id="terrain-hillocks-texture" pointerEvents="none" opacity={0.25}>
              {terrainHillocks.map((h, idx) => (
                <g key={`hill_${idx}`} transform={`translate(${h.hx}, ${h.hy}) scale(${h.scale})`}>
                  <path
                    d="M-12 4 Q -6 -6, 0 4 M0 4 Q 6 -6, 12 4"
                    fill="none"
                    stroke={styleConfig.mountainColor}
                    strokeWidth={1.2}
                    strokeLinecap="round"
                  />
                </g>
              ))}
            </g>
          )}

          {/* 3. CUSTOM PAINTED TERRAIN CELLS */}
          {map.terrainCells?.map((cell, idx) => (
            <circle
              key={`cell_${idx}`}
              cx={cell.x}
              cy={cell.y}
              r={16}
              fill={
                cell.type === 'desert'
                  ? '#f39c12'
                  : cell.type === 'snow'
                  ? '#f1f5f9'
                  : cell.type === 'swamp'
                  ? '#16a085'
                  : cell.type === 'volcanic'
                  ? '#c0392b'
                  : '#27ae60'
              }
              opacity={0.3}
            />
          ))}

          {/* 4. POLITICAL REGIONS & KINGDOM BORDERS */}
          {layers.kingdoms &&
            map.kingdoms?.map((k: MapKingdom) => {
              if (!k.borderPath) return null;
              const hasValidName = isRenderableLabel(k.name);

              return (
                <g key={`kingdom_${k.id}`}>
                  {/* Soft parchment tinted fill */}
                  <path
                    d={k.borderPath}
                    fill={k.color || styleConfig.borderColor}
                    fillOpacity={0.15}
                    stroke={k.color || styleConfig.borderColor}
                    strokeWidth={1.8}
                    strokeDasharray="6,4"
                  />
                  {/* Kingdom Region Title Label (ONLY if valid non-placeholder name!) */}
                  {k.center && hasValidName && (
                    <g transform={`translate(${k.center.x}, ${k.center.y})`} pointerEvents="none">
                      <text
                        textAnchor="middle"
                        stroke={styleConfig.textHaloColor}
                        strokeWidth={4}
                        strokeLinejoin="round"
                        fill={styleConfig.textColor}
                        fontSize={15}
                        fontWeight="bold"
                        fontFamily="Cinzel, serif"
                        letterSpacing="2"
                        opacity={0.8}
                      >
                        {k.name.toUpperCase()}
                      </text>
                      <text
                        textAnchor="middle"
                        fill={styleConfig.textColor}
                        fontSize={15}
                        fontWeight="bold"
                        fontFamily="Cinzel, serif"
                        letterSpacing="2"
                        opacity={0.8}
                      >
                        {k.name.toUpperCase()}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

          {/* 5. LAKES */}
          {layers.lakes !== false &&
            map.lakes?.map((l, idx) => {
              const lakePathData = getSmoothBezierPath(l.points);
              return (
                <path
                  key={`lake_${l.id || idx}`}
                  d={lakePathData}
                  fill={styleConfig.waterColor}
                  stroke={styleConfig.coastColor}
                  strokeWidth={1.5}
                />
              );
            })}

          {/* 6. RIVERS (Organic Winding Bezier Paths & Tapering Width) */}
          {layers.rivers &&
            map.rivers?.map((r) => {
              const pts = r.points || r.path || [];
              if (pts.length < 2) return null;
              const bezierPath = getSmoothBezierPath(pts);
              const mainWidth = r.width || 3.5;
              const hasValidRiverName = isRenderableLabel(r.name);

              // Midpoint calculation for river italic label
              const midIdx = Math.floor(pts.length / 2);
              const midPt = pts[midIdx] || pts[0];

              return (
                <g key={`river_${r.id}`}>
                  {/* Outer estuary glow */}
                  <path
                    d={bezierPath}
                    fill="none"
                    stroke={styleConfig.coastColor}
                    strokeWidth={mainWidth + 1.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.35}
                  />
                  {/* Main tapering river path */}
                  <path
                    d={bezierPath}
                    fill="none"
                    stroke={styleConfig.waterColor}
                    strokeWidth={mainWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* River Italic Name Label (ONLY if valid non-placeholder name!) */}
                  {hasValidRiverName && (
                    <g transform={`translate(${midPt.x}, ${midPt.y})`} pointerEvents="none">
                      <text
                        textAnchor="middle"
                        stroke={styleConfig.textHaloColor}
                        strokeWidth={3}
                        fill={styleConfig.textColor}
                        fontSize={10}
                        fontStyle="italic"
                        fontFamily="Cinzel, serif"
                        opacity={0.85}
                      >
                        {r.name}
                      </text>
                      <text
                        textAnchor="middle"
                        fill={styleConfig.textColor}
                        fontSize={10}
                        fontStyle="italic"
                        fontFamily="Cinzel, serif"
                        opacity={0.85}
                      >
                        {r.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

          {/* 7. ROADS (Hand-Drawn Warm Ink Lines with Hierarchy) */}
          {layers.roads &&
            map.roads?.map((rd) => {
              const pts = rd.points || rd.path || [];
              if (pts.length < 2) return null;
              const bezierPath = getSmoothBezierPath(pts);
              const isMajor = rd.roadType === 'main' || rd.roadType === 'military';

              return (
                <path
                  key={`road_${rd.id}`}
                  d={bezierPath}
                  fill="none"
                  stroke={styleConfig.roadColor}
                  strokeWidth={isMajor ? 2.2 : 1.4}
                  strokeDasharray={isMajor ? 'none' : '4,3'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isMajor ? 0.85 : 0.65}
                />
              );
            })}

          {/* 8. ILLUSTRATIVE FOREST REGIONS (Organic Boundary — NO GREEN CIRCLES!) */}
          {layers.forests &&
            forestData.map(({ forest, organicPath, trees }, fIdx) => {
              const fId = forest.id || `f_${fIdx}`;
              const isSelected = selectedObject?.type === 'forest' && selectedObject.id === fId;

              return (
                <g
                  key={fId}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectObject({ type: 'forest', id: fId });
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingObj({ type: 'forest', id: fId });
                  }}
                  className="cursor-pointer"
                >
                  {/* Organic woodland irregular background wash (NO green circle!) */}
                  <path d={organicPath} fill={styleConfig.forestColor} opacity={0.28} />

                  {/* Scatter of detailed illustrated tree icons inside organic boundary */}
                  {trees.map((t, tIdx) => (
                    <g key={`tree_${tIdx}`} transform={`translate(${forest.x + t.tx}, ${forest.y + t.ty}) scale(${t.scale})`}>
                      <path
                        d="M0 -12 L-6 2 L-2 2 L-7 10 L-3 10 L-8 18 L8 18 L3 10 L7 10 L2 2 L6 2 Z M-1.5 18 L-1.5 22 L1.5 22 L1.5 18 Z"
                        fill={styleConfig.forestColor}
                        stroke={isDark ? '#022c22' : '#1b4332'}
                        strokeWidth={0.8}
                      />
                    </g>
                  ))}

                  {/* Editor selection outline (ONLY in editor mode) */}
                  {isSelected && !isPreviewMode && (
                    <path d={organicPath} fill="none" stroke="#38bdf8" strokeWidth={2} strokeDasharray="3,3" />
                  )}
                </g>
              );
            })}

          {/* 9. ORGANIC FANTASY MOUNTAIN RANGES (Continuous Chain & Shaded Peaks) */}
          {layers.mountains && (
            <g id="mountain-ranges-layer">
              {/* Continuous range ridge connection path */}
              {mountainRangeData.ridgeConnections && (
                <path
                  d={mountainRangeData.ridgeConnections}
                  fill="none"
                  stroke={baseStyle.mountainStroke || styleConfig.textColor}
                  strokeWidth={2}
                  opacity={0.35}
                  strokeDasharray="3,2"
                />
              )}

              {map.mountains?.map((m: Position, idx: number) => {
                const mId = m.id || `m_${idx}`;
                const isSelected = selectedObject?.type === 'mountain' && selectedObject.id === mId;
                const mainH = m.height || 24;
                const mainW = mainH * 1.2;

                const subH1 = mainH * 0.65;
                const subH2 = mainH * 0.55;

                return (
                  <g
                    key={mId}
                    transform={`translate(${m.x}, ${m.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectObject({ type: 'mountain', id: mId });
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingObj({ type: 'mountain', id: mId });
                    }}
                    className="cursor-pointer"
                  >
                    {/* Left Foothill Peak */}
                    <g transform={`translate(-${mainW * 0.55}, 4)`}>
                      <polygon
                        points={`0,-${subH1} -${subH1 * 0.7},${subH1 * 0.6} ${subH1 * 0.7},${subH1 * 0.6}`}
                        fill={styleConfig.mountainColor}
                        stroke={baseStyle.mountainStroke || styleConfig.textColor}
                        strokeWidth={1.2}
                      />
                      <polygon points={`0,-${subH1} -${subH1 * 0.7},${subH1 * 0.6} 0,${subH1 * 0.6}`} fill="#ffffff" opacity={0.25} />
                    </g>

                    {/* Right Foothill Peak */}
                    <g transform={`translate(${mainW * 0.55}, 6)`}>
                      <polygon
                        points={`0,-${subH2} -${subH2 * 0.7},${subH2 * 0.6} ${subH2 * 0.7},${subH2 * 0.6}`}
                        fill={styleConfig.mountainColor}
                        stroke={baseStyle.mountainStroke || styleConfig.textColor}
                        strokeWidth={1.2}
                      />
                      <polygon points={`0,-${subH2} -${subH2 * 0.7},${subH2 * 0.6} 0,${subH2 * 0.6}`} fill="#ffffff" opacity={0.2} />
                    </g>

                    {/* MAIN ORGANIC PEAK */}
                    <g>
                      {/* Base shadow facet */}
                      <polygon
                        points={`0,-${mainH} -${mainW / 2},${mainH * 0.6} ${mainW / 2},${mainH * 0.6}`}
                        fill={styleConfig.mountainColor}
                        stroke={baseStyle.mountainStroke || styleConfig.textColor}
                        strokeWidth={1.5}
                        strokeLinejoin="round"
                      />
                      {/* Left light facet */}
                      <polygon
                        points={`0,-${mainH} -${mainW / 2},${mainH * 0.6} 0,${mainH * 0.5}`}
                        fill="#ffffff"
                        opacity={isDark ? 0.25 : 0.45}
                      />
                      {/* Central Hand-Drawn Ridgeline */}
                      <path
                        d={`M0 -${mainH} Q -2 0, 0 ${mainH * 0.6}`}
                        fill="none"
                        stroke={baseStyle.mountainStroke || styleConfig.textColor}
                        strokeWidth={1.2}
                      />
                      {/* Snow Cap for high peaks */}
                      {mainH > 20 && (
                        <polygon
                          points={`0,-${mainH} -${mainW * 0.22},-${mainH * 0.4} 0,-${mainH * 0.45} ${mainW * 0.22},-${mainH * 0.4}`}
                          fill="#ffffff"
                          opacity={0.85}
                        />
                      )}
                    </g>

                    {/* Editor Selection outline (ONLY in editor mode) */}
                    {isSelected && !isPreviewMode && (
                      <circle r={mainH + 4} fill="none" stroke="#38bdf8" strokeWidth={2} strokeDasharray="3,3" />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* MOUNTAIN RANGE LABEL (ONLY if non-placeholder!) */}
          {mountainRangeData.rangeLabel && layers.mountains && (
            <g transform={`translate(${mountainRangeData.rangeLabel.x}, ${mountainRangeData.rangeLabel.y})`} pointerEvents="none">
              <text
                textAnchor="middle"
                stroke={styleConfig.textHaloColor}
                strokeWidth={3}
                fill={styleConfig.textColor}
                fontSize={12}
                fontWeight="bold"
                fontFamily="Cinzel, serif"
                letterSpacing="2"
                opacity={0.85}
              >
                {mountainRangeData.rangeLabel.text}
              </text>
              <text
                textAnchor="middle"
                fill={styleConfig.textColor}
                fontSize={12}
                fontWeight="bold"
                fontFamily="Cinzel, serif"
                letterSpacing="2"
                opacity={0.85}
              >
                {mountainRangeData.rangeLabel.text}
              </text>
            </g>
          )}

          {/* 10. CITIES & SETTLEMENTS (Cartographic Vector Symbols + Valid Name Filter) */}
          {layers.cities &&
            map.cities?.map((c: Settlement) => {
              const isSelected = selectedObject?.type === 'city' && selectedObject.id === c.id;
              const isCapital = c.type === 'capital';
              const hasValidCityName = isRenderableLabel(c.name);

              return (
                <g
                  key={`city_${c.id}`}
                  transform={`translate(${c.x}, ${c.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectObject({ type: 'city', id: c.id });
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingObj({ type: 'city', id: c.id });
                  }}
                  className="cursor-pointer group"
                >
                  {/* Capital Ornate Heraldry Emblem vs Settlement Symbol */}
                  {isCapital ? (
                    <g transform="translate(-12, -12) scale(1)">
                      <circle cx="12" cy="12" r="13" fill="#d4af37" opacity={0.25} />
                      <circle cx="12" cy="12" r="9" fill={isDark ? '#0f172a' : '#fef3c7'} stroke="#d4af37" strokeWidth={2} />
                      <path d={getVectorIconPath('capital')} fill="#d4af37" transform="scale(0.85) translate(2,2)" />
                    </g>
                  ) : (
                    <g transform="translate(-10, -10)">
                      <rect x="2" y="2" width="16" height="16" rx="3" fill={isDark ? '#1e293b' : '#ffffff'} stroke={styleConfig.textColor} strokeWidth={1.5} />
                      <path d={getVectorIconPath(c.type)} fill={styleConfig.textColor} transform="scale(0.7) translate(4,4)" />
                    </g>
                  )}

                  {/* Editor selection circle (ONLY in editor mode) */}
                  {isSelected && !isPreviewMode && (
                    <circle r={16} fill="none" stroke="#38bdf8" strokeWidth={2} strokeDasharray="3,3" />
                  )}

                  {/* City Text Label with Legibility Halo (ONLY if valid non-placeholder name!) */}
                  {hasValidCityName && (
                    <>
                      <text
                        y={isCapital ? 22 : 18}
                        textAnchor="middle"
                        stroke={styleConfig.textHaloColor}
                        strokeWidth={3}
                        strokeLinejoin="round"
                        fill={styleConfig.textColor}
                        fontSize={isCapital ? 13 : 11}
                        fontWeight="bold"
                        fontFamily={styleConfig.fontFamily}
                      >
                        {c.name}
                      </text>
                      <text
                        y={isCapital ? 22 : 18}
                        textAnchor="middle"
                        fill={isCapital ? '#d4af37' : styleConfig.textColor}
                        fontSize={isCapital ? 13 : 11}
                        fontWeight="bold"
                        fontFamily={styleConfig.fontFamily}
                      >
                        {c.name}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

          {/* 11. POINTS OF INTEREST (Thematic Cartographic Symbols + Valid Name Filter) */}
          {layers.locations !== false &&
            map.pointsOfInterest?.map((p: PointOfInterest) => {
              const isSelected = selectedObject?.type === 'poi' && selectedObject.id === p.id;
              const iconPath = getVectorIconPath(p.type);
              const hasValidPoiName = isRenderableLabel(p.name);

              return (
                <g
                  key={`poi_${p.id}`}
                  transform={`translate(${p.x}, ${p.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectObject({ type: 'poi', id: p.id });
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingObj({ type: 'poi', id: p.id });
                  }}
                  className="cursor-pointer group"
                >
                  {/* Cartographic POI Emblem Frame */}
                  <g transform="translate(-10, -10)">
                    <circle cx="10" cy="10" r="10" fill={isDark ? '#0f172a' : '#f8fafc'} stroke="#38bdf8" strokeWidth={1.5} />
                    <path d={iconPath} fill="#38bdf8" transform="scale(0.7) translate(4,4)" />
                  </g>

                  {/* Editor Selection Ring (ONLY in editor mode) */}
                  {isSelected && !isPreviewMode && (
                    <circle r={16} fill="none" stroke="#38bdf8" strokeWidth={2} strokeDasharray="3,3" />
                  )}

                  {/* POI Label with Halo (ONLY if valid non-placeholder name!) */}
                  {hasValidPoiName && (
                    <>
                      <text
                        y={16}
                        textAnchor="middle"
                        stroke={styleConfig.textHaloColor}
                        strokeWidth={3}
                        fill={styleConfig.textColor}
                        fontSize={10}
                        fontWeight="semibold"
                        fontFamily={styleConfig.fontFamily}
                      >
                        {p.name}
                      </text>
                      <text
                        y={16}
                        textAnchor="middle"
                        fill={styleConfig.textColor}
                        fontSize={10}
                        fontWeight="semibold"
                        fontFamily={styleConfig.fontFamily}
                      >
                        {p.name}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

          {/* 12. TYPOGRAPHY LABELS (With Placeholder Filter) */}
          {layers.labels &&
            map.labels?.map((l) => {
              if (!isRenderableLabel(l.text)) return null;
              const isSelected = selectedObject?.type === 'label' && selectedObject.id === l.id;

              return (
                <g
                  key={`label_${l.id}`}
                  transform={`translate(${l.x}, ${l.y}) rotate(${l.rotation || 0})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectObject({ type: 'label', id: l.id });
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingObj({ type: 'label', id: l.id });
                  }}
                  className="cursor-pointer"
                >
                  <text
                    textAnchor="middle"
                    stroke={styleConfig.textHaloColor}
                    strokeWidth={3}
                    strokeLinejoin="round"
                    fill={l.color || styleConfig.textColor}
                    fontSize={l.fontSize || 14}
                    fontWeight={l.fontWeight || 'bold'}
                    fontFamily={l.fontFamily || styleConfig.fontFamily}
                    opacity={l.opacity || 1}
                  >
                    {l.text}
                  </text>
                  <text
                    textAnchor="middle"
                    fill={l.color || styleConfig.textColor}
                    fontSize={l.fontSize || 14}
                    fontWeight={l.fontWeight || 'bold'}
                    fontFamily={l.fontFamily || styleConfig.fontFamily}
                    opacity={l.opacity || 1}
                  >
                    {l.text}
                  </text>
                  {isSelected && !isPreviewMode && (
                    <rect x={-50} y={-15} width={100} height={24} fill="none" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="3,3" />
                  )}
                </g>
              );
            })}

          {/* 13. PRIVATE GM SECRET LAYER (Never rendered in export or preview) */}
          {layers.private_gm && !isPreviewMode && (
            <g id="layer-private-gm" opacity={opacities['private_gm'] ? opacities['private_gm'] / 100 : 1}>
              {map.pointsOfInterest?.filter((p: any) => p.isSecret || p.type === 'dungeon').map((p: any) => (
                <g key={`gm_sec_${p.id}`} transform={`translate(${p.x}, ${p.y})`}>
                  <circle r={18} fill="#be185d" opacity={0.3} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="3,3" />
                  <text y={4} textAnchor="middle" fill="#fecdd3" fontSize={9} fontWeight="bold" fontFamily="monospace">
                    GM
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* 14. GRID OVERLAY */}
          {layers.grid && <rect width={map.width} height={map.height} fill="url(#grid-pattern)" pointerEvents="none" />}

          {/* 15. COMPASS ROSE */}
          {layers.compass && (
            <g transform={`translate(${map.width - 85}, 85)`} pointerEvents="none">
              <circle r={32} fill="none" stroke={styleConfig.textColor} strokeWidth={1.5} opacity={0.5} />
              <circle r={36} fill="none" stroke={styleConfig.textColor} strokeWidth={0.8} opacity={0.3} strokeDasharray="2,2" />
              <polygon points="0,-32 5,-5 32,0 5,5 0,32 -5,5 -32,0 -5,-5" fill={styleConfig.textColor} opacity={0.85} />
              <polygon points="0,-32 0,0 5,-5" fill="#ffffff" opacity={0.5} />
              <text y={-38} textAnchor="middle" fill={styleConfig.textColor} fontSize={12} fontWeight="bold" fontFamily="Cinzel, serif">
                N
              </text>
            </g>
          )}

          {/* 16. SCALE BAR */}
          <g transform={`translate(60, ${map.height - 40})`} pointerEvents="none">
            <rect x={-4} y={-16} width={108} height={24} fill={isDark ? '#0f172a' : '#fef3c7'} fillOpacity={0.6} rx={4} stroke={styleConfig.textColor} strokeWidth={0.5} />
            <line x1={0} y1={0} x2={100} y2={0} stroke={styleConfig.textColor} strokeWidth={3} />
            <line x1={0} y1={-4} x2={0} y2={4} stroke={styleConfig.textColor} strokeWidth={2} />
            <line x1={50} y1={-3} x2={50} y2={3} stroke={styleConfig.textColor} strokeWidth={1.5} />
            <line x1={100} y1={-4} x2={100} y2={4} stroke={styleConfig.textColor} strokeWidth={2} />
            <text x={50} y={-8} textAnchor="middle" fill={styleConfig.textColor} fontSize={10} fontFamily="Cinzel, serif" fontWeight="bold">
              100 Miles
            </text>
          </g>

          {/* 17. DECORATIVE TITLE BANNER (ONLY if valid non-placeholder title!) */}
          {isRenderableLabel(map.titleBannerText || map.name) && (
            <g transform={`translate(${map.width / 2}, 55)`} pointerEvents="none">
              <rect x={-160} y={-22} width={320} height={44} fill={isDark ? '#0f172a' : '#fef3c7'} fillOpacity={0.9} stroke="#d4af37" strokeWidth={2} rx={10} />
              <text y={6} textAnchor="middle" fill="#d4af37" fontSize={16} fontWeight="bold" fontFamily="Cinzel, serif" letterSpacing="1.5">
                {(map.titleBannerText || map.name).toUpperCase()}
              </text>
            </g>
          )}

          {/* Vignette Overlay for Depth */}
          <rect width={map.width} height={map.height} fill="url(#vignette-grad)" pointerEvents="none" />
        </g>
      </svg>
    </div>
  );
};
