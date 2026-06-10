// History transactions page
import { useState, useEffect } from "react";
import { Search, Calendar, Inbox, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { StatusBadge } from "@/components/StatusBadge";
import { useRequireAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/quickload";
import { supabase } from "@/integrations/supabase/client";

export default History;

const filters = ["All", "airtime", "data", "dstv", "electricity", "wallet"] as const;

interface Transaction {
  id: string;
  service_type: string;
  amount: number;
  status: "success" | "failed" | "pending";
  created_at: string;
  metadata: Record<string, any>;
}

function History() {
  const { user } = useRequireAuth();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [q, setQ] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [user]);

  const filtered = transactions.filter((t) => {
    if (filter !== "All" && t.service_type !== filter) return false;
    if (q && !t.metadata?.reference?.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const getServiceName = (type: string) => {
    const names: Record<string, string> = {
      airtime: "Airtime",
      data: "Data",
      dstv: "DStv",
      electricity: "Electricity",
      wallet: "Wallet Fund",
    };
    return names[type] || type;
  };

  const getServiceColor = (type: string) => {
    const colors: Record<string, string> = {
      airtime: "#6366f1",
      data: "#0ea5e9",
      dstv: "#f59e0b",
      electricity: "#ef4444",
      wallet: "#10b981",
    };
    return colors[type] || "#6366f1";
  };

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
          {loading ? (
            <div className="bg-background rounded-2xl shadow-card p-10 flex flex-col items-center text-center">
              <Loader2 className="animate-spin text-primary mb-4" size={32} />
              <p className="text-sm text-muted-foreground">Loading transactions...</p>
            </div>
          ) : filtered.length === 0 ? (
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
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: getServiceColor(t.service_type) }}
                  >
                    {t.service_type[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{getServiceName(t.service_type)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString()} · {t.metadata?.reference || t.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${t.status === "success" ? "text-primary" : t.status === "failed" ? "text-destructive" : ""}`}>
                      {formatNaira(t.amount)}
                    </p>
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
