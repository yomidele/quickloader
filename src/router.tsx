import { createBrowserRouter } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'

const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fff' }}>
    <div style={{ width: '32px', height: '32px', border: '3px solid #eee', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
)

// Lazy load all page components
const Landing = lazy(() => import('./pages/index'))
const Login = lazy(() => import('./pages/login'))
const Register = lazy(() => import('./pages/signup'))
const Onboarding = lazy(() => import('./pages/onboarding'))
const OTP = lazy(() => import('./pages/otp'))
const Confirm = lazy(() => import('./pages/confirm'))
const Dashboard = lazy(() => import('./pages/dashboard'))
const BuyData = lazy(() => import('./pages/data'))
const BuyAirtime = lazy(() => import('./pages/airtime'))
const CableTV = lazy(() => import('./pages/tv'))
const Electricity = lazy(() => import('./pages/electricity'))
const Wallet = lazy(() => import('./pages/wallet'))
const PaymentPending = lazy(() => import('./pages/payment-pending'))
const TransactionHistory = lazy(() => import('./pages/history'))
const Profile = lazy(() => import('./pages/profile'))
const EditProfile = lazy(() => import('./pages/edit-profile'))
const ChangePassword = lazy(() => import('./pages/change-password'))
const ChangePin = lazy(() => import('./pages/change-pin'))
const NotificationSettings = lazy(() => import('./pages/notification-settings'))
const Notifications = lazy(() => import('./pages/notifications'))
const Success = lazy(() => import('./pages/success'))
const Failed = lazy(() => import('./pages/failed'))
const Refer = lazy(() => import('./pages/refer'))
const Help = lazy(() => import('./pages/help'))
const Services = lazy(() => import('./pages/services'))
const Terms = lazy(() => import('./pages/terms'))
const Privacy = lazy(() => import('./pages/privacy'))
const NotFound = lazy(() => import('./pages/not-found'))

// Wallet flow pages
const WalletVerify = lazy(() => import('./pages/wallet/verify'))
const WalletSuccess = lazy(() => import('./pages/wallet/success'))
const WalletFailed = lazy(() => import('./pages/wallet/failed'))

// Service flow pages
const AirtimeReceipt = lazy(() => import('./pages/services/airtime-receipt'))
const DataReceipt = lazy(() => import('./pages/services/data-receipt'))
const DstvReceipt = lazy(() => import('./pages/services/dstv-receipt'))
const ElectricityReceipt = lazy(() => import('./pages/services/electricity-receipt'))

const wrap = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<Loader />}><Component /></Suspense>
)

const protect = (Component: React.LazyExoticComponent<any>) => (
  <ProtectedRoute><Suspense fallback={<Loader />}><Component /></Suspense></ProtectedRoute>
)

const adminProtect = (Component: React.LazyExoticComponent<any>) => (
  <AdminRoute><Suspense fallback={<Loader />}><Component /></Suspense></AdminRoute>
)

export const router = createBrowserRouter([
  { path: '/', element: wrap(Landing) },
  { path: '/login', element: wrap(Login) },
  { path: '/signup', element: wrap(Register) },
  { path: '/onboarding', element: wrap(Onboarding) },
  { path: '/otp', element: wrap(OTP) },
  { path: '/confirm', element: wrap(Confirm) },
  { path: '/dashboard', element: protect(Dashboard) },
  { path: '/data', element: protect(BuyData) },
  { path: '/airtime', element: protect(BuyAirtime) },
  { path: '/tv', element: protect(CableTV) },
  { path: '/electricity', element: protect(Electricity) },
  { path: '/wallet', element: protect(Wallet) },
  { path: '/payment-pending', element: protect(PaymentPending) },
  { path: '/history', element: protect(TransactionHistory) },
  { path: '/profile', element: protect(Profile) },
  { path: '/edit-profile', element: protect(EditProfile) },
  { path: '/change-password', element: protect(ChangePassword) },
  { path: '/change-pin', element: protect(ChangePin) },
  { path: '/notification-settings', element: protect(NotificationSettings) },
  { path: '/notifications', element: protect(Notifications) },
  { path: '/success', element: protect(Success) },
  { path: '/failed', element: protect(Failed) },
  { path: '/refer', element: protect(Refer) },
  { path: '/help', element: wrap(Help) },
  { path: '/services', element: wrap(Services) },
  { path: '/terms', element: wrap(Terms) },
  { path: '/privacy', element: wrap(Privacy) },
  
  // Wallet flow
  { path: '/wallet/verify', element: protect(WalletVerify) },
  { path: '/wallet/success', element: protect(WalletSuccess) },
  { path: '/wallet/failed', element: protect(WalletFailed) },
  
  // Service receipts
  { path: '/services/airtime/receipt', element: protect(AirtimeReceipt) },
  { path: '/services/data/receipt', element: protect(DataReceipt) },
  { path: '/services/dstv/receipt', element: protect(DstvReceipt) },
  { path: '/services/electricity/receipt', element: protect(ElectricityReceipt) },
  
  { path: '*', element: wrap(NotFound) },
])
