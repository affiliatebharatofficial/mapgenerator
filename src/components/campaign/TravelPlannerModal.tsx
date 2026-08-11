import React, { useState } from 'react';
import { Compass, Sparkles, X, MapPin } from 'lucide-react';
import { AICampaignEngine } from '../../lib/ai/aiCampaignEngine';
import { useSubscription } from '../../lib/supabase/subscriptionStore';

interface TravelPlannerModalProps {
  worldName: string;
  onClose: () => void;
}

export const TravelPlannerModal: React.FC<TravelPlannerModalProps> = ({ worldName, onClose }) => {
  const { deductCredits } = useSubscription();

  const [origin, setOrigin] = useState('Silverkeep Capital');
  const [destination, setDestination] = useState('Winterhold Fortress');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlanTravel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    deductCredits(1, 'AI Travel Planner');

    const res = await AICampaignEngine.planTravelWithAI(origin, destination, worldName);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121620] border border-amber-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-slate-100">AI Journey & Travel Planner</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {result ? (
          <div className="space-y-4 text-xs animate-in fade-in duration-200">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-300">{origin} ➔ {destination}</span>
                <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {result.distanceDays} Days Travel
                </span>
              </div>
              <p className="text-slate-300">Weather: <span className="text-slate-100">{result.weather}</span></p>
              <p className="text-slate-300">Terrain Hazard: <span className="text-rose-300">{result.hazard}</span></p>
            </div>

            <div className="space-y-2">
              <h4 className="font-cinzel font-bold text-slate-200">Possible Journey Complications</h4>
              <ul className="space-y-1 font-mono text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                {result.complications.map((c: string, i: number) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setResult(null)} className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">
                Plan Another Journey
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlanTravel} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Origin Location</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 disabled:opacity-40"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{loading ? 'Planning Route...' : 'Calculate Route (1 Credit)'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
