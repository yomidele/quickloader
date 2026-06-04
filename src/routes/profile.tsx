import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Pencil, CheckCircle2, UserCog, Lock, KeyRound, Bell, Gift, LifeBuoy, FileText, Shield, LogOut } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/profile")({ component: Profile });

const items = [
  { Icon: UserCog, label: "Edit Profile" },
  { Icon: Lock, label: "Change PIN" },
  { Icon: KeyRound, label: "Change Password" },
  { Icon: Bell, label: "Notification Settings" },
  { Icon: Gift, label: "Refer & Earn", to: "/refer" as const },
  { Icon: LifeBuoy, label: "Help & Support" },
  { Icon: Shield, label: "Privacy Policy" },
  { Icon: FileText, label: "Terms of Service" },
];

function Profile() {
  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <header className="px-5 pt-8 pb-4">
          <h1 className="text-2xl font-bold">Profile</h1>
        </header>

        <div className="px-5">
          <div className="bg-background rounded-2xl shadow-card p-5 flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">JA</div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background border-2 border-surface shadow-soft flex items-center justify-center text-primary">
                <Pencil size={14} />
              </button>
            </div>
            <p className="mt-3 text-base font-bold">John Adeyemi</p>
            <p className="text-xs text-muted-foreground">john.adeyemi@email.com</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent text-primary text-[11px] font-semibold">
              <CheckCircle2 size={12} /> +234 803 000 0000
            </div>
          </div>
        </div>

        <div className="px-5 mt-5">
          <div className="bg-background rounded-2xl shadow-card overflow-hidden divide-y divide-border/60">
            {items.map(({ Icon, label, to }) => {
              const inner = (
                <>
                  <div className="w-9 h-9 rounded-xl bg-surface-muted text-foreground flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <span className="flex-1 text-sm font-medium">{label}</span>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </>
              );
              return to ? (
                <Link key={label} to={to} className="flex items-center gap-3 px-4 py-3 active:bg-surface-muted">{inner}</Link>
              ) : (
                <button key={label} className="w-full flex items-center gap-3 px-4 py-3 active:bg-surface-muted text-left">{inner}</button>
              );
            })}
            <button className="w-full flex items-center gap-3 px-4 py-3 active:bg-destructive/5 text-left">
              <div className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <LogOut size={18} />
              </div>
              <span className="flex-1 text-sm font-semibold text-destructive">Logout</span>
            </button>
          </div>
          <p className="mt-6 mb-2 text-center text-[11px] text-muted-foreground">QuickLoad v1.0.0</p>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
