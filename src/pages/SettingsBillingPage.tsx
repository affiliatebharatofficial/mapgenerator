import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CreditCard, Sparkles, Database, History, Gift } from 'lucide-react';
import { useSubscription } from '../lib/supabase/subscriptionStore';
import { PLANS } from '../config/plans';
import { PlatformConfigService } from '../lib/config/platformConfigService';

interface SettingsBillingPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onNavigatePricing: () => void;
}

export const SettingsBillingPage: React.FC<SettingsBillingPageProps> = ({
  onNavigateCreate,
  onNavigateHome,
  onNavigatePricing
}) => {
  const { subscription, currentPlan, creditsRemaining, creditsTotal, creditsUsed, transactions, cancelSubscription } = useSubscription();
  const plan = PLANS[currentPlan] || PLANS.free;

  const masterConfig = PlatformConfigService.getMasterConfig();
  const isFreeLaunchMode = masterConfig.freeLaunchMode || !masterConfig.monetizationEnabled;

  const creditUsagePercent = Math.min(100, Math.round((creditsUsed / creditsTotal) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-cinzel font-bold text-2xl text-slate-100">
              Billing & <span className="gold-gradient-text">Subscriptions</span>
            </h1>
            <p className="text-xs text-slate-400">Manage your subscription plan, credit usage, and transaction logs.</p>
          </div>
        </div>

        {/* Free Launch Mode Notice (Spec #34) */}
        {isFreeLaunchMode && (
          <div className="p-6 bg-gradient-to-r from-emerald-500/15 via-amber-500/10 to-emerald-500/15 rounded-2xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-cinzel font-bold text-sm">
              <Gift className="w-4 h-4" /> 100% FREE LAUNCH MODE ACTIVE
            </div>
            <p className="text-xs text-slate-300">
              Billing & checkout are currently inactive. All platform features, map generations, AI artwork, and high-resolution exports are unlocked for free during launch.
            </p>
          </div>
        )}

        {/* Current Plan Overview Card */}
        <div className="glass-panel p-8 rounded-2xl border border-amber-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Active Plan</span>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="font-cinzel font-bold text-2xl text-slate-100">{plan.name}</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 capitalize">
                  {subscription.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
            </div>

            <button
              onClick={onNavigatePricing}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-4 h-4" /> Change / Upgrade Plan
            </button>
          </div>

          {/* Usage Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Monthly AI Credits
                </span>
                <span className="font-mono text-amber-300">{creditsUsed} / {creditsTotal} Used</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${creditUsagePercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">{creditsRemaining} credits remaining for this cycle.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-400" /> Saved Maps Limit
                </span>
                <span className="font-mono text-emerald-400">Max {plan.maxSavedMaps} Maps</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full rounded-full w-1/4" />
              </div>
              <p className="text-[11px] text-slate-400">Generous cloud storage included with {plan.name}.</p>
            </div>
          </div>

          {currentPlan !== 'free' && (
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Renewal Date: <strong className="text-slate-200">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</strong></span>
              {subscription.cancelAtPeriodEnd ? (
                <span className="text-amber-400">Cancels at end of billing period</span>
              ) : (
                <button
                  onClick={async () => {
                    await cancelSubscription();
                  }}
                  className="text-slate-400 hover:text-rose-400 underline"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          )}
        </div>

        {/* Credit Transaction Audit Log */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <h2 className="font-cinzel font-bold text-lg text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
            <History className="w-5 h-5 text-amber-400" />
            <span>Credit Audit History</span>
          </h2>

          {transactions.length === 0 ? (
            <p className="text-xs text-slate-500">No transactions recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-800/80 text-xs">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-200">{tx.description}</p>
                    <p className="text-[10px] font-mono text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>

                  <span className={`font-mono font-bold text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Credits
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
