import React, { useState } from 'react';
import { Flag, X, Check } from 'lucide-react';
import { CommunityService } from '../../lib/supabase/communityService';

interface ReportModalProps {
  targetId: string;
  targetType: 'map' | 'world' | 'comment' | 'profile';
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ targetId, targetType, onClose }) => {
  const [reason, setReason] = useState<'spam' | 'offensive' | 'copyright' | 'harassment' | 'other'>('spam');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    CommunityService.reportContent({
      reporter_id: 'user_current',
      target_type: targetType,
      target_id: targetId,
      reason,
      description
    });
    setSubmitted(true);
    setTimeout(() => onClose(), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-rose-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">Report {targetType.toUpperCase()}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2">
            <Check className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-cinzel font-bold text-base text-emerald-300">Report Filed</h4>
            <p className="text-xs text-slate-400">Thank you for helping keep the cartography community safe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">Reason for Report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              >
                <option value="spam">Spam / Unsolicited</option>
                <option value="offensive">Offensive Content</option>
                <option value="copyright">Copyright Infringement</option>
                <option value="harassment">Harassment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">Details (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Provide additional details..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold text-xs rounded-xl">
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
