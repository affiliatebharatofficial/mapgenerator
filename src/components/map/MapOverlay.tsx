import React from 'react';
import type { FantasyMap, MapLayers } from '../../types/map';
import { MAP_STYLES } from '../../lib/map-engine/styles';

interface MapOverlayProps {
  map: FantasyMap;
  layers: MapLayers;
}

export const MapOverlay: React.FC<MapOverlayProps> = ({ map, layers }) => {
  const style = MAP_STYLES[map.style] || MAP_STYLES.parchment;

  return (
    <g className="map-decorations pointer-events-none select-none">
      {/* Decorative Outer Border */}
      <rect
        x="12"
        y="12"
        width={map.width - 24}
        height={map.height - 24}
        fill="none"
        stroke={style.coastlineColor}
        strokeWidth="2"
        opacity="0.6"
      />
      <rect
        x="18"
        y="18"
        width={map.width - 36}
        height={map.height - 36}
        fill="none"
        stroke={style.coastlineColor}
        strokeWidth="1"
        strokeDasharray="4,4"
        opacity="0.4"
      />

      {/* Decorative Corner Ornaments */}
      {[
        { x: 12, y: 12, rot: 0 },
        { x: map.width - 12, y: 12, rot: 90 },
        { x: map.width - 12, y: map.height - 12, rot: 180 },
        { x: 12, y: map.height - 12, rot: 270 }
      ].map((c, i) => (
        <g key={`corner_${i}`} transform={`translate(${c.x}, ${c.y}) rotate(${c.rot})`}>
          <path d="M 0,0 L 25,0 L 25,5 L 5,5 L 5,25 L 0,25 Z" fill={style.coastlineColor} opacity="0.7" />
          <circle cx="12" cy="12" r="3" fill={style.cityNameColor} opacity="0.8" />
        </g>
      ))}

      {/* Compass Rose */}
      {layers.compass && (
        <g transform={`translate(${map.width - 80}, 90)`} className="compass-rose">
          {/* Outer Ring */}
          <circle cx="0" cy="0" r="32" fill="none" stroke={style.coastlineColor} strokeWidth="1.5" opacity="0.7" />
          <circle cx="0" cy="0" r="28" fill="none" stroke={style.coastlineColor} strokeWidth="0.75" strokeDasharray="2,2" opacity="0.5" />

          {/* North/South/East/West Points */}
          <polygon points="0,-36 6,-8 0,0 -6,-8" fill={style.cityIconColor} />
          <polygon points="0,36 6,8 0,0 -6,8" fill={style.coastlineColor} opacity="0.8" />
          <polygon points="36,0 8,6 0,0 8,-6" fill={style.coastlineColor} opacity="0.8" />
          <polygon points="-36,0 -8,6 0,0 -8,-6" fill={style.coastlineColor} opacity="0.8" />

          <text x="0" y="-42" textAnchor="middle" dominantBaseline="middle" fill={style.cityNameColor} fontSize="12" fontWeight="bold" fontFamily={style.labelFontFamily}>N</text>
          <text x="0" y="46" textAnchor="middle" dominantBaseline="middle" fill={style.cityNameColor} fontSize="10" fontFamily={style.labelFontFamily}>S</text>
          <text x="46" y="0" textAnchor="middle" dominantBaseline="middle" fill={style.cityNameColor} fontSize="10" fontFamily={style.labelFontFamily}>E</text>
          <text x="-46" y="0" textAnchor="middle" dominantBaseline="middle" fill={style.cityNameColor} fontSize="10" fontFamily={style.labelFontFamily}>W</text>
        </g>
      )}

      {/* Map Legend */}
      {layers.legend && (
        <g transform={`translate(35, ${map.height - 115})`}>
          <rect x="0" y="0" width="160" height="80" rx="4" fill={style.landBg} stroke={style.coastlineColor} strokeWidth="1" opacity="0.9" />
          <text x="12" y="20" fill={style.cityNameColor} fontSize="11" fontWeight="bold" fontFamily={style.labelFontFamily}>MAP LEGEND</text>

          <g transform="translate(12, 35)">
            <circle cx="6" cy="0" r="4" fill={style.cityIconColor} />
            <text x="18" y="3" fill={style.cityNameColor} fontSize="10">Capital City</text>
          </g>
          <g transform="translate(12, 52)">
            <rect x="2" y="-4" width="8" height="8" fill={style.mountainStroke} />
            <text x="18" y="3" fill={style.cityNameColor} fontSize="10">Fortress / Castle</text>
          </g>
          <g transform="translate(12, 68)">
            <line x1="0" y1="0" x2="12" y2="0" stroke={style.riverColor} strokeWidth="2" />
            <text x="18" y="3" fill={style.cityNameColor} fontSize="10">Major River</text>
          </g>
        </g>
      )}

      {/* Map Title Card Banner */}
      <g transform={`translate(${map.width / 2}, 45)`}>
        <rect x="-160" y="-18" width="320" height="36" rx="4" fill={style.landBg} stroke={style.coastlineColor} strokeWidth="1.5" opacity="0.9" />
        <text
          x="0"
          y="2"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={style.cityNameColor}
          fontSize="16"
          fontWeight="bold"
          letterSpacing="2"
          fontFamily={style.labelFontFamily}
        >
          {map.name.toUpperCase()}
        </text>
      </g>

      {/* Scale Bar */}
      <g transform={`translate(${map.width / 2 - 60}, ${map.height - 35})`}>
        <rect x="0" y="0" width="120" height="4" fill={style.coastlineColor} opacity="0.7" />
        <rect x="0" y="0" width="30" height="4" fill={style.cityIconColor} />
        <rect x="60" y="0" width="30" height="4" fill={style.cityIconColor} />
        <text x="0" y="-6" fontSize="9" fill={style.cityNameColor}>0</text>
        <text x="60" y="-6" fontSize="9" fill={style.cityNameColor}>50</text>
        <text x="120" y="-6" fontSize="9" fill={style.cityNameColor}>100 Leagues</text>
      </g>
    </g>
  );
};
