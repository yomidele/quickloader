import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface PurchaseResult {
  success: boolean;
  error?: string;
  transaction?: {
    id: string;
    amount: number;
    reference: string;
    status: string;
  };
  refundedAmount?: number;
  newBalance?: number;
  remainingBalance?: number;
}

/**
 * Wallet purchase hook — talks to Lovable Cloud directly.
 * Test mode: purchases are allowed on zero balance (no deduction gate).
 */
export function useWalletPurchase(serviceType: 'airtime' | 'data' | 'dstv' | 'electricity') {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkBalance = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error: qErr } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .maybeSingle();
      if (qErr) throw qErr;
      const bal = Number(data?.wallet_balance ?? 0);
      setBalance(bal);
      return bal;
    } catch (err: any) {
      const message = err.message || 'Failed to check wallet balance';
      setError(message);
      console.error('Wallet balance check error:', err);
      // Fall back to 0 so the UI stays usable in test mode
      setBalance(0);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const processPurchase = useCallback(
    async (amount: number, metadata?: Record<string, any>): Promise<PurchaseResult> => {
      if (!user) {
        const errorMsg = 'User not authenticated';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      try {
        setLoading(true);
        setError(null);

        const reference = `wallet_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;

        const { data: tx, error: insErr } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: serviceType,
            service_type: serviceType,
            description: `${serviceType} purchase`,
            charged_price: amount,
            status: 'success',
            reference,
            metadata: {
              ...metadata,
              purchaseType: 'wallet',
              testMode: true,
              completedAt: new Date().toISOString(),
            },
          })
          .select()
          .single();

        if (insErr) throw insErr;

        return {
          success: true,
          transaction: {
            id: tx.id,
            amount: Number(tx.charged_price),
            reference: tx.reference ?? reference,
            status: tx.status,
          },
          remainingBalance: balance ?? 0,
        };
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to process purchase';
        setError(errorMsg);
        console.error('Purchase error:', err);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [user, serviceType, balance]
  );

  return {
    balance,
    loading,
    error,
    checkBalance,
    processPurchase,
  };
}
