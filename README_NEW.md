# QuickLoader - VTU Payment Platform

**Status**: ✅ Production Ready

A modern, fast, and reliable Virtual Top-Up (VTU) platform built with React, Vite, Express.js, and Supabase.

## Features

- 💳 **Wallet Funding** - Load money into user accounts via Paystack
- 📱 **Airtime Purchases** - Buy airtime for all major Nigerian networks
- 📊 **Data Plans** - Purchase data bundles with live pricing
- 📺 **TV Subscriptions** - DStv, GoTV, and Startimes subscriptions
- ⚡ **Electricity Payment** - Pay electricity bills instantly
- 💰 **Transaction History** - Full tracking of all user transactions
- 🔐 **Secure Authentication** - Supabase JWT-based auth
- 💼 **Admin Features** - Dashboard for platform administration

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite 7** - Build tool
- **React Router v6** - Client-side routing
- **Tailwind CSS 4** - Styling
- **React Query 5** - Data fetching
- **Supabase JS** - Auth & database
- **TypeScript** - Type safety

### Backend
- **Express.js** - REST API
- **Node.js** - Runtime
- **Paystack API** - Payment processing
- **Supabase** - Database & auth

### Deployment
- **Vercel** - Frontend & API hosting
- **Supabase** - Database & authentication

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Paystack account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quickloader.git
   cd quickloader
   ```

2. **Database Setup**
   - Run SQL script: `SQL_SETUP.sql` in Supabase dashboard
   - See [QUICK_START.md](./QUICK_START.md#step-1-database-setup-5-min)

3. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Fill in your Supabase and Paystack credentials
   npm install
   npm run dev
   ```

4. **Frontend Setup**
   ```bash
   cp .env.example .env
   # Fill in your API URLs
   npm install
   npm run dev
   ```

5. **Test**
   - Open http://localhost:5173
   - Sign up and test the payment flows

## Documentation

- **Quick Start**: [QUICK_START.md](./QUICK_START.md) - 30-minute setup guide
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Full production deployment guide
- **Implementation**: [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - Complete system overview
- **Database**: [SQL_SETUP.sql](./SQL_SETUP.sql) - Database schema
- **Backend**: [backend/README.md](./backend/README.md) - Backend API setup

## Project Structure

```
quickloader/
├── src/                    # Frontend source
│   ├── pages/             # Page components
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   ├── router.tsx         # Route configuration
│   └── main.tsx           # Entry point
├── backend/               # Express API
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── lib/           # Utilities (Paystack, Supabase)
│   │   └── server.ts      # Express app
│   └── schema.sql         # Database schema
├── public/                # Static files
├── SQL_SETUP.sql          # Database setup script
├── DEPLOYMENT.md          # Deployment guide
├── QUICK_START.md         # Quick start guide
└── README.md              # This file
```

## API Endpoints

### Wallet
- `POST /api/wallet/initiate-funding` - Start wallet funding
- `GET /api/wallet/verify?reference=xxx` - Verify payment

### Services
- `POST /api/services/:serviceType/initiate` - Start service purchase
- `GET /api/services/:serviceType/verify?reference=xxx` - Verify purchase

See [backend/README.md](./backend/README.md) for detailed documentation.

## Payment Flow

```
User initiates payment
  ↓
Frontend calls API to get Paystack URL
  ↓
User redirected to Paystack
  ↓
User completes payment
  ↓
Paystack redirects back with reference
  ↓
Frontend verifies payment with backend
  ↓
Backend verifies with Paystack
  ↓
If successful: Update database & show receipt
If failed: Show error message
```

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3001 (dev) or https://api.yoursite.com (prod)
```

### Backend (.env)
```
PAYSTACK_SECRET_KEY=sk_live_xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Development

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend
```bash
cd backend
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Run production build
```

## Testing

Test card (Paystack):
```
Number: 4084084084084081
CVV: 408
Expiry: 12/25 (any future date)
PIN: 1111
OTP: 123456
```

## Security

- ✅ JWT-based authentication
- ✅ Row Level Security (RLS) on database
- ✅ Server-side payment verification
- ✅ Environment variables for secrets
- ✅ Input validation with Zod
- ✅ CORS protection

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick deploy:**
```bash
# Backend
cd backend && vercel deploy --prod

# Frontend
vercel deploy --prod
```

## Performance

- **Frontend**: 511 KB (gzipped: 150 KB)
- **Build time**: ~12 seconds
- **Page load**: < 2 seconds (on 4G)
- **API response**: < 500ms

## Monitoring

- Vercel analytics for frontend
- Backend logs in Vercel dashboard
- Supabase query performance
- Paystack transaction logs

## Support

- 📖 Check documentation in [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 File issues on GitHub
- 💬 Contact support team

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - All rights reserved

## Changelog

### v1.0.0 (Current)
- ✨ Complete VTU platform
- 💳 Paystack integration
- 🏦 Supabase backend
- 🚀 Production ready
- 📊 Transaction tracking
- 🔐 Secure authentication

---

**Ready to deploy?** Start with [QUICK_START.md](./QUICK_START.md)

**Questions?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) or [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)
