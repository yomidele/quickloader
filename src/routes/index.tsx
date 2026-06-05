import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Al-Malami — Fast. Simple. Reliable." },
      { name: "description", content: "Buy airtime, data, pay bills and more — instantly." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      const dest = data.session ? "/dashboard" : "/onboarding";
      setTimeout(() => { if (!cancelled) navigate({ to: dest, replace: true }); }, 1800);
    })();
    return () => { cancelled = true; };
  }, [navigate]);
  return (
    <div className="min-h-dvh gradient-primary relative overflow-hidden">
      <div className="absolute -top-32 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div className="app-shell !bg-transparent flex flex-col items-center justify-center text-center px-6">
        <div className="animate-pop-in">
          <Logo size="lg" invert />
        </div>
        <p className="mt-4 text-white/85 text-sm font-medium tracking-wide">
          Fast. Simple. Reliable.
        </p>
        <div className="absolute bottom-16 left-0 right-0 px-12">
          <div className="h-1 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white rounded-full animate-progress-load" />
          </div>
          <p className="mt-3 text-[11px] text-white/70">Loading your experience…</p>
        </div>
      </div>
    </div>
  );
}
