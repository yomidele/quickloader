import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Phone, Lock, Fingerprint, ShieldCheck, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import {
  authenticateBiometric,
  getStoredBiometric,
  isPlatformAuthenticatorAvailable,
  registerBiometric,
} from "@/lib/biometric";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [identifier, setIdentifier] = useState("+234 803 000 0000");
  const [bioAvailable, setBioAvailable] = useState(false);
  const [enrolledUser, setEnrolledUser] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const [bioBusy, setBioBusy] = useState(false);
  const [showEnrollPrompt, setShowEnrollPrompt] = useState(false);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setBioAvailable);
    const stored = getStoredBiometric();
    if (stored) setEnrolledUser(stored.username);
  }, []);

  const finishLogin = () => navigate({ to: "/dashboard" });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Password login succeeded (stub). Offer biometric enrollment if supported & not yet enrolled.
    if (bioAvailable && !getStoredBiometric()) {
      setPendingUsername(identifier);
      setShowEnrollPrompt(true);
      return;
    }
    finishLogin();
  };

  const handleBiometricLogin = async () => {
    setBioError(null);
    if (!enrolledUser) {
      setBioError("Sign in with your password first to enable biometric login.");
      return;
    }
    try {
      setBioBusy(true);
      await authenticateBiometric();
      finishLogin();
    } catch (err) {
      setBioError(err instanceof Error ? err.message : "Biometric unlock failed");
    } finally {
      setBioBusy(false);
    }
  };

  const handleEnroll = async () => {
    if (!pendingUsername) return;
    setBioError(null);
    try {
      setBioBusy(true);
      await registerBiometric(pendingUsername);
      setEnrolledUser(pendingUsername);
      setShowEnrollPrompt(false);
      finishLogin();
    } catch (err) {
      setBioError(err instanceof Error ? err.message : "Couldn't enable biometric");
      setShowEnrollPrompt(false);
      finishLogin();
    } finally {
      setBioBusy(false);
    }
  };

  const skipEnroll = () => {
    setShowEnrollPrompt(false);
    finishLogin();
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="app-shell px-6 py-10">
        <div className="flex justify-center mb-8"><Logo /></div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {enrolledUser
            ? `Unlock with biometrics or sign in as ${enrolledUser}.`
            : "Sign in to continue to Al-Malami."}
        </p>

        <form onSubmit={handlePasswordSubmit} className="mt-7 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Phone or Email</span>
            <div className="mt-1.5 relative">
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full h-12 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Password</span>
            <div className="mt-1.5 relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type={show ? "text" : "password"} placeholder="••••••••" className="w-full h-12 pl-10 pr-11 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <div className="text-right">
            <button type="button" className="text-xs font-semibold text-primary">Forgot password?</button>
          </div>
          <button className="w-full gradient-primary text-primary-foreground rounded-full py-4 text-sm font-semibold shadow-glow active:scale-[0.98] transition">
            Login
          </button>
        </form>

        {bioAvailable && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={bioBusy || !enrolledUser}
              className={`flex flex-col items-center gap-1.5 transition ${
                enrolledUser ? "text-foreground" : "text-muted-foreground opacity-60"
              } disabled:opacity-60`}
              aria-label="Login with biometrics"
            >
              <span className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                enrolledUser ? "bg-primary/15 text-primary" : "bg-accent text-muted-foreground"
              }`}>
                <Fingerprint size={28} />
              </span>
              <span className="text-[11px] font-medium">
                {bioBusy ? "Verifying…" : enrolledUser ? "Use Biometrics" : "Biometrics (sign in once first)"}
              </span>
            </button>
            {bioError && (
              <p className="text-[11px] text-destructive text-center max-w-xs">{bioError}</p>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account? <Link to="/signup" className="text-primary font-semibold">Sign Up</Link>
        </p>
      </div>

      {showEnrollPrompt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-sm bg-background rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={skipEnroll}
              className="absolute right-4 top-4 text-muted-foreground"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="flex justify-center mb-4">
              <span className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                <ShieldCheck size={32} />
              </span>
            </div>
            <h2 className="text-lg font-bold text-center">Enable biometric login?</h2>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Use Face ID or your fingerprint to sign in faster next time on this device.
            </p>
            <div className="mt-6 space-y-2">
              <button
                onClick={handleEnroll}
                disabled={bioBusy}
                className="w-full gradient-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold shadow-glow disabled:opacity-60"
              >
                {bioBusy ? "Setting up…" : "Enable biometrics"}
              </button>
              <button
                onClick={skipEnroll}
                className="w-full rounded-full py-3.5 text-sm font-semibold text-muted-foreground"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
