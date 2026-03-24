import { RuleFormGuardian } from "./RuleFormGuardian";
import { StatusBadge } from "./StatusBadge";

const builderNotes = [
  {
    title: "Two rules from one intent",
    summary: "Guardian creates a price-triggered protection rule and a vault-health breaker from the same form input.",
  },
  {
    title: "One action rail",
    summary: "Both rules can withdraw collateral or route inventory through the mock DEX into stable exposure.",
  },
  {
    title: "Registry-level guardrails",
    summary: "Cooldowns and execution limits live in the registry, then get enforced again by the executor on every fire.",
  },
] as const;

export function RuleBuilder() {
  return (
    <section className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <div className="space-y-6">
          <div className="panel panel-strong rounded-[36px] p-8 md:p-10">
            <StatusBadge label="Guardian template" tone="live" />
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
              Configure a reactive protection pair.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
              This flow packages a real user intent: protect a vault when the market moves or the position health degrades.
              The UI should feel like a strategy desk, not a pile of raw fields.
            </p>
          </div>

          <div className="grid gap-4">
            {builderNotes.map((note) => (
              <div key={note.title} className="panel rounded-[28px] p-6">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">{note.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{note.summary}</p>
              </div>
            ))}
          </div>

          <div className="panel rounded-[30px] p-6">
            <div className="eyebrow">Execution rail</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[
                "PriceUpdated and HealthFactorChanged are the live trigger rails.",
                "Withdraw and SwapToStable are the live action modules.",
                "Rules fire with cooldown and daily limit enforcement already wired.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <RuleFormGuardian />
      </section>
    </section>
  );
}
