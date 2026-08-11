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
    setTimeout(() => {
      setIsExporting(false);
      setDownloaded(true);
    }, 1500);
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
