"use client";

import { isConfiguredAddress, ruleRegistryAbi } from "@rop/shared";
import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import { appConfig } from "../lib/config";
import { fetchRulesByOwner } from "../lib/contracts";
import { formatTokenValue } from "../lib/utils";
import { StatusBadge } from "./StatusBadge";

type OwnedRule = Awaited<ReturnType<typeof fetchRulesByOwner>>[number];

function formatLastExecuted(unixSeconds: bigint) {
  if (unixSeconds === 0n) {
    return "Not fired yet";
  }

  return new Date(Number(unixSeconds) * 1000).toLocaleString();
}

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
      <div className="panel rounded-[30px] p-5 text-sm leading-7 text-slate-300">{status}</div>
      {error ? <div className="text-sm text-rose-300">{error}</div> : null}

      {rules.map(({ id, rule, stats }) => (
        <div key={id} className="panel rounded-[30px] p-6 md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Rule #{id}</div>
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{rule.metadata.name}</h3>
              <p className="max-w-2xl text-sm leading-6 text-slate-400">
                Trigger kind {Number(rule.trigger.kind)} routed into action module {rule.action.moduleAddress.slice(0, 10)}...
              </p>
            </div>
            <StatusBadge label={rule.active ? "Active" : "Disabled"} tone={rule.active ? "live" : "upcoming"} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Template</div>
              <div className="mt-2 text-white">{Number(rule.metadata.templateKind) === 0 ? "Guardian" : "Protocol"}</div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Threshold</div>
              <div className="mt-2 text-white">{formatTokenValue(rule.condition.threshold)}</div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Cooldown</div>
              <div className="mt-2 text-white">{Number(rule.limits.cooldownSeconds)}s</div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Executions today</div>
              <div className="mt-2 text-white">{Number(stats[1])}</div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Last fired</div>
              <div className="mt-2 text-sm text-white">{formatLastExecuted(stats[0])}</div>
            </div>
          </div>

          <div className="mt-6">
            <button
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:text-slate-500"
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
