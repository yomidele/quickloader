import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { formatNaira } from "@/lib/quickload";

interface ReceiptProps {
  serviceType: 'airtime' | 'data' | 'dstv' | 'electricity';
  icon: React.ReactNode;
  title: string;
}

export function ServiceReceiptBase({ serviceType, icon, title }: ReceiptProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const receiptData = location.state?.receiptData;

  if (!receiptData) {
    return (
      <div className="min-h-dvh bg-surface px-5 py-8 flex flex-col items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-sm text-muted-foreground mb-6">No receipt data found.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow active:scale-[0.98]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface px-5 py-8 flex flex-col items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          {icon}
        </div>
        
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Transaction successful! {formatNaira(receiptData.amount)} has been processed.
        </p>

        <div className="bg-background rounded-2xl shadow-card p-4 mb-6 text-left space-y-3">
          <ReceiptRow label="Amount" value={formatNaira(receiptData.amount)} />
          <ReceiptRow label="Reference" value={receiptData.transaction?.reference} />
          <ReceiptRow label="Status" value="Completed" highlight />
          {receiptData.metadata?.phone && (
            <ReceiptRow label="Phone Number" value={receiptData.metadata.phone} />
          )}
          {receiptData.metadata?.provider && (
            <ReceiptRow label="Provider" value={receiptData.metadata.provider} />
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-border text-foreground rounded-full py-3.5 text-sm font-semibold active:scale-[0.98]"
          >
            Back Home
          </button>
          <button
            onClick={() => navigate("/history")}
            className="flex-1 gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow active:scale-[0.98]"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center pb-3 border-b border-border last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={highlight ? "font-semibold text-success" : "font-semibold"}>{value}</span>
    </div>
  );
}
