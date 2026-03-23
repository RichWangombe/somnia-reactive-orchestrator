import type { WatcherFeedEvent } from "@rop/shared";

export type WatcherRule = {
  id: number;
  owner: `0x${string}`;
  active: boolean;
  trigger: {
    kind: number;
    contractAddress: `0x${string}`;
    topicFilters: readonly [`0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`];
    filterData: `0x${string}`;
  };
  condition: {
    kind: number;
    threshold: bigint;
    auxData: `0x${string}`;
  };
  action: {
    kind: number;
    moduleAddress: `0x${string}`;
    data: `0x${string}`;
  };
  limits: {
    cooldownSeconds: number;
    maxExecutionsPerDay: number;
  };
  metadata: {
    name: string;
    templateKind: number;
    createdAt: number;
    updatedAt: number;
  };
  executionStats: {
    lastExecutedAt: number;
    executionsToday: number;
    currentDayBucket: number;
  };
};

export type MatchEvaluation = {
  matches: boolean;
  reason: string;
  observedValue?: bigint;
};

export type PublishFeedEvent = (event: WatcherFeedEvent) => void;
