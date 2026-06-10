import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

export default OTP;

function OTP() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [secs, setSecs] = useState(59);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const set = (i: number, v: string) => {
    const nv = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = nv;
    setDigits(next);
    if (nv && i < 5) refs.current[i + 1]?.focus();
  };

  const ready = digits.every((d) => d);

  return (
    <div className="min-h-dvh bg-background">
      <div className="app-shell px-6 py-10">
        <div className="w-14 h-14 rounded-2xl bg-accent text-primary flex items-center justify-center">
          <ShieldCheck size={28} />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Enter OTP</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A 6-digit code was sent to <span className="font-semibold text-foreground">+234 803 000 0000</span>
        </p>

        <div className="mt-8 grid grid-cols-6 gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={d}
              onChange={(e) => set(i, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus(); }}
              inputMode="numeric"
              maxLength={1}
              className="aspect-square text-center text-xl font-bold rounded-xl bg-surface border-2 border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          ))}
        </div>

        <div className="mt-6 text-center text-sm">
          {secs > 0 ? (
            <span className="text-muted-foreground">
              Resend in <span className="font-semibold text-foreground">00:{String(secs).padStart(2, "0")}</span>
            </span>
          ) : (
            <button onClick={() => setSecs(59)} className="text-primary font-semibold">Resend OTP</button>
          )}
        </div>

        <button
          disabled={!ready}
          onClick={() => navigate("/dashboard")}
          className="mt-10 w-full gradient-primary text-primary-foreground rounded-full py-4 text-sm font-semibold shadow-glow disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
