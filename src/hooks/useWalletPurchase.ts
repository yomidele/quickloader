import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';

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

export function useWalletPurchase(serviceType: 'airtime' | 'data' | 'dstv' | 'electricity') {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Fetch wallet balance
  const checkBalance = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/services/${serviceType}/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch wallet balance');
      }

      const data = await response.json();
      setBalance(data.balance);
      return data.balance;
    } catch (err: any) {
      const message = err.message || 'Failed to check wallet balance';
      setError(message);
      console.error('Wallet balance check error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, serviceType, API_URL]);

  // Process wallet purchase
  const processPurchase = useCallback(
    async (
      amount: number,
      metadata?: Record<string, any>
    ): Promise<PurchaseResult> => {
      if (!user) {
        const errorMsg = 'User not authenticated';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      try {
        setLoading(true);
        setError(null);

        const token = await user.getIdToken();

        const response = await fetch(`${API_URL}/api/services/${serviceType}/purchase`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            metadata,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || 'Purchase failed';
          setError(errorMsg);
          return {
            success: false,
            error: errorMsg,
            transaction: data.transaction,
            refundedAmount: data.refundedAmount,
            newBalance: data.newBalance,
          };
        }

        // Update balance after successful purchase
        if (data.remainingBalance !== undefined) {
          setBalance(data.remainingBalance);
        }

        return {
          success: true,
          transaction: data.transaction,
          remainingBalance: data.remainingBalance,
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
    [user, serviceType, API_URL]
  );

  return {
    balance,
    loading,
    error,
    checkBalance,
    processPurchase,
  };
}
