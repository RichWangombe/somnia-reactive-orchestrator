import { RuleFormGuardian } from "./RuleFormGuardian";
import { StatusBadge } from "./StatusBadge";

export function RuleBuilder() {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
      <div className="panel rounded-[32px] p-8">
        <StatusBadge label="Guardian template" tone="live" />
        <h1 className="mt-6 text-4xl text-white">Create a reactive protection pair.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
          The Guardian template turns one product choice into two protocol rules: one price-triggered stop-loss and one
          vault-health breaker. Both share the same action module and execution limits.
        </p>
        <div className="mt-8 space-y-4 text-sm text-slate-300">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            Trigger rail: <span className="text-white">PriceUpdated</span> and <span className="text-white">HealthFactorChanged</span>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            Action rail: withdraw collateral directly, or route the position through the mock DEX into stable inventory.
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            Guardrails: cooldown and max executions/day are encoded at the registry layer, then enforced by the executor.
          </div>
        </div>
      </div>

      <RuleFormGuardian />
    </section>
  );
}
