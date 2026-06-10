import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, Fingerprint } from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  authenticateBiometric,
  getStoredBiometric,
  isPlatformAuthenticatorAvailable,
  registerBiometric,
  saveBiometricRefreshToken,
} from "@/lib/biometric";

export default Login;

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [enrolledUser, setEnrolledUser] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const autoPrompted = useRef(false);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then((available) => {
      setBioAvailable(available);
      const stored = getStoredBiometric();
      if (stored) {
        setEnrolledUser(stored.username);
        setShowPasswordForm(false);
        // Auto-trigger biometric on mount, just like native apps
        if (available && !autoPrompted.current) {
          autoPrompted.current = true;
          setTimeout(() => handleBiometric(true), 400);
        }
      } else {
        setShowPasswordForm(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completeLogin = () => navigate("/dashboard", { replace: true });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter your email and password");
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const refreshToken = data.session?.refresh_token;
    // Offer biometric enrollment after first password login
    if (bioAvailable && !getStoredBiometric()) {
      try {
        await registerBiometric(email.trim());
        if (refreshToken) saveBiometricRefreshToken(refreshToken);
        toast.success("Biometric login enabled");
      } catch {
        // user cancelled — ignore
      }
    } else if (refreshToken) {
      saveBiometricRefreshToken(refreshToken);
    }
    completeLogin();
  };

  const handleBiometric = async (silent = false) => {
    const stored = getStoredBiometric();
    if (!stored) {
      if (!silent) toast.error("Sign in with your password first to enable biometrics");
      setShowPasswordForm(true);
      return;
    }
    try {
      await authenticateBiometric();
    } catch (err) {
      if (!silent) toast.error(err instanceof Error ? err.message : "Biometric unlock failed");
      setShowPasswordForm(true);
      return;
    }

    // Already signed in? Just continue.
    const { data: sess } = await supabase.auth.getSession();
    if (sess.session) return completeLogin();

    // Restore session from saved refresh token
    if (stored.refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: stored.refreshToken,
      });
      if (!error && data.session) {
        if (data.session.refresh_token) saveBiometricRefreshToken(data.session.refresh_token);
        return completeLogin();
      }
    }

    toast.error("Session expired — please sign in with your password");
    setShowPasswordForm(true);
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="app-shell px-6 py-10">
        <div className="flex justify-center mb-8"><Logo /></div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {enrolledUser && !showPasswordForm
            ? `Sign in as ${enrolledUser} with biometrics.`
            : "Sign in to continue to Al-Malami."}
        </p>

        {enrolledUser && !showPasswordForm && (
          <div className="mt-10 flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={() => handleBiometric(false)}
              className="w-24 h-24 rounded-full gradient-primary text-primary-foreground flex items-center justify-center shadow-glow active:scale-95 transition"
              aria-label="Use biometrics to sign in"
            >
              <Fingerprint size={44} />
            </button>
            <p className="text-sm font-medium">Tap to unlock with biometrics</p>
            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              className="text-xs text-primary font-semibold"
            >
              Use password instead
            </button>
          </div>
        )}

        {showPasswordForm && (
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

            {enrolledUser && bioAvailable && (
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="w-full text-center text-xs text-primary font-semibold"
              >
                Back to biometric login
              </button>
            )}
          </form>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account? <Link to="/signup" className="text-primary font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
