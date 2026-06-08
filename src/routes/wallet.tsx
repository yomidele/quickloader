import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, X, AlertCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { WalletCard } from "@/components/WalletCard";
import { BottomNav } from "@/components/BottomNav";
import { StatusBadge } from "@/components/StatusBadge";
import { transactions, formatNaira } from "@/lib/quickload";
import { useProfile, useRequireAuth } from "@/lib/auth";
import { initiateWalletFunding } from "@/lib/wallet.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/wallet")({ component: WalletPage });

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];
const FUNDING_FEE = 35;
const MIN_FUND = 200;

function WalletPage() {
  const { user, loading } = useRequireAuth();
  const { data: profile } = useProfile(user?.id);
  const [fundOpen, setFundOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startFunding = useServerFn(initiateWalletFunding);

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const openFund = () => {
    setAmount("");
    setFundOpen(true);
  };

  const openWithdraw = () => {
    setAmount("");
    setWithdrawOpen(true);
  };

  const submitFund = async (e: FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt < MIN_FUND) return toast.error(`Minimum funding amount is ₦${MIN_FUND}`);
    setSubmitting(true);
    try {
      const res = await startFunding({ data: { amount: amt } });
      localStorage.setItem("pending_funding_ref", res.reference);
      window.location.href = res.authorizationUrl;
    } catch (err) {
      toast.error((err as Error).message ?? "Could not start payment");
      setSubmitting(false);
    }
  };

  const submitWithdraw = (e: FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt < 100) return toast.error("Minimum withdrawal is ₦100");
    if (amt > Number(profile?.wallet_balance ?? 0)) return toast.error("Amount exceeds wallet balance");
    setWithdrawOpen(false);
    toast.info("Withdrawal gateway not yet integrated.");
  };

  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <header className="px-5 pt-8 pb-4">
          <h1 className="text-2xl font-bold">Wallet</h1>
          <p className="text-sm text-muted-foreground">Fund and manage your balance.</p>
        </header>
        <div className="px-5">
          <WalletCard
            balance={Number(profile?.wallet_balance ?? 0)}
            onFund={openFund}
            onWithdraw={openWithdraw}
          />
        </div>

        <section className="px-5 mt-6">
          <div className="bg-background rounded-2xl shadow-card p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent text-primary flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">Secure payments via Paystack</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                A ₦{FUNDING_FEE} transaction fee applies to every funding. Minimum funding is ₦{MIN_FUND}.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 mt-7">
          <h2 className="text-sm font-semibold mb-3">Recent Activity</h2>
          <div className="bg-background rounded-2xl shadow-card divide-y divide-border/60">
            {transactions.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: t.color }}>{t.type[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.title}</p>
                  <p className="text-[11px] text-muted-foreground">{t.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${t.amount > 0 ? "text-primary" : ""}`}>{formatNaira(t.amount)}</p>
                  <div className="mt-0.5"><StatusBadge status={t.status as any} /></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <BottomNav />
      </div>

      {fundOpen && (
        <FundSheet
          amount={amount}
          setAmount={setAmount}
          onClose={() => !submitting && setFundOpen(false)}
          onSubmit={submitFund}
          submitting={submitting}
        />
      )}
      {withdrawOpen && (
        <AmountSheet
          title="Withdraw"
          description={`Available: ${formatNaira(Number(profile?.wallet_balance ?? 0))}`}
          amount={amount}
          setAmount={setAmount}
          onClose={() => setWithdrawOpen(false)}
          onSubmit={submitWithdraw}
          ctaLabel="Request Withdrawal"
        />
      )}
    </div>
  );
}

function FundSheet({
  amount, setAmount, onClose, onSubmit, submitting,
}: {
  amount: string;
  setAmount: (v: string) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  submitting: boolean;
}) {
  const amt = Number(amount) || 0;
  const total = amt > 0 ? amt + FUNDING_FEE : 0;
  const belowMin = amt > 0 && amt < MIN_FUND;
  const disabled = submitting || amt < MIN_FUND;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 py-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-background rounded-3xl p-6 shadow-2xl relative">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-muted-foreground" aria-label="Close" disabled={submitting}>
          <X size={18} />
        </button>
        <h2 className="text-lg font-bold">Fund Wallet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pay securely with Paystack. Minimum ₦{MIN_FUND}.
        </p>

        <label className="block mt-5">
          <span className="text-xs font-medium text-muted-foreground">Amount to credit (₦)</span>
          <input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0"
            className="mt-1.5 w-full h-14 px-4 rounded-xl bg-surface border border-border text-xl font-bold focus:outline-none focus:border-primary"
            disabled={submitting}
          />
        </label>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(String(q))}
              className="py-2 rounded-full bg-surface text-xs font-semibold border border-border active:bg-accent"
              disabled={submitting}
            >
              ₦{q.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-surface border border-border p-4 text-sm">
          <Row label="Amount to credit" value={formatNaira(amt)} />
          <Row label="Transaction fee" value={`₦${FUNDING_FEE}`} muted />
          <div className="h-px bg-border my-2" />
          <Row label="Total charged" value={formatNaira(total)} bold />
        </div>

        {belowMin && (
          <p className="mt-2 text-xs text-destructive">Minimum funding amount is ₦{MIN_FUND}</p>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="mt-6 w-full gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Redirecting…</> : `Pay ${formatNaira(total)} with Paystack`}
        </button>
      </form>
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={muted ? "text-muted-foreground text-xs" : "text-xs text-muted-foreground"}>{label}</span>
      <span className={bold ? "font-bold" : "font-semibold"}>{value}</span>
    </div>
  );
}

function AmountSheet({
  title, description, amount, setAmount, onClose, onSubmit, ctaLabel,
}: {
  title: string; description: string; amount: string; setAmount: (v: string) => void;
  onClose: () => void; onSubmit: (e: FormEvent) => void; ctaLabel: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 py-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-background rounded-3xl p-6 shadow-2xl relative">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-muted-foreground" aria-label="Close">
          <X size={18} />
        </button>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>

        <label className="block mt-5">
          <span className="text-xs font-medium text-muted-foreground">Amount (₦)</span>
          <input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0"
            className="mt-1.5 w-full h-14 px-4 rounded-xl bg-surface border border-border text-xl font-bold focus:outline-none focus:border-primary"
          />
        </label>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(String(q))}
              className="py-2 rounded-full bg-surface text-xs font-semibold border border-border active:bg-accent"
            >
              ₦{q.toLocaleString()}
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="mt-6 w-full gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow active:scale-[0.98]"
        >
          {ctaLabel}
        </button>
      </form>
    </div>
  );
}
