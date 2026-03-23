import { ruleRegistryAbi, reactiveExecutorAbi, mockPriceFeedAbi, mockVaultAbi, somniaShannon } from "@rop/shared";
import { createPublicClient, createWalletClient, defineChain, http, webSocket } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import type { WatcherConfig } from "./config";
import type { WatcherRule } from "./types/rules";

export function resolveChain(config: WatcherConfig) {
  if (config.chainId === somniaShannon.id) {
    return somniaShannon;
  }

  return defineChain({
    id: config.chainId,
    name: config.chainId === 31337 ? "Local Hardhat" : `Chain ${config.chainId}`,
    network: config.chainId === 31337 ? "localhost" : `chain-${config.chainId}`,
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [config.rpcUrl],
        webSocket: config.wsUrl ? [config.wsUrl] : [],
      },
      public: {
        http: [config.rpcUrl],
        webSocket: config.wsUrl ? [config.wsUrl] : [],
      },
    },
  });
}

export function createClients(config: WatcherConfig) {
  const chain = resolveChain(config);
  const publicClient = createPublicClient({
    chain,
    transport: config.wsUrl ? webSocket(config.wsUrl) : http(config.rpcUrl),
  });

  const walletClient = config.privateKey
    ? createWalletClient({
        account: privateKeyToAccount(config.privateKey),
        chain,
        transport: http(config.rpcUrl),
      })
    : null;

  return {
    chain,
    publicClient,
    walletClient,
    account: walletClient?.account ?? null,
  };
}

export async function loadRules(
  publicClient: ReturnType<typeof createClients>["publicClient"],
  ruleRegistry: `0x${string}`,
): Promise<WatcherRule[]> {
  const count = Number(
    await publicClient.readContract({
      address: ruleRegistry,
      abi: ruleRegistryAbi,
      functionName: "getRuleCount",
    }),
  );

  const rules: WatcherRule[] = [];
  for (let ruleId = 1; ruleId <= count; ruleId += 1) {
    const rule = (await publicClient.readContract({
      address: ruleRegistry,
      abi: ruleRegistryAbi,
      functionName: "getRule",
      args: [BigInt(ruleId)],
    })) as any;

    const stats = (await publicClient.readContract({
      address: ruleRegistry,
      abi: ruleRegistryAbi,
      functionName: "getExecutionStats",
      args: [BigInt(ruleId)],
    })) as readonly [bigint, number, number];

    rules.push({
      id: ruleId,
      owner: rule.owner,
      active: rule.active,
      trigger: {
        kind: Number(rule.trigger.kind),
        contractAddress: rule.trigger.contractAddress,
        topicFilters: rule.trigger.topicFilters as WatcherRule["trigger"]["topicFilters"],
        filterData: rule.trigger.filterData,
      },
      condition: {
        kind: Number(rule.condition.kind),
        threshold: rule.condition.threshold,
        auxData: rule.condition.auxData,
      },
      action: {
        kind: Number(rule.action.kind),
        moduleAddress: rule.action.moduleAddress,
        data: rule.action.data,
      },
      limits: {
        cooldownSeconds: Number(rule.limits.cooldownSeconds),
        maxExecutionsPerDay: Number(rule.limits.maxExecutionsPerDay),
      },
      metadata: {
        name: rule.metadata.name,
        templateKind: Number(rule.metadata.templateKind),
        createdAt: Number(rule.metadata.createdAt),
        updatedAt: Number(rule.metadata.updatedAt),
      },
      executionStats: {
        lastExecutedAt: Number(stats[0]),
        executionsToday: Number(stats[1]),
        currentDayBucket: Number(stats[2]),
      },
    });
  }

  return rules;
}

export async function readLatestPrice(
  publicClient: ReturnType<typeof createClients>["publicClient"],
  priceFeed: `0x${string}`,
) {
  return publicClient.readContract({
    address: priceFeed,
    abi: mockPriceFeedAbi,
    functionName: "latestPrice",
  });
}

export async function readHealthFactor(
  publicClient: ReturnType<typeof createClients>["publicClient"],
  vault: `0x${string}`,
  user: `0x${string}`,
) {
  return publicClient.readContract({
    address: vault,
    abi: mockVaultAbi,
    functionName: "getHealthFactor",
    args: [user],
  });
}

export { mockPriceFeedAbi, mockVaultAbi, reactiveExecutorAbi };
