import { LiveFeed } from "../../components/LiveFeed";

export default function FeedPage() {
  return (
    <main className="page space-y-6 md:space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="panel panel-strong rounded-[36px] p-8 md:p-10">
          <div className="eyebrow">Live Execution Tape</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
            Watch the rail fire in real time.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            The watcher streams normalized feed events over SSE. In testnet mode those events originate from Somnia
            Reactivity callbacks; in mock mode they are driven from the same contract interfaces for deterministic local demos.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {["SSE stream", "Receipt-first UX", "No polling loops"].map((item) => (
              <div key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-[36px] p-8 md:p-10">
          <div className="eyebrow">Demo loop</div>
          <div className="mt-5 space-y-4">
            {[
              "Open this page and keep it visible.",
              "Run pnpm demo:price-drop in the project root.",
              "Watch the feed show trigger, match, and on-chain execution.",
            ].map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/10 text-xs font-medium text-emerald-200">
                  0{index + 1}
                </div>
                <div className="text-sm leading-6 text-slate-300">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LiveFeed />
    </main>
  );
}
