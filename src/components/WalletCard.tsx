import { useState } from "react";
import { Eye, EyeOff, Plus, ArrowDownToLine } from "lucide-react";

export function WalletCard({ balance = 152340.5 }: { balance?: number }) {
  const [show, setShow] = useState(true);
  return (
    <div className="relative gradient-primary text-primary-foreground rounded-3xl p-5 overflow-hidden shadow-glow">
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs/4 opacity-80 font-medium tracking-wide uppercase">Wallet Balance</p>
          <button
            onClick={() => setShow((s) => !s)}
            className="w-8 h-8 rounded-full glass flex items-center justify-center"
            aria-label="Toggle balance"
          >
            {show ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-sm opacity-80">₦</span>
          <span className="text-3xl font-bold tracking-tight">
            {show ? balance.toLocaleString("en-NG", { minimumFractionDigits: 2 }) : "••••••"}
          </span>
        </div>
        <p className="mt-1 text-[11px] opacity-75">Account: 8012•••456 · QuickLoad MFB</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="glass rounded-full py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition">
            <Plus size={16} /> Fund Wallet
          </button>
          <button className="bg-white/95 text-primary-deep rounded-full py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition">
            <ArrowDownToLine size={16} /> Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}
