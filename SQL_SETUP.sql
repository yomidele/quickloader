-- ============================================================================
-- SQL CODE TO RUN IN SUPABASE - VTU APPLICATION SETUP
-- ============================================================================
-- 
-- Instructions:
-- 1. Go to your Supabase project dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New Query"
-- 4. Copy and paste the ENTIRE contents of this file
-- 5. Click "Run"
-- 6. Wait for completion (should see "Success" message)
--
-- ============================================================================

-- ============================================================================
-- 1. CREATE TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
  user_id uuid NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('wallet', 'airtime', 'data', 'dstv', 'electricity')),
  amount numeric NOT NULL,
  reference text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending')),
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_service_type_idx ON public.transactions(service_type);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON public.transactions(status);
CREATE INDEX IF NOT EXISTS transactions_reference_idx ON public.transactions(reference);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON public.transactions(created_at DESC);

-- ============================================================================
-- 3. ENSURE PROFILES TABLE HAS WALLET_BALANCE COLUMN
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0;

-- ============================================================================
-- 4. CREATE RPC FUNCTIONS FOR WALLET OPERATIONS
-- ============================================================================

-- Add funds to wallet (for Paystack wallet funding)
CREATE OR REPLACE FUNCTION public.add_to_wallet(user_id uuid, amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET wallet_balance = wallet_balance + amount,
      updated_at = now()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
END;
$$;

-- Deduct from wallet (for service purchases)
-- Returns true if successful, false if insufficient balance
CREATE OR REPLACE FUNCTION public.deduct_from_wallet(user_id uuid, amount numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance numeric;
BEGIN
  -- Get current balance
  SELECT wallet_balance INTO current_balance
  FROM public.profiles
  WHERE id = user_id;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Check if sufficient balance
  IF current_balance < amount THEN
    RETURN false;
  END IF;
  
  -- Deduct from wallet
  UPDATE public.profiles
  SET wallet_balance = wallet_balance - amount,
      updated_at = now()
  WHERE id = user_id;
  
  RETURN true;
END;
$$;

-- Refund to wallet (for failed service purchases)
CREATE OR REPLACE FUNCTION public.refund_to_wallet(user_id uuid, amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET wallet_balance = wallet_balance + amount,
      updated_at = now()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
END;
$$;

-- Get wallet balance (for frontend display)
CREATE OR REPLACE FUNCTION public.get_wallet_balance(user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  balance numeric;
BEGIN
  SELECT wallet_balance INTO balance
  FROM public.profiles
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  RETURN balance;
END;
$$;

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. CREATE RLS POLICIES
-- ============================================================================

-- Policy: Users can only view their own transactions
DROP POLICY IF EXISTS transactions_user_select ON public.transactions;
CREATE POLICY transactions_user_select
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only authenticated users can insert their own transactions
DROP POLICY IF EXISTS transactions_user_insert ON public.transactions;
CREATE POLICY transactions_user_insert
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. CREATE UPDATED TRIGGER FOR AUTO-UPDATING updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.transactions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS transactions_updated_at_trigger ON public.transactions;
CREATE TRIGGER transactions_updated_at_trigger
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.transactions_updated_at();

-- ============================================================================
-- 8. ADD HELPFUL COMMENTS
-- ============================================================================

COMMENT ON TABLE public.transactions IS 'Stores all user transactions for wallet funding, airtime, data, DStv, and electricity purchases';
COMMENT ON COLUMN public.transactions.id IS 'Unique transaction identifier (UUID)';
COMMENT ON COLUMN public.transactions.user_id IS 'Foreign key reference to auth.users table';
COMMENT ON COLUMN public.transactions.service_type IS 'Type of service: wallet, airtime, data, dstv, electricity';
COMMENT ON COLUMN public.transactions.amount IS 'Transaction amount in Naira (NGN)';
COMMENT ON COLUMN public.transactions.reference IS 'Paystack transaction reference - unique identifier';
COMMENT ON COLUMN public.transactions.status IS 'Transaction status: success, failed, pending';
COMMENT ON COLUMN public.transactions.metadata IS 'JSON metadata storing phone, plan, provider, network, etc.';
COMMENT ON COLUMN public.transactions.created_at IS 'Transaction creation timestamp';
COMMENT ON COLUMN public.transactions.updated_at IS 'Transaction last update timestamp';
COMMENT ON FUNCTION public.add_to_wallet(uuid, numeric) IS 'RPC function to atomically add funds to user wallet balance. Call from backend with service_role key.';

-- ============================================================================
-- VERIFICATION QUERIES - Run these to verify everything is set up:
-- ============================================================================

-- Check if transactions table exists and has correct columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name='transactions';

-- Check if RLS is enabled
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions';

-- Check if RLS policies exist
-- SELECT * FROM pg_policies WHERE tablename = 'transactions';

-- Check if add_to_wallet function exists
-- SELECT * FROM pg_proc WHERE proname = 'add_to_wallet';

-- ============================================================================
-- END OF SQL SETUP
-- ============================================================================
-- 
-- If you see "Success" message above, all tables, functions, and policies
-- have been created successfully!
--
-- Next steps:
-- 1. Update backend .env with Paystack and Supabase credentials
-- 2. Deploy backend API
-- 3. Update frontend .env with API_URL
-- 4. Deploy frontend
-- 5. Test the complete payment flow
--
-- ============================================================================
