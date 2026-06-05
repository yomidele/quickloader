import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Pencil, CheckCircle2, UserCog, Lock, KeyRound, Bell, Gift, LifeBuoy, FileText, Shield, LogOut, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { initials, useProfile, useRequireAuth, useSignOut } from "@/lib/auth";

export const Route = createFileRoute("/profile")({ component: Profile });

const items = [
  { Icon: UserCog, label: "Edit Profile", to: "/edit-profile" as const },
  { Icon: Lock, label: "Change PIN", to: "/change-pin" as const },
  { Icon: KeyRound, label: "Change Password", to: "/change-password" as const },
  { Icon: Bell, label: "Notification Settings", to: "/notification-settings" as const },
  { Icon: Gift, label: "Refer & Earn", to: "/refer" as const },
  { Icon: LifeBuoy, label: "Help & Support", to: "/help" as const },
  { Icon: Shield, label: "Privacy Policy", to: "/privacy" as const },
  { Icon: FileText, label: "Terms of Service", to: "/terms" as const },
];

function Profile() {
  const { user, loading } = useRequireAuth();
  const { data: profile } = useProfile(user?.id);
  const signOut = useSignOut();

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <header className="px-5 pt-8 pb-4">
          <h1 className="text-2xl font-bold">Profile</h1>
        </header>

        <div className="px-5">
          <div className="bg-background rounded-2xl shadow-card p-5 flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                {initials(displayName)}
              </div>
              <Link
                to="/edit-profile"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background border-2 border-surface shadow-soft flex items-center justify-center text-primary"
              >
                <Pencil size={14} />
              </Link>
            </div>
            <p className="mt-3 text-base font-bold">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {profile?.phone && (
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent text-primary text-[11px] font-semibold">
                <CheckCircle2 size={12} /> {profile.phone}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 mt-5">
          <div className="bg-background rounded-2xl shadow-card overflow-hidden divide-y divide-border/60">
            {items.map(({ Icon, label, to }) => (
              <Link key={label} to={to} className="flex items-center gap-3 px-4 py-3 active:bg-surface-muted">
                <div className="w-9 h-9 rounded-xl bg-surface-muted text-foreground flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <span className="flex-1 text-sm font-medium">{label}</span>
                <ChevronRight size={18} className="text-muted-foreground" />
              </Link>
            ))}
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 active:bg-destructive/5 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <LogOut size={18} />
              </div>
              <span className="flex-1 text-sm font-semibold text-destructive">Logout</span>
            </button>
          </div>
          <p className="mt-6 mb-2 text-center text-[11px] text-muted-foreground">Al-Malami v1.0.0</p>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
