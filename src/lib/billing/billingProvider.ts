import type { PlanId } from '../../config/plans';
import { PlatformConfigService } from '../config/platformConfigService';

export interface SubscriptionStatusInfo {
  planId: PlanId;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  provider: 'lemon_squeezy' | 'stripe' | 'mock';
}

export interface BillingProvider {
  createCheckoutSession(planId: PlanId, userId: string, billingInterval?: 'month' | 'year'): Promise<{ checkoutUrl: string }>;
  createBillingPortalSession(userId: string): Promise<{ portalUrl: string }>;
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatusInfo>;
  cancelSubscription(userId: string): Promise<{ success: boolean }>;
}

const LOCAL_SUB_KEY = 'createfantasymap_user_subscription';

export const MockBillingProvider: BillingProvider = {
  async createCheckoutSession(planId: PlanId, _userId: string, _billingInterval = 'month') {
    const config = PlatformConfigService.getMasterConfig();
    if (!config.paymentSystemEnabled || !config.monetizationEnabled || config.freeLaunchMode) {
      throw new Error('Payment System is currently disabled during Free Launch Mode.');
    }
    // Simulated checkout session URL
    return {
      checkoutUrl: `/checkout/success?plan=${planId}`
    };
  },

  async createBillingPortalSession(_userId: string) {
    return {
      portalUrl: '/settings/billing'
    };
  },

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatusInfo> {
    try {
      const raw = localStorage.getItem(`${LOCAL_SUB_KEY}_${userId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback default
    }

    const defaultSub: SubscriptionStatusInfo = {
      planId: 'free',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 86400000 * 30).toISOString(),
      cancelAtPeriodEnd: false,
      provider: 'mock'
    };
    return defaultSub;
  },

  async cancelSubscription(userId: string) {
    const current = await this.getSubscriptionStatus(userId);
    const updated: SubscriptionStatusInfo = {
      ...current,
      cancelAtPeriodEnd: true
    };
    localStorage.setItem(`${LOCAL_SUB_KEY}_${userId}`, JSON.stringify(updated));
    return { success: true };
  }
};

export function setMockUserPlan(userId: string, planId: PlanId): SubscriptionStatusInfo {
  const updated: SubscriptionStatusInfo = {
    planId,
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 86400000 * 30).toISOString(),
    cancelAtPeriodEnd: false,
    provider: 'mock'
  };
  localStorage.setItem(`${LOCAL_SUB_KEY}_${userId}`, JSON.stringify(updated));
  return updated;
}
