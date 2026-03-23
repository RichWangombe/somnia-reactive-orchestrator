"use client";

import { guardianRuleFormSchema, guardianDefaults, isConfiguredAddress } from "@rop/shared";
import { useMemo, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import { appConfig } from "../lib/config";
import { buildGuardianRuleRequests } from "../lib/contracts";
import { ruleRegistryAbi } from "@rop/shared";

type FormState = {
  name: string;
  vaultAddress: string;
  priceFeedAddress: string;
  recipient: string;
  thresholdPrice: string;
  healthFactorThreshold: string;
  cooldownSeconds: number;
  maxExecutionsPerDay: number;
  actionKind: "WITHDRAW_FROM_VAULT" | "SWAP_TO_STABLE";
  amount: string;
  minAmountOut: string;
};

const initialState: FormState = {
  name: guardianDefaults.ruleName,
  vaultAddress: appConfig.addresses.vault,
  priceFeedAddress: appConfig.addresses.priceFeed,
  recipient: "",
  thresholdPrice: guardianDefaults.thresholdPrice,
  healthFactorThreshold: guardianDefaults.healthFactorThreshold,
  cooldownSeconds: guardianDefaults.cooldownSeconds,
  maxExecutionsPerDay: guardianDefaults.maxExecutionsPerDay,
  actionKind: guardianDefaults.action,
  amount: "25",
  minAmountOut: "20",
};

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="space-y-2">
      <div className="text-sm text-slate-200">{label}</div>
      {children}
      {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
    </label>
  );
}

export function RuleFormGuardian() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending } = useWriteContract();
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<string>("Guardian creates a price rule and a health rule.");
  const [error, setError] = useState<string | null>(null);

  const ready = useMemo(
    () =>
      isConfiguredAddress(appConfig.addresses.ruleRegistry) &&
      isConfiguredAddress(appConfig.addresses.vault) &&
      isConfiguredAddress(appConfig.addresses.priceFeed),
    [],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("Validating guardian template...");

    if (!address) {
      setError("Connect a wallet before creating rules.");
      return;
    }

    if (!ready || !publicClient) {
      setError("Contract addresses are missing. Deploy the demo contracts and fill the web env file first.");
      return;
    }

    try {
      const parsed = guardianRuleFormSchema.parse(form);
      const requests = buildGuardianRuleRequests(parsed, address);
      const hashes: string[] = [];

      for (const request of requests) {
        setStatus(`Submitting ${request.label}...`);
        const hash = await writeContractAsync({
          address: appConfig.addresses.ruleRegistry,
          abi: ruleRegistryAbi,
          functionName: "createRule",
          args: request.args as never,
        });
        hashes.push(hash);
        await publicClient.waitForTransactionReceipt({ hash });
      }

      setStatus(`Created ${hashes.length} guardian rules. Latest tx: ${hashes[hashes.length - 1]}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to create guardian rules.");
      setStatus("Guardian creation failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel rounded-[32px] p-6 md:p-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Rule name">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </Field>

        <Field label="Action">
          <select
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
            value={form.actionKind}
            onChange={(event) => update("actionKind", event.target.value as FormState["actionKind"])}
          >
            <option value="WITHDRAW_FROM_VAULT">Withdraw collateral</option>
            <option value="SWAP_TO_STABLE">Swap to stable</option>
          </select>
        </Field>

        <Field label="Vault address">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
            value={form.vaultAddress}
            onChange={(event) => update("vaultAddress", event.target.value)}
          />
        </Field>

        <Field label="Price feed address">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
            value={form.priceFeedAddress}
            onChange={(event) => update("priceFeedAddress", event.target.value)}
          />
        </Field>

        <Field label="Price threshold" hint="Creates a PriceUpdated-triggered guardian rule.">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
            value={form.thresholdPrice}
            onChange={(event) => update("thresholdPrice", event.target.value)}
          />
        </Field>

        <Field label="Health factor threshold" hint="Creates a HealthFactorChanged-triggered guardian rule.">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
            value={form.healthFactorThreshold}
            onChange={(event) => update("healthFactorThreshold", event.target.value)}
          />
        </Field>

        <Field label="Action amount">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
            value={form.amount}
            onChange={(event) => update("amount", event.target.value)}
          />
        </Field>

        <Field label="Minimum stable out" hint="Only used for swap rules.">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
            value={form.minAmountOut}
            onChange={(event) => update("minAmountOut", event.target.value)}
          />
        </Field>

        <Field label="Recipient address" hint="Defaults to the connected wallet.">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
            value={form.recipient}
            onChange={(event) => update("recipient", event.target.value)}
          />
        </Field>

        <Field label="Cooldown seconds">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
            type="number"
            min={0}
            value={form.cooldownSeconds}
            onChange={(event) => update("cooldownSeconds", Number(event.target.value))}
          />
        </Field>

        <Field label="Max executions per day">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
            type="number"
            min={1}
            value={form.maxExecutionsPerDay}
            onChange={(event) => update("maxExecutionsPerDay", Number(event.target.value))}
          />
        </Field>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
        {status}
      </div>

      {error ? <div className="mt-4 text-sm text-rose-300">{error}</div> : null}

      <button
        className="mt-6 rounded-full bg-emerald-300 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Submitting..." : "Create Guardian Rules"}
      </button>
    </form>
  );
}
