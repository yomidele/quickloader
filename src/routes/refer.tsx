import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Gift, Copy, Check, Share2, Link as LinkIcon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/refer")({ component: Refer });

function Refer() {
  const [copied, setCopied] = useState(false);
  const code = "JOHNQL250";
  const copy = () => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <PageHeader title="Refer & Earn" />
        <div className="p-5 space-y-5">
          <div className="relative gradient-primary text-primary-foreground rounded-3xl p-6 text-center overflow-hidden shadow-glow">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="mx-auto w-20 h-20 rounded-2xl glass flex items-center justify-center">
                <Gift size={36} />
              </div>
              <h2 className="mt-4 text-xl font-bold">Invite Friends,<br />Earn Rewards</h2>
              <p className="mt-2 text-xs opacity-85 max-w-[260px] mx-auto">
                Earn ₦500 for every friend who signs up and makes their first transaction.
              </p>
            </div>
          </div>

          <div className="bg-background rounded-2xl shadow-card p-5">
            <p className="text-xs font-medium text-muted-foreground">Your Referral Code</p>
            <div className="mt-2 flex items-center justify-between gap-3 p-4 bg-accent rounded-2xl border-2 border-dashed border-primary/40">
              <span className="text-2xl font-bold text-primary tracking-widest">{code}</span>
              <button onClick={copy} className="w-11 h-11 rounded-full gradient-primary text-primary-foreground flex items-center justify-center">
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <ShareBtn label="WhatsApp" color="bg-emerald-50 text-emerald-600" />
              <ShareBtn label="Twitter" color="bg-sky-50 text-sky-600" />
              <button className="flex flex-col items-center gap-1.5 active:scale-95">
                <div className="w-12 h-12 rounded-full bg-surface-muted text-foreground flex items-center justify-center"><LinkIcon size={18} /></div>
                <span className="text-[11px] font-medium">Copy Link</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Total Earned" value="₦12,500" />
            <Stat label="Friends Referred" value="25" />
          </div>

          <div className="bg-background rounded-2xl shadow-card p-5">
            <p className="text-sm font-semibold">How it works</p>
            <ol className="mt-3 space-y-3">
              {[
                "Share your unique referral code with friends.",
                "They sign up using your code on QuickLoad.",
                "You earn ₦500 once they complete their first transaction.",
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <span className="text-xs text-muted-foreground leading-relaxed pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareBtn({ label, color }: { label: string; color: string }) {
  return (
    <button className="flex flex-col items-center gap-1.5 active:scale-95">
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}><Share2 size={18} /></div>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background rounded-2xl shadow-card p-4">
      <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
      <p className="mt-1 text-xl font-bold text-primary">{value}</p>
    </div>
  );
}
