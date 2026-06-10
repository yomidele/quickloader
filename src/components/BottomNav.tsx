import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Wallet, Receipt, User } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Home", Icon: Home },
  { to: "/services", label: "Services", Icon: LayoutGrid },
  { to: "/wallet", label: "Wallet", Icon: Wallet },
  { to: "/history", label: "History", Icon: Receipt },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <>
      <div className="h-24" />
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background border-t border-border z-40">
        <div className="grid grid-cols-5 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {items.map(({ to, label, Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors"
              >
                <div
                  className={`flex items-center justify-center w-11 h-7 rounded-full transition-all ${
                    active ? "bg-accent text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                </div>
                <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
