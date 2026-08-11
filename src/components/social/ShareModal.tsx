import React, { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';

interface ShareModalProps {
  mapTitle: string;
  shareUrl: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ mapTitle, shareUrl, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Check out "${mapTitle}" generated with CreateFantasyMap!`;

  const shareToX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToReddit = () => {
    window.open(`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-amber-400" />
          <h3 className="font-cinzel font-bold text-lg text-slate-100">
            Share Fantasy Map
          </h3>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Public Map Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 pt-1">
              <Check className="w-3.5 h-3.5" /> Link copied to clipboard!
            </p>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-300">Share to Social</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={shareToX}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-sky-400 font-bold">𝕏</span>
              <span>X / Twitter</span>
            </button>

            <button
              onClick={shareToFacebook}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-blue-500 font-bold">f</span>
              <span>Facebook</span>
            </button>

            <button
              onClick={shareToReddit}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-orange-500 font-bold">r/</span>
              <span>Reddit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
