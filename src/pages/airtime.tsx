import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Wallet } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useRequireAuth } from "@/lib/auth";
import { networks } from "@/lib/quickload";
import { toast } from "sonner";
import { useWalletPurchase } from "@/hooks/useWalletPurchase";

export default Airtime;

const amounts = [50, 100, 200, 500, 1000, 2000];

function Airtime() {
  const navigate = useNavigate();
  const { user } = useRequireAuth();
  const { balance, loading: checkingBalance, error: balanceError, checkBalance, processPurchase } = useWalletPurchase('airtime');
  
  const [net, setNet] = useState("mtn");
  const [amount, setAmount] = useState(500);
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const network = networks.find((n) => n.id === net)!;
  const discount = Math.round(amount * 0.03);
  const finalAmount = amount - discount;

  // Fetch wallet balance on mount
  useEffect(() => {
    if (user) {
      checkBalance();
    }
  }, [user, checkBalance]);

  const handlePurchase = async () => {
    if (!phone) {
      toast.error("Please enter a phone number");
      return;
    }

    if (balance === null) {
      toast.error("Unable to verify wallet balance");
      return;
    }

    if (balance < finalAmount) {
      setInsufficientBalance(true);
      toast.error("Insufficient wallet balance");
      return;
    }

    setProcessing(true);
    setInsufficientBalance(false);

    try {
      const result = await processPurchase(finalAmount, {
        phone,
        network: network.name,
        serviceType: 'airtime',
      });

      if (result.success) {
        toast.success(`Airtime purchased successfully! ₦${finalAmount.toLocaleString()} deducted.`);
        // Navigate to receipt page with transaction data
        navigate('/services/airtime/receipt', {
          state: {
            receiptData: {
              amount: finalAmount,
              reference: result.transaction?.id,
              status: 'success',
              serviceType: 'airtime',
              metadata: {
                phone,
                network: network.name,
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
        <PageHeader title="Buy Airtime" />
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
          {insufficientBalance && balance !== null && balance < finalAmount && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Insufficient Balance</p>
                <p className="text-xs text-red-700 mt-1">
                  You need ₦{(finalAmount - (balance || 0)).toLocaleString()} more to complete this purchase.
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
                  onClick={() => setNet(n.id)}
                  className={`flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full border-2 transition flex-shrink-0 ${
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
            <div className="mt-1.5 flex items-center gap-2">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0803 000 0000"
                inputMode="tel"
                disabled={processing}
                className="flex-1 h-12 px-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
              />
              <button onClick={() => setPhone("0803 000 0000")} disabled={processing} className="h-12 px-3 rounded-xl bg-accent text-primary text-xs font-semibold whitespace-nowrap disabled:opacity-50">
                Use My Number
              </button>
            </div>
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Amount</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {amounts.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  disabled={processing}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition disabled:opacity-50 ${
                    amount === a ? "border-primary bg-accent text-primary" : "border-border bg-surface"
                  }`}
                >
                  ₦{a.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")) || 0)}
              inputMode="numeric"
              disabled={processing}
              className="mt-3 w-full h-12 px-3 rounded-xl bg-surface border border-border text-sm font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
            />
            <label className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Save as beneficiary</span>
              <input type="checkbox" disabled={processing} className="accent-[var(--primary)] w-5 h-5" />
            </label>
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4 border border-accent">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Summary</p>
            <Row k="Network" v={network.name} />
            <Row k="Number" v={phone || "—"} />
            <Row k="Amount" v={`₦${amount.toLocaleString()}`} />
            <Row k="Discount (3%)" v={`-₦${discount.toLocaleString()}`} accent />
            <div className="mt-2 pt-3 border-t border-border flex justify-between">
              <span className="text-sm font-semibold">To Deduct from Wallet</span>
              <span className="text-base font-bold text-primary">₦{finalAmount.toLocaleString()}</span>
            </div>
            {balance !== null && (
              <div className="mt-2 pt-2 border-t border-border flex justify-between">
                <span className="text-xs text-muted-foreground">Remaining Balance</span>
                <span className={`text-sm font-semibold ${(balance - finalAmount) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ₦{Math.max(0, balance - finalAmount).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handlePurchase}
            disabled={processing || checkingBalance || balance === null || insufficientBalance}
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
              "Purchase Airtime"
            )}
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-full text-primary font-semibold text-sm hover:bg-accent/50"
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
