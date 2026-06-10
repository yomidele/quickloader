import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";

export function PageHeader({ title, right }: { title: string; right?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/60">
      <div className="flex items-center justify-between px-4 h-14">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-surface-muted active:scale-95 transition"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        <div className="w-10 h-10 flex items-center justify-center">{right}</div>
      </div>
    </header>
  );
}
