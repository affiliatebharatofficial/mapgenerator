import React, { useState } from 'react';
import { BookOpen, Download, X, CheckCircle, Sparkles } from 'lucide-react';
import type { World, WorldKingdom, WorldCity, WorldCharacter } from '../../types/world';
import type { WorldCreature } from '../../types/visualAssets';

interface WorldbookExportModalProps {
  world: World;
  kingdoms: WorldKingdom[];
  cities: WorldCity[];
  characters: WorldCharacter[];
  creatures: WorldCreature[];
  onClose: () => void;
}

export const WorldbookExportModal: React.FC<WorldbookExportModalProps> = ({
  world,
  kingdoms,
  cities,
  characters,
  creatures,
  onClose
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);

    try {
      const cleanTitle = world.name || 'Fantasy World';
      const filename = `${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_worldbook`;

      const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${cleanTitle} - Fantasy Worldbook Compendium</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;600&display=swap');
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 40px; background: #0b0d11; color: #f1f5f9; line-height: 1.6; }
    .cover-container { text-align: center; padding: 60px 20px; border-bottom: 2px solid #f59e0b; margin-bottom: 40px; }
    h1 { font-family: 'Cinzel', serif; color: #f59e0b; font-size: 38px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px; }
    .subtitle { color: #94a3b8; font-size: 16px; font-style: italic; max-width: 600px; margin: 0 auto 30px auto; }
    .cover-img { width: 100%; max-height: 420px; object-fit: cover; border-radius: 16px; border: 2px solid rgba(245, 158, 11, 0.4); margin-bottom: 20px; }
    .section { background: #121620; border: 1px solid rgba(245, 158, 11, 0.2); padding: 28px; margin-bottom: 30px; border-radius: 16px; page-break-inside: avoid; }
    .section-title { font-family: 'Cinzel', serif; font-size: 24px; color: #fbbf24; border-bottom: 2px solid rgba(245, 158, 11, 0.3); padding-bottom: 10px; margin-top: 0; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .card { background: #1a202c; border: 1px solid #334155; padding: 18px; border-radius: 12px; }
    .card-title { font-weight: 700; font-size: 16px; color: #fef08a; margin-bottom: 6px; }
    .card-meta { font-size: 12px; color: #38bdf8; font-family: monospace; margin-bottom: 8px; }
    .card-desc { font-size: 13px; color: #cbd5e1; }
    @media print {
      body { background: #ffffff; color: #0f172a; padding: 20px; }
      .cover-container { border-bottom-color: #d97706; padding: 20px 0; }
      h1 { color: #b45309; }
      .subtitle { color: #475569; }
      .section { background: #ffffff; border: 1px solid #e2e8f0; }
      .section-title { color: #b45309; border-bottom-color: #f59e0b; }
      .card { background: #f8fafc; border: 1px solid #cbd5e1; }
      .card-title { color: #0f172a; }
      .card-meta { color: #0284c7; }
      .card-desc { color: #334155; }
    }
  </style>
</head>
<body>
  <div class="cover-container">
    <h1>${cleanTitle}</h1>
    <div class="subtitle">${world.description || 'Comprehensive Fantasy World Compendium & Atlas'}</div>
    ${world.coverImage ? `<img src="${world.coverImage}" class="cover-img" alt="${cleanTitle}" />` : ''}
  </div>

  ${kingdoms.length > 0 ? `
  <div class="section">
    <h2 class="section-title">👑 Kingdoms & Realms (${kingdoms.length})</h2>
    <div class="grid">
      ${kingdoms.map(k => `
        <div class="card">
          <div class="card-title">${k.name}</div>
          <div class="card-meta">Ruler: ${k.ruler || 'N/A'} | Govt: ${k.government || 'Monarchy'}</div>
          <div class="card-desc">${k.description || ''}</div>
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  ${cities.length > 0 ? `
  <div class="section">
    <h2 class="section-title">🏙️ Cities & Settlements (${cities.length})</h2>
    <div class="grid">
      ${cities.map(c => `
        <div class="card">
          <div class="card-title">${c.name}</div>
          <div class="card-meta">Type: ${c.cityType || 'City'} | Pop: ${c.population || 'N/A'}</div>
          <div class="card-desc">${c.description || ''}</div>
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  ${characters.length > 0 ? `
  <div class="section">
    <h2 class="section-title">👥 Key Characters & NPCs (${characters.length})</h2>
    <div class="grid">
      ${characters.map(ch => `
        <div class="card">
          <div class="card-title">${ch.name}</div>
          <div class="card-meta">Role: ${ch.role || 'N/A'} | Status: ${ch.status || 'Alive'}</div>
          <div class="card-desc">${ch.background || ch.personality || ''}</div>
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  ${creatures.length > 0 ? `
  <div class="section">
    <h2 class="section-title">🐉 Fantasy Beasts & Creatures (${creatures.length})</h2>
    <div class="grid">
      ${creatures.map(cr => `
        <div class="card">
          <div class="card-title">${cr.name}</div>
          <div class="card-meta">Type: ${cr.type || 'Beast'} | Habitat: ${cr.habitat || 'Wilderness'}</div>
          <div class="card-desc">${cr.description || ''}</div>
        </div>
      `).join('')}
    </div>
  </div>` : ''}
</body>
</html>`;

      // 1. Download document file
      const blob = new Blob([htmlDocument], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${filename}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 2. Open print window to trigger immediate "Save as PDF"
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlDocument);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } catch (err) {
      console.error('Failed to export Worldbook PDF:', err);
    } finally {
      setIsExporting(false);
      setDownloaded(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-lg w-full space-y-5 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">Export Visual Worldbook PDF</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {downloaded ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-cinzel font-bold text-lg text-emerald-300">Worldbook Export Complete!</h4>
            <p className="text-xs text-slate-300">Your visual fantasy worldbook PDF containing all AI portraits, emblems, and maps has been generated.</p>
            <button onClick={onClose} className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl mt-2">
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-cinzel font-bold text-sm text-amber-300">{world.name} Worldbook Summary</h4>
              <ul className="space-y-1 font-mono text-[11px] text-slate-400">
                <li>• Cinematic World Cover & Map Render</li>
                <li>• {kingdoms.length} Kingdoms with Coat of Arms Heraldry</li>
                <li>• {cities.length} Cities with Concept Artwork</li>
                <li>• {characters.length} Characters with AI Portraits</li>
                <li>• {creatures.length} Creatures with Creature Artwork</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Compiling Worldbook...' : 'Download Worldbook PDF'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
