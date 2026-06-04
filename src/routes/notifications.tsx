import { createFileRoute } from "@tanstack/react-router";
import { Smartphone, Wifi, Zap, Gift, Wallet, BellOff } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/notifications")({ component: Notifications });

const notifs = [
  { Icon: Wallet, title: "Wallet Funded", body: "₦10,000 has been credited to your wallet.", time: "2m ago", unread: true, tint: "bg-accent text-primary" },
  { Icon: Smartphone, title: "Airtime Successful", body: "₦500 MTN airtime to 0803•••1234 delivered.", time: "1h ago", unread: true, tint: "bg-yellow-50 text-yellow-700" },
  { Icon: Gift, title: "You Earned ₦500!", body: "Tunde just signed up using your code.", time: "Yesterday", unread: false, tint: "bg-pink-50 text-pink-600" },
  { Icon: Wifi, title: "Data Purchase", body: "Airtel 2GB data activated successfully.", time: "Yesterday", unread: false, tint: "bg-blue-50 text-blue-600" },
  { Icon: Zap, title: "Token Delivered", body: "Your EKEDC token: 1234-5678-9012-3456-7890", time: "Jun 2", unread: false, tint: "bg-orange-50 text-orange-600" },
];

function Notifications() {
  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <PageHeader
          title="Notifications"
          right={<button className="text-[11px] text-primary font-semibold whitespace-nowrap">Mark all read</button>}
        />
        <div className="p-5 space-y-3">
          {notifs.length === 0 ? (
            <div className="bg-background rounded-2xl shadow-card p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent text-primary flex items-center justify-center"><BellOff size={28} /></div>
              <p className="mt-4 text-sm font-semibold">All caught up</p>
              <p className="mt-1 text-xs text-muted-foreground">You have no notifications right now.</p>
            </div>
          ) : notifs.map((n, i) => (
            <div key={i} className={`bg-background rounded-2xl shadow-card p-4 flex gap-3 ${n.unread ? "border-l-4 border-primary" : ""}`}>
              <div className={`w-10 h-10 rounded-xl ${n.tint} flex items-center justify-center flex-shrink-0`}>
                <n.Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
