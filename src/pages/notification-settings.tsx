// Notification settings page
import { useEffect, useState } from "react";
import { SubPage } from "@/components/SubPage";
import { useRequireAuth } from "@/lib/auth";
import { toast } from "sonner";

export default NotificationSettings;

const KEY = "al-malami:notif-prefs";

type Prefs = {
  transactions: boolean;
  promotions: boolean;
  security: boolean;
  email: boolean;
  push: boolean;
};

const defaults: Prefs = { transactions: true, promotions: false, security: true, email: true, push: true };

function NotificationSettings() {
  const { user, loading } = useRequireAuth();
  const [prefs, setPrefs] = useState<Prefs>(defaults);

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    const raw = localStorage.getItem(`${KEY}:${user.id}`);
    if (raw) {
      try { setPrefs({ ...defaults, ...JSON.parse(raw) }); } catch {}
    }
  }, [user]);

  if (loading || !user) return null;

  const update = (k: keyof Prefs, v: boolean) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    localStorage.setItem(`${KEY}:${user.id}`, JSON.stringify(next));
    toast.success("Preferences saved");
  };

  const rows: { key: keyof Prefs; label: string; description: string }[] = [
    { key: "transactions", label: "Transaction alerts", description: "Receipts and balance updates" },
    { key: "security", label: "Security alerts", description: "Sign-ins and account changes" },
    { key: "promotions", label: "Promotions", description: "Offers, bonuses and cashback" },
    { key: "email", label: "Email", description: "Receive notifications via email" },
    { key: "push", label: "Push notifications", description: "On-device push alerts" },
  ];

  return (
    <SubPage title="Notification Settings" description="Choose what you want to hear about">
      <div className="bg-background rounded-2xl shadow-card divide-y divide-border/60">
        {rows.map((r) => (
          <div key={r.key} className="flex items-start gap-3 px-4 py-4">
            <div className="flex-1">
              <p className="text-sm font-semibold">{r.label}</p>
              <p className="text-xs text-muted-foreground">{r.description}</p>
            </div>
            <Toggle checked={prefs[r.key]} onChange={(v) => update(r.key, v)} />
          </div>
        ))}
      </div>
    </SubPage>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition ${checked ? "bg-primary" : "bg-surface-muted"}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${checked ? "left-[1.375rem]" : "left-0.5"}`} />
    </button>
  );
}
