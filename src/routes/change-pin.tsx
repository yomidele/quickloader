import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SubPage } from "@/components/SubPage";
import { useRequireAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/change-pin")({ component: ChangePin });

const PIN_KEY = "al-malami:pin";

function ChangePin() {
  const navigate = useNavigate();
  const { user, loading } = useRequireAuth();
  const [hasExisting, setHasExisting] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      setHasExisting(!!localStorage.getItem(`${PIN_KEY}:${user.id}`));
    }
  }, [user]);

  if (loading || !user) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPin)) return toast.error("PIN must be exactly 4 digits");
    if (newPin !== confirmPin) return toast.error("PINs don't match");
    const key = `${PIN_KEY}:${user.id}`;
    if (hasExisting) {
      const stored = localStorage.getItem(key);
      if (stored !== currentPin) return toast.error("Current PIN is incorrect");
    }
    localStorage.setItem(key, newPin);
    toast.success(hasExisting ? "PIN updated" : "PIN set");
    navigate({ to: "/profile" });
  };

  return (
    <SubPage title={hasExisting ? "Change PIN" : "Set Transaction PIN"} description="Used to authorize wallet payments">
      <form onSubmit={submit} className="space-y-4 bg-background p-5 rounded-2xl shadow-card">
        {hasExisting && (
          <PinField label="Current PIN" value={currentPin} onChange={setCurrentPin} />
        )}
        <PinField label="New PIN" value={newPin} onChange={setNewPin} />
        <PinField label="Confirm New PIN" value={confirmPin} onChange={setConfirmPin} />
        <button
          type="submit"
          className="w-full gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow active:scale-[0.98]"
        >
          {hasExisting ? "Update PIN" : "Set PIN"}
        </button>
      </form>
    </SubPage>
  );
}

function PinField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder="••••"
        className="mt-1.5 w-full h-14 px-4 rounded-xl bg-surface border border-border text-2xl font-bold tracking-[0.5em] text-center focus:outline-none focus:border-primary"
      />
    </label>
  );
}
