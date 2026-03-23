export function MetricCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="panel rounded-3xl p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-3 text-2xl text-white">{value}</div>
      {detail ? <div className="mt-2 text-sm text-slate-400">{detail}</div> : null}
    </div>
  );
}
