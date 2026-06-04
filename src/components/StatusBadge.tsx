export function StatusBadge({ status }: { status: "success" | "failed" | "pending" }) {
  const styles = {
    success: "bg-accent text-accent-foreground",
    failed: "bg-destructive/10 text-destructive",
    pending: "bg-warning/15 text-warning",
  }[status];
  const label = { success: "Success", failed: "Failed", pending: "Pending" }[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
