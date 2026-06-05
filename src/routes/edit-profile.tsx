import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { SubPage } from "@/components/SubPage";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useRequireAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/edit-profile")({ component: EditProfile });

function EditProfile() {
  const navigate = useNavigate();
  const { user, loading } = useRequireAuth();
  const { data: profile, isLoading, refetch } = useProfile(user?.id);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  if (loading || isLoading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    await refetch();
    toast.success("Profile updated");
    navigate({ to: "/profile" });
  };

  return (
    <SubPage title="Edit Profile" description="Update your personal information">
      <form onSubmit={handleSave} className="space-y-4 bg-background p-5 rounded-2xl shadow-card">
        <Field label="Full Name" value={fullName} onChange={setFullName} placeholder="John Adeyemi" />
        <Field label="Email" value={user.email ?? ""} onChange={() => {}} disabled />
        <Field label="Phone" value={phone} onChange={setPhone} placeholder="+234 803 000 0000" type="tel" />
        <button
          type="submit"
          disabled={busy}
          className="w-full gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </SubPage>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", disabled,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-1.5 w-full h-12 px-4 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary disabled:opacity-60"
      />
    </label>
  );
}
