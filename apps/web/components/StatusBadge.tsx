export function StatusBadge({ label, tone }: { label: string; tone?: "live" | "upcoming" | "muted" }) {
  const className =
    tone === "upcoming"
      ? "border-amber-400/20 bg-amber-400/12 text-amber-200"
      : tone === "muted"
        ? "border-white/10 bg-white/5 text-slate-300"
        : "border-emerald-300/30 bg-emerald-300/12 text-emerald-200";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
