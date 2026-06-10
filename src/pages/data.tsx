import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { Loader2, AlertCircle, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/lib/auth";
import { networks } from "@/lib/quickload";
import { getDataPlans } from "@/lib/cheapdatahub.functions";
import { toast } from "sonner";
import { useWalletPurchase } from "@/hooks/useWalletPurchase";

export default Data;

type Network = "mtn" | "glo" | "airtel" | "9mobile";

function Data() {
  const navigate = useNavigate();
  const { user } = useRequireAuth();
  const { balance, loading: checkingBalance, error: balanceError, checkBalance, processPurchase } = useWalletPurchase('data');
  
  const [net, setNet] = useState<Network>("mtn");
  const [planId, setPlanId] = useState<number | null>(null);
  const [phone, setPhone] = useState("0803 000 0000");
  const [processing, setProcessing] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["data-plans", net],
    queryFn: () => getDataPlans({ data: { network: net } }),
    staleTime: 5 * 60 * 1000,
  });

  const plans = data?.plans ?? [];
  const selected = useMemo(
    () => plans.find((p) => p.plan_id === planId) ?? plans[0],
    [plans, planId],
  );
  const network = networks.find((n) => n.id === net)!;

  // Fetch wallet balance on mount
  useEffect(() => {
    if (user) {
      checkBalance();
    }
  }, [user, checkBalance]);

  const handlePurchase = async () => {
    if (!selected) {
      toast.error("Please select a data plan");
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
        phone,
        network: network.name,
        planId: selected.plan_id,
        size: selected.size,
        validity: selected.validity,
        type: selected.type,
        serviceType: 'data',
      });

      if (result.success) {
        toast.success(`Data purchased successfully! ₦${selected.price.toLocaleString()} deducted.`);
        navigate('/services/data/receipt', {
          state: {
            receiptData: {
              amount: selected.price,
              reference: result.transaction?.id,
              status: 'success',
              serviceType: 'data',
              metadata: {
                phone,
                network: network.name,
                planSize: selected.size,
                validity: selected.validity,
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
        <PageHeader title="Buy Data" />
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
                  You need ₦{((selected?.price ?? 0) - (balance || 0)).toLocaleString()} more to complete this purchase.
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
            <p className="text-xs font-medium text-muted-foreground mb-2">Select Network</p>
            <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
              {networks.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { setNet(n.id as Network); setPlanId(null); }}
                  disabled={processing}
                  className={`flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full border-2 transition flex-shrink-0 disabled:opacity-50 ${
                    net === n.id ? "border-primary bg-accent" : "border-border bg-background"
                  }`}
                >
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: n.color, color: n.text }}>
                    {n.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold">{n.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4">
            <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              disabled={processing}
              className="mt-1.5 w-full h-12 px-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Select Plan</p>
              <p className="text-[10px] text-muted-foreground">Live pricing · CheapDataHub</p>
            </div>

            {isLoading && (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            )}

            {isError && (
              <div className="bg-background rounded-2xl p-4 border border-destructive/30 text-center">
                <p className="text-sm font-semibold text-destructive">Couldn't load plans</p>
                <button onClick={() => refetch()} disabled={processing} className="mt-2 text-xs font-semibold text-primary underline disabled:opacity-50">
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !isError && plans.length === 0 && (
              <div className="bg-background rounded-2xl p-6 text-center">
                <p className="text-sm font-semibold">No plans available</p>
                <p className="mt-1 text-xs text-muted-foreground">Pick another network.</p>
              </div>
            )}

            {!isLoading && !isError && plans.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {plans.map((p) => {
                  const active = (selected?.plan_id ?? null) === p.plan_id;
                  return (
                    <button
                      key={p.plan_id}
                      onClick={() => setPlanId(p.plan_id)}
                      disabled={processing}
                      className={`text-left p-3 rounded-2xl border-2 transition disabled:opacity-50 ${
                        active ? "border-primary bg-accent shadow-soft" : "border-border bg-background"
                      }`}
                    >
                      <p className={`text-base font-bold ${active ? "text-primary" : ""}`}>{p.size}</p>
                      <p className="text-[11px] text-muted-foreground">{p.validity} · {p.type}</p>
                      <p className="mt-2 text-sm font-bold">₦{p.price.toLocaleString()}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <label className="flex items-center justify-between bg-background rounded-2xl shadow-card p-4 text-sm">
            <span className="text-muted-foreground">Save as beneficiary</span>
            <input type="checkbox" disabled={processing} className="accent-[var(--primary)] w-5 h-5" />
          </label>

          <div className="bg-background rounded-2xl shadow-card p-4 border border-accent">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Summary</p>
            <Row k="Network" v={network.name} />
            <Row k="Number" v={phone} />
            <Row k="Plan" v={selected ? `${selected.size} · ${selected.validity}` : "—"} />
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
            disabled={!selected || processing || checkingBalance || balance === null || insufficientBalance}
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
            ) : (
              "Purchase Data"
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
