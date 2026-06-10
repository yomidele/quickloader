import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CheckCircle2, Info, Loader2, AlertCircle, Wallet } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useRequireAuth } from "@/lib/auth";
import { discos } from "@/lib/quickload";
import { toast } from "sonner";
import { useWalletPurchase } from "@/hooks/useWalletPurchase";

export default Electricity;

const SERVICE_CHARGE = 100; // ₦100 service charge

function Electricity() {
  const navigate = useNavigate();
  const { user } = useRequireAuth();
  const { balance, loading: checkingBalance, error: balanceError, checkBalance, processPurchase } = useWalletPurchase('electricity');
  
  const [disco, setDisco] = useState("ekedc");
  const [type, setType] = useState<"prepaid" | "postpaid">("prepaid");
  const [meter, setMeter] = useState("");
  const [verified, setVerified] = useState(false);
  const [amount, setAmount] = useState(3500);
  const [processing, setProcessing] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const totalAmount = amount + SERVICE_CHARGE;

  // Fetch wallet balance on mount
  useEffect(() => {
    if (user) {
      checkBalance();
    }
  }, [user, checkBalance]);

  const handlePurchase = async () => {
    if (!meter) {
      toast.error("Please enter meter number");
      return;
    }

    if (!verified) {
      toast.error("Please verify your meter first");
      return;
    }

    if (balance === null) {
      toast.error("Unable to verify wallet balance");
      return;
    }

    if (balance < totalAmount) {
      setInsufficientBalance(true);
      toast.error("Insufficient wallet balance");
      return;
    }

    setProcessing(true);
    setInsufficientBalance(false);

    try {
      const result = await processPurchase(totalAmount, {
        disco,
        meterNumber: meter,
        type,
        serviceCharge: SERVICE_CHARGE,
        serviceType: 'electricity',
      });

      if (result.success) {
        toast.success(`Electricity purchased! ₦${totalAmount.toLocaleString()} deducted.`);
        navigate('/services/electricity/receipt', {
          state: {
            receiptData: {
              amount: totalAmount,
              reference: result.transaction?.id,
              status: 'success',
              serviceType: 'electricity',
              metadata: {
                disco: discos.find((d) => d.id === disco)!.name,
                meterNumber: meter,
                type,
                serviceCharge: SERVICE_CHARGE,
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
        <PageHeader title="Electricity Payment" />
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
          {insufficientBalance && balance !== null && balance < totalAmount && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Insufficient Balance</p>
                <p className="text-xs text-red-700 mt-1">
                  You need ₦{(totalAmount - (balance || 0)).toLocaleString()} more to complete this payment.
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
            <p className="text-xs font-medium text-muted-foreground mb-2">Select Disco</p>
            <div className="flex flex-wrap gap-2">
              {discos.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDisco(d.id)}
                  disabled={processing}
                  className={`px-3 py-2 rounded-full border-2 text-xs font-semibold transition disabled:opacity-50 ${
                    disco === d.id ? "border-primary bg-accent text-primary" : "border-border bg-background"
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-background rounded-2xl shadow-card p-1 grid grid-cols-2 gap-1">
            {(["prepaid", "postpaid"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                disabled={processing}
                className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition disabled:opacity-50 ${
                  type === t ? "gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4">
            <label className="text-xs font-medium text-muted-foreground">Meter Number</label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                value={meter}
                onChange={(e) => { setMeter(e.target.value); setVerified(false); }}
                placeholder="45210981234"
                inputMode="numeric"
                disabled={processing}
                className="flex-1 h-12 px-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
              />
              <button
                onClick={() => meter.length > 5 && setVerified(true)}
                disabled={processing || meter.length <= 5 || verified}
                className="h-12 px-4 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
              >
                {verified ? "✓" : "Verify"}
              </button>
            </div>
            {verified && (
              <div className="mt-3 p-3 bg-accent rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  <p className="text-sm font-semibold">Meter Verified</p>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground pl-6">Valid meter number confirmed</p>
              </div>
            )}
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4">
            <label className="text-xs font-medium text-muted-foreground">Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")) || 0)}
              inputMode="numeric"
              disabled={processing}
              className="mt-1.5 w-full h-12 px-3 rounded-xl bg-surface border border-border text-sm font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
            />
            <div className="mt-3 flex items-start gap-2 p-3 bg-accent/60 rounded-xl">
              <Info size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Token will be sent to your phone number via SMS within 60 seconds.
              </p>
            </div>
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4 border border-accent">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Summary</p>
            <Row k="Disco" v={discos.find((d) => d.id === disco)!.name} />
            <Row k="Type" v={type === "prepaid" ? "Prepaid" : "Postpaid"} />
            <Row k="Meter" v={meter || "—"} />
            <Row k="Amount" v={`₦${amount.toLocaleString()}`} />
            <Row k="Service Fee" v={`₦${SERVICE_CHARGE.toLocaleString()}`} accent />
            <div className="mt-2 pt-3 border-t border-border flex justify-between">
              <span className="text-sm font-semibold">To Deduct from Wallet</span>
              <span className="text-base font-bold text-primary">₦{totalAmount.toLocaleString()}</span>
            </div>
            {balance !== null && (
              <div className="mt-2 pt-2 border-t border-border flex justify-between">
                <span className="text-xs text-muted-foreground">Remaining Balance</span>
                <span className={`text-sm font-semibold ${(balance - totalAmount) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ₦{Math.max(0, balance - totalAmount).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handlePurchase}
            disabled={processing || checkingBalance || balance === null || insufficientBalance || !verified}
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
              "Verify Meter First"
            ) : (
              "Purchase Electricity"
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

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className={`text-sm font-semibold ${accent ? "text-primary" : ""}`}>{v}</span>
    </div>
  );
}
