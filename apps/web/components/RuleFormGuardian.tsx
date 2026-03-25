"use client";

import { guardianDefaults, guardianRuleFormSchema, isConfiguredAddress, ruleRegistryAbi } from "@rop/shared";
import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import { appConfig } from "../lib/config";
import { buildGuardianRuleRequests } from "../lib/contracts";
import { StatusBadge } from "./StatusBadge";

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

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition duration-200 focus:border-emerald-300/50 focus:bg-slate-950/80";

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
    <label className="space-y-2.5">
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{label}</div>
      {children}
      {hint ? <div className="text-xs leading-5 text-slate-500">{hint}</div> : null}
    </label>
  );
}

function FormSection({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{title}</div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{summary}</p>
      </div>
      {children}
    </section>
  );
}

export function RuleFormGuardian() {
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <form onSubmit={handleSubmit} className="panel panel-strong rounded-[36px] p-6 md:p-8">
      <div className="border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="eyebrow">Guardian rule builder</div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
              Configure thresholds, action, and limits.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-300">
              The form writes directly to the RuleRegistry. One submission creates two rules that share the same action
              rail and execution controls.
            </p>
          </div>
          <StatusBadge
            label={mounted && address ? "Wallet connected" : "Wallet required"}
            tone={mounted && address ? "live" : "muted"}
          />
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <FormSection title="Rule identity" summary="Set the names and addresses that anchor both guardian rules.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Rule name">
              <input className={fieldClassName} value={form.name} onChange={(event) => update("name", event.target.value)} />
            </Field>

            <Field label="Recipient address" hint="Defaults to the connected wallet.">
              <input
                className={fieldClassName}
                value={form.recipient}
                onChange={(event) => update("recipient", event.target.value)}
              />
            </Field>

            <Field label="Vault address">
              <input
                className={fieldClassName}
                value={form.vaultAddress}
                onChange={(event) => update("vaultAddress", event.target.value)}
              />
            </Field>

            <Field label="Price feed address">
              <input
                className={fieldClassName}
                value={form.priceFeedAddress}
                onChange={(event) => update("priceFeedAddress", event.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Trigger thresholds" summary="Guardian listens to both price and health rails, then reacts when either falls below the chosen level.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Price threshold" hint="Creates a PriceUpdated-triggered guardian rule.">
              <input
                className={fieldClassName}
                value={form.thresholdPrice}
                onChange={(event) => update("thresholdPrice", event.target.value)}
              />
            </Field>

            <Field label="Health factor threshold" hint="Creates a HealthFactorChanged-triggered guardian rule.">
              <input
                className={fieldClassName}
                value={form.healthFactorThreshold}
                onChange={(event) => update("healthFactorThreshold", event.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Action module" summary="Choose whether Guardian exits through a direct withdrawal or a mock swap into stable inventory.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Action">
              <select
                className={fieldClassName}
                value={form.actionKind}
                onChange={(event) => update("actionKind", event.target.value as FormState["actionKind"])}
              >
                <option value="WITHDRAW_FROM_VAULT">Withdraw collateral</option>
                <option value="SWAP_TO_STABLE">Swap to stable</option>
              </select>
            </Field>

            <Field label="Action amount">
              <input className={fieldClassName} value={form.amount} onChange={(event) => update("amount", event.target.value)} />
            </Field>

            <Field label="Minimum stable out" hint="Only used for swap rules.">
              <input
                className={fieldClassName}
                value={form.minAmountOut}
                onChange={(event) => update("minAmountOut", event.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Guardrails" summary="These limits live on-chain and are enforced by the executor before every action dispatch.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Cooldown seconds">
              <input
                className={fieldClassName}
                type="number"
                min={0}
                value={form.cooldownSeconds}
                onChange={(event) => update("cooldownSeconds", Number(event.target.value))}
              />
            </Field>

            <Field label="Max executions per day">
              <input
                className={fieldClassName}
                type="number"
                min={1}
                value={form.maxExecutionsPerDay}
                onChange={(event) => update("maxExecutionsPerDay", Number(event.target.value))}
              />
            </Field>
          </div>
        </FormSection>
      </div>

      <div className="mt-8 rounded-[28px] border border-white/10 bg-slate-950/50 p-5 text-sm leading-7 text-slate-300">
        {status}
      </div>

      {error ? <div className="mt-4 text-sm text-rose-300">{error}</div> : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center justify-center rounded-full border border-emerald-300/35 bg-emerald-300 px-5 py-3 text-sm font-medium text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-700 disabled:text-slate-300"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Submitting..." : "Create Guardian Rules"}
        </button>
        <span className="text-sm text-slate-500">Creates one price rule and one health rule.</span>
      </div>
    </form>
  );
}
