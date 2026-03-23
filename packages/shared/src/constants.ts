import { defineChain, zeroHash } from "viem";

export const SOMNIA_CHAIN_ID = 50312;
export const LOCAL_CHAIN_ID = 31337;

export const somniaShannon = defineChain({
  id: SOMNIA_CHAIN_ID,
  name: "Somnia Shannon Testnet",
  network: "somnia-shannon",
  nativeCurrency: {
    name: "STT",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://dream-rpc.somnia.network/"],
      webSocket: ["ws://api.infra.testnet.somnia.network/ws"],
    },
    public: {
      http: ["https://dream-rpc.somnia.network/"],
      webSocket: ["ws://api.infra.testnet.somnia.network/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Shannon Explorer",
      url: "https://shannon-explorer.somnia.network/",
    },
  },
  testnet: true,
});

export const watcherDefaultPort = 4100;
export const defaultWatcherUrl = `http://localhost:${watcherDefaultPort}`;
export const emptyTopicFilters = [zeroHash, zeroHash, zeroHash, zeroHash] as const;

export const triggerKindMap = {
  PRICE_UPDATED: 0,
  VAULT_HEALTH_CHANGED: 1,
  TOKEN_TRANSFER: 2,
  CUSTOM_EVENT: 3,
} as const;

export const conditionKindMap = {
  LT: 0,
  LTE: 1,
  GT: 2,
  GTE: 3,
  EQ: 4,
} as const;

export const actionKindMap = {
  WITHDRAW_FROM_VAULT: 0,
  SWAP_TO_STABLE: 1,
  EMIT_ONLY: 2,
} as const;

export const templateKindMap = {
  GUARDIAN: 0,
  TREASURY: 1,
  COMPOUND: 2,
} as const;

export const feedEventTypes = [
  "system",
  "price.updated",
  "health.updated",
  "rule.matched",
  "rule.fired",
  "rule.failed",
] as const;

export const guardianDefaults = {
  ruleName: "Guardian Vault Protection",
  thresholdPrice: "0.82",
  healthFactorThreshold: "1.15",
  cooldownSeconds: 60,
  maxExecutionsPerDay: 6,
  action: "WITHDRAW_FROM_VAULT" as const,
};
