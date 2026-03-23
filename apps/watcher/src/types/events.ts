import type { Hex } from "viem";

export type ReactiveEventKind = "PRICE_UPDATED" | "VAULT_HEALTH_CHANGED";

export type NormalizedReactiveEvent = {
  kind: ReactiveEventKind;
  kindIndex: number;
  key: string;
  contractAddress: `0x${string}`;
  observedValue: bigint;
  auxiliaryValue?: bigint;
  user?: `0x${string}`;
  txHash?: Hex;
  blockNumber?: bigint;
  timestamp: number;
  raw?: unknown;
};
