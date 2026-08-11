import React, { useState } from 'react';
import { Search, Compass, Palette, Layers, Download, Plus, Wand2, X } from 'lucide-react';

interface CommandPaletteModalProps {
  onSelectAction: (actionId: string) => void;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ onSelectAction, onClose }) => {
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'add_city', name: 'Add New City / Settlement', category: 'Civilization', icon: Plus },
    { id: 'add_river', name: 'Draw New River Path', category: 'Hydrology', icon: Plus },
    { id: 'change_theme', name: 'Change Cartography Style Theme', category: 'Style', icon: Palette },
    { id: 'geo_settings', name: 'Open Realistic Geography Controls', category: 'Engine', icon: Compass },
    { id: 'map_health', name: 'Run Geographic Health Audit', category: 'Diagnostics', icon: Search },
    { id: 'export_studio', name: 'Open Export Studio', category: 'Publishing', icon: Download }
  ];

  const filtered = commands.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-24 p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-4 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
        <div className="relative">
          <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search action (e.g. Add city, Theme)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500/40"
          />
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filtered.map((cmd) => {
            const IconComponent = cmd.icon;
            return (
              <button
                key={cmd.id}
                onClick={() => {
                  onSelectAction(cmd.id);
                  onClose();
                }}
                className="w-full p-3 rounded-xl hover:bg-amber-500/10 text-left flex items-center justify-between text-xs group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-slate-200 group-hover:text-amber-300">{cmd.name}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">{cmd.category}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
