import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { initializePaystack, verifyPaystackTransaction } from '../lib/paystack.js';
import { saveTransaction, addToWallet, supabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Validation schemas
const InitiateFundingSchema = z.object({
  amount: z.number().min(500, 'Minimum funding is ₦500'),
});

// POST /api/wallet/initiate-funding
// Start wallet funding via Paystack
router.post('/initiate-funding', requireAuth, async (req: Request, res: Response) => {
  try {
    const { amount } = InitiateFundingSchema.parse(req.body);
    const userId = req.user!.id;
    const email = req.user!.email!;

    const paystackResponse = await initializePaystack(email, amount, {
      serviceType: 'wallet',
      userId,
      amount,
    });

    if (!paystackResponse.status) {
      return res.status(400).json({ error: paystackResponse.message });
    }

    res.json({
      authorizationUrl: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/wallet/verify?reference=xxx
// Verify wallet funding payment
router.get('/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const { reference } = req.query;
    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({ error: 'Invalid reference' });
    }

    const userId = req.user!.id;

    // Verify with Paystack
    const paystackData = await verifyPaystackTransaction(reference);
    if (!paystackData.status) {
      // Save failed transaction
      await saveTransaction(userId, 'wallet', 0, reference, 'failed', {
        reason: paystackData.message,
      });
      return res.json({ success: false, error: paystackData.message });
    }

    if (paystackData.data.status !== 'success') {
      await saveTransaction(userId, 'wallet', 0, reference, 'failed', {
        paystackStatus: paystackData.data.status,
      });
      return res.json({ success: false, error: 'Payment not successful' });
    }

    // Add funds to wallet
    const amountInNaira = paystackData.data.amount / 100; // Convert from kobo
    await addToWallet(userId, amountInNaira);

    // Save successful transaction
    const transaction = await saveTransaction(
      userId,
      'wallet',
      amountInNaira,
      reference,
      'success',
      {
        paystackId: paystackData.data.id,
        paystackReference: paystackData.data.reference,
      }
    );

    res.json({
      success: true,
      amount: amountInNaira,
      transaction,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
