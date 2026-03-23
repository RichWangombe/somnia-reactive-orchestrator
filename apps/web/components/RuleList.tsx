"use client";

import { isConfiguredAddress, ruleRegistryAbi } from "@rop/shared";
import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import { appConfig } from "../lib/config";
import { fetchRulesByOwner } from "../lib/contracts";
import { formatTokenValue } from "../lib/utils";
import { StatusBadge } from "./StatusBadge";

type OwnedRule = Awaited<ReturnType<typeof fetchRulesByOwner>>[number];

export function RuleList() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending } = useWriteContract();
  const [rules, setRules] = useState<OwnedRule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Connect a wallet to load your rules.");

  async function loadRules() {
    if (!address || !publicClient || !isConfiguredAddress(appConfig.addresses.ruleRegistry)) {
      return;
    }

    setStatus("Loading rules...");
    const nextRules = await fetchRulesByOwner(publicClient, address);
    setRules(nextRules);
    setStatus(nextRules.length === 0 ? "No rules created yet." : `Loaded ${nextRules.length} rules.`);
  }

  useEffect(() => {
    void loadRules().catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Failed to load rules.");
    });
  }, [address, publicClient]);

  async function toggleRule(ruleId: number, active: boolean) {
    if (!publicClient || !isConfiguredAddress(appConfig.addresses.ruleRegistry)) {
      return;
    }

    const hash = await writeContractAsync({
      address: appConfig.addresses.ruleRegistry,
      abi: ruleRegistryAbi,
      functionName: "setRuleActive",
      args: [BigInt(ruleId), active],
    });

    await publicClient.waitForTransactionReceipt({ hash });
    await loadRules();
  }

  if (!address) {
    return <div className="panel rounded-[32px] p-8 text-slate-300">{status}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="panel rounded-[32px] p-6 text-sm text-slate-300">{status}</div>
      {error ? <div className="text-sm text-rose-300">{error}</div> : null}

      {rules.map(({ id, rule, stats }) => (
        <div key={id} className="panel rounded-[28px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Rule #{id}</div>
              <h3 className="mt-2 text-2xl text-white">{rule.metadata.name}</h3>
            </div>
            <StatusBadge label={rule.active ? "Active" : "Disabled"} tone={rule.active ? "live" : "upcoming"} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Template</div>
              <div className="mt-2 text-white">{Number(rule.metadata.templateKind) === 0 ? "Guardian" : "Protocol"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Threshold</div>
              <div className="mt-2 text-white">{formatTokenValue(rule.condition.threshold)} </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Cooldown</div>
              <div className="mt-2 text-white">{Number(rule.limits.cooldownSeconds)}s</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Executions today</div>
              <div className="mt-2 text-white">{Number(stats[1])}</div>
            </div>
          </div>

          <div className="mt-6">
            <button
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-emerald-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:text-slate-500"
              disabled={isPending}
              type="button"
              onClick={() => toggleRule(id, !rule.active)}
            >
              {rule.active ? "Disable rule" : "Enable rule"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
