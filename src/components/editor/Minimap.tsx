import React, { useRef } from 'react';
import type { FantasyMap } from '../../types/map';

interface MinimapProps {
  map: FantasyMap;
  transform: { x: number; y: number; k: number };
  onNavigateTransform: (x: number, y: number) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  map,
  transform,
  onNavigateTransform
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const minimapWidth = 160;
  const minimapHeight = Math.round((map.height / map.width) * minimapWidth);

  // Compute viewport rectangle on minimap
  const scale = minimapWidth / map.width;
  const viewW = (window.innerWidth / transform.k) * scale;
  const viewH = (window.innerHeight / transform.k) * scale;
  const viewX = (-transform.x / transform.k) * scale;
  const viewY = (-transform.y / transform.k) * scale;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const mapX = (clickX / minimapWidth) * map.width;
    const mapY = (clickY / minimapHeight) * map.height;

    const targetTransformX = window.innerWidth / 2 - mapX * transform.k;
    const targetTransformY = window.innerHeight / 2 - mapY * transform.k;

    onNavigateTransform(targetTransformX, targetTransformY);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{ width: minimapWidth, height: minimapHeight }}
      className="bg-[#0e1118]/90 border border-amber-500/30 rounded-xl overflow-hidden shadow-2xl relative cursor-pointer select-none"
    >
      {/* Background Map Canvas Thumbnail */}
      <svg
        viewBox={`0 0 ${map.width} ${map.height}`}
        className="w-full h-full object-cover opacity-50 pointer-events-none"
      >
        <path d={map.coastline} fill="#1a2332" stroke="#d4af37" strokeWidth={2} />
        {map.cities.map((c) => (
          <circle key={c.id} cx={c.x} cy={c.y} r={12} fill="#e74c3c" />
        ))}
      </svg>

      {/* Active Viewport Rect Box */}
      <div
        style={{
          left: `${Math.max(0, viewX)}px`,
          top: `${Math.max(0, viewY)}px`,
          width: `${Math.min(minimapWidth, viewW)}px`,
          height: `${Math.min(minimapHeight, viewH)}px`
        }}
        className="absolute border-2 border-amber-400 bg-amber-400/10 pointer-events-none rounded"
      />
    </div>
  );
};
