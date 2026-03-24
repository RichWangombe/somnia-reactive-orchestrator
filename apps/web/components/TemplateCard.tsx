import Link from "next/link";

import { StatusBadge } from "./StatusBadge";

export function TemplateCard({
  href,
  name,
  summary,
  status,
}: {
  href: string;
  name: string;
  summary: string;
  status: "live" | "upcoming";
}) {
  return (
    <Link
      href={href}
      className="panel group relative flex h-full min-h-[260px] flex-col justify-between overflow-hidden rounded-[30px] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/25 hover:bg-slate-900/90"
    >
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-300/8 blur-3xl transition duration-300 group-hover:bg-emerald-300/12" />

      <div className="relative space-y-6">
        <StatusBadge label={status === "live" ? "Live template" : "Upcoming"} tone={status === "live" ? "live" : "upcoming"} />
        <div className="space-y-3">
          <h3 className="text-[1.85rem] font-semibold tracking-[-0.04em] text-white">{name}</h3>
          <p className="max-w-sm text-sm leading-7 text-slate-300">{summary}</p>
        </div>
      </div>

      <div className="relative mt-8 flex items-end justify-between gap-4">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {status === "live" ? "Ready for a live guardian demo" : "Fits the same trigger-action rail"}
        </div>
        <div className="text-sm font-medium text-emerald-200 transition group-hover:text-emerald-100">Open template</div>
      </div>
    </Link>
  );
}
