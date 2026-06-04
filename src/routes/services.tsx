import { createFileRoute, Link } from "@tanstack/react-router";
import { Smartphone, Wifi, Tv, Zap, Send, GraduationCap, Plane, Heart, Wallet, ShoppingBag, Gamepad2, Globe, Gift, LifeBuoy } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/services")({ component: Services });

const groups = [
  {
    name: "Bills & Top-ups",
    items: [
      { to: "/airtime", Icon: Smartphone, label: "Airtime", tint: "bg-accent text-primary" },
      { to: "/data", Icon: Wifi, label: "Data Bundle", tint: "bg-blue-50 text-blue-600" },
      { to: "/tv", Icon: Tv, label: "TV", tint: "bg-purple-50 text-purple-600" },
      { to: "/electricity", Icon: Zap, label: "Electricity", tint: "bg-orange-50 text-orange-600" },
    ],
  },
  {
    name: "Transfers",
    items: [
      { to: "/services", Icon: Send, label: "Send Money", tint: "bg-pink-50 text-pink-600" },
      { to: "/services", Icon: Wallet, label: "Bank Transfer", tint: "bg-emerald-50 text-emerald-700" },
    ],
  },
  {
    name: "Lifestyle",
    items: [
      { to: "/services", Icon: GraduationCap, label: "Education", tint: "bg-indigo-50 text-indigo-600" },
      { to: "/services", Icon: Plane, label: "Flights", tint: "bg-sky-50 text-sky-600" },
      { to: "/services", Icon: Heart, label: "Insurance", tint: "bg-rose-50 text-rose-600" },
      { to: "/services", Icon: ShoppingBag, label: "Shopping", tint: "bg-amber-50 text-amber-700" },
      { to: "/services", Icon: Gamepad2, label: "Betting", tint: "bg-violet-50 text-violet-600" },
      { to: "/services", Icon: Globe, label: "Internet", tint: "bg-teal-50 text-teal-600" },
    ],
  },
  {
    name: "More",
    items: [
      { to: "/refer", Icon: Gift, label: "Refer & Earn", tint: "bg-yellow-50 text-yellow-700" },
      { to: "/profile", Icon: LifeBuoy, label: "Support", tint: "bg-slate-100 text-slate-700" },
    ],
  },
];

function Services() {
  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <header className="px-5 pt-8 pb-4">
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">Pay for everything you love in one place.</p>
        </header>
        <div className="px-5 space-y-6 pb-4">
          {groups.map((g) => (
            <div key={g.name}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{g.name}</h2>
              <div className="bg-background rounded-2xl shadow-card p-4 grid grid-cols-4 gap-3">
                {g.items.map(({ to, Icon, label, tint }) => (
                  <Link key={label} to={to} className="flex flex-col items-center gap-1.5 active:scale-95 transition">
                    <div className={`w-14 h-14 rounded-2xl ${tint} flex items-center justify-center`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
