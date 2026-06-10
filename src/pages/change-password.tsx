import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { SubPage } from "@/components/SubPage";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth";
import { toast } from "sonner";

export default ChangePassword;

function ChangePassword() {
  const navigate = useNavigate();
  const { user, loading } = useRequireAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading || !user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (next.length < 6) return toast.error("Password must be at least 6 characters");
    if (next !== confirm) return toast.error("Passwords don't match");

    setBusy(true);
    // Re-authenticate first to verify current password
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: current,
    });
    if (signInErr) {
      setBusy(false);
      return toast.error("Current password is incorrect");
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate("/profile");
  };

  return (
    <SubPage title="Change Password" description="Use a strong, unique password">
      <form onSubmit={handleSubmit} className="space-y-4 bg-background p-5 rounded-2xl shadow-card">
        <PwField label="Current Password" value={current} onChange={setCurrent} />
        <PwField label="New Password" value={next} onChange={setNext} />
        <PwField label="Confirm New Password" value={confirm} onChange={setConfirm} />
        <button
          type="submit"
          disabled={busy}
          className="w-full gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "Updating…" : "Update Password"}
        </button>
      </form>
    </SubPage>
  );
}

function PwField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        className="mt-1.5 w-full h-12 px-4 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary"
      />
    </label>
  );
}
