import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, CreditCard, Hash, Copy, Check } from "lucide-react";
import { WalletCard } from "@/components/WalletCard";
import { BottomNav } from "@/components/BottomNav";
import { StatusBadge } from "@/components/StatusBadge";
import { transactions, formatNaira } from "@/lib/quickload";

export const Route = createFileRoute("/wallet")({ component: WalletPage });

function WalletPage() {
  const [method, setMethod] = useState<"bank" | "card" | "ussd">("bank");
  const [copied, setCopied] = useState(false);
  const copy = (t: string) => {
    navigator.clipboard?.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <header className="px-5 pt-8 pb-4">
          <h1 className="text-2xl font-bold">Wallet</h1>
          <p className="text-sm text-muted-foreground">Fund and manage your balance.</p>
        </header>
        <div className="px-5"><WalletCard /></div>

        <section className="px-5 mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Fund Wallet</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "bank" as const, Icon: Building2, name: "Bank Transfer" },
              { id: "card" as const, Icon: CreditCard, name: "Card" },
              { id: "ussd" as const, Icon: Hash, name: "USSD" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`p-4 rounded-2xl border-2 transition flex flex-col items-center gap-2 ${
                  method === m.id ? "border-primary bg-accent" : "border-border bg-background"
                }`}
              >
                <m.Icon size={22} className={method === m.id ? "text-primary" : "text-muted-foreground"} />
                <p className="text-xs font-semibold text-center">{m.name}</p>
              </button>
            ))}
          </div>
        </section>

        {method === "bank" && (
          <section className="px-5 mt-5">
            <div className="bg-background rounded-2xl shadow-card p-5">
              <p className="text-xs text-muted-foreground">Transfer to this account to fund your wallet instantly.</p>
              <div className="mt-4 space-y-3">
                <Field label="Bank Name" value="Wema Bank" />
                <Field label="Account Number" value="8012345678" onCopy={() => copy("8012345678")} copied={copied} />
                <Field label="Account Name" value="Al-Malami / John Adeyemi" />
              </div>
              <button className="mt-5 w-full gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow active:scale-[0.98]">
                I&apos;ve sent the money
              </button>
            </div>
          </section>
        )}
        {method === "card" && (
          <section className="px-5 mt-5">
            <div className="bg-background rounded-2xl shadow-card p-5">
              <p className="text-sm font-semibold">Add a debit card</p>
              <p className="mt-1 text-xs text-muted-foreground">A ₦50 refundable charge will be used to verify your card.</p>
              <input placeholder="Card number" className="mt-4 w-full h-12 px-3 rounded-xl bg-surface border border-border text-sm focus:outline-none focus:border-primary" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <input placeholder="MM/YY" className="h-12 px-3 rounded-xl bg-surface border border-border text-sm focus:outline-none focus:border-primary" />
                <input placeholder="CVV" className="h-12 px-3 rounded-xl bg-surface border border-border text-sm focus:outline-none focus:border-primary" />
              </div>
              <button className="mt-5 w-full gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow active:scale-[0.98]">
                Add Card
              </button>
            </div>
          </section>
        )}
        {method === "ussd" && (
          <section className="px-5 mt-5">
            <div className="bg-background rounded-2xl shadow-card p-5">
              <p className="text-sm font-semibold">Fund via USSD</p>
              <p className="mt-1 text-xs text-muted-foreground">Dial the code below from your registered phone number.</p>
              <div className="mt-4 bg-accent rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-primary tracking-wide">*737*1*Amount#</p>
              </div>
            </div>
          </section>
        )}

        <section className="px-5 mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent Activity</h2>
          </div>
          <div className="bg-background rounded-2xl shadow-card divide-y divide-border/60">
            {transactions.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: t.color }}>{t.type[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.title}</p>
                  <p className="text-[11px] text-muted-foreground">{t.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${t.amount > 0 ? "text-primary" : ""}`}>{formatNaira(t.amount)}</p>
                  <div className="mt-0.5"><StatusBadge status={t.status as any} /></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <BottomNav />
      </div>
    </div>
  );
}

function Field({ label, value, onCopy, copied }: { label: string; value: string; onCopy?: () => void; copied?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-surface rounded-xl">
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-bold mt-0.5">{value}</p>
      </div>
      {onCopy && (
        <button onClick={onCopy} className="w-9 h-9 rounded-full bg-accent text-primary flex items-center justify-center">
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      )}
    </div>
  );
}
