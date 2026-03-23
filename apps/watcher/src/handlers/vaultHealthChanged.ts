import { dispatchRuleExecution } from "../dispatcher";
import { encodeTriggerPayload, evaluateRule } from "../evaluator";
import { logger } from "../logger";
import { Metrics } from "../metrics";
import type { ExecutionQueue } from "../queue";
import type { NormalizedReactiveEvent } from "../types/events";
import type { PublishFeedEvent, WatcherRule } from "../types/rules";
import type { createClients } from "../contracts";

type HandlerContext = {
  loadRules: () => Promise<WatcherRule[]>;
  queue: ExecutionQueue;
  metrics: Metrics;
  publish: PublishFeedEvent;
  dispatchDeps: {
    executorAddress: `0x${string}`;
    publicClient: ReturnType<typeof createClients>["publicClient"];
    walletClient: ReturnType<typeof createClients>["walletClient"];
    account: ReturnType<typeof createClients>["account"];
  };
};

export async function handleVaultHealthChanged(event: NormalizedReactiveEvent, context: HandlerContext) {
  context.publish({
    id: `${event.key}:health`,
    type: "health.updated",
    title: "Vault health factor changed",
    description: `Observed health factor ${(Number(event.observedValue) / 1e18).toFixed(4)} for ${
      event.user ?? "unknown user"
    }.`,
    timestamp: new Date(event.timestamp).toISOString(),
    txHash: event.txHash,
    blockNumber: event.blockNumber ? Number(event.blockNumber) : undefined,
    metadata: {
      user: event.user ?? "0x0",
      observedValue: event.observedValue.toString(),
    },
  });

  const rules = await context.loadRules();
  const matchingRules = rules.filter((rule) => rule.trigger.kind === event.kindIndex);

  for (const rule of matchingRules) {
    const evaluation = evaluateRule(rule, event);
    if (!evaluation.matches) {
      continue;
    }

    context.metrics.increment("rulesMatched");
    const payload = encodeTriggerPayload(event);

    void context.queue
      .enqueue(`health-rule-${rule.id}`, async () => {
        context.metrics.increment("executionsAttempted");
        const result = await dispatchRuleExecution(context.dispatchDeps, rule.id, payload);
        context.metrics.recordLatency(result.latencyMs);

        if (result.success) {
          context.metrics.increment("executionsSucceeded");
          context.publish({
            id: `${event.key}:fired:${rule.id}`,
            type: "rule.fired",
            title: `Rule #${rule.id} executed`,
            description: `Health-factor trigger dispatched its action module on-chain.`,
            timestamp: new Date().toISOString(),
            ruleId: rule.id,
            txHash: result.txHash,
            metadata: {
              latencyMs: result.latencyMs,
            },
          });
          return;
        }

        context.metrics.increment("executionsFailed");
        context.publish({
          id: `${event.key}:failed:${rule.id}`,
          type: "rule.failed",
          title: `Rule #${rule.id} failed`,
          description: result.error ?? "Execution failed",
          timestamp: new Date().toISOString(),
          ruleId: rule.id,
        });
      })
      .catch((error) => {
        logger.error("Queued health rule failed permanently", {
          ruleId: rule.id,
          error: error instanceof Error ? error.message : String(error),
        });
      });
  }
}
