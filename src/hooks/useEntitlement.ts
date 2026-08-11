import type { EntitlementKey } from '../config/plans';
import { useSubscription } from '../lib/supabase/subscriptionStore';

export function useEntitlement(key: EntitlementKey): {
  isAllowed: boolean;
  currentPlan: string;
  requireUpgrade: () => void;
} {
  const { hasEntitlement, currentPlan } = useSubscription();
  const isAllowed = hasEntitlement(key);

  return {
    isAllowed,
    currentPlan,
    requireUpgrade: () => {
      // Helper function hook if UI wants to direct to pricing
      window.location.pathname = '/pricing';
    }
  };
}
