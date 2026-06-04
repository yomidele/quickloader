import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Info } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { discos } from "@/lib/quickload";

export const Route = createFileRoute("/electricity")({ component: Electricity });

function Electricity() {
  const navigate = useNavigate();
  const [disco, setDisco] = useState("ekedc");
  const [type, setType] = useState<"prepaid" | "postpaid">("prepaid");
  const [meter, setMeter] = useState("");
  const [verified, setVerified] = useState(false);
  const [amount, setAmount] = useState(3500);

  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <PageHeader title="Electricity Payment" />
        <div className="p-5 space-y-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Select Disco</p>
            <div className="flex flex-wrap gap-2">
              {discos.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDisco(d.id)}
                  className={`px-3 py-2 rounded-full border-2 text-xs font-semibold transition ${
                    disco === d.id ? "border-primary bg-accent text-primary" : "border-border bg-background"
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-background rounded-2xl shadow-card p-1 grid grid-cols-2 gap-1">
            {(["prepaid", "postpaid"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition ${
                  type === t ? "gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4">
            <label className="text-xs font-medium text-muted-foreground">Meter Number</label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                value={meter}
                onChange={(e) => { setMeter(e.target.value); setVerified(false); }}
                placeholder="45210981234"
                inputMode="numeric"
                className="flex-1 h-12 px-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button
                onClick={() => meter.length > 5 && setVerified(true)}
                className="h-12 px-4 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold"
              >
                Verify
              </button>
            </div>
            {verified && (
              <div className="mt-3 p-3 bg-accent rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  <p className="text-sm font-semibold">John Adeyemi</p>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground pl-6">12 Adeola Odeku Street, Victoria Island, Lagos</p>
              </div>
            )}
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4">
            <label className="text-xs font-medium text-muted-foreground">Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")) || 0)}
              inputMode="numeric"
              className="mt-1.5 w-full h-12 px-3 rounded-xl bg-surface border border-border text-sm font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <div className="mt-3 flex items-start gap-2 p-3 bg-accent/60 rounded-xl">
              <Info size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Token will be sent to your phone number via SMS within 60 seconds.
              </p>
            </div>
          </div>

          <div className="bg-background rounded-2xl shadow-card p-4 border border-accent">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Summary</p>
            <Row k="Disco" v={discos.find((d) => d.id === disco)!.name} />
            <Row k="Type" v={type === "prepaid" ? "Prepaid" : "Postpaid"} />
            <Row k="Meter" v={meter || "—"} />
            <Row k="Amount" v={`₦${amount.toLocaleString()}`} />
            <Row k="Service Fee" v="₦100" />
            <div className="mt-2 pt-3 border-t border-border flex justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-base font-bold text-primary">₦{(amount + 100).toLocaleString()}</span>
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
