import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { PlanId, EntitlementKey } from '../../config/plans';
import { PLANS, checkPlanEntitlement } from '../../config/plans';
import { useAuth } from './authStore';
import { MockBillingProvider, setMockUserPlan, type SubscriptionStatusInfo } from '../billing/billingProvider';

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  transactionType: 'monthly_grant' | 'generation_usage' | 'bonus' | 'purchase' | 'refund' | 'adjustment';
  description: string;
  createdAt: string;
}

interface SubscriptionContextType {
  subscription: SubscriptionStatusInfo;
  currentPlan: PlanId;
  creditsRemaining: number;
  creditsTotal: number;
  creditsUsed: number;
  transactions: CreditTransaction[];
  hasEntitlement: (key: EntitlementKey) => boolean;
  deductCredits: (amount: number, description: string) => boolean;
  refundCredits: (amount: number, description: string) => void;
  upgradePlan: (newPlan: PlanId) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const LOCAL_CREDITS_KEY = 'createfantasymap_credits';
const LOCAL_TX_KEY = 'createfantasymap_tx_history';

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [subscription, setSubscription] = useState<SubscriptionStatusInfo>({
    planId: 'free',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 86400000 * 30).toISOString(),
    cancelAtPeriodEnd: false,
    provider: 'mock'
  });

  const currentPlan = subscription.planId;
  const planConfig = PLANS[currentPlan] || PLANS.free;

  const [creditsTotal, setCreditsTotal] = useState<number>(planConfig.creditsPerMonth);
  const [creditsUsed, setCreditsUsed] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync subscription status & credits for user
  useEffect(() => {
    async function initSub() {
      setIsLoading(true);
      const sub = await MockBillingProvider.getSubscriptionStatus(userId);
      setSubscription(sub);

      const plan = PLANS[sub.planId] || PLANS.free;
      setCreditsTotal(plan.creditsPerMonth);

      try {
        const rawUsed = localStorage.getItem(`${LOCAL_CREDITS_KEY}_${userId}`);
        const used = rawUsed ? parseInt(rawUsed, 10) : 0;
        setCreditsUsed(used);

        const rawTx = localStorage.getItem(`${LOCAL_TX_KEY}_${userId}`);
        if (rawTx) {
          setTransactions(JSON.parse(rawTx));
        } else {
          const initTx: CreditTransaction = {
            id: `tx_init_${Date.now()}`,
            userId,
            amount: plan.creditsPerMonth,
            transactionType: 'monthly_grant',
            description: `Monthly credit grant for ${plan.name}`,
            createdAt: new Date().toISOString()
          };
          setTransactions([initTx]);
          localStorage.setItem(`${LOCAL_TX_KEY}_${userId}`, JSON.stringify([initTx]));
        }
      } catch {
        setCreditsUsed(0);
      }
      setIsLoading(false);
    }
    initSub();
  }, [userId, subscription.planId]);

  const creditsRemaining = Math.max(0, creditsTotal - creditsUsed);

  const hasEntitlement = useCallback(
    (key: EntitlementKey): boolean => {
      return checkPlanEntitlement(currentPlan, key);
    },
    [currentPlan]
  );

  const deductCredits = useCallback(
    (amount: number, description: string): boolean => {
      if (creditsRemaining < amount) return false;

      const newUsed = creditsUsed + amount;
      setCreditsUsed(newUsed);
      localStorage.setItem(`${LOCAL_CREDITS_KEY}_${userId}`, newUsed.toString());

      const newTx: CreditTransaction = {
        id: `tx_${Date.now().toString(36)}`,
        userId,
        amount: -amount,
        transactionType: 'generation_usage',
        description,
        createdAt: new Date().toISOString()
      };

      setTransactions((prev) => {
        const next = [newTx, ...prev];
        localStorage.setItem(`${LOCAL_TX_KEY}_${userId}`, JSON.stringify(next));
        return next;
      });

      return true;
    },
    [creditsRemaining, creditsUsed, userId]
  );

  const refundCredits = useCallback(
    (amount: number, description: string) => {
      const newUsed = Math.max(0, creditsUsed - amount);
      setCreditsUsed(newUsed);
      localStorage.setItem(`${LOCAL_CREDITS_KEY}_${userId}`, newUsed.toString());

      const newTx: CreditTransaction = {
        id: `tx_ref_${Date.now().toString(36)}`,
        userId,
        amount: amount,
        transactionType: 'refund',
        description: `Refund: ${description}`,
        createdAt: new Date().toISOString()
      };

      setTransactions((prev) => {
        const next = [newTx, ...prev];
        localStorage.setItem(`${LOCAL_TX_KEY}_${userId}`, JSON.stringify(next));
        return next;
      });
    },
    [creditsUsed, userId]
  );

  const upgradePlan = async (newPlanId: PlanId) => {
    const updated = setMockUserPlan(userId, newPlanId);
    setSubscription(updated);
    const newPlan = PLANS[newPlanId] || PLANS.free;
    setCreditsTotal(newPlan.creditsPerMonth);
    setCreditsUsed(0);
    localStorage.setItem(`${LOCAL_CREDITS_KEY}_${userId}`, '0');

    const grantTx: CreditTransaction = {
      id: `tx_upgrade_${Date.now().toString(36)}`,
      userId,
      amount: newPlan.creditsPerMonth,
      transactionType: 'monthly_grant',
      description: `Upgraded to ${newPlan.name} — Monthly Credits Granted`,
      createdAt: new Date().toISOString()
    };

    setTransactions((prev) => {
      const next = [grantTx, ...prev];
      localStorage.setItem(`${LOCAL_TX_KEY}_${userId}`, JSON.stringify(next));
      return next;
    });
  };

  const cancelSubscription = async () => {
    await MockBillingProvider.cancelSubscription(userId);
    setSubscription((prev) => ({ ...prev, cancelAtPeriodEnd: true }));
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        currentPlan,
        creditsRemaining,
        creditsTotal,
        creditsUsed,
        transactions,
        hasEntitlement,
        deductCredits,
        refundCredits,
        upgradePlan,
        cancelSubscription,
        isLoading
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
