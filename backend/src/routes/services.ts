import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  saveTransaction,
  supabase,
  getWalletBalance,
  deductFromWallet,
  refundToWallet,
  updateTransactionStatus,
} from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

// Validation schemas
const ServiceMetadataSchema = z.object({
  phone: z.string().optional(),
  planId: z.string().optional(),
  provider: z.string().optional(),
  network: z.string().optional(),
  planName: z.string().optional(),
  smartCard: z.string().optional(),
  disco: z.string().optional(),
  meterNumber: z.string().optional(),
  type: z.string().optional(),
  additionalData: z.record(z.any()).optional(),
});

const PurchaseSchema = z.object({
  amount: z.number().min(1, 'Invalid amount'),
  metadata: ServiceMetadataSchema.optional(),
});

// Helper: Generate unique reference for wallet purchases
function generateReference(): string {
  return `wallet_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

// Factory function for service routes
function createServiceRoutes(serviceType: 'airtime' | 'data' | 'dstv' | 'electricity') {
  const subrouter = Router();

  // GET /api/services/:serviceType/balance
  // Returns user's wallet balance
  subrouter.get('/balance', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const balance = await getWalletBalance(userId);

      res.json({
        balance,
        currency: 'NGN',
      });
    } catch (error: any) {
      console.error(`Error fetching wallet balance:`, error);
      res.status(500).json({ error: 'Failed to fetch wallet balance' });
    }
  });

  // POST /api/services/:serviceType/purchase
  // Process wallet-based service purchase
  subrouter.post('/purchase', requireAuth, async (req: Request, res: Response) => {
    try {
      const { amount, metadata } = PurchaseSchema.parse(req.body);
      const userId = req.user!.id;

      // Step 1: Check wallet balance
      const balance = await getWalletBalance(userId);
      if (balance < amount) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient wallet balance',
          currentBalance: balance,
          requiredAmount: amount,
        });
      }

      // Step 2: Generate unique reference for this transaction
      const reference = generateReference();

      // Step 3: Deduct from wallet atomically
      const deductSuccess = await deductFromWallet(userId, amount);
      if (!deductSuccess) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient wallet balance',
          currentBalance: balance,
          requiredAmount: amount,
        });
      }

      // Step 4: Create pending transaction record
      let transaction;
      try {
        transaction = await saveTransaction(
          userId,
          serviceType,
          amount,
          reference,
          'pending',
          {
            ...metadata,
            purchaseType: 'wallet',
            initiatedAt: new Date().toISOString(),
          }
        );
      } catch (error: any) {
        // If transaction creation fails, refund the deducted amount
        await refundToWallet(userId, amount);
        console.error(`Error creating transaction:`, error);
        return res.status(500).json({
          success: false,
          error: 'Failed to process purchase',
        });
      }

      // Step 5: Call VTU Provider API (backend credentials)
      // This is where the actual service is processed
      let providerSuccess = false;
      let providerError = null;

      try {
        // TODO: Implement actual VTU provider API calls here
        // Examples:
        // - For airtime: Call CheapDataHub API or other airtime provider
        // - For data: Call CheapDataHub API
        // - For TV: Call cable provider API
        // - For electricity: Call electricity provider API
        //
        // Use backend environment variables for provider credentials:
        // - AIRTIME_API_KEY
        // - DATA_API_KEY
        // - TV_API_KEY
        // - ELECTRICITY_API_KEY
        // 
        // Example (placeholder):
        // const providerResponse = await callVTUProviderAPI(serviceType, metadata, amount);
        // providerSuccess = providerResponse.status === 'success';

        // For now, mark as success (placeholder)
        // In production, replace with actual provider API call
        providerSuccess = true;
      } catch (error: any) {
        providerError = error.message;
        console.error(`VTU Provider API error (${serviceType}):`, error);
      }

      // Step 6: Handle success/failure
      if (providerSuccess) {
        // Update transaction status to success
        await updateTransactionStatus(transaction.id, 'success', {
          ...metadata,
          completedAt: new Date().toISOString(),
        });

        return res.json({
          success: true,
          serviceType,
          amount,
          reference: transaction.id,
          transaction,
          remainingBalance: balance - amount,
        });
      } else {
        // Refund the user's wallet
        await refundToWallet(userId, amount);

        // Update transaction status to failed
        await updateTransactionStatus(transaction.id, 'failed', {
          ...metadata,
          error: providerError || 'VTU provider request failed',
          failedAt: new Date().toISOString(),
          refunded: true,
        });

        return res.status(400).json({
          success: false,
          error: providerError || 'Failed to process service request',
          reference: transaction.id,
          transaction,
          refundedAmount: amount,
          newBalance: balance, // Balance is back to original after refund
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error(`Error processing purchase:`, error);
      res.status(500).json({ error: error.message || 'Failed to process purchase' });
    }
  });

  return subrouter;
}

// Mount service routes
router.use('/airtime', createServiceRoutes('airtime'));
router.use('/data', createServiceRoutes('data'));
router.use('/dstv', createServiceRoutes('dstv'));
router.use('/electricity', createServiceRoutes('electricity'));

export default router;
