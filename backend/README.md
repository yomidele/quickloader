# VTU Backend API - Setup & Deployment Guide

## Overview

This is a Node.js/Express backend API for the QuickLoader VTU application. It handles:
- Paystack payment initialization and verification
- Wallet funding
- Service purchases (airtime, data, DStv, electricity)
- Transaction record storage in Supabase

## Environment Variables

Create a `.env` file based on `.env.example`:

```
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Installation

```bash
cd backend
npm install
```

## Development

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### Wallet Funding

**POST /api/wallet/initiate-funding**
- Headers: `Authorization: Bearer {token}`
- Body: `{ amount: number }`
- Response: `{ authorizationUrl, reference }`

**GET /api/wallet/verify?reference=xxx**
- Headers: `Authorization: Bearer {token}`
- Response: `{ success, amount, transaction }`

### Service Purchases

**POST /api/services/:serviceType/initiate**
- serviceType: `airtime`, `data`, `dstv`, `electricity`
- Headers: `Authorization: Bearer {token}`
- Body: `{ amount, metadata: { phone, plan, provider, etc } }`
- Response: `{ authorizationUrl, reference }`

**GET /api/services/:serviceType/verify?reference=xxx**
- serviceType: `airtime`, `data`, `dstv`, `electricity`
- Headers: `Authorization: Bearer {token}`
- Response: `{ success, serviceType, amount, metadata, transaction }`

## Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy the contents of backend/schema.sql and run in Supabase SQL editor
```

This will create:
1. `transactions` table
2. RLS policies for security
3. `add_to_wallet()` RPC function
4. Indexes for performance

## Deployment (Vercel)

### Option 1: Separate Deployment

Deploy backend and frontend separately:

1. **Backend (Node.js)**
   - Deploy to Vercel using Node.js runtime
   - Set environment variables in Vercel dashboard
   - Update `FRONTEND_URL` to your deployed frontend

2. **Frontend (React/Vite)**
   - Update `VITE_API_URL` to your deployed backend API

### Option 2: API Routes (Optional)

For a single Vercel deployment, you can move `/api` routes to the frontend's `/api` directory instead of running a separate backend.

## Production Checklist

- [ ] Update `PAYSTACK_SECRET_KEY` with production key
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Set up proper CORS origin
- [ ] Test wallet funding flow end-to-end
- [ ] Test all service purchase flows
- [ ] Verify transaction records are saved
- [ ] Monitor error logs
- [ ] Set up rate limiting
- [ ] Configure transaction retry logic

## Troubleshooting

### 401 Unauthorized
- Check if token is valid Supabase JWT
- Verify `Authorization` header format: `Bearer {token}`

### Payment Verification Fails
- Check Paystack credentials
- Verify reference exists in Paystack dashboard
- Check network connectivity

### Wallet Balance Not Updated
- Verify RPC function was created
- Check Supabase service_role permissions
- Ensure user ID matches in database

## Development Notes

- Authentication is handled via Supabase JWT tokens
- Paystack amounts are in kobo (100 kobo = 1 naira)
- All amounts stored in naira in database
- Transaction metadata is JSON for flexibility
- Service-specific logic (airtime, data, etc.) should be added in respective verify endpoints
