import { describe, expect, it } from "vitest";

import { encodeTriggerPayload, evaluateRule } from "../src/evaluator";
import type { NormalizedReactiveEvent } from "../src/types/events";
import type { WatcherRule } from "../src/types/rules";

const baseRule: WatcherRule = {
  id: 1,
  owner: "0x1111111111111111111111111111111111111111",
  active: true,
  trigger: {
    kind: 0,
    contractAddress: "0x2222222222222222222222222222222222222222",
    topicFilters: [
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    ],
    filterData: "0x",
  },
  condition: {
    kind: 0,
    threshold: 820000000000000000n,
    auxData: "0x",
  },
  action: {
    kind: 0,
    moduleAddress: "0x3333333333333333333333333333333333333333",
    data: "0x",
  },
  limits: {
    cooldownSeconds: 60,
    maxExecutionsPerDay: 4,
  },
  metadata: {
    name: "Guardian",
    templateKind: 0,
    createdAt: 0,
    updatedAt: 0,
  },
  executionStats: {
    lastExecutedAt: 0,
    executionsToday: 0,
    currentDayBucket: 0,
  },
};

const matchingEvent: NormalizedReactiveEvent = {
  kind: "PRICE_UPDATED",
  kindIndex: 0,
  key: "price:1",
  contractAddress: "0x2222222222222222222222222222222222222222",
  observedValue: 790000000000000000n,
  auxiliaryValue: 1000000000000000000n,
  timestamp: Date.now(),
};

describe("evaluateRule", () => {
  it("matches when the observed value crosses the threshold", () => {
    const result = evaluateRule(baseRule, matchingEvent);
    expect(result.matches).toBe(true);
  });

  it("rejects events from the wrong emitter", () => {
    const result = evaluateRule(baseRule, {
      ...matchingEvent,
      contractAddress: "0x4444444444444444444444444444444444444444",
    });
    expect(result.matches).toBe(false);
    expect(result.reason).toContain("Emitter");
  });

  it("encodes deterministic trigger payloads", () => {
    const payload = encodeTriggerPayload(matchingEvent);
    expect(payload.startsWith("0x")).toBe(true);
    expect(payload.length).toBeGreaterThan(10);
  });
});
