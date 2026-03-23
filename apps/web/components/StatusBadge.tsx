export function StatusBadge({ label, tone }: { label: string; tone?: "live" | "upcoming" | "muted" }) {
  const className =
    tone === "upcoming"
      ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
      : tone === "muted"
        ? "border-white/10 bg-white/5 text-slate-300"
        : "border-emerald-300/25 bg-emerald-300/10 text-emerald-200";

  return <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${className}`}>{label}</span>;
}
