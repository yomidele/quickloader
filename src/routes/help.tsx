import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MessageCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { SubPage } from "@/components/SubPage";

export const Route = createFileRoute("/help")({ component: Help });

const FAQS = [
  {
    q: "How long does wallet funding take?",
    a: "Bank transfers reflect within 1-3 minutes. Card payments are instant.",
  },
  {
    q: "What if my airtime or data purchase fails?",
    a: "Failed purchases are automatically refunded to your wallet within minutes. Contact support if it takes longer than 24 hours.",
  },
  {
    q: "How do I reset my transaction PIN?",
    a: "Go to Profile → Change PIN. You'll need your current PIN; if you've forgotten it, contact support to reset.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use bank-grade encryption, secure authentication, and never store your card details.",
  },
];

function Help() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SubPage title="Help & Support" description="We're here to help">
      <div className="space-y-4">
        <div className="bg-background rounded-2xl shadow-card p-5">
          <p className="text-sm font-semibold mb-3">Contact us</p>
          <div className="space-y-2">
            <a href="mailto:support@al-malami.app" className="flex items-center gap-3 p-3 rounded-xl bg-surface active:bg-accent">
              <div className="w-9 h-9 rounded-xl bg-accent text-primary flex items-center justify-center"><Mail size={18} /></div>
              <div>
                <p className="text-sm font-semibold">Email</p>
                <p className="text-xs text-muted-foreground">support@al-malami.app</p>
              </div>
            </a>
            <a href="tel:+2348000000000" className="flex items-center gap-3 p-3 rounded-xl bg-surface active:bg-accent">
              <div className="w-9 h-9 rounded-xl bg-accent text-primary flex items-center justify-center"><Phone size={18} /></div>
              <div>
                <p className="text-sm font-semibold">Phone</p>
                <p className="text-xs text-muted-foreground">+234 800 000 0000</p>
              </div>
            </a>
            <a href="https://wa.me/2348000000000" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-surface active:bg-accent">
              <div className="w-9 h-9 rounded-xl bg-accent text-primary flex items-center justify-center"><MessageCircle size={18} /></div>
              <div>
                <p className="text-sm font-semibold">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Chat with us 24/7</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-background rounded-2xl shadow-card overflow-hidden">
          <p className="text-sm font-semibold p-5 pb-3">Frequently asked</p>
          <div className="divide-y divide-border/60">
            {FAQS.map((f, i) => (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left active:bg-surface"
                >
                  <span className="text-sm font-medium flex-1">{f.q}</span>
                  <ChevronDown size={18} className={`text-muted-foreground transition ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && <p className="px-5 pb-4 text-xs text-muted-foreground leading-relaxed">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SubPage>
  );
}
