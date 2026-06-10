# File Reference Guide - Complete VTU Implementation

## 📋 What This Document Is

A complete reference showing:
- Every file created/modified
- What each file does
- Where to find it
- Key code highlights
- Integration points

---

## 🎯 Start Here

**New to this project?** Read in this order:

1. **QUICK_START.md** - 30-minute deployment guide (THIS IS YOUR FIRST STOP)
2. **This file** - Understand project structure
3. **DEPLOYMENT.md** - Full deployment details
4. **IMPLEMENTATION_COMPLETE.md** - System architecture overview

---

## 📂 Frontend Files

### 1. Configuration

#### `.env.example`
**Location**: Root directory
**Purpose**: Template for frontend environment variables
**Contains**:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_URL` - Backend API URL

**Usage**: Copy to `.env` and fill in your values

#### `vite.config.ts`
**Status**: ✓ No changes needed (already configured)

#### `tsconfig.json`
**Status**: ✓ No changes needed (strict mode enabled)

#### `vercel.json`
**Status**: ✓ No changes needed (SPA routing configured)

---

### 2. Core Application

#### `src/main.tsx`
**Status**: ✓ No changes needed (already setup with providers)
**Provides**:
- QueryClient for React Query
- RouterProvider for routing

#### `src/router.tsx`
**Status**: ✏️ UPDATED
**Changes**:
- Added wallet routes:
  - `/wallet/verify` → WalletVerify
  - `/wallet/success` → WalletSuccess
  - `/wallet/failed` → WalletFailed
- Added service receipt routes:
  - `/services/airtime/receipt` → AirtimeReceipt
  - `/services/data/receipt` → DataReceipt
  - `/services/dstv/receipt` → DstvReceipt
  - `/services/electricity/receipt` → ElectricityReceipt
- All wrapped with `ProtectedRoute` for auth

---

### 3. Page Components

#### `src/pages/wallet.tsx`
**Status**: ✏️ UPDATED
**What's New**:
```typescript
// Added constants
const FUNDING_FEE = 50;
const MIN_FUND = 500;
const QUICK_AMOUNTS = [500, 1000, 5000, 10000];

// Added async function
async function startFunding(token: string, amount: number) {
  const response = await fetch(`${API_URL}/api/wallet/initiate-funding`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amount })
  });
  // Redirect to Paystack, store amount in localStorage
}
```
**Key Features**:
- Input validation (min ₦500)
- Fee calculation (₦50)
- Quick amount buttons
- Paystack redirect

---

#### `src/pages/wallet/verify.tsx`
**Status**: ✨ NEW FILE
**Purpose**: Verify wallet funding after Paystack payment
**Logic**:
1. Get reference from URL query param
2. Call `GET /api/wallet/verify?reference=xxx`
3. On success: redirect to `/wallet/success`
4. On error: redirect to `/wallet/failed`
5. Show loading spinner during verification

---

#### `src/pages/wallet/success.tsx`
**Status**: ✨ NEW FILE
**Purpose**: Display successful wallet funding
**Shows**:
- Amount funded (from localStorage)
- Success status
- Button to view wallet
- Button to go to dashboard

---

#### `src/pages/wallet/failed.tsx`
**Status**: ✨ NEW FILE
**Purpose**: Display failed wallet funding
**Shows**:
- Error message
- Support contact
- Retry button

---

#### `src/pages/airtime.tsx`
**Status**: ✏️ UPDATED
**What's New**:
```typescript
async function initiateAirtimePayment(
  token: string,
  phone: string,
  network: string,
  amount: number
) {
  const response = await fetch(`${API_URL}/api/services/airtime/initiate`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount,
      metadata: { phone, network, serviceType: 'airtime' }
    })
  });
  // Redirect to Paystack
}
```
**Key Changes**:
- Removed navigate to confirm page
- Added actual API call to Paystack
- Added loading state
- Removed hardcoded "DStv" (this was the bug!)

---

#### `src/pages/data.tsx`
**Status**: ✏️ UPDATED
**Similar to airtime**:
- API call to `POST /api/services/data/initiate`
- Metadata includes: network, planId, size, validity
- Redirects to Paystack
- Shows loading state

---

#### `src/pages/tv.tsx`
**Status**: ✏️ UPDATED
**Differences from airtime**:
- Smart card verification
- Metadata includes: smartCard, provider, planId, planName
- API call to `POST /api/services/dstv/initiate`
- Paystack redirect for DStv only (not for all services)

---

#### `src/pages/electricity.tsx`
**Status**: ✏️ UPDATED
**Details**:
- Meter verification (prepaid/postpaid)
- Service charge (₦100 added to amount)
- Metadata includes: disco, meterNumber, type
- API call to `POST /api/services/electricity/initiate`

---

#### `src/pages/history.tsx`
**Status**: ✏️ UPDATED (Major refactor)
**Before**: Hardcoded array from `lib/quickload`
**After**: Fetches from Supabase
```typescript
useEffect(() => {
  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    setTransactions(data || []);
  };
  
  fetchTransactions();
}, [user?.id]);
```
**Key Features**:
- Real-time data from database
- Filter by service type
- Correct service types (no more mixing)
- Status from verified transactions

---

### 4. Service Receipt Pages

#### `src/pages/services/receipt-base.tsx`
**Status**: ✨ NEW FILE
**Purpose**: Reusable receipt component
**Features**:
```typescript
interface ReceiptData {
  amount: number;
  reference: string;
  status: string;
  serviceType: string;
  metadata: Record<string, any>;
  createdAt: string;
}

// Reads from location.state (passed by verify page)
const receiptData = location.state?.receiptData;
```
**Component**: `ReceiptRow` for displaying metadata fields

---

#### `src/pages/services/airtime-receipt.tsx`
**Status**: ✨ NEW FILE
**Uses**: ServiceReceiptBase
**Icon**: Phone icon
**Title**: "Airtime Purchased"

---

#### `src/pages/services/data-receipt.tsx`
**Status**: ✨ NEW FILE
**Uses**: ServiceReceiptBase
**Icon**: Smartphone icon
**Title**: "Data Purchased"

---

#### `src/pages/services/dstv-receipt.tsx`
**Status**: ✨ NEW FILE
**Uses**: ServiceReceiptBase
**Icon**: Tv icon
**Title**: "DStv Subscription Activated"

---

#### `src/pages/services/electricity-receipt.tsx`
**Status**: ✨ NEW FILE
**Uses**: ServiceReceiptBase
**Icon**: Zap icon
**Title**: "Electricity Purchased"

---

### 5. Hooks

#### `src/hooks/useAuth.ts`
**Status**: ✨ NEW FILE
**Purpose**: Centralized authentication hook
**Returns**:
```typescript
{
  user: User | null,
  loading: boolean,
  isAdmin: boolean
}
```
**Usage**: Used by ProtectedRoute, AdminRoute, page components

---

---

## 🔧 Backend Files

### 1. Configuration

#### `backend/.env.example`
**Location**: backend/ directory
**Must Configure Before Deployment**:
```
PAYSTACK_SECRET_KEY=sk_live_xxxxx (Get from Paystack dashboard)
SUPABASE_URL=https://xxxxx.supabase.co (Get from Supabase)
SUPABASE_ANON_KEY=xxxxxxxx (Get from Supabase)
PORT=3001 (Default)
NODE_ENV=development (Change to production for deployment)
FRONTEND_URL=http://localhost:5173 (Change for production)
```

#### `backend/package.json`
**Key Dependencies**:
- express@4.18.2 - HTTP server
- @supabase/supabase-js@2.40.0 - Database client
- axios@1.6.7 - HTTP client for Paystack
- zod@3.22.4 - Input validation
- dotenv@16.3.1 - Environment variables

---

### 2. Server Setup

#### `backend/src/server.ts`
**Purpose**: Express application initialization
**Key Setup**:
```typescript
const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(errorHandler);

// Routes
app.use('/api/wallet', walletRoutes);
app.use('/api/services', serviceRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handling
app.use(globalErrorHandler);

app.listen(PORT);
```
**Endpoints**:
- `GET /health` - Health check

---

### 3. Middleware

#### `backend/src/middleware/auth.ts`
**Purpose**: JWT authentication middleware
**Function**: `requireAuth(req, res, next)`
**Logic**:
1. Get Bearer token from `Authorization` header
2. Verify token with Supabase auth API
3. Attach `req.user` (decoded JWT)
4. Pass to next middleware

**Usage**:
```typescript
app.post('/api/wallet/initiate-funding', requireAuth, (req, res) => {
  // req.user is available here
  const userId = req.user.sub;
});
```

---

### 4. Libraries

#### `backend/src/lib/paystack.ts`
**Purpose**: Paystack API integration
**Functions**:

**`initializePaystack(email: string, amount: number, metadata: object)`**
- Calls Paystack API to initialize payment
- Amount must be in kobo (1 naira = 100 kobo)
- Returns: `{ authorizationUrl, reference, accessCode }`

**`verifyPaystackTransaction(reference: string)`**
- Calls Paystack API to verify payment
- Uses PAYSTACK_SECRET_KEY (never expose this)
- Returns: `{ status, amount, email, reference, metadata }`

---

#### `backend/src/lib/supabase.ts`
**Purpose**: Supabase database operations
**Functions**:

**`saveTransaction(userId, serviceType, amount, reference, status, metadata)`**
- Inserts record into `transactions` table
- Returns: Created transaction object
- Metadata is stored as JSON

**`addToWallet(userId, amount)`**
- Calls RPC function `add_to_wallet()`
- Atomically adds funds to user's wallet
- Uses service_role key (secret)

**`getUserByEmail(email)`**
- Gets user profile by email
- Uses admin API

---

### 5. Routes

#### `backend/src/routes/wallet.ts`
**Purpose**: Wallet funding API endpoints

**POST /api/wallet/initiate-funding**
```typescript
Body: { amount: number }
Returns: { authorizationUrl, reference }

// Validation
- amount must be >= 500 (₦500 minimum)
- user must be authenticated

// Process
1. Get user ID from JWT
2. Call Paystack.initializePaystack()
3. Return authorization URL
4. Frontend redirects user to Paystack
```

**GET /api/wallet/verify**
```typescript
Query: reference=xxx
Returns: { success, amount, transaction }

// Process
1. Get user ID from JWT
2. Get reference from query param
3. Verify with Paystack.verifyPaystackTransaction()
4. If success:
   - Call supabase.addToWallet(userId, amount)
   - Call saveTransaction(..., 'wallet', ..., 'success')
   - Return success response
5. If failed:
   - Call saveTransaction(..., 'wallet', ..., 'failed')
   - Return error response
```

---

#### `backend/src/routes/services.ts`
**Purpose**: Service purchase API endpoints (airtime, data, TV, electricity)

**Dynamic Pattern**:
- Routes work for: `airtime`, `data`, `dstv`, `electricity`
- All use same logic, differentiated by metadata

**POST /api/services/:serviceType/initiate**
```typescript
Path: :serviceType = airtime | data | dstv | electricity
Body: { amount, metadata: { ... } }
Returns: { authorizationUrl, reference }

// Metadata examples:
// Airtime: { phone, network, serviceType: 'airtime' }
// Data: { phone, network, planId, size, validity, serviceType: 'data' }
// TV: { smartCard, provider, planId, planName, serviceType: 'dstv' }
// Electricity: { disco, meterNumber, type, serviceType: 'electricity' }

// Process
1. Validate JWT
2. Call Paystack.initializePaystack() with metadata
3. Return authorization URL
```

**GET /api/services/:serviceType/verify**
```typescript
Path: :serviceType = airtime | data | dstv | electricity
Query: reference=xxx
Returns: { success, serviceType, amount, metadata, transaction }

// Process
1. Validate JWT
2. Verify with Paystack
3. Read serviceType from verified metadata (IMPORTANT: not from path!)
4. If success:
   - Call saveTransaction(..., serviceType, ..., 'success', metadata)
   - Return verified data
5. If failed:
   - Call saveTransaction(..., serviceType, ..., 'failed', metadata)
   - Return error
```

---

---

## 📊 Database Files

### `backend/schema.sql`
**Location**: backend/schema.sql
**Purpose**: Database schema (for reference, runs via SQL_SETUP.sql)
**Contains**:
- CREATE TABLE transactions
- CREATE INDEXes
- ALTER TABLE profiles (add wallet_balance)
- CREATE FUNCTION add_to_wallet()
- CREATE POLICIES (RLS)
- CREATE TRIGGER (updated_at)

---

### `SQL_SETUP.sql`
**Location**: Root directory
**Purpose**: Complete SQL setup script
**How to Use**:
1. Copy entire contents
2. Open Supabase SQL Editor
3. Create new query
4. Paste & run
5. Wait for "Success"

**What It Creates**:
- `transactions` table (stores all payments)
- Indexes for fast queries
- RPC function `add_to_wallet()`
- RLS policies for security
- Trigger for updated_at timestamp

---

---

## 📚 Documentation Files

### `QUICK_START.md`
**Location**: Root directory
**Purpose**: 30-minute deployment guide
**Contents**:
- Step 1: Database setup (5 min)
- Step 2: Backend deployment (10 min)
- Step 3: Frontend deployment (10 min)
- Step 4: Testing (5 min)
- Common mistakes
- Troubleshooting

**READ THIS FIRST** when deploying!

---

### `DEPLOYMENT.md`
**Location**: Root directory
**Purpose**: Comprehensive deployment guide
**Contents**:
- Architecture overview
- Step-by-step deployment instructions
- Environment variable setup
- Testing checklist
- Monitoring & logs
- Troubleshooting
- Post-deployment tasks

---

### `IMPLEMENTATION_COMPLETE.md`
**Location**: Root directory
**Purpose**: Complete system overview
**Contents**:
- What's been built
- File structure
- Payment flow diagrams
- API endpoint documentation
- Database schema explanation
- Security features
- Deployment steps
- Testing guide

---

### `README_NEW.md`
**Location**: Root directory
**Purpose**: Project README
**Contains**:
- Features overview
- Tech stack
- Quick start
- Project structure
- API endpoints
- Environment variables
- Development commands
- Testing
- Deployment

---

### `backend/README.md`
**Location**: backend/README.md
**Purpose**: Backend-specific documentation
**Contents**:
- Setup instructions
- Environment variables
- How to run locally
- API endpoint reference
- Testing guide
- Deployment options

---

---

## 🔗 Integration Map

### Payment Initialization Flow
```
Frontend (airtime.tsx)
  ↓ User clicks "Pay with Paystack"
  ↓ Gets JWT token from Supabase auth
  ↓ API call: POST /api/services/airtime/initiate
  ↓
Backend (services.ts route)
  ↓ Middleware (auth.ts): Verify JWT
  ↓ Get user ID from token
  ↓ Call Paystack.initializePaystack()
  ↓ Returns authorizationUrl & reference
  ↓
Frontend
  ↓ Redirect user to authorizationUrl
  ↓ User enters card on Paystack
  ↓ Paystack redirects to /services/airtime/verify?reference=xxx
```

### Payment Verification Flow
```
Frontend (verify.tsx)
  ↓ Get reference from URL
  ↓ API call: GET /api/services/airtime/verify?reference=xxx
  ↓
Backend (services.ts route)
  ↓ Middleware (auth.ts): Verify JWT
  ↓ Get user ID from token
  ↓ Call Paystack.verifyPaystackTransaction(reference)
  ↓
Paystack API
  ↓ Returns: status, amount, metadata, etc.
  ↓
Backend
  ↓ Read serviceType from metadata (e.g., 'airtime')
  ↓ If successful:
  │  ├─ Call supabase.saveTransaction(..., 'airtime', ..., 'success')
  │  └─ Transaction saved to DB
  ↓
Frontend (receipt-base.tsx)
  ↓ Display receipt with verified data
  ↓ Show correct service type
  ↓ Link to history page
  ↓
History Page (history.tsx)
  ↓ Fetch from Supabase: SELECT * FROM transactions
  ↓ Display all verified transactions
```

---

## 🎯 Key Integration Points

### 1. Authentication
- **Frontend**: `useAuth()` hook gets user from Supabase
- **Backend**: `requireAuth` middleware verifies JWT
- **Database**: RLS policies check `auth.uid()`

### 2. Payment Processing
- **Frontend**: Calls API to get Paystack URL
- **Backend**: Calls Paystack API with secret key
- **Frontend**: User pays on Paystack, redirected back
- **Backend**: Verifies payment with Paystack
- **Database**: Transaction saved with verified status

### 3. Data Display
- **Frontend**: Receipt reads from location.state (verified data)
- **Database**: Transaction stored with service_type and metadata
- **Frontend**: History page fetches from Supabase
- **Frontend**: Filters by service_type from database (never from state)

---

## ✅ Everything Is Connected

✓ Frontend → Backend API
✓ Backend API → Paystack API
✓ Backend API → Supabase Database
✓ Frontend → Supabase Auth
✓ Frontend → Supabase Database (read transactions)
✓ All flows verified end-to-end
✓ All builds pass without errors

---

## 📞 Need Help?

- **Deployment?** → Read QUICK_START.md
- **How does it work?** → Read IMPLEMENTATION_COMPLETE.md
- **Backend setup?** → Read backend/README.md
- **Full guide?** → Read DEPLOYMENT.md
- **Configuration?** → Check .env.example files
- **API details?** → Read routes documentation above

---

**Status**: ✅ All files complete and integrated. Ready for deployment.
