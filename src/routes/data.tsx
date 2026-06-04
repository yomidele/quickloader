import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { networks, dataPlans } from "@/lib/quickload";

export const Route = createFileRoute("/data")({ component: Data });

function Data() {
  const navigate = useNavigate();
  const [net, setNet] = useState("mtn");
  const [plan, setPlan] = useState(2);
  const [phone, setPhone] = useState("0803 000 0000");
  const selected = dataPlans.find((p) => p.id === plan)!;
  const network = networks.find((n) => n.id === net)!;

  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <PageHeader title="Buy Data" />
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
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              className="mt-1.5 w-full h-12 px-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Select Plan</p>
            <div className="grid grid-cols-2 gap-3">
              {dataPlans.map((p) => {
                const active = plan === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    className={`text-left p-3 rounded-2xl border-2 transition ${
                      active ? "border-primary bg-accent shadow-soft" : "border-border bg-background"
                    }`}
                  >
                    <p className={`text-lg font-bold ${active ? "text-primary" : ""}`}>{p.size}</p>
                    <p className="text-[11px] text-muted-foreground">{p.validity}</p>
                    <p className="mt-2 text-sm font-bold">₦{p.price.toLocaleString()}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center justify-between bg-background rounded-2xl shadow-card p-4 text-sm">
            <span className="text-muted-foreground">Save as beneficiary</span>
            <input type="checkbox" className="accent-[var(--primary)] w-5 h-5" />
          </label>

          <div className="bg-background rounded-2xl shadow-card p-4 border border-accent">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Summary</p>
            <Row k="Network" v={network.name} />
            <Row k="Number" v={phone} />
            <Row k="Plan" v={`${selected.size} · ${selected.validity}`} />
            <div className="mt-2 pt-3 border-t border-border flex justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-base font-bold text-primary">₦{selected.price.toLocaleString()}</span>
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

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-sm font-semibold">{v}</span>
    </div>
  );
}
