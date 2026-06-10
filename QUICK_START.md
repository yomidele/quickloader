# 🚀 QUICK START - What To Do Next

## ⏱️ Time to Deploy: 30 minutes

---

## STEP 1: Database Setup (5 min)

### In Supabase Dashboard:

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of: **`SQL_SETUP.sql`**
4. Paste into the SQL editor
5. Click **Run**
6. ✅ Wait for "Success" message

**That's it!** Your database is now ready.

---

## STEP 2: Backend API Setup (10 min)

### Option A: Deploy Separately (Recommended for Scale)

```bash
# 1. Navigate to backend folder
cd backend

# 2. Create .env file
cp .env.example .env

# 3. Fill in your credentials:
# PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx

# 4. Deploy to Vercel
npm install
vercel deploy --prod
```

**After deploying**, set environment variables in Vercel dashboard:
- `PAYSTACK_SECRET_KEY` - Your live Paystack secret key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `FRONTEND_URL` - https://your-frontend.vercel.app
- `NODE_ENV` - production

### Option B: Serverless Functions (Simpler)

Skip backend deployment and use Vercel Serverless Functions instead:
- Move `backend/src/routes` to `src/api` (convert to Vercel API format)
- Deploy frontend only
- Update `VITE_API_URL` to point to your frontend

---

## STEP 3: Frontend Setup (10 min)

### 1. Create `.env` File

```bash
cp .env.example .env
```

### 2. Fill in Your Credentials

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
VITE_API_URL=https://your-api.vercel.app (or https://your-frontend.vercel.app if using serverless)
```

### 3. Deploy to Vercel

```bash
npm run build  # Verify build works locally
vercel deploy --prod
```

---

## STEP 4: Test Everything (5 min)

### Test Checklist

```
1. Wallet Funding
   [ ] Click /wallet
   [ ] Enter ₦1000
   [ ] Click "Fund Wallet"
   [ ] Use test card: 4084084084084081
   [ ] Verify success page shows ₦1000
   [ ] Check Supabase: transaction created with status='success'

2. Airtime Purchase
   [ ] Click /airtime
   [ ] Select MTN, enter phone
   [ ] Click "Pay with Paystack"
   [ ] Complete payment
   [ ] Verify receipt shows "Airtime Purchased"
   [ ] Check transaction in /history

3. Data Purchase
   [ ] Click /data
   [ ] Select MTN, select plan
   [ ] Click "Pay with Paystack"
   [ ] Complete payment
   [ ] Verify receipt shows "Data Purchased"

4. TV Subscription
   [ ] Click /tv
   [ ] Select DStv, verify smart card
   [ ] Click "Pay with Paystack"
   [ ] Complete payment
   [ ] Verify receipt shows "DStv Subscription Activated"

5. Electricity Payment
   [ ] Click /electricity
   [ ] Verify meter number
   [ ] Click "Pay with Paystack"
   [ ] Complete payment
   [ ] Verify receipt shows "Electricity Purchased"

6. Transaction History
   [ ] Click /history
   [ ] Verify all transactions appear
   [ ] Filter by service type works
   [ ] All service types show correctly (NOT mixed up)
```

---

## 🔑 Key Credentials

Get from:

### Supabase
- Dashboard → Settings → API
- Copy: `URL`, `Anon Key`

### Paystack
- Dashboard → Settings → API Keys & Webhooks
- Copy: Live `Secret Key`

### Vercel
- Create projects for backend & frontend
- Add environment variables for each

---

## 📁 Files Created/Modified

### Backend (New Directory)

```
backend/
├── src/
│   ├── server.ts           (Express app)
│   ├── middleware/auth.ts  (JWT verification)
│   ├── lib/
│   │   ├── paystack.ts     (Paystack API)
│   │   └── supabase.ts     (DB operations)
│   └── routes/
│       ├── wallet.ts       (Wallet endpoints)
│       └── services.ts     (Service endpoints)
├── package.json
├── tsconfig.json
├── .env.example
├── schema.sql
└── README.md
```

### Frontend (Modified)

```
src/
├── pages/
│   ├── airtime.tsx         ✏️ UPDATED (API integration)
│   ├── data.tsx            ✏️ UPDATED (API integration)
│   ├── tv.tsx              ✏️ UPDATED (API integration)
│   ├── electricity.tsx      ✏️ UPDATED (API integration)
│   ├── wallet.tsx          ✏️ UPDATED (API integration)
│   ├── history.tsx         ✏️ UPDATED (Supabase fetch)
│   ├── wallet/
│   │   ├── verify.tsx      ✨ NEW
│   │   ├── success.tsx     ✨ NEW
│   │   └── failed.tsx      ✨ NEW
│   └── services/
│       ├── verify.tsx      ✨ NEW
│       ├── receipt-base.tsx ✨ NEW
│       ├── airtime-receipt.tsx ✨ NEW
│       ├── data-receipt.tsx    ✨ NEW
│       ├── dstv-receipt.tsx    ✨ NEW
│       └── electricity-receipt.tsx ✨ NEW
├── hooks/
│   └── useAuth.ts          ✨ NEW
└── router.tsx              ✏️ UPDATED (new routes)

Root files:
├── .env.example            ✏️ UPDATED
├── SQL_SETUP.sql           ✨ NEW (Database schema)
├── DEPLOYMENT.md           ✨ NEW (Full guide)
├── IMPLEMENTATION_COMPLETE.md ✨ NEW (Summary)
└── vercel.json             ✓ Unchanged
```

---

## 🎯 The Payment Flow (What's Different)

### OLD (Before)
```
User pays → No transaction tracking → Receipt from state → Service mixup
```

### NEW (After)
```
User pays → Paystack verifies → Transaction saved in DB → Receipt from verified data → Always correct
```

**Key Fix**: Receipt now reads `serviceType` from the verified transaction, NOT from React state. So you can never have the DStv/airtime mixup again.

---

## 🔍 Verify It Worked

After deployment, check:

1. **Frontend builds**
   ```bash
   npm run build
   # Should see: ✓ built in 11.91s
   ```

2. **Backend API responds**
   ```bash
   curl https://your-api.vercel.app/health
   # Should return: {"status":"ok"}
   ```

3. **Database has transactions table**
   ```
   In Supabase SQL Editor:
   SELECT * FROM transactions LIMIT 1;
   # Should return empty (no errors)
   ```

4. **RLS policies work**
   ```
   Sign in as user A
   Try to view user B's transactions
   Should get: No rows returned (access denied)
   ```

---

## ⚠️ Common Mistakes to Avoid

❌ **Don't**: Use Paystack test secret key in production
✅ **Do**: Switch to live secret key before going live

❌ **Don't**: Expose Paystack secret key in frontend code
✅ **Do**: Keep it in backend .env only

❌ **Don't**: Trust frontend payment status
✅ **Do**: Always verify server-side with Paystack

❌ **Don't**: Store credit card details
✅ **Do**: Let Paystack handle all card data

❌ **Don't**: Update wallet balance without verifying payment
✅ **Do**: Verify first, then update

---

## 📞 If Something Goes Wrong

### "Build fails"
→ Check `npm install` in both frontend and backend

### "API returns 401"
→ Check token format in headers: `Authorization: Bearer {token}`

### "Payment verification fails"
→ Check Paystack secret key is correct

### "Wallet not updated"
→ Check `add_to_wallet()` RPC function exists in Supabase

### "Transaction not showing in history"
→ Check Supabase transactions table has the record with user_id matching logged-in user

### "Wrong service type on receipt"
→ This is fixed! Receipt reads from verified transaction, not state

---

## 📚 Documentation

- **Backend Setup**: Read `/backend/README.md`
- **Full Deployment**: Read `/DEPLOYMENT.md`
- **Implementation Details**: Read `/IMPLEMENTATION_COMPLETE.md`
- **Database Schema**: Read `/SQL_SETUP.sql`

---

## ✅ Final Checklist

Before saying "We're live!":

- [ ] SQL_SETUP.sql executed successfully
- [ ] Backend deployed & health check returns 200
- [ ] Frontend deployed & loads without errors
- [ ] Wallet funding tested end-to-end
- [ ] All service purchases tested
- [ ] History shows all transactions correctly
- [ ] Paystack set to live mode
- [ ] All env variables updated
- [ ] Team notified
- [ ] Celebrate! 🎉

---

**You're all set!** The complete payment system is ready to go.

Questions? Check the docs or reach out to your backend team.

Good luck! 🚀
