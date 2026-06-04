import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Share2 } from "lucide-react";

export const Route = createFileRoute("/success")({ component: Success });

function Success() {
  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface flex flex-col min-h-dvh">
        <div className="flex-1 px-6 pt-16 text-center">
          <div className="mx-auto w-28 h-28 rounded-full bg-accent flex items-center justify-center animate-pop-in">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow">
              <Check size={42} strokeWidth={3} className="text-white" />
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-bold">Transaction Successful!</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your payment has been processed successfully.</p>

          <div className="mt-8 bg-background rounded-2xl shadow-card p-5 text-left space-y-3">
            <Row k="Reference" v="QL-TX982104" />
            <Row k="Service" v="DStv Compact" />
            <Row k="Amount" v="₦15,700.00" />
            <Row k="Date" v="Jun 4, 2026 · 10:42 AM" />
            <Row k="Status" v="Successful" success />
          </div>
        </div>

        <div className="p-6 space-y-3">
          <Link to="/dashboard" className="block w-full gradient-primary text-primary-foreground rounded-full py-4 text-sm font-semibold shadow-glow text-center active:scale-[0.98]">
            Back to Home
          </Link>
          <button className="w-full border-2 border-primary text-primary rounded-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98]">
            <Share2 size={16} /> Share Receipt
          </button>
          <Link to="/services" className="block text-center text-sm font-semibold text-muted-foreground">
            Do Another Transaction
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, success }: { k: string; v: string; success?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className={`text-sm font-semibold ${success ? "text-primary" : ""}`}>{v}</span>
    </div>
  );
}
