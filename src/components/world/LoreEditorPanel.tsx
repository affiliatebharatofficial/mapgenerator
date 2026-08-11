import React, { useState } from 'react';
import { BookOpen, Plus, Save, AtSign, Link2 } from 'lucide-react';
import { WorldBibleService } from '../../lib/supabase/worldBibleService';
import type { LoreDocument, CanonStatus } from '../../types/worldBible';

interface LoreEditorPanelProps {
  worldId: string;
}

export const LoreEditorPanel: React.FC<LoreEditorPanelProps> = ({ worldId }) => {
  const [loreDocs, setLoreDocs] = useState<LoreDocument[]>(() => WorldBibleService.getLoreDocuments(worldId));
  const [selectedDoc, setSelectedDoc] = useState<LoreDocument | null>(loreDocs[0] || null);

  const [title, setTitle] = useState(selectedDoc?.title || '');
  const [content, setContent] = useState(selectedDoc?.content || '');
  const [category, setCategory] = useState<LoreDocument['category']>('history');
  const [status, setStatus] = useState<CanonStatus>('canon');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const saved = WorldBibleService.saveLoreDocument({
      id: selectedDoc?.id,
      worldId,
      title,
      category,
      content,
      canonStatus: status,
      mentions: []
    });

    setLoreDocs(WorldBibleService.getLoreDocuments(worldId));
    setSelectedDoc(saved);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-sans select-none text-xs">
      {/* Lore Library List (4 cols) */}
      <div className="md:col-span-4 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h4 className="font-cinzel font-bold text-sm text-slate-100">Lore Compendium</h4>
          <button
            onClick={() => {
              setSelectedDoc(null);
              setTitle('New World Chronicle');
              setContent('');
            }}
            className="p-1.5 bg-amber-500 text-slate-950 rounded-lg font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> New Document
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loreDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => {
                setSelectedDoc(doc);
                setTitle(doc.title);
                setContent(doc.content);
                setCategory(doc.category);
                setStatus(doc.canonStatus);
              }}
              className={`w-full p-3 rounded-xl border text-left space-y-1 transition-all ${
                selectedDoc?.id === doc.id ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <strong className="font-cinzel font-bold text-slate-200 block">{doc.title}</strong>
                <span className="text-[9px] font-mono text-amber-400 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">
                  {doc.canonStatus}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2">{doc.content}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Lore Editor (8 cols) */}
      <form onSubmit={handleSave} className="md:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title..."
              className="bg-transparent font-cinzel font-bold text-lg text-slate-100 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CanonStatus)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-1.5 text-slate-200 font-mono text-xs"
            >
              <option value="canon">Canon Status: Canon</option>
              <option value="draft">Canon Status: Draft</option>
              <option value="non-canon">Canon Status: Non-Canon</option>
            </select>

            <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5">
              <Save className="w-4 h-4" /> Save Lore
            </button>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write history, myths, religions, or lore... Type @Entity to insert structured world references."
          rows={12}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-amber-500/40 resize-none font-serif"
        />

        {/* Backlinks Footer */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-amber-400" />
            <span>Mentioned Entities: @Silverkeep, @Queen Elara</span>
          </div>
          <span>Automatic Backlink Sync Active</span>
        </div>
      </form>
    </div>
  );
};
