REVOKE EXECUTE ON FUNCTION public.credit_wallet_funding(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.credit_wallet_funding(TEXT) TO service_role;