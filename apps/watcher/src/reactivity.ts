import { encodeEventTopics, encodeFunctionData, decodeEventLog, decodeFunctionResult } from "viem";
import { mockPriceFeedAbi, mockVaultAbi } from "@rop/shared";

import type { createClients } from "./contracts";
import type { WatcherConfig } from "./config";
import { logger } from "./logger";
import { startMockModeSubscriptions } from "./mock-mode";
import type { NormalizedReactiveEvent } from "./types/events";

type EventHandler = (event: NormalizedReactiveEvent) => Promise<void> | void;

type ReactivityDependencies = {
  config: WatcherConfig;
  publicClient: ReturnType<typeof createClients>["publicClient"];
  onEvent: EventHandler;
};

function createEventKey(prefix: string, data: unknown) {
  return `${prefix}:${JSON.stringify(data)}`;
}

async function startSomniaSubscriptions({
  config,
  publicClient,
  onEvent,
}: ReactivityDependencies): Promise<() => Promise<void>> {
  const { SDK } = await import("@somnia-chain/reactivity");
  const sdk: any = new SDK({ public: publicClient as never });
  const subscriptions: Array<{ unsubscribe: () => Promise<void> | void }> = [];

  const priceTopic = encodeEventTopics({
    abi: mockPriceFeedAbi,
    eventName: "PriceUpdated",
  })[0];

  const healthTopic = encodeEventTopics({
    abi: mockVaultAbi,
    eventName: "HealthFactorChanged",
  })[0];

  const priceSubscription: any = await sdk.subscribe({
    emitter: config.addresses.priceFeed,
    eventTopics: [priceTopic],
    ethCalls: [
      {
        to: config.addresses.priceFeed,
        data: encodeFunctionData({
          abi: mockPriceFeedAbi,
          functionName: "latestPrice",
        }),
      },
    ],
    onData: (data: any) => {
      const decoded = decodeEventLog({
        abi: mockPriceFeedAbi,
        topics: data.result.topics,
        data: data.result.data,
      }) as any;

      const bundledValue =
        data.result.simulationResults?.[0] !== undefined
          ? decodeFunctionResult({
              abi: mockPriceFeedAbi,
              functionName: "latestPrice",
              data: data.result.simulationResults[0],
            })
          : BigInt(decoded.args.newPrice);

      void onEvent({
        kind: "PRICE_UPDATED",
        kindIndex: 0,
        key: createEventKey("price", {
          txHash: data.result.transactionHash,
          logIndex: data.result.logIndex,
          newPrice: decoded.args.newPrice.toString(),
        }),
        contractAddress: config.addresses.priceFeed,
        observedValue: BigInt(bundledValue),
        auxiliaryValue: BigInt(decoded.args.oldPrice),
        txHash: data.result.transactionHash,
        blockNumber: data.result.blockNumber,
        timestamp: Date.now(),
        raw: data,
      });
    },
  });
  subscriptions.push(priceSubscription);

  const healthEthCalls = config.observedUser
    ? [
        {
          to: config.addresses.vault,
          data: encodeFunctionData({
            abi: mockVaultAbi,
            functionName: "getHealthFactor",
            args: [config.observedUser],
          }),
        },
      ]
    : [];

  const healthSubscription: any = await sdk.subscribe({
    emitter: config.addresses.vault,
    eventTopics: [healthTopic],
    ethCalls: healthEthCalls,
    onData: (data: any) => {
      const decoded = decodeEventLog({
        abi: mockVaultAbi,
        topics: data.result.topics,
        data: data.result.data,
      }) as any;

      const bundledValue =
        config.observedUser && data.result.simulationResults?.[0] !== undefined
          ? decodeFunctionResult({
              abi: mockVaultAbi,
              functionName: "getHealthFactor",
              data: data.result.simulationResults[0],
            })
          : BigInt(decoded.args.newHealthFactor);

      void onEvent({
        kind: "VAULT_HEALTH_CHANGED",
        kindIndex: 1,
        key: createEventKey("health", {
          txHash: data.result.transactionHash,
          logIndex: data.result.logIndex,
          user: decoded.args.user,
          newHealthFactor: decoded.args.newHealthFactor.toString(),
        }),
        contractAddress: config.addresses.vault,
        observedValue: BigInt(bundledValue),
        auxiliaryValue: BigInt(decoded.args.oldHealthFactor),
        user: decoded.args.user,
        txHash: data.result.transactionHash,
        blockNumber: data.result.blockNumber,
        timestamp: Date.now(),
        raw: data,
      });
    },
  });
  subscriptions.push(healthSubscription);

  logger.info("Somnia Reactivity subscriptions started", {
    mode: "real",
    priceFeed: config.addresses.priceFeed,
    vault: config.addresses.vault,
  });

  return async () => {
    for (const subscription of subscriptions) {
      await subscription.unsubscribe();
    }
  };
}

export async function startReactivity(deps: ReactivityDependencies): Promise<() => Promise<void> | void> {
  if (deps.config.mockMode) {
    logger.info("Starting watcher in mock reactivity mode");
    return startMockModeSubscriptions(deps);
  }

  logger.info("Starting watcher in Somnia Reactivity mode");
  return startSomniaSubscriptions(deps);
}
