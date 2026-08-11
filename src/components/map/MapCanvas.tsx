import React, { useState } from 'react';
import type {
  FantasyMap,
  MapLayers,
  SelectedObjectRef,
  Position
} from '../../types/map';
import { MAP_STYLES } from '../../lib/map-engine/styles';
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
  onContextMenuAction,
  transform,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  svgRef
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
    borderColor: cartographyTheme?.borderColor || baseStyle.borderColor
  };
  const isDark = map.style === 'dark-fantasy' || cartographyTheme?.id === 'dark-fantasy';

  const [draggingObj, setDraggingObj] = useState<{ type: string; id: string } | null>(null);

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
    if (activeTool === 'terrain_brush' && onPaintTerrainCell) {
      const coords = getSVGCoordinates(e);
      onPaintTerrainCell(coords.x, coords.y, activeTerrainBrush);
      return;
    }
    onMouseDown(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingObj) {
      const coords = getSVGCoordinates(e);
      onUpdateObjectPosition(draggingObj.type, draggingObj.id, coords);
      return;
    }
    onMouseMove(e);
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    setDraggingObj(null);
    onMouseUp(e);
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden bg-[#090b0e] cursor-crosshair select-none"
      onWheel={undefined}
    >
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
        </defs>

        {/* Scaled & Panned Group Container */}
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          {/* 1. Water Background Layer */}
          <rect width={map.width} height={map.height} fill={styleConfig.waterColor} />

          {/* 2. Coastline & Landmass Layer */}
          {layers.terrain && (
            <path
              d={map.coastline}
              fill={styleConfig.landColor}
              stroke={styleConfig.coastColor}
              strokeWidth={3}
              className="transition-colors duration-300"
            />
          )}

          {/* 3. Custom Painted Terrain Cells */}
          {map.terrainCells?.map((cell, idx) => (
            <circle
              key={idx}
              cx={cell.x}
              cy={cell.y}
              r={15}
              fill={
                cell.type === 'desert'
                  ? '#f39c12'
                  : cell.type === 'snow'
                  ? '#ecf0f1'
                  : cell.type === 'swamp'
                  ? '#16a085'
                  : cell.type === 'volcanic'
                  ? '#c0392b'
                  : '#27ae60'
              }
              opacity={0.5}
            />
          ))}

          {/* 4. Polygon Region & Kingdom Borders */}
          {layers.kingdoms &&
            map.kingdomBorders?.map((kb) => (
              <polygon
                key={kb.id}
                points={kb.points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill={kb.color}
                fillOpacity={kb.opacity || 0.25}
                stroke={kb.color}
                strokeWidth={2}
                strokeDasharray="6,4"
              />
            ))}

          {/* 5. Rivers */}
          {layers.rivers &&
            map.rivers.map((r) => {
              const pts = r.points || r.path || [];
              if (pts.length < 2) return null;
              const pathData = pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
              return (
                <path
                  key={r.id}
                  d={pathData}
                  fill="none"
                  stroke={styleConfig.waterColor}
                  strokeWidth={r.width || 4}
                  strokeLinecap="round"
                />
              );
            })}

          {/* 6. Roads */}
          {layers.roads &&
            map.roads?.map((rd) => {
              const pts = rd.points || rd.path || [];
              if (pts.length < 2) return null;
              const pathData = pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
              return (
                <path
                  key={rd.id}
                  d={pathData}
                  fill="none"
                  stroke="#8e44ad"
                  strokeWidth={rd.width || 2}
                  strokeDasharray="4,4"
                />
              );
            })}

          {/* 7. Mountains */}
          {layers.mountains &&
            map.mountains.map((m, idx) => (
              <g key={idx} transform={`translate(${m.x}, ${m.y})`}>
                <polygon points="0,-18 -14,14 14,14" fill={styleConfig.mountainColor} stroke={styleConfig.textColor} strokeWidth={1.5} />
                <polygon points="0,-18 -6,0 0,-2" fill={isDark ? '#e2e8f0' : '#ffffff'} opacity={0.8} />
              </g>
            ))}

          {/* 8. Forests */}
          {layers.forests &&
            map.forests.map((f, idx) => (
              <g key={idx} transform={`translate(${f.x}, ${f.y})`}>
                <circle r={f.radius} fill={styleConfig.forestColor} opacity={0.6} />
              </g>
            ))}

          {/* 9. Cities / Settlements */}
          {layers.cities &&
            map.cities.map((c) => {
              const isSelected = selectedObject?.type === 'city' && selectedObject.id === c.id;
              return (
                <g
                  key={c.id}
                  transform={`translate(${c.x}, ${c.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectObject({ type: 'city', id: c.id });
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingObj({ type: 'city', id: c.id });
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (onContextMenuAction) onContextMenuAction(e, { type: 'city', id: c.id });
                  }}
                  className="cursor-pointer group"
                >
                  <circle
                    r={c.type === 'capital' ? 10 : 7}
                    fill={c.type === 'capital' ? '#d4af37' : '#e74c3c'}
                    stroke="#0b0d11"
                    strokeWidth={2}
                  />
                  {isSelected && <circle r={16} fill="none" stroke="#38bdf8" strokeWidth={2} strokeDasharray="3,3" />}
                  <text
                    y={18}
                    textAnchor="middle"
                    fill={styleConfig.textColor}
                    fontSize={11}
                    fontWeight="bold"
                    fontFamily={styleConfig.fontFamily}
                  >
                    {c.name}
                  </text>
                </g>
              );
            })}

          {/* 10. Typography Labels */}
          {layers.labels &&
            map.labels.map((l) => {
              const isSelected = selectedObject?.type === 'label' && selectedObject.id === l.id;
              return (
                <g
                  key={l.id}
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
                    fill={l.color || styleConfig.textColor}
                    fontSize={l.fontSize || 14}
                    fontWeight={l.fontWeight || 'bold'}
                    fontFamily={l.fontFamily || styleConfig.fontFamily}
                    opacity={l.opacity || 1}
                  >
                    {l.text}
                  </text>
                  {isSelected && <rect x={-50} y={-15} width={100} height={24} fill="none" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="3,3" />}
                </g>
              );
            })}

          {/* 11. Grid Overlay */}
          {layers.grid && <rect width={map.width} height={map.height} fill="url(#grid-pattern)" pointerEvents="none" />}

          {/* 12. Compass Rose */}
          {layers.compass && (
            <g transform={`translate(${map.width - 80}, 80)`} pointerEvents="none">
              <circle r={35} fill="none" stroke={styleConfig.textColor} strokeWidth={1.5} opacity={0.6} />
              <polygon points="0,-35 6,-6 35,0 6,6 0,35 -6,6 -35,0 -6,-6" fill={styleConfig.textColor} opacity={0.8} />
              <text y={-40} textAnchor="middle" fill={styleConfig.textColor} fontSize={12} fontWeight="bold">
                N
              </text>
            </g>
          )}

          {/* 13. Scale Bar */}
          <g transform={`translate(60, ${map.height - 40})`} pointerEvents="none">
            <line x1={0} y1={0} x2={100} y2={0} stroke={styleConfig.textColor} strokeWidth={3} />
            <text x={50} y={-8} textAnchor="middle" fill={styleConfig.textColor} fontSize={10} fontFamily="monospace">
              100 Miles
            </text>
          </g>

          {/* 14. Decorative Title Banner */}
          {map.titleBannerText && (
            <g transform={`translate(${map.width / 2}, 60)`} pointerEvents="none">
              <rect x={-150} y={-20} width={300} height={40} fill={isDark ? '#0f172a' : '#fef3c7'} stroke="#d4af37" strokeWidth={2} rx={8} />
              <text y={6} textAnchor="middle" fill="#d4af37" fontSize={16} fontWeight="bold" fontFamily="Cinzel, serif">
                {map.titleBannerText}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
