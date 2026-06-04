import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Calendar, Inbox } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { StatusBadge } from "@/components/StatusBadge";
import { transactions, formatNaira } from "@/lib/quickload";

export const Route = createFileRoute("/history")({ component: History });

const filters = ["All", "Airtime", "Data", "TV", "Electricity"] as const;

function History() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [q, setQ] = useState("");
  const filtered = transactions.filter((t) => {
    if (filter !== "All" && t.type !== filter.toLowerCase()) return false;
    if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <header className="px-5 pt-8 pb-3 sticky top-0 bg-surface z-20">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <div className="mt-4 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search transactions"
              className="w-full h-11 pl-10 pr-3 rounded-full bg-background border border-border text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto -mx-1 px-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition ${
                  filter === f ? "gradient-primary text-primary-foreground" : "bg-background border border-border"
                }`}
              >
                {f}
              </button>
            ))}
            <button className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-background flex items-center gap-1 flex-shrink-0">
              <Calendar size={13} /> Date
            </button>
          </div>
        </header>

        <div className="px-5 mt-4">
          {filtered.length === 0 ? (
            <div className="bg-background rounded-2xl shadow-card p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent text-primary flex items-center justify-center">
                <Inbox size={28} />
              </div>
              <p className="mt-4 text-sm font-semibold">No transactions yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Your transaction history will appear here.</p>
            </div>
          ) : (
            <div className="bg-background rounded-2xl shadow-card divide-y divide-border/60">
              {filtered.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: t.color }}>
                    {t.type[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{t.title}</p>
                    <p className="text-[11px] text-muted-foreground">{t.date} · {t.id}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${t.amount > 0 ? "text-primary" : t.status === "failed" ? "text-destructive" : ""}`}>{formatNaira(t.amount)}</p>
                    <div className="mt-0.5"><StatusBadge status={t.status as any} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
