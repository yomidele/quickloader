import { createFileRoute, Link } from "@tanstack/react-router";
import { X, HeadphonesIcon } from "lucide-react";

export const Route = createFileRoute("/failed")({ component: Failed });

function Failed() {
  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface flex flex-col min-h-dvh">
        <div className="flex-1 px-6 pt-16 text-center">
          <div className="mx-auto w-28 h-28 rounded-full bg-destructive/10 flex items-center justify-center animate-pop-in">
            <div className="w-20 h-20 rounded-full bg-destructive flex items-center justify-center shadow-[0_12px_40px_-8px_rgba(239,68,68,0.45)]">
              <X size={42} strokeWidth={3} className="text-white" />
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-bold">Transaction Failed</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
            We couldn&apos;t complete your transaction.
            <br />Reason: <span className="font-semibold text-destructive">Insufficient wallet balance.</span>
          </p>

          <div className="mt-8 bg-background rounded-2xl shadow-card p-5 text-left space-y-3">
            <Row k="Reference" v="QL-TX982104" />
            <Row k="Service" v="DStv Compact" />
            <Row k="Amount" v="₦15,700.00" />
            <Row k="Date" v="Jun 4, 2026 · 10:42 AM" />
          </div>
        </div>

        <div className="p-6 space-y-3">
          <Link to="/confirm" className="block w-full gradient-primary text-primary-foreground rounded-full py-4 text-sm font-semibold shadow-glow text-center active:scale-[0.98]">
            Try Again
          </Link>
          <Link to="/dashboard" className="block w-full border-2 border-border text-foreground rounded-full py-3.5 text-sm font-semibold text-center active:scale-[0.98]">
            Back to Home
          </Link>
          <button className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-primary">
            <HeadphonesIcon size={16} /> Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-sm font-semibold">{v}</span>
    </div>
  );
}
