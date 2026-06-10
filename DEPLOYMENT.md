# VTU Application - Full Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Vercel)                       │
│                  React 19 + Vite + React Router                │
│         https://quickloader.vercel.app (or your domain)        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓ HTTP Requests
┌─────────────────────────────────────────────────────────────────┐
│                       Backend API (Vercel/Node)                 │
│                  Express.js on Node.js Runtime                 │
│                 https://api.quickloader.com/api                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┬─────────────────┐
            ↓                            ↓                  ↓
     ┌────────────────┐    ┌─────────────────────┐   ┌──────────┐
     │  Supabase DB   │    │  Paystack Payment   │   │  Emails  │
     │  Transactions  │    │  Initialization &   │   │  (SMS)   │
     │  Profiles      │    │  Verification       │   │  Service │
     └────────────────┘    └─────────────────────┘   └──────────┘
```

## Prerequisites

1. **Supabase Project**
   - Created and configured
   - Database tables exist
   - RLS policies enabled
   - Service role key available

2. **Paystack Account**
   - Live secret key obtained
   - Test and live mode available
   - Webhook configured (optional)

3. **Vercel Account**
   - Connected to GitHub
   - Environment variables ready

## Step 1: Database Setup

### In Supabase Dashboard:

1. Go to SQL Editor
2. Copy and run the entire `backend/schema.sql` file
3. Verify tables are created:
   - `transactions` table ✓
   - `profiles` has `wallet_balance` ✓
   - `add_to_wallet()` RPC function ✓

### Verify RLS Policies:

1. Go to Table "transactions"
2. Click "Auth" tab
3. Verify policies:
   - `transactions_user_select` ✓
   - `transactions_user_insert` ✓

## Step 2: Backend Deployment

### Option A: Vercel Serverless Functions (Recommended)

1. **Create API Routes in Frontend**
   ```
   src/api/wallet/initiate.ts
   src/api/wallet/verify.ts
   src/api/services/[serviceType]/initiate.ts
   src/api/services/[serviceType]/verify.ts
   ```

2. **Update Frontend .env**
   ```
   VITE_API_URL=https://quickloader.vercel.app
   ```

3. **Deploy to Vercel**
   ```bash
   vercel deploy
   ```

### Option B: Separate Node.js Backend (Advanced)

1. **Deploy to Vercel (Node.js)**
   ```bash
   cd backend
   vercel deploy --prod
   ```

2. **Set Environment Variables in Vercel Dashboard**
   ```
   PAYSTACK_SECRET_KEY=sk_live_xxxxx
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=xxxxxxx
   FRONTEND_URL=https://quickloader.vercel.app
   NODE_ENV=production
   ```

3. **Update Frontend .env**
   ```
   VITE_API_URL=https://vtu-api.vercel.app
   ```

## Step 3: Frontend Deployment

### In Vercel Dashboard:

1. **Import Project**
   - Select GitHub repo
   - Select "quickloader" root

2. **Set Environment Variables**
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxxxxxx
   VITE_API_URL=https://vtu-api.vercel.app (or https://quickloader.vercel.app if using Option A)
   ```

3. **Build Settings**
   ```
   Framework: Vite
   Build Command: npm run build
   Output Directory: dist
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Test the app

## Step 4: Paystack Configuration

### In Paystack Dashboard:

1. **Get Live Secret Key**
   - Go to Settings → API Keys & Webhooks
   - Copy live secret key
   - Add to backend environment variables

2. **Test Payment Flow**
   - Fund wallet with test card: 4084084084084081
   - Verify transaction records appear in Supabase

3. **Configure Webhooks (Optional)**
   - Set webhook URL: `https://api.quickloader.com/webhook/paystack`
   - Events: charge.success, charge.failed
   - Add authentication header

## Step 5: Testing Production

### Test Checklist

1. **Authentication**
   - [ ] Sign up new user
   - [ ] Login successfully
   - [ ] Token stored in localStorage
   - [ ] Profile page shows user info

2. **Wallet Funding**
   - [ ] Open /wallet page
   - [ ] Click "Fund Wallet"
   - [ ] Enter amount ≥ ₦500
   - [ ] Redirect to Paystack (test mode)
   - [ ] Enter test card: 4084084084084081
   - [ ] Verify redirect to /wallet/verify
   - [ ] Verify success page shows amount
   - [ ] Check Supabase: transaction created
   - [ ] Check wallet balance updated

3. **Airtime Purchase**
   - [ ] Open /airtime page
   - [ ] Select network (MTN)
   - [ ] Enter phone number
   - [ ] Select amount
   - [ ] Click "Pay with Paystack"
   - [ ] Complete payment
   - [ ] Verify receipt shows correct service type
   - [ ] Check transaction in /history

4. **Data Purchase**
   - [ ] Open /data page
   - [ ] Select network
   - [ ] Select data plan
   - [ ] Complete payment
   - [ ] Verify receipt and transaction

5. **TV Subscription**
   - [ ] Open /tv page
   - [ ] Select provider (DStv)
   - [ ] Verify smart card
   - [ ] Select package
   - [ ] Complete payment
   - [ ] Verify receipt

6. **Electricity Payment**
   - [ ] Open /electricity page
   - [ ] Select disco
   - [ ] Verify meter
   - [ ] Enter amount
   - [ ] Complete payment
   - [ ] Verify receipt

7. **Transaction History**
   - [ ] Open /history
   - [ ] Verify all transactions appear
   - [ ] Filter by service type works
   - [ ] Search by reference works

## Step 6: Monitoring & Maintenance

### Set Up Alerts

1. **Supabase**
   - Monitor database quota
   - Check for failed transactions
   - Monitor RLS policy violations

2. **Vercel**
   - Monitor function invocations
   - Check error logs
   - Monitor performance metrics

### Regular Tasks

1. **Weekly**
   - Check transaction logs for errors
   - Verify all services operational
   - Monitor payment success rates

2. **Monthly**
   - Review transaction volume
   - Check for rate limits
   - Update dependencies

3. **Quarterly**
   - Audit security settings
   - Review RLS policies
   - Update Paystack integration if needed

## Troubleshooting Production Issues

### 404 on Service Pages

**Problem**: Pages load but show 404 after Paystack redirect

**Solution**:
1. Verify vercel.json has correct rewrites
2. Check `public/_redirects` file exists
3. Ensure `/api` routes are configured

### Payment Verification Fails

**Problem**: "Verification failed" after payment

**Solution**:
1. Check Paystack secret key is correct
2. Verify backend can reach Paystack API
3. Check Supabase connection
4. Review backend logs for errors

### Wallet Balance Not Updating

**Problem**: Payment succeeds but balance unchanged

**Solution**:
1. Verify `add_to_wallet()` RPC exists
2. Check Supabase service_role permissions
3. Review transaction record status
4. Check for database errors in logs

### Missing Transactions

**Problem**: No transactions appear in /history

**Solution**:
1. Verify transactions table exists
2. Check RLS policies allow user access
3. Verify user_id matches auth user
4. Check created_at timestamps are recent

## Security Checklist

- [ ] PAYSTACK_SECRET_KEY never exposed in frontend
- [ ] RLS policies enabled on transactions table
- [ ] JWT tokens verified server-side
- [ ] HTTPS enforced
- [ ] CORS origins restricted
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS protection headers set
- [ ] Transaction amounts verified before charging

## Rollback Plan

If issues occur after deployment:

1. **Revert Frontend**
   ```bash
   vercel rollback
   ```

2. **Revert Backend**
   ```bash
   cd backend
   vercel rollback
   ```

3. **Restore Database**
   - Supabase has automatic backups
   - Restore from point-in-time recovery if needed

## Support & Documentation

- Supabase Docs: https://supabase.com/docs
- Paystack Docs: https://paystack.com/docs
- React Router Docs: https://reactrouter.com
- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev

## Next Steps

1. [ ] Complete database setup
2. [ ] Deploy backend API
3. [ ] Deploy frontend
4. [ ] Run full test suite
5. [ ] Monitor for errors
6. [ ] Announce to users
