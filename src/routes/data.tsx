import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { networks } from "@/lib/quickload";
import { getDataPlans } from "@/lib/cheapdatahub.functions";

export const Route = createFileRoute("/data")({ component: Data });

type Network = "mtn" | "glo" | "airtel" | "9mobile";

function Data() {
  const navigate = useNavigate();
  const [net, setNet] = useState<Network>("mtn");
  const [planId, setPlanId] = useState<number | null>(null);
  const [phone, setPhone] = useState("0803 000 0000");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["data-plans", net],
    queryFn: () => getDataPlans({ data: { network: net } }),
    staleTime: 5 * 60 * 1000,
  });

  const plans = data?.plans ?? [];
  const selected = useMemo(
    () => plans.find((p) => p.plan_id === planId) ?? plans[0],
    [plans, planId],
  );
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
                  onClick={() => { setNet(n.id as Network); setPlanId(null); }}
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Select Plan</p>
              <p className="text-[10px] text-muted-foreground">Live pricing · CheapDataHub</p>
            </div>

            {isLoading && (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            )}

            {isError && (
              <div className="bg-background rounded-2xl p-4 border border-destructive/30 text-center">
                <p className="text-sm font-semibold text-destructive">Couldn't load plans</p>
                <button onClick={() => refetch()} className="mt-2 text-xs font-semibold text-primary underline">
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !isError && plans.length === 0 && (
              <div className="bg-background rounded-2xl p-6 text-center">
                <p className="text-sm font-semibold">No plans available</p>
                <p className="mt-1 text-xs text-muted-foreground">Pick another network.</p>
              </div>
            )}

            {!isLoading && !isError && plans.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {plans.map((p) => {
                  const active = (selected?.plan_id ?? null) === p.plan_id;
                  return (
                    <button
                      key={p.plan_id}
                      onClick={() => setPlanId(p.plan_id)}
                      className={`text-left p-3 rounded-2xl border-2 transition ${
                        active ? "border-primary bg-accent shadow-soft" : "border-border bg-background"
                      }`}
                    >
                      <p className={`text-base font-bold ${active ? "text-primary" : ""}`}>{p.size}</p>
                      <p className="text-[11px] text-muted-foreground">{p.validity} · {p.type}</p>
                      <p className="mt-2 text-sm font-bold">₦{p.price.toLocaleString()}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <label className="flex items-center justify-between bg-background rounded-2xl shadow-card p-4 text-sm">
            <span className="text-muted-foreground">Save as beneficiary</span>
            <input type="checkbox" className="accent-[var(--primary)] w-5 h-5" />
          </label>

          <div className="bg-background rounded-2xl shadow-card p-4 border border-accent">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Summary</p>
            <Row k="Network" v={network.name} />
            <Row k="Number" v={phone} />
            <Row k="Plan" v={selected ? `${selected.size} · ${selected.validity}` : "—"} />
            <div className="mt-2 pt-3 border-t border-border flex justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-base font-bold text-primary">
                ₦{(selected?.price ?? 0).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => selected && navigate({ to: "/confirm" })}
            disabled={!selected}
            className="w-full gradient-primary text-primary-foreground rounded-full py-4 text-sm font-semibold shadow-glow active:scale-[0.98] disabled:opacity-50"
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
