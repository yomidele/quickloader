import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Mail, Phone, User, Lock } from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default Signup;

function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [accept, setAccept] = useState(true);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return toast.error("Enter your full name");
    if (!email.trim()) return toast.error("Enter your email");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords don't match");
    if (!accept) return toast.error("You must accept the terms to continue");

    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName.trim(), phone: phone.trim() },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created!");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="app-shell px-6 py-8">
        <div className="flex justify-center mb-6"><Logo /></div>
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join thousands topping up the smart way.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <TextField icon={User} label="Full Name" value={fullName} onChange={setFullName} placeholder="John Adeyemi" />
          <TextField icon={Mail} label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
          <TextField icon={Phone} label="Phone Number" type="tel" value={phone} onChange={setPhone} placeholder="+234 803 000 0000" />
          <PasswordField label="Password" value={password} onChange={setPassword} show={showPw} toggle={() => setShowPw((s) => !s)} />
          <PasswordField label="Confirm Password" value={confirm} onChange={setConfirm} show={showPw} toggle={() => setShowPw((s) => !s)} />

          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              className="mt-0.5 accent-[var(--primary)]"
              checked={accept}
              onChange={(e) => setAccept(e.target.checked)}
            />
            <span>I agree to the <Link to="/terms" className="text-primary font-medium">Terms</Link> and <Link to="/privacy" className="text-primary font-medium">Privacy Policy</Link>.</span>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full gradient-primary text-primary-foreground rounded-full py-4 text-sm font-semibold shadow-glow active:scale-[0.98] transition disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}

function TextField({
  icon: Icon, label, type = "text", placeholder, value, onChange,
}: {
  icon: any; label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5 relative">
        <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>
    </label>
  );
}

function PasswordField({
  label, value, onChange, show, toggle,
}: { label: string; value: string; onChange: (v: string) => void; show: boolean; toggle: () => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5 relative">
        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full h-12 pl-10 pr-11 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}
