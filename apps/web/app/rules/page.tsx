import { RuleList } from "../../components/RuleList";

export default function RulesPage() {
  return (
    <main className="page space-y-6 md:space-y-8">
      <section className="panel panel-strong rounded-[36px] p-8 md:p-10">
        <div className="eyebrow">Rule inventory</div>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">Your automation inventory</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
          The registry stores each rule as a reusable protocol primitive. This view should feel like a clean operating
          surface for the rail: current status, thresholds, limits, and execution counts in one place.
        </p>
      </section>

      <RuleList />
    </main>
  );
}
