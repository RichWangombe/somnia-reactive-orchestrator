import { reactiveExecutorAbi } from "@rop/shared";

import type { createClients } from "./contracts";
import { logger } from "./logger";

type DispatchDependencies = {
  executorAddress: `0x${string}`;
  publicClient: ReturnType<typeof createClients>["publicClient"];
  walletClient: ReturnType<typeof createClients>["walletClient"];
  account: ReturnType<typeof createClients>["account"];
};

export type DispatchResult = {
  success: boolean;
  txHash?: `0x${string}`;
  error?: string;
  latencyMs: number;
};

export async function dispatchRuleExecution(
  deps: DispatchDependencies,
  ruleId: number,
  triggerPayload: `0x${string}`,
): Promise<DispatchResult> {
  if (!deps.walletClient || !deps.account) {
    return {
      success: false,
      error: "PRIVATE_KEY_WATCHER is missing; cannot submit execution transaction.",
      latencyMs: 0,
    };
  }

  const startedAt = Date.now();

  try {
    const txHash = await deps.walletClient.writeContract({
      account: deps.account,
      address: deps.executorAddress,
      abi: reactiveExecutorAbi,
      functionName: "fire",
      args: [BigInt(ruleId), triggerPayload],
    });

    await deps.publicClient.waitForTransactionReceipt({ hash: txHash });

    return {
      success: true,
      txHash,
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    logger.error("Rule dispatch failed", {
      ruleId,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      latencyMs: Date.now() - startedAt,
    };
  }
}
