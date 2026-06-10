import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function SubPage({
  title,
  description,
  children,
  back = "/profile" as const,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  back?: "/profile" | "/dashboard";
}) {
  return (
    <div className="min-h-dvh bg-surface">
      <div className="app-shell !bg-surface">
        <header className="px-5 pt-8 pb-4 flex items-center gap-3">
          <Link to={back} className="w-10 h-10 rounded-full bg-background shadow-soft flex items-center justify-center">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </header>
        <div className="px-5 pb-10">{children}</div>
      </div>
    </div>
  );
}
