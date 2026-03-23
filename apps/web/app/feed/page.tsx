import { LiveFeed } from "../../components/LiveFeed";

export default function FeedPage() {
  return (
    <main className="page space-y-6">
      <section className="panel rounded-[32px] p-8">
        <div className="eyebrow">Live execution tape</div>
        <h1 className="mt-4 text-4xl text-white">Watch the rail fire in real time.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          The watcher streams normalized feed events over SSE. In testnet mode those events originate from Somnia
          Reactivity callbacks; in mock mode they are simulated from the same contract interfaces for deterministic local demos.
        </p>
      </section>

      <LiveFeed />
    </main>
  );
}
