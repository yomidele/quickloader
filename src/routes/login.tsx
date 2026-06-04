import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Phone, Lock, Fingerprint } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  return (
    <div className="min-h-dvh bg-background">
      <div className="app-shell px-6 py-10">
        <div className="flex justify-center mb-8"><Logo /></div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to QuickLoad.</p>

        <form
          onSubmit={(e) => { e.preventDefault(); navigate({ to: "/dashboard" }); }}
          className="mt-7 space-y-4"
        >
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Phone or Email</span>
            <div className="mt-1.5 relative">
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" defaultValue="+234 803 000 0000" className="w-full h-12 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
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

        <button className="mt-4 mx-auto flex flex-col items-center gap-1.5 text-muted-foreground">
          <span className="w-14 h-14 rounded-2xl bg-accent text-primary flex items-center justify-center">
            <Fingerprint size={28} />
          </span>
          <span className="text-[11px] font-medium">Use Biometrics</span>
        </button>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account? <Link to="/signup" className="text-primary font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
