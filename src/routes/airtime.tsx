import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { networks } from "@/lib/quickload";

export const Route = createFileRoute("/airtime")({ component: Airtime });

const amounts = [50, 100, 200, 500, 1000, 2000];

function Airtime() {
  const navigate = useNavigate();
  const [net, setNet] = useState("mtn");
  const [amount, setAmount] = useState(500);
  const [phone, setPhone] = useState("");
  const network = networks.find((n) => n.id === net)!;
  const discount = Math.round(amount * 0.03);

  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <PageHeader title="Buy Airtime" />
        <div className="p-5 space-y-5">
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
                className="flex-1 h-12 px-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button onClick={() => setPhone("0803 000 0000")} className="h-12 px-3 rounded-xl bg-accent text-primary text-xs font-semibold whitespace-nowrap">
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
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
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
              className="mt-3 w-full h-12 px-3 rounded-xl bg-surface border border-border text-sm font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <label className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Save as beneficiary</span>
              <input type="checkbox" className="accent-[var(--primary)] w-5 h-5" />
            </label>
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4 border border-accent">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Summary</p>
            <Row k="Network" v={network.name} />
            <Row k="Number" v={phone || "—"} />
            <Row k="Amount" v={`₦${amount.toLocaleString()}`} />
            <Row k="Discount (3%)" v={`-₦${discount.toLocaleString()}`} accent />
            <div className="mt-2 pt-3 border-t border-border flex justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-base font-bold text-primary">₦{(amount - discount).toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => navigate({ to: "/confirm" })}
            className="w-full gradient-primary text-primary-foreground rounded-full py-4 text-sm font-semibold shadow-glow active:scale-[0.98]"
          >
            Proceed
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
