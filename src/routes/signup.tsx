import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Phone, User, Lock } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/signup")({ component: Signup });

function Field({
  icon: Icon, label, type = "text", placeholder,
}: { icon: any; label: string; type?: string; placeholder: string }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5 relative">
        <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type={isPass && show ? "text" : type}
          placeholder={placeholder}
          className="w-full h-12 pl-10 pr-11 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
        />
        {isPass && (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </label>
  );
}

function Signup() {
  const navigate = useNavigate();
  return (
    <div className="min-h-dvh bg-background">
      <div className="app-shell px-6 py-8">
        <div className="flex justify-center mb-6"><Logo /></div>
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join thousands topping up the smart way.</p>

        <form
          onSubmit={(e) => { e.preventDefault(); navigate({ to: "/otp" }); }}
          className="mt-6 space-y-4"
        >
          <Field icon={User} label="Full Name" placeholder="John Adeyemi" />
          <Field icon={Mail} label="Email Address" type="email" placeholder="you@email.com" />
          <Field icon={Phone} label="Phone Number" type="tel" placeholder="+234 803 000 0000" />
          <Field icon={Lock} label="Password" type="password" placeholder="••••••••" />
          <Field icon={Lock} label="Confirm Password" type="password" placeholder="••••••••" />

          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="mt-0.5 accent-[var(--primary)]" defaultChecked />
            <span>I agree to the <span className="text-primary font-medium">Terms</span> and <span className="text-primary font-medium">Privacy Policy</span>.</span>
          </label>

          <button className="w-full gradient-primary text-primary-foreground rounded-full py-4 text-sm font-semibold shadow-glow active:scale-[0.98] transition">
            Create Account
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-[11px] text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> OR CONTINUE WITH <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="h-12 rounded-full border border-border bg-background text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98]">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.2-11.5-11.5S17.6 12.5 24 12.5c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-2 13.3-5.2l-6.2-5.2c-1.9 1.4-4.4 2.4-7.1 2.4-5.3 0-9.8-3.1-11.3-7.5l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.5-4.2 5.6l6.2 5.2c-.4.4 6.7-4.9 6.7-15.3 0-1.3-.1-2.3-.4-3z"/></svg>
            Google
          </button>
          <button className="h-12 rounded-full border border-border bg-background text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 1.4c0 1.1-.5 2.2-1.2 3-.8.9-2.1 1.6-3.2 1.5-.1-1.1.4-2.3 1.2-3 .8-.9 2.2-1.5 3.2-1.5zm3.9 7c-1.7-1-3.5-.6-4.7-.6-1.2 0-3-.6-4.6.5-1.6 1-2.4 2.9-2.4 5.1 0 4.5 4.1 9.6 6 9.6.7 0 1.6-.4 2.5-.4.9 0 1.8.4 2.5.4 2 0 6-5 6-9.6 0-2.2-.8-4-3.3-5z"/></svg>
            Apple
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}
