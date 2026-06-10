-- ============================================================================
-- SUPABASE DATABASE SCHEMA - VTU Application
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_service_type_idx ON public.transactions(service_type);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON public.transactions(status);
CREATE INDEX IF NOT EXISTS transactions_reference_idx ON public.transactions(reference);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON public.transactions(created_at DESC);

-- ============================================================================
-- 2. UPDATE PROFILES TABLE (if needed)
-- ============================================================================

-- Ensure profiles table has wallet_balance column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0;

-- ============================================================================
-- 3. CREATE RPC FUNCTION TO ADD FUNDS TO WALLET
-- ============================================================================

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
END;
$$;

-- ============================================================================
-- 4. SET UP ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own transactions
CREATE POLICY transactions_user_select
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only authenticated users can insert their own transactions
CREATE POLICY transactions_user_insert
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service backend (via service_role key) can insert/update transactions
-- This is handled server-side with proper authorization

-- ============================================================================
-- 5. CREATE UPDATED TRIGGER FOR TRANSACTIONS
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
-- 6. ADD HELPFUL COMMENTS
-- ============================================================================

COMMENT ON TABLE public.transactions IS 'Stores all user transactions for wallet funding, airtime, data, DStv, and electricity purchases';
COMMENT ON COLUMN public.transactions.service_type IS 'Type of service: wallet, airtime, data, dstv, electricity';
COMMENT ON COLUMN public.transactions.reference IS 'Paystack transaction reference - unique identifier';
COMMENT ON COLUMN public.transactions.metadata IS 'JSON metadata storing phone, plan, provider, network, etc.';
COMMENT ON FUNCTION public.add_to_wallet(uuid, numeric) IS 'RPC function to atomically add funds to user wallet balance';
