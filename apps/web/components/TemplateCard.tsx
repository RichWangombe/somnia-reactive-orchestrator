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
      className="panel group flex h-full flex-col justify-between rounded-[28px] p-6 transition hover:-translate-y-1 hover:border-emerald-300/25 hover:bg-slate-900/90"
    >
      <div className="space-y-5">
        <StatusBadge label={status === "live" ? "Live template" : "Upcoming"} tone={status === "live" ? "live" : "upcoming"} />
        <div className="space-y-3">
          <h3 className="text-2xl text-white">{name}</h3>
          <p className="text-sm leading-6 text-slate-300">{summary}</p>
        </div>
      </div>
      <div className="mt-8 text-sm text-emerald-200 transition group-hover:text-emerald-100">Open template</div>
    </Link>
  );
}
