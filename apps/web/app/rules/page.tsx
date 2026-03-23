import { RuleList } from "../../components/RuleList";

export default function RulesPage() {
  return (
    <main className="page space-y-6">
      <section className="panel rounded-[32px] p-8">
        <div className="eyebrow">Rule inventory</div>
        <h1 className="mt-4 text-4xl text-white">Your automation inventory</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          The registry stores each rule as a reusable protocol primitive. This page pulls your rule IDs, current limits,
          and execution counters directly from the chain.
        </p>
      </section>

      <RuleList />
    </main>
  );
}
