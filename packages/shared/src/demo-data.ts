import type { WatcherFeedEvent } from "./event-schema";

export const templateCatalog = [
  {
    slug: "guardian",
    name: "Reactive Guardian",
    summary: "Protect a leveraged vault position when price or health factor breaks a threshold.",
    status: "live",
  },
  {
    slug: "treasury",
    name: "Treasury Threshold Rebalance",
    summary: "Rotate idle treasury balances into a stable reserve when balances spike or fall.",
    status: "upcoming",
  },
  {
    slug: "compound",
    name: "Auto-Compound Rewards",
    summary: "Sweep and redeploy emitted rewards without waiting for a bot or cron.",
    status: "upcoming",
  },
] as const;

export const sampleFeedEvents: WatcherFeedEvent[] = [
  {
    id: "feed-1",
    type: "price.updated",
    title: "Price feed moved",
    description: "MockPriceFeed published a new collateral price of 0.79 STT.",
    timestamp: new Date().toISOString(),
    metadata: {
      observedPrice: "0.79",
    },
  },
  {
    id: "feed-2",
    type: "rule.fired",
    title: "Guardian rule executed",
    description: "Rule #1 withdrew collateral to protect a vault from a sudden price drop.",
    timestamp: new Date().toISOString(),
    ruleId: 1,
    metadata: {
      latencyMs: 412,
      action: "WITHDRAW_FROM_VAULT",
    },
  },
];
