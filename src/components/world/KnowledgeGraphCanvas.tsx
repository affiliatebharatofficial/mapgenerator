import React, { useState } from 'react';
import { Share2, ZoomIn, ZoomOut, Filter } from 'lucide-react';
import { WorldBibleService } from '../../lib/supabase/worldBibleService';

interface KnowledgeGraphCanvasProps {
  worldId: string;
}

export const KnowledgeGraphCanvas: React.FC<KnowledgeGraphCanvasProps> = ({ worldId }) => {
  const { nodes, edges } = WorldBibleService.getKnowledgeGraphData(worldId);
  const [degree, setDegree] = useState<number>(2);

  return (
    <div className="w-full h-[500px] bg-[#090b0e] border border-amber-500/20 rounded-3xl p-6 font-sans select-none relative flex flex-col justify-between overflow-hidden">
      {/* Header Controls */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-amber-400" />
          <h3 className="font-cinzel font-bold text-base text-slate-100">Interactive Knowledge Graph</h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400">Depth Degree:</span>
          {[1, 2, 3].map((d) => (
            <button
              key={d}
              onClick={() => setDegree(d)}
              className={`px-2.5 py-1 rounded-lg border font-bold ${
                degree === d ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {d} DEG
            </button>
          ))}
        </div>
      </div>

      {/* SVG Relationship Graph Display */}
      <svg className="w-full h-full absolute inset-0 pt-12">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
          </marker>
        </defs>

        {edges.map((e, idx) => (
          <g key={idx}>
            <line x1={150 + idx * 80} y1={180} x2={300 + idx * 60} y2={280} stroke="#38bdf8" strokeWidth={1.5} opacity={0.6} markerEnd="url(#arrow)" />
            <text x={220 + idx * 70} y={220} fill="#94a3b8" fontSize={10} fontFamily="monospace" textAnchor="middle">
              {e.label}
            </text>
          </g>
        ))}

        {nodes.map((n, idx) => (
          <g key={n.id} transform={`translate(${150 + idx * 100}, ${180 + (idx % 2 === 0 ? 0 : 100)})`} className="cursor-pointer group">
            <circle r={24} fill="#1e293b" stroke="#f59e0b" strokeWidth={2} />
            <text textAnchor="middle" y={4} fill="#f8fafc" fontSize={11} fontWeight="bold" fontFamily="Cinzel, serif">
              {n.label.substring(0, 8)}
            </text>
          </g>
        ))}

        {nodes.length === 0 && (
          <text x="50%" y="50%" textAnchor="middle" fill="#64748b" fontSize={13} fontFamily="Cinzel, serif">
            Add relationships between characters, kingdoms, and cities to populate the Knowledge Graph.
          </text>
        )}
      </svg>
    </div>
  );
};
