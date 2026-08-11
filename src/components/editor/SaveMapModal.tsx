import React, { useState } from 'react';
import { Save, Globe, Lock, Sparkles, X, AlertCircle } from 'lucide-react';
import type { FantasyMap } from '../../types/map';
import { useAuth } from '../../lib/supabase/authStore';

interface SaveMapModalProps {
  map: FantasyMap;
  isPublicDefault?: boolean;
  onSaveConfirmed: (options: { title: string; description?: string; is_public: boolean }) => void;
  onClose: () => void;
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
}

export const SaveMapModal: React.FC<SaveMapModalProps> = ({
  map,
  isPublicDefault = false,
  onSaveConfirmed,
  onClose,
  onNavigateLogin,
  onNavigateSignup
}) => {
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState(map.name);
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(isPublicDefault);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSaveConfirmed({
        title: title.trim(),
        description: description.trim(),
        is_public: isPublic
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-lg w-full space-y-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100">
          <X className="w-5 h-5" />
        </button>

        {!isAuthenticated ? (
          /* Anonymous Guest Save Prompt */
          <div className="space-y-5 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="font-cinzel font-bold text-xl text-amber-200">
              Save Your World
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              Create a free account to save this map to your cloud account, access it from any device, publish to the community gallery, and share readable links.
            </p>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[11px] text-amber-300/90 leading-snug">
              ✨ Don't worry, your map edits will remain intact while you log in!
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={onNavigateSignup}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                Create Free Account
              </button>

              <button
                onClick={onNavigateLogin}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
              >
                Already have an account? Sign In
              </button>

              <button
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-400 pt-1"
              >
                Continue as Guest (Save locally only)
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated Cloud Save Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <Save className="w-5 h-5 text-amber-400" />
              <h3 className="font-cinzel font-bold text-lg text-slate-100">
                Save Map to Cloud
              </h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Map Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Kingdom of Eldoria"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40 font-cinzel font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="A brief background lore or summary of this world map..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-500/40 resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300">Visibility Setting</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    !isPublic
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Lock className="w-4 h-4 text-slate-300 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold">Private</div>
                    <div className="text-[10px] text-slate-400">Only you can view & edit</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    isPublic
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Globe className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold">Public</div>
                    <div className="text-[10px] text-slate-400">Appears in gallery & remixed</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Only publish maps and lore content you have the right to share.</span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                Save Map
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
