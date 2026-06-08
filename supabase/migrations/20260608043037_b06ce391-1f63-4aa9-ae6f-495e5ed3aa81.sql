
CREATE TABLE public.wallet_fundings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  fee NUMERIC(12,2) NOT NULL DEFAULT 35,
  total_charged NUMERIC(12,2) NOT NULL,
  paystack_reference TEXT NOT NULL UNIQUE,
  paystack_access_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallet_fundings TO authenticated;
GRANT ALL ON public.wallet_fundings TO service_role;
ALTER TABLE public.wallet_fundings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own fundings" ON public.wallet_fundings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER wallet_fundings_touch BEFORE UPDATE ON public.wallet_fundings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX idx_wallet_fundings_user ON public.wallet_fundings(user_id);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT,
  charged_price NUMERIC(12,2) NOT NULL,
  api_price NUMERIC(12,2),
  platform_profit NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('pending','success','failed')),
  reference TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER transactions_touch BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX idx_transactions_user ON public.transactions(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.credit_wallet_funding(_reference TEXT)
RETURNS TABLE(funding_id UUID, user_id UUID, amount NUMERIC, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  f public.wallet_fundings%ROWTYPE;
BEGIN
  SELECT * INTO f FROM public.wallet_fundings WHERE paystack_reference = _reference FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Funding reference not found: %', _reference; END IF;
  IF f.status = 'success' THEN
    RETURN QUERY SELECT f.id, f.user_id, f.amount, f.status;
    RETURN;
  END IF;
  UPDATE public.wallet_fundings SET status = 'success' WHERE id = f.id;
  UPDATE public.profiles SET wallet_balance = wallet_balance + f.amount WHERE id = f.user_id;
  INSERT INTO public.transactions (user_id, type, description, charged_price, status, reference)
  VALUES (f.user_id, 'wallet_funding', 'Wallet funding via Paystack', f.amount, 'success', f.paystack_reference);
  RETURN QUERY SELECT f.id, f.user_id, f.amount, 'success'::TEXT;
END;
$$;
