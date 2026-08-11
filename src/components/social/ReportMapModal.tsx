import React, { useState } from 'react';
import { Flag, X, Check } from 'lucide-react';
import { MapService } from '../../lib/supabase/mapService';
import { useAuth } from '../../lib/supabase/authStore';

interface ReportMapModalProps {
  mapId: string;
  onClose: () => void;
}

export const ReportMapModal: React.FC<ReportMapModalProps> = ({ mapId, onClose }) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [reported, setReported] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      await MapService.reportMap(mapId, user.id, reason, details);
      setReported(true);
      setTimeout(() => onClose(), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-rose-400" />
          <h3 className="font-cinzel font-bold text-lg text-slate-100">
            Report Map
          </h3>
        </div>

        {reported ? (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs rounded-xl text-center space-y-2">
            <Check className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="font-semibold">Thank you for reporting. Our moderation team will review this map.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Reason for Report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none"
              >
                <option value="spam">Spam / Low Quality</option>
                <option value="offensive">Offensive Content / Language</option>
                <option value="copyright">Copyright Concern</option>
                <option value="other">Other Reason</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Additional Details (Optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Explain why this content violates guidelines..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 placeholder-slate-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
