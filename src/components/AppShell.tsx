import { ReactNode } from "react";

export function AppShell({ children, surface = false }: { children: ReactNode; surface?: boolean }) {
  return (
    <div className="min-h-dvh bg-surface">
      <div className={`app-shell ${surface ? "bg-surface" : "bg-background"}`}>{children}</div>
    </div>
  );
}
