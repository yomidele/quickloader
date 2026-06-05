import { Zap } from "lucide-react";

export function Logo({ size = "md", invert = false }: { size?: "sm" | "md" | "lg"; invert?: boolean }) {
  const sizes = {
    sm: { wrap: "gap-1.5", icon: 18, badge: "w-7 h-7 rounded-lg", text: "text-base" },
    md: { wrap: "gap-2", icon: 22, badge: "w-9 h-9 rounded-xl", text: "text-xl" },
    lg: { wrap: "gap-3", icon: 32, badge: "w-14 h-14 rounded-2xl", text: "text-3xl" },
  }[size];
  return (
    <div className={`inline-flex items-center ${sizes.wrap}`}>
      <div
        className={`${sizes.badge} flex items-center justify-center ${
          invert ? "bg-white text-primary" : "gradient-primary text-primary-foreground"
        } shadow-soft`}
      >
        <Zap size={sizes.icon} strokeWidth={2.5} fill="currentColor" />
      </div>
      <span className={`${sizes.text} font-extrabold tracking-tight ${invert ? "text-white" : "text-foreground"}`}>
        Al-<span className={invert ? "text-white/80" : "text-primary"}>Malami</span>
      </span>
    </div>
  );
}
