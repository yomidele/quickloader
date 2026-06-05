import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, Fingerprint } from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  authenticateBiometric,
  getStoredBiometric,
  isPlatformAuthenticatorAvailable,
  registerBiometric,
} from "@/lib/biometric";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [enrolledUser, setEnrolledUser] = useState<string | null>(null);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setBioAvailable);
    const stored = getStoredBiometric();
    if (stored) setEnrolledUser(stored.username);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter your email and password");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Offer biometric enrollment after first password login
    if (bioAvailable && !getStoredBiometric()) {
      try {
        await registerBiometric(email.trim());
        toast.success("Biometric login enabled");
      } catch {
        // user cancelled or permission denied — ignore
      }
    }
    navigate({ to: "/dashboard", replace: true });
  };

  const handleBiometric = async () => {
    if (!enrolledUser) {
      toast.error("Sign in with your password first to enable biometrics");
      return;
    }
    try {
      await authenticateBiometric();
      // Biometric unlocks the saved session; if there's no session, prompt password
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Session expired — please sign in with your password");
        return;
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Biometric unlock failed");
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="app-shell px-6 py-10">
        <div className="flex justify-center mb-8"><Logo /></div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to Al-Malami.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Email</span>
            <div className="mt-1.5 relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full h-12 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Password</span>
            <div className="mt-1.5 relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-10 pr-11 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full gradient-primary text-primary-foreground rounded-full py-4 text-sm font-semibold shadow-glow active:scale-[0.98] transition disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>

        {bioAvailable && (
          <button
            type="button"
            onClick={handleBiometric}
            disabled={!enrolledUser}
            className={`mt-6 mx-auto flex flex-col items-center gap-1.5 transition ${
              enrolledUser ? "text-foreground" : "text-muted-foreground opacity-60"
            }`}
          >
            <span className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              enrolledUser ? "bg-primary/15 text-primary" : "bg-accent text-muted-foreground"
            }`}>
              <Fingerprint size={28} />
            </span>
            <span className="text-[11px] font-medium">
              {enrolledUser ? "Use Biometrics" : "Biometrics (sign in once first)"}
            </span>
          </button>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account? <Link to="/signup" className="text-primary font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
