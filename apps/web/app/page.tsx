import Link from "next/link";

import { MetricCard } from "../components/MetricCard";
import { TemplateCard } from "../components/TemplateCard";
import { homeStats, templateCatalog } from "../lib/demo";

export default function HomePage() {
  return (
    <main className="page space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
        <div className="panel panel-strong rounded-[40px] p-8 md:p-12">
          <div className="eyebrow">Reactive Intent Rail</div>
          <h1 className="mt-5 max-w-3xl text-5xl leading-tight text-white md:text-6xl">
            Programmable on-chain automation for Somnia.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            ROP turns Somnia’s native reactivity into an execution substrate. Rules watch contract events in real time,
            enforce protocol-level guardrails, and dispatch action modules without polling or keeper infrastructure.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/create"
              className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-200"
            >
              Create Guardian Rule
            </Link>
            <Link
              href="/feed"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:border-emerald-300/30 hover:bg-white/10"
            >
              View Live Feed
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {homeStats.map((stat) => (
            <MetricCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      </section>

      <section className="panel rounded-[36px] p-8">
        <div className="eyebrow">Architecture strip</div>
        <div className="mt-5 grid gap-4 md:grid-cols-5">
          {["RuleRegistry", "Somnia Reactivity", "Watcher", "ReactiveExecutor", "Action Modules"].map((item) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/45 px-4 py-5 text-center text-sm text-slate-200">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="eyebrow">Template gallery</div>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {templateCatalog.map((template) => (
            <TemplateCard
              key={template.slug}
              href={template.slug === "guardian" ? "/create" : "/templates"}
              name={template.name}
              summary={template.summary}
              status={template.status}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
