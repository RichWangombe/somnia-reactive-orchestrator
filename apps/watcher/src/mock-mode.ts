import { mockPriceFeedAbi, mockVaultAbi } from "@rop/shared";

import type { createClients } from "./contracts";
import type { NormalizedReactiveEvent } from "./types/events";
import type { WatcherConfig } from "./config";

type EventHandler = (event: NormalizedReactiveEvent) => Promise<void> | void;

type MockModeDependencies = {
  config: WatcherConfig;
  publicClient: ReturnType<typeof createClients>["publicClient"];
  onEvent: EventHandler;
};

export function startMockModeSubscriptions({ config, publicClient, onEvent }: MockModeDependencies) {
  const unwatchers: Array<() => void> = [];

  unwatchers.push(
    publicClient.watchContractEvent({
      address: config.addresses.priceFeed,
      abi: mockPriceFeedAbi,
      eventName: "PriceUpdated",
      onLogs: (logs) => {
        for (const log of logs) {
          void onEvent({
            kind: "PRICE_UPDATED",
            kindIndex: 0,
            key: `${log.transactionHash ?? "tx"}:${log.logIndex?.toString() ?? "0"}:price`,
            contractAddress: config.addresses.priceFeed,
            observedValue: BigInt(log.args.newPrice ?? 0n),
            auxiliaryValue: BigInt(log.args.oldPrice ?? 0n),
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: Date.now(),
            raw: log,
          });
        }
      },
    }),
  );

  unwatchers.push(
    publicClient.watchContractEvent({
      address: config.addresses.vault,
      abi: mockVaultAbi,
      eventName: "HealthFactorChanged",
      onLogs: (logs) => {
        for (const log of logs) {
          void onEvent({
            kind: "VAULT_HEALTH_CHANGED",
            kindIndex: 1,
            key: `${log.transactionHash ?? "tx"}:${log.logIndex?.toString() ?? "0"}:health`,
            contractAddress: config.addresses.vault,
            observedValue: BigInt(log.args.newHealthFactor ?? 0n),
            auxiliaryValue: BigInt(log.args.oldHealthFactor ?? 0n),
            user: log.args.user,
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: Date.now(),
            raw: log,
          });
        }
      },
    }),
  );

  return () => {
    for (const unwatch of unwatchers) {
      unwatch();
    }
  };
}
