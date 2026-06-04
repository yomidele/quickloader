import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Wallet, CreditCard, Building2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/confirm")({ component: Confirm });

function Confirm() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<"wallet" | "card" | "bank">("wallet");
  const [pin, setPin] = useState(["", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const ready = pin.every((d) => d);

  const set = (i: number, v: string) => {
    const nv = v.replace(/\D/g, "").slice(-1);
    const next = [...pin];
    next[i] = nv;
    setPin(next);
    if (nv && i < 3) refs.current[i + 1]?.focus();
  };

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const methods = [
    { id: "wallet" as const, Icon: Wallet, name: "Wallet", desc: "Balance ₦152,340" },
    { id: "card" as const, Icon: CreditCard, name: "Card", desc: "**** 4242" },
    { id: "bank" as const, Icon: Building2, name: "Bank", desc: "Transfer" },
  ];

  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <PageHeader title="Confirm Payment" />
        <div className="p-5 space-y-5">
          <div className="bg-background rounded-2xl shadow-card p-5">
            <p className="text-xs text-muted-foreground">You're about to pay</p>
            <p className="mt-1 text-3xl font-bold text-primary">₦15,700.00</p>
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <Row k="Service" v="DStv Compact" />
              <Row k="Beneficiary" v="0123 4567 89" />
              <Row k="Service Fee" v="₦0.00" />
              <Row k="Total" v="₦15,700.00" bold />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 bg-accent rounded-2xl">
            <span className="text-xs text-muted-foreground">Available Wallet Balance</span>
            <span className="text-sm font-bold text-primary">₦152,340.50</span>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-3 rounded-2xl border-2 transition text-left ${
                    method === m.id ? "border-primary bg-accent" : "border-border bg-background"
                  }`}
                >
                  <m.Icon size={18} className={method === m.id ? "text-primary" : "text-muted-foreground"} />
                  <p className="mt-1.5 text-xs font-bold">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-background rounded-2xl shadow-card p-5">
            <p className="text-sm font-semibold">Enter Transaction PIN</p>
            <p className="text-xs text-muted-foreground">Authorise with your 4-digit PIN.</p>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {pin.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { refs.current[i] = el; }}
                  type="password"
                  value={d}
                  onChange={(e) => set(i, e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus(); }}
                  inputMode="numeric"
                  maxLength={1}
                  className="aspect-square text-center text-2xl font-bold rounded-xl bg-surface border-2 border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              ))}
            </div>
          </div>

          <button
            disabled={!ready}
            onClick={() => navigate({ to: Math.random() > 0.2 ? "/success" : "/failed" })}
            className="w-full gradient-primary text-primary-foreground rounded-full py-4 text-sm font-semibold shadow-glow disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
          >
            Confirm & Pay
          </button>
          <Link to="/dashboard" className="block text-center text-sm font-semibold text-muted-foreground">Cancel</Link>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={`text-xs ${bold ? "font-semibold" : "text-muted-foreground"}`}>{k}</span>
      <span className={`text-sm ${bold ? "font-bold text-primary" : "font-semibold"}`}>{v}</span>
    </div>
  );
}
