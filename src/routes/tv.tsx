import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { CheckCircle2, Tv } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { tvProviders } from "@/lib/quickload";
import { getCablePlans } from "@/lib/cheapdatahub.functions";

export const Route = createFileRoute("/tv")({ component: TV });

type Provider = "dstv" | "gotv" | "startimes";

function TV() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider>("dstv");
  const [planId, setPlanId] = useState<number | null>(null);
  const [card, setCard] = useState("");
  const [verified, setVerified] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["cable-plans", provider],
    queryFn: () => getCablePlans({ data: { provider } }),
    staleTime: 5 * 60 * 1000,
  });

  const plans = data?.plans ?? [];
  const selected = useMemo(
    () => plans.find((p) => p.plan_id === planId) ?? plans[0],
    [plans, planId],
  );
  const prov = tvProviders.find((p) => p.id === provider)!;

  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <PageHeader title="TV Subscription" />
        <div className="p-5 space-y-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Select Provider</p>
            <div className="grid grid-cols-3 gap-3">
              {tvProviders.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setProvider(p.id as Provider); setPlanId(null); }}
                  className={`p-4 rounded-2xl border-2 transition flex flex-col items-center gap-2 ${
                    provider === p.id ? "border-primary bg-accent" : "border-border bg-background"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center">
                    <Tv size={22} />
                  </div>
                  <p className="text-xs font-bold">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.tag}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4">
            <label className="text-xs font-medium text-muted-foreground">Smart Card Number</label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                value={card}
                onChange={(e) => { setCard(e.target.value); setVerified(false); }}
                placeholder="0123456789"
                inputMode="numeric"
                className="flex-1 h-12 px-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button
                onClick={() => card.length > 5 && setVerified(true)}
                className="h-12 px-4 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold"
              >
                Verify
              </button>
            </div>
            {verified && (
              <div className="mt-3 flex items-center gap-2 p-2.5 bg-accent rounded-xl">
                <CheckCircle2 size={16} className="text-primary" />
                <p className="text-xs font-semibold">John Doe</p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Select Package</p>
              <p className="text-[10px] text-muted-foreground">Live pricing</p>
            </div>

            {isLoading && (
              <div className="bg-background rounded-2xl shadow-card divide-y divide-border/60">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4"><Skeleton className="h-6 w-full" /></div>
                ))}
              </div>
            )}

            {isError && (
              <div className="bg-background rounded-2xl p-4 border border-destructive/30 text-center">
                <p className="text-sm font-semibold text-destructive">Couldn't load packages</p>
                <button onClick={() => refetch()} className="mt-2 text-xs font-semibold text-primary underline">
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !isError && plans.length > 0 && (
              <div className="bg-background rounded-2xl shadow-card divide-y divide-border/60">
                {plans.map((p) => {
                  const active = (selected?.plan_id ?? null) === p.plan_id;
                  return (
                    <button
                      key={p.plan_id}
                      onClick={() => setPlanId(p.plan_id)}
                      className="w-full flex items-center justify-between p-4 text-left active:bg-surface-muted"
                    >
                      <div>
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">Subscription</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-bold">₦{p.price.toLocaleString()}</p>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? "border-primary bg-primary" : "border-border"}`}>
                          {active && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4 border border-accent">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Summary</p>
            <Row k="Provider" v={prov.name} />
            <Row k="Smart Card" v={card || "—"} />
            <Row k="Package" v={selected?.name ?? "—"} />
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
