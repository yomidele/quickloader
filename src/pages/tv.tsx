import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { CheckCircle2, Tv, Loader2, AlertCircle, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/lib/auth";
import { tvProviders } from "@/lib/quickload";
import { getCablePlans } from "@/lib/cheapdatahub.functions";
import { toast } from "sonner";
import { useWalletPurchase } from "@/hooks/useWalletPurchase";

export default TV;

type Provider = "dstv" | "gotv" | "startimes";

function TV() {
  const navigate = useNavigate();
  const { user } = useRequireAuth();
  const { balance, loading: checkingBalance, error: balanceError, checkBalance, processPurchase } = useWalletPurchase('dstv');
  
  const [provider, setProvider] = useState<Provider>("dstv");
  const [planId, setPlanId] = useState<number | null>(null);
  const [card, setCard] = useState("");
  const [verified, setVerified] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["cable-plans", provider],
    queryFn: () => getCablePlans({ data: { provider } }),
    staleTime: 5 * 60 * 1000,
  });

  const plans = data?.plans ?? [];
  const selected = useMemo(
    () => plans.find((p) => p.plan_id === planId) ?? plans[0],
    [plans, planId],
  );
  const prov = tvProviders.find((p) => p.id === provider)!;

  // Fetch wallet balance on mount
  useEffect(() => {
    if (user) {
      checkBalance();
    }
  }, [user, checkBalance]);

  const handlePurchase = async () => {
    if (!selected) {
      toast.error("Please select a package");
      return;
    }

    if (!verified || !card) {
      toast.error("Please verify your smart card first");
      return;
    }

    if (balance === null) {
      toast.error("Unable to verify wallet balance");
      return;
    }

    if (balance < selected.price) {
      setInsufficientBalance(true);
      toast.error("Insufficient wallet balance");
      return;
    }

    setProcessing(true);
    setInsufficientBalance(false);

    try {
      const result = await processPurchase(selected.price, {
        smartCard: card,
        provider,
        planId: selected.plan_id,
        planName: selected.name,
        serviceType: 'dstv',
      });

      if (result.success) {
        toast.success(`Subscription activated! ₦${selected.price.toLocaleString()} deducted.`);
        navigate('/services/dstv/receipt', {
          state: {
            receiptData: {
              amount: selected.price,
              reference: result.transaction?.id,
              status: 'success',
              serviceType: 'dstv',
              metadata: {
                smartCard: card,
                provider,
                planName: selected.name,
              },
              createdAt: new Date().toISOString(),
            },
          },
        });
      } else {
        setInsufficientBalance(result.error?.includes('balance') ?? false);
        toast.error(result.error || 'Purchase failed');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      toast.error('An error occurred while processing your purchase');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <PageHeader title="TV Subscription" />
        <div className="p-5 space-y-5">
          {/* Wallet Balance Display */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wallet size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Available Balance</p>
                  <p className="text-xl font-bold text-primary">
                    {checkingBalance ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                      </span>
                    ) : balance !== null ? (
                      `₦${balance.toLocaleString()}`
                    ) : (
                      'Unable to load'
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => checkBalance()}
                disabled={checkingBalance}
                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Insufficient Balance Warning */}
          {insufficientBalance && balance !== null && selected && balance < selected.price && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Insufficient Balance</p>
                <p className="text-xs text-red-700 mt-1">
                  You need ₦{((selected?.price ?? 0) - (balance || 0)).toLocaleString()} more to complete this subscription.
                </p>
                <button
                  onClick={() => navigate('/wallet')}
                  className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 underline"
                >
                  Fund Wallet Now →
                </button>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Select Provider</p>
            <div className="grid grid-cols-3 gap-3">
              {tvProviders.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setProvider(p.id as Provider); setPlanId(null); }}
                  disabled={processing}
                  className={`p-4 rounded-2xl border-2 transition flex flex-col items-center gap-2 disabled:opacity-50 ${
                    provider === p.id ? "border-primary bg-accent" : "border-border bg-background"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center">
                    <Tv size={22} />
                  </div>
                  <p className="text-xs font-bold">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.tag}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4">
            <label className="text-xs font-medium text-muted-foreground">Smart Card Number</label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                value={card}
                onChange={(e) => { setCard(e.target.value); setVerified(false); }}
                placeholder="0123456789"
                inputMode="numeric"
                disabled={processing}
                className="flex-1 h-12 px-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
              />
              <button
                onClick={() => card.length > 5 && setVerified(true)}
                disabled={processing || card.length <= 5 || verified}
                className="h-12 px-4 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
              >
                {verified ? "✓" : "Verify"}
              </button>
            </div>
            {verified && (
              <div className="mt-3 flex items-center gap-2 p-2.5 bg-accent rounded-xl">
                <CheckCircle2 size={16} className="text-primary" />
                <p className="text-xs font-semibold">Card Verified</p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Select Package</p>
              <p className="text-[10px] text-muted-foreground">Live pricing</p>
            </div>

            {isLoading && (
              <div className="bg-background rounded-2xl shadow-card divide-y divide-border/60">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4"><Skeleton className="h-6 w-full" /></div>
                ))}
              </div>
            )}

            {isError && (
              <div className="bg-background rounded-2xl p-4 border border-destructive/30 text-center">
                <p className="text-sm font-semibold text-destructive">Couldn't load packages</p>
                <button onClick={() => refetch()} disabled={processing} className="mt-2 text-xs font-semibold text-primary underline disabled:opacity-50">
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !isError && plans.length > 0 && (
              <div className="bg-background rounded-2xl shadow-card divide-y divide-border/60">
                {plans.map((p) => {
                  const active = (selected?.plan_id ?? null) === p.plan_id;
                  return (
                    <button
                      key={p.plan_id}
                      onClick={() => setPlanId(p.plan_id)}
                      disabled={processing}
                      className="w-full flex items-center justify-between p-4 text-left active:bg-surface-muted disabled:opacity-50"
                    >
                      <div>
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">Subscription</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-bold">₦{p.price.toLocaleString()}</p>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? "border-primary bg-primary" : "border-border"}`}>
                          {active && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4 border border-accent">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Summary</p>
            <Row k="Provider" v={prov.name} />
            <Row k="Smart Card" v={card ? `****${card.slice(-4)}` : "—"} />
            <Row k="Package" v={selected?.name ?? "—"} />
            <div className="mt-2 pt-3 border-t border-border flex justify-between">
              <span className="text-sm font-semibold">To Deduct from Wallet</span>
              <span className="text-base font-bold text-primary">
                ₦{(selected?.price ?? 0).toLocaleString()}
              </span>
            </div>
            {balance !== null && selected && (
              <div className="mt-2 pt-2 border-t border-border flex justify-between">
                <span className="text-xs text-muted-foreground">Remaining Balance</span>
                <span className={`text-sm font-semibold ${(balance - selected.price) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ₦{Math.max(0, balance - (selected?.price ?? 0)).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handlePurchase}
            disabled={!selected || processing || checkingBalance || balance === null || insufficientBalance || !verified}
            className="w-full gradient-primary text-primary-foreground rounded-full py-4 text-sm font-semibold shadow-glow active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing Purchase...
              </>
            ) : insufficientBalance ? (
              "Insufficient Balance"
            ) : checkingBalance ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Checking Balance...
              </>
            ) : !verified ? (
              "Verify Card First"
            ) : (
              "Subscribe Now"
            )}
          </button>

          <button
            onClick={() => navigate('/')}
            disabled={processing}
            className="w-full py-3 rounded-full text-primary font-semibold text-sm hover:bg-accent/50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-sm font-semibold">{v}</span>
    </div>
  );
}
