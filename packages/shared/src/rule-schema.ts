import { z } from "zod";

import {
  actionKindMap,
  conditionKindMap,
  emptyTopicFilters,
  templateKindMap,
  triggerKindMap,
} from "./constants";

export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Expected a checksummed or lowercase hex address");

export const hexSchema = z.string().regex(/^0x[a-fA-F0-9]*$/, "Expected hex data");

export const triggerKindSchema = z.enum(Object.keys(triggerKindMap) as [keyof typeof triggerKindMap, ...(keyof typeof triggerKindMap)[]]);
export const conditionKindSchema = z.enum(
  Object.keys(conditionKindMap) as [keyof typeof conditionKindMap, ...(keyof typeof conditionKindMap)[]],
);
export const actionKindSchema = z.enum(Object.keys(actionKindMap) as [keyof typeof actionKindMap, ...(keyof typeof actionKindMap)[]]);
export const templateKindSchema = z.enum(
  Object.keys(templateKindMap) as [keyof typeof templateKindMap, ...(keyof typeof templateKindMap)[]],
);

export const guardianRuleFormSchema = z.object({
  name: z.string().min(3).max(80),
  vaultAddress: addressSchema,
  priceFeedAddress: addressSchema,
  recipient: addressSchema.optional(),
  thresholdPrice: z.string().min(1),
  healthFactorThreshold: z.string().min(1),
  cooldownSeconds: z.number().int().min(0).max(86_400),
  maxExecutionsPerDay: z.number().int().min(1).max(1_440),
  actionKind: actionKindSchema.extract(["WITHDRAW_FROM_VAULT", "SWAP_TO_STABLE"]),
  amount: z.string().min(1),
  minAmountOut: z.string().min(1),
});

export type GuardianRuleForm = z.infer<typeof guardianRuleFormSchema>;

export type TriggerKindLabel = z.infer<typeof triggerKindSchema>;
export type ConditionKindLabel = z.infer<typeof conditionKindSchema>;
export type ActionKindLabel = z.infer<typeof actionKindSchema>;
export type TemplateKindLabel = z.infer<typeof templateKindSchema>;

export type ChainTriggerSpec = {
  kind: number;
  contractAddress: `0x${string}`;
  topicFilters: readonly [`0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`];
  filterData: `0x${string}`;
};

export type ChainConditionSpec = {
  kind: number;
  threshold: bigint;
  auxData: `0x${string}`;
};

export type ChainActionSpec = {
  kind: number;
  moduleAddress: `0x${string}`;
  data: `0x${string}`;
};

export type ChainRuleLimits = {
  cooldownSeconds: number;
  maxExecutionsPerDay: number;
};

export function toChainTriggerKind(kind: TriggerKindLabel): number {
  return triggerKindMap[kind];
}

export function toChainConditionKind(kind: ConditionKindLabel): number {
  return conditionKindMap[kind];
}

export function toChainActionKind(kind: ActionKindLabel): number {
  return actionKindMap[kind];
}

export function toChainTemplateKind(kind: TemplateKindLabel): number {
  return templateKindMap[kind];
}

export function createDefaultTrigger(
  contractAddress: `0x${string}`,
  topic0: `0x${string}`,
  kind: TriggerKindLabel,
): ChainTriggerSpec {
  return {
    kind: toChainTriggerKind(kind),
    contractAddress,
    topicFilters: [topic0, emptyTopicFilters[1], emptyTopicFilters[2], emptyTopicFilters[3]],
    filterData: "0x",
  };
}
