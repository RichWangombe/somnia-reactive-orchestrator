import Link from "next/link";

import { MetricCard } from "../components/MetricCard";
import { TemplateCard } from "../components/TemplateCard";
import { homeStats, templateCatalog } from "../lib/demo";

const railSteps = [
  {
    index: "01",
    title: "Listen",
    summary: "Somnia Reactivity pushes event and state updates without polling or off-chain keepers.",
  },
  {
    index: "02",
    title: "Evaluate",
    summary: "The watcher normalizes trigger payloads, enforces idempotency, and checks rule conditions.",
  },
  {
    index: "03",
    title: "Execute",
    summary: "ReactiveExecutor applies cooldowns and execution limits before dispatching the action module.",
  },
  {
    index: "04",
    title: "Receipt",
    summary: "The UI turns every match into a readable execution tape with reason, action, and latency.",
  },
] as const;

const valuePillars = [
  {
    title: "Technical depth",
    summary: "A protocol primitive, not a cosmetic dashboard. Rules, modules, limits, and receipts all live on the same rail.",
  },
  {
    title: "Real-time UX",
    summary: "The product visibly reacts as the chain changes. The feed becomes proof, not marketing copy.",
  },
  {
    title: "Protocol leverage",
    summary: "Guardian is just the wedge. The same architecture extends to treasury moves, compounding, referrals, and games.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="page space-y-10 md:space-y-14">
      <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="panel panel-strong relative overflow-hidden rounded-[38px] p-8 md:p-10 xl:p-12">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-emerald-300/12 blur-3xl" />
          <div className="absolute bottom-0 left-8 h-px w-36 bg-gradient-to-r from-emerald-300/70 to-transparent" />

          <div className="relative max-w-3xl">
            <div className="eyebrow">Reactive Intent Rail</div>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.05em] text-white md:text-6xl xl:text-[4.4rem]">
              Programmable on-chain automation for Somnia.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              ROP turns Somnia&apos;s native reactivity into an execution substrate. Rules watch contract events in real
              time, enforce protocol guardrails, and dispatch action modules without polling or keeper infrastructure.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/create"
                className="inline-flex items-center justify-center rounded-full border border-emerald-300/35 bg-emerald-300 px-5 py-3 text-sm font-medium text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-200"
              >
                Create Guardian Rule
              </Link>
              <Link
                href="/feed"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300/30 hover:bg-white/8"
              >
                View Live Feed
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                "No polling loops",
                "Deterministic on-chain actions",
                "Guardian demo live on the same rail",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {homeStats.map((stat) => (
            <MetricCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
          ))}

          <div className="panel rounded-[30px] p-6">
            <div className="eyebrow">Demo path</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">One clean sequence for judges.</h2>
            <div className="mt-6 space-y-4">
              {[
                "Create a Guardian rule pair from one form.",
                "Push the mock collateral price down.",
                "Watch the feed show match, execution, and receipt in real time.",
              ].map((step, index) => (
                <div key={step} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-300/10 text-xs font-medium text-emerald-200">
                    0{index + 1}
                  </div>
                  <div className="text-sm leading-6 text-slate-300">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {railSteps.map((step) => (
          <div key={step.index} className="panel rounded-[28px] p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{step.index}</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">{step.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{step.summary}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
        <div className="panel rounded-[36px] p-8 md:p-10">
          <div className="eyebrow">Execution Graph</div>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">A rule becomes a visible chain of reactions.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            The architecture is readable on purpose. Judges should be able to look at the product and immediately see
            where the trigger came from, why the condition matched, what executed, and how quickly it happened.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "MockPriceFeed -> Somnia Reactivity",
              "Watcher -> normalized trigger payload",
              "ReactiveExecutor -> rule limits + dispatch",
              "Action module -> withdraw, swap, or emit",
            ].map((item) => (
              <div key={item} className="rounded-[24px] border border-white/10 bg-slate-950/45 px-5 py-5 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-[36px] p-8 md:p-10">
          <div className="eyebrow">Why This Lands</div>
          <div className="mt-6 space-y-5">
            {valuePillars.map((pillar) => (
              <div key={pillar.title} className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-5">
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{pillar.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="eyebrow">Template Gallery</div>
            <h2 className="text-4xl font-semibold tracking-[-0.05em] text-white">Start with Guardian, grow into a protocol catalog.</h2>
            <p className="max-w-2xl text-base leading-7 text-slate-300">
              The live template proves the execution rail. The rest of the catalog signals how the same primitive expands
              across treasury ops, reward flows, and protocol automation.
            </p>
          </div>
          <Link href="/templates" className="text-sm font-medium text-emerald-200 transition hover:text-emerald-100">
            Open all templates
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
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
