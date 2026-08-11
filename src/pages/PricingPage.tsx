import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Sparkles, Check, X, HelpCircle, Gift } from 'lucide-react';
import { PLANS, type PlanId } from '../config/plans';
import { useSubscription } from '../lib/supabase/subscriptionStore';
import { useAuth } from '../lib/supabase/authStore';
import { PlatformConfigService } from '../lib/config/platformConfigService';

interface PricingPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onNavigateCreate,
  onNavigateHome,
  onNavigateLogin
}) => {
  const { currentPlan, upgradePlan } = useSubscription();
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const masterConfig = PlatformConfigService.getMasterConfig();
  const isFreeLaunchMode = masterConfig.freeLaunchMode || !masterConfig.monetizationEnabled;

  const handleSelectPlan = async (planId: PlanId) => {
    if (isFreeLaunchMode) {
      onNavigateCreate();
      return;
    }

    if (!isAuthenticated && planId !== 'free') {
      onNavigateLogin();
      return;
    }

    if (planId === currentPlan) return;

    await upgradePlan(planId);
    window.location.pathname = '/dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans relative overflow-hidden">
      {/* Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-16 z-10">
        {/* Free Launch Banner (Spec #35) */}
        {isFreeLaunchMode && (
          <div className="p-6 bg-gradient-to-r from-emerald-500/20 via-amber-500/15 to-emerald-500/20 rounded-3xl border border-emerald-500/40 text-center space-y-2 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
              <Gift className="w-4 h-4" /> 100% FREE LAUNCH MODE ACTIVE
            </div>
            <h2 className="font-cinzel font-bold text-xl text-slate-100">All Map Generator Features & Exports Are Currently 100% Free!</h2>
            <p className="text-xs text-slate-300 max-w-xl mx-auto">
              CreateFantasyMap is operating in 100% Free Launch Mode. No payment, credit card, or subscription purchase is required to generate maps, artwork, or high-res exports.
            </p>
            <button
              onClick={onNavigateCreate}
              className="mt-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow font-mono"
            >
              Start Creating Maps Free Now →
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple, Transparent Pricing</span>
          </div>

          <h1 className="font-cinzel font-black text-4xl sm:text-5xl text-slate-100">
            Create More <span className="gold-gradient-text">Worlds</span>
          </h1>

          <p className="text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Choose the plan that fits your worldbuilding workflow. Upgrade or cancel anytime.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-[#121620] p-1.5 rounded-2xl border border-amber-500/20 mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {(['free', 'pro', 'creator'] as PlanId[]).map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = currentPlan === planId;
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`glass-panel p-8 rounded-3xl border flex flex-col justify-between relative transition-all duration-300 ${
                  plan.isPopular
                    ? 'border-amber-500/50 bg-[#141824]/90 shadow-2xl shadow-amber-500/10 scale-105'
                    : 'border-slate-800 bg-[#121620]/70 hover:border-slate-700'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[11px] px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    ⭐ Most Popular
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="font-cinzel font-bold text-xl text-slate-100">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed min-h-[36px]">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="font-cinzel font-extrabold text-4xl text-slate-100">${price}</span>
                    <span className="text-xs font-mono text-slate-400">/ month</span>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(planId)}
                    disabled={isCurrent}
                    className={`w-full py-3 text-xs font-bold rounded-xl transition-all shadow-md ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-400 cursor-default border border-slate-700'
                        : plan.isPopular
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                        : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : planId === 'free' ? 'Get Started Free' : `Choose ${plan.name}`}
                  </button>

                  <div className="space-y-3 pt-4 border-t border-slate-800/80">
                    <span className="text-xs font-semibold text-amber-300 uppercase tracking-wide font-mono block">
                      Included Features:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix Table */}
        <div className="space-y-6 pt-10">
          <h2 className="font-cinzel font-bold text-2xl text-center text-slate-100">
            Compare Plan <span className="gold-gradient-text">Capabilities</span>
          </h2>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0e1118]">
                  <th className="p-4 font-cinzel font-bold text-slate-300 text-sm">Feature</th>
                  <th className="p-4 font-cinzel font-bold text-slate-400 text-center">Free ($0)</th>
                  <th className="p-4 font-cinzel font-bold text-amber-300 text-center">Pro ($9/mo)</th>
                  <th className="p-4 font-cinzel font-bold text-purple-300 text-center">Creator ($19/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-4 font-semibold text-slate-200">Monthly AI Generation Credits</td>
                  <td className="p-4 text-center font-mono">5 / month</td>
                  <td className="p-4 text-center font-mono text-amber-300 font-bold">100 / month</td>
                  <td className="p-4 text-center font-mono text-purple-300 font-bold">500 / month</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-200">Saved Cloud Maps Storage</td>
                  <td className="p-4 text-center font-mono">10 Maps</td>
                  <td className="p-4 text-center font-mono text-amber-300 font-bold">100 Maps</td>
                  <td className="p-4 text-center font-mono text-purple-300 font-bold">500 Maps</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-200">Fantasy Map Styles</td>
                  <td className="p-4 text-center">2 Styles</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">All 5 Styles</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">All 5 Styles</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-200">PNG Export Quality</td>
                  <td className="p-4 text-center">Standard (1x)</td>
                  <td className="p-4 text-center text-amber-300 font-semibold">HD (2x)</td>
                  <td className="p-4 text-center text-purple-300 font-semibold">Ultra HD (4x)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-200">Vector SVG Export</td>
                  <td className="p-4 text-center text-slate-600"><X className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-200">Printable PDF Export</td>
                  <td className="p-4 text-center text-slate-600"><X className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-200">Commercial Usage Rights</td>
                  <td className="p-4 text-center text-slate-600"><X className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-slate-600"><X className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-purple-300 font-bold"><Check className="w-4 h-4 mx-auto text-emerald-400 inline" /> Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing FAQ Section */}
        <div className="space-y-6 max-w-3xl mx-auto pt-8">
          <h2 className="font-cinzel font-bold text-2xl text-center text-slate-100 flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-400" /> Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <h3 className="font-cinzel font-bold text-sm text-amber-200">Can I change or cancel my plan at any time?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time from your Billing Settings page. If you cancel, your subscription will remain active until the end of your current period.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <h3 className="font-cinzel font-bold text-sm text-amber-200">What happens to my saved maps if I downgrade?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your maps are never deleted! All existing saved maps remain fully accessible and editable. If your map count exceeds the Free tier limit, you won't be able to save new maps until you delete an existing one or re-upgrade.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <h3 className="font-cinzel font-bold text-sm text-amber-200">Do procedural map generation features require credits?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No! Unlimited procedural map generation using Quick Generate is completely free for all users. AI credits are only consumed when using natural language "Describe Your World" AI generation.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
