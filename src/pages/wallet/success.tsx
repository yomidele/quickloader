import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { formatNaira } from "@/lib/quickload";

export default function WalletSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = Number(searchParams.get("amount")) || 0;

  return (
    <div className="min-h-dvh bg-surface px-5 py-8 flex flex-col items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-success" size={40} />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your wallet has been funded with {formatNaira(amount)}.
        </p>

        <div className="bg-background rounded-2xl shadow-card p-4 mb-6 text-left">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-semibold">{formatNaira(amount)}</span>
          </div>
          <div className="flex justify-between items-center pt-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="text-success font-semibold">Completed</span>
          </div>
        </div>

        <button
          onClick={() => navigate("/wallet")}
          className="w-full gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow active:scale-[0.98]"
        >
          Back to Wallet
        </button>
      </div>
    </div>
  );
}
