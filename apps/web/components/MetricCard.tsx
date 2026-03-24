export function MetricCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="panel relative overflow-hidden rounded-[28px] p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
      <div className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</div>
        <div className="text-2xl font-semibold tracking-[-0.03em] text-white md:text-[1.9rem]">{value}</div>
        {detail ? <div className="max-w-xs text-sm leading-6 text-slate-400">{detail}</div> : null}
      </div>
    </div>
  );
}
