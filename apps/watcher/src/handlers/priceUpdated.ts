import type { WatcherFeedEvent } from "@rop/shared";

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

function buildFeedEvent(
  event: WatcherFeedEvent,
  publish: PublishFeedEvent,
) {
  publish(event);
}

export async function handlePriceUpdated(event: NormalizedReactiveEvent, context: HandlerContext) {
  buildFeedEvent(
    {
      id: `${event.key}:price`,
      type: "price.updated",
      title: "Price feed updated",
      description: `Observed collateral price ${(Number(event.observedValue) / 1e18).toFixed(4)}.`,
      timestamp: new Date(event.timestamp).toISOString(),
      txHash: event.txHash,
      blockNumber: event.blockNumber ? Number(event.blockNumber) : undefined,
      metadata: {
        observedValue: event.observedValue.toString(),
      },
    },
    context.publish,
  );

  const rules = await context.loadRules();
  const matchingRules = rules.filter((rule) => rule.trigger.kind === event.kindIndex);

  for (const rule of matchingRules) {
    const evaluation = evaluateRule(rule, event);
    if (!evaluation.matches) {
      continue;
    }

    context.metrics.increment("rulesMatched");
    const payload = encodeTriggerPayload(event);

    buildFeedEvent(
      {
        id: `${event.key}:match:${rule.id}`,
        type: "rule.matched",
        title: `Rule #${rule.id} matched`,
        description: `${rule.metadata.name} matched on a price move.`,
        timestamp: new Date().toISOString(),
        ruleId: rule.id,
        txHash: event.txHash,
        metadata: {
          threshold: rule.condition.threshold.toString(),
          observedValue: event.observedValue.toString(),
        },
      },
      context.publish,
    );

    void context.queue
      .enqueue(`price-rule-${rule.id}`, async () => {
        context.metrics.increment("executionsAttempted");
        const result = await dispatchRuleExecution(context.dispatchDeps, rule.id, payload);
        context.metrics.recordLatency(result.latencyMs);

        if (result.success) {
          context.metrics.increment("executionsSucceeded");
          buildFeedEvent(
            {
              id: `${event.key}:fired:${rule.id}`,
              type: "rule.fired",
              title: `Rule #${rule.id} executed`,
              description: `Guardian action submitted on-chain after the price threshold was crossed.`,
              timestamp: new Date().toISOString(),
              ruleId: rule.id,
              txHash: result.txHash,
              metadata: {
                latencyMs: result.latencyMs,
                actionModule: rule.action.moduleAddress,
              },
            },
            context.publish,
          );
          return;
        }

        context.metrics.increment("executionsFailed");
        buildFeedEvent(
          {
            id: `${event.key}:failed:${rule.id}`,
            type: "rule.failed",
            title: `Rule #${rule.id} failed`,
            description: result.error ?? "Execution failed",
            timestamp: new Date().toISOString(),
            ruleId: rule.id,
            metadata: {
              latencyMs: result.latencyMs,
            },
          },
          context.publish,
        );
      })
      .catch((error) => {
        logger.error("Queued price rule failed permanently", {
          ruleId: rule.id,
          error: error instanceof Error ? error.message : String(error),
        });
      });
  }
}
