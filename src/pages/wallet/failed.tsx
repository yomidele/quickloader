import { useSearchParams, useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function WalletFailedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error") || "Payment verification failed";

  return (
    <div className="min-h-dvh bg-surface px-5 py-8 flex flex-col items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-destructive" size={40} />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {error}
        </p>

        <div className="bg-background rounded-2xl shadow-card p-4 mb-6 text-left border border-destructive/20">
          <p className="text-sm text-destructive font-medium">
            Your wallet was not funded. Please try again or contact support if the problem persists.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/wallet")}
            className="flex-1 bg-border text-foreground rounded-full py-3.5 text-sm font-semibold active:scale-[0.98]"
          >
            Back to Wallet
          </button>
          <button
            onClick={() => navigate("/help")}
            className="flex-1 gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow active:scale-[0.98]"
          >
            Get Help
          </button>
        </div>
      </div>
    </div>
  );
}
