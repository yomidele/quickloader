import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";
import { formatNaira } from "@/lib/quickload";
// TODO: Replace getFundingStatus with API call

export default function PaymentPending() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const navigate = useNavigate();
  // TODO: const fetchStatus = useServerFn(getFundingStatus);
  const [referenceState, setReference] = useState<string | undefined>(reference || undefined);

  useEffect(() => {
    if (reference) {
      localStorage.setItem("pending_funding_ref", reference);
      setReference(reference);
    } else {
      const stored = localStorage.getItem("pending_funding_ref");
      if (stored) setReference(stored);
    }
  }, [reference]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["funding-status", reference],
    enabled: !!reference,
    queryFn: async () => {
      throw new Error("Funding status API endpoint not configured.");
    },
    refetchInterval: (q) => {
      const s = (q.state.data as any)?.status;
      return s === "success" || s === "failed" ? false : 5000;
    },
  });

  useEffect(() => {
    if (data?.status === "success" || data?.status === "failed") {
      localStorage.removeItem("pending_funding_ref");
    }
  }, [data?.status]);

  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface px-5 pt-16 pb-10 flex flex-col items-center text-center">
        {!reference ? (
          <EmptyState />
        ) : isLoading ? (
          <Pending label="Loading payment status…" />
        ) : error ? (
          <Failed message={(error as Error).message} onRetry={() => refetch()} />
        ) : data?.status === "success" ? (
          <Success data={data} onContinue={() => navigate("/dashboard")} />

        ) : data?.status === "failed" ? (
          <Failed
            message="Payment did not complete."
            onRetry={() => navigate("/wallet")}
          />
        ) : (
          <Pending
            label="Awaiting confirmation from Paystack"
            sub={
              data
                ? `${formatNaira(data.totalCharged)} charged · ₦${data.fee} fee`
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

function Pending({ label, sub }: { label: string; sub?: string }) {
  return (
    <>
      <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
      <h1 className="mt-6 text-xl font-bold">Payment in progress</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      <p className="mt-6 text-[11px] text-muted-foreground max-w-xs">
        You can safely close this page — your wallet will be credited automatically once
        Paystack confirms the payment.
      </p>
    </>
  );
}

type VerifiedFunding = {
  reference: string;
  amount: number;
  fee: number;
  totalCharged: number;
  status: "pending" | "success" | "failed";
  createdAt: string;
  type: string;
  description: string;
};

function Success({ data, onContinue }: { data: VerifiedFunding; onContinue: () => void }) {
  const date = new Date(data.createdAt).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <>
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
        <CheckCircle2 className="text-emerald-600" size={40} />
      </div>
      <h1 className="mt-6 text-xl font-bold">Payment Successful!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatNaira(data.amount)} has been credited to your wallet.
      </p>

      <div className="mt-6 w-full max-w-xs bg-background rounded-2xl shadow-card p-5 text-left space-y-2.5">
        <Row k="Reference" v={data.reference} />
        <Row k="Service" v={data.description} />
        <Row k="Amount" v={formatNaira(data.amount)} />
        <Row k="Fee" v={formatNaira(data.fee)} />
        <Row k="Total Charged" v={formatNaira(data.totalCharged)} />
        <Row k="Date" v={date} />
        <Row k="Status" v="Successful" success />
      </div>

      <button
        onClick={onContinue}
        className="mt-6 w-full max-w-xs gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow flex items-center justify-center gap-2"
      >
        Go to Dashboard <ArrowRight size={16} />
      </button>
    </>
  );
}

function Row({ k, v, success }: { k: string; v: string; success?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className={`text-sm font-semibold text-right break-all ${success ? "text-primary" : ""}`}>{v}</span>
    </div>
  );
}

function Failed({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <>
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
        <XCircle className="text-destructive" size={40} />
      </div>
      <h1 className="mt-6 text-xl font-bold">Payment failed</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <button
        onClick={onRetry}
        className="mt-8 w-full max-w-xs bg-background border border-border rounded-full py-3.5 text-sm font-semibold"
      >
        Try again
      </button>
    </>
  );
}

function EmptyState() {
  return (
    <>
      <h1 className="text-xl font-bold">No pending payment</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn't find a payment reference to track.
      </p>
      <Link
        to="/wallet"
        className="mt-8 w-full max-w-xs gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow text-center"
      >
        Go to Wallet
      </Link>
    </>
  );
}
