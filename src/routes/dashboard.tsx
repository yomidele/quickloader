import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Smartphone, Wifi, Tv, Zap, Send, History, Gift, LifeBuoy, ArrowRight } from "lucide-react";
import { WalletCard } from "@/components/WalletCard";
import { BottomNav } from "@/components/BottomNav";
import { StatusBadge } from "@/components/StatusBadge";
import { transactions, formatNaira } from "@/lib/quickload";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

const services = [
  { to: "/airtime", Icon: Smartphone, label: "Airtime", tint: "bg-accent text-primary" },
  { to: "/data", Icon: Wifi, label: "Data", tint: "bg-blue-50 text-blue-600" },
  { to: "/tv", Icon: Tv, label: "TV", tint: "bg-purple-50 text-purple-600" },
  { to: "/electricity", Icon: Zap, label: "Electricity", tint: "bg-orange-50 text-orange-600" },
  { to: "/services", Icon: Send, label: "Send Money", tint: "bg-pink-50 text-pink-600" },
  { to: "/history", Icon: History, label: "History", tint: "bg-slate-100 text-slate-700" },
  { to: "/refer", Icon: Gift, label: "Refer & Earn", tint: "bg-yellow-50 text-yellow-700" },
  { to: "/profile", Icon: LifeBuoy, label: "Support", tint: "bg-emerald-50 text-emerald-700" },
] as const;

function Dashboard() {
  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <header className="px-5 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full gradient-primary text-primary-foreground flex items-center justify-center font-bold">JA</div>
            <div>
              <p className="text-xs text-muted-foreground">Good Morning 👋</p>
              <p className="text-sm font-semibold">John Adeyemi</p>
            </div>
          </div>
          <Link to="/notifications" className="relative w-11 h-11 rounded-full bg-background shadow-soft flex items-center justify-center">
            <Bell size={18} />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-destructive" />
          </Link>
        </header>

        <div className="px-5"><WalletCard /></div>

        <section className="px-5 mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Quick Services</h2>
            <Link to="/services" className="text-xs text-primary font-semibold">See all</Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {services.map(({ to, Icon, label, tint }) => (
              <Link key={label} to={to} className="flex flex-col items-center gap-1.5 active:scale-95 transition">
                <div className={`w-14 h-14 rounded-2xl ${tint} flex items-center justify-center shadow-soft`}>
                  <Icon size={22} />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-5 mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent Transactions</h2>
            <Link to="/history" className="text-xs text-primary font-semibold flex items-center gap-0.5">View all <ArrowRight size={12} /></Link>
          </div>
          <div className="bg-background rounded-2xl shadow-card divide-y divide-border/60">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: t.color }}>
                  {t.type[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.title}</p>
                  <p className="text-[11px] text-muted-foreground">{t.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${t.amount > 0 ? "text-primary" : "text-foreground"}`}>{formatNaira(t.amount)}</p>
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
