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
  ogdamsMessage?: string;
}

/**
 * Wallet purchase hook — Lovable Cloud + Ogdams (data only for now).
 * Test mode: no balance gate, no deduction; the Ogdams API call is real.
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
      console.error('Wallet balance check error:', err);
      setError(err.message || 'Failed to check wallet balance');
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

      setLoading(true);
      setError(null);

      try {
        // Data purchases go through Ogdams edge function.
        if (serviceType === 'data') {
          const network = (metadata?.network as string || '').toLowerCase();
          const planId = Number(metadata?.planId);
          const phone = String(metadata?.phone || '');

          if (!network || !planId || !phone) {
            return { success: false, error: 'Missing network, planId, or phone' };
          }

          const { data, error: fnErr } = await supabase.functions.invoke('ogdams-purchase-data', {
            body: { network, planId, phone, amount, metadata },
          });

          if (fnErr) {
            // Edge function may return non-2xx with a body; surface it
            const msg = (data as any)?.error || fnErr.message || 'Purchase failed at Ogdams';
            return { success: false, error: msg };
          }

          if (!data?.success) {
            return {
              success: false,
              error: data?.ogdams?.message || 'Ogdams rejected the purchase',
              transaction: data?.transaction,
              ogdamsMessage: data?.ogdams?.message,
            };
          }

          return {
            success: true,
            transaction: data.transaction,
            remainingBalance: balance ?? 0,
            ogdamsMessage: data?.ogdams?.message,
          };
        }

        // Fallback for airtime / dstv / electricity — record a local transaction (unchanged test mode).
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
        console.error('Purchase error:', err);
        const errorMsg = err.message || 'Failed to process purchase';
        setError(errorMsg);
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
