import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Check, X, Lock, Globe } from 'lucide-react';
import { CommunityService } from '../../lib/supabase/communityService';
import type { Collection } from '../../types/community';
import { useAuth } from '../../lib/supabase/authStore';

interface SaveToCollectionModalProps {
  mapId?: string;
  worldId?: string;
  onClose: () => void;
}

export const SaveToCollectionModal: React.FC<SaveToCollectionModalProps> = ({ mapId, worldId, onClose }) => {
  const { user } = useAuth();
  const userId = user?.id || 'user_master_cartographer';

  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');

  useEffect(() => {
    const cols = CommunityService.getUserCollections(userId);
    setCollections(cols);
  }, [userId]);

  const handleSaveToCol = (colId: string) => {
    const success = CommunityService.saveToCollection(colId, mapId, worldId);
    if (success) {
      setSavedIds((prev) => new Set(prev).add(colId));
    }
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const newCol = CommunityService.createCollection(userId, newColName, newColDesc, 'public');
    setCollections((prev) => [...prev, newCol]);
    handleSaveToCol(newCol.id);
    setNewColName('');
    setNewColDesc('');
    setShowCreateForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">Save to Collection</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Collections List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {collections.map((col) => {
            const isSaved = savedIds.has(col.id);
            return (
              <div
                key={col.id}
                onClick={() => !isSaved && handleSaveToCol(col.id)}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-200'
                }`}
              >
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    {col.visibility === 'public' ? <Globe className="w-3 h-3 text-slate-400" /> : <Lock className="w-3 h-3 text-slate-400" />}
                    <span>{col.name}</span>
                  </div>
                  {col.description && <p className="text-[10px] text-slate-400 line-clamp-1">{col.description}</p>}
                </div>
                {isSaved ? <Check className="w-4 h-4 text-amber-400 stroke-[3]" /> : <Plus className="w-4 h-4 text-slate-400" />}
              </div>
            );
          })}
        </div>

        {/* Create New Collection Form */}
        {showCreateForm ? (
          <form onSubmit={handleCreateCollection} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 animate-in fade-in duration-200">
            <input
              type="text"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              placeholder="Collection title..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              autoFocus
            />
            <input
              type="text"
              value={newColDesc}
              onChange={(e) => setNewColDesc(e.target.value)}
              placeholder="Description (optional)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowCreateForm(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg">
                Cancel
              </button>
              <button type="submit" disabled={!newColName.trim()} className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg">
                Create & Save
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-amber-400" /> Create New Collection
          </button>
        )}

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
