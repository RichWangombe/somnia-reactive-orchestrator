"use client";

import {
  isConfiguredAddress,
  mockPriceFeedAbi,
  mockVaultAbi,
  ruleRegistryAbi,
  actionKindMap,
  conditionKindMap,
  emptyTopicFilters,
  templateKindMap,
  type GuardianRuleForm,
} from "@rop/shared";
import { encodeAbiParameters, encodeEventTopics, parseEther, type PublicClient } from "viem";

import { appConfig } from "./config";

type GuardianCreateRequest = {
  label: string;
  args: [
    {
      kind: number;
      contractAddress: `0x${string}`;
      topicFilters: readonly [`0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`];
      filterData: `0x${string}`;
    },
    {
      kind: number;
      threshold: bigint;
      auxData: `0x${string}`;
    },
    {
      kind: number;
      moduleAddress: `0x${string}`;
      data: `0x${string}`;
    },
    {
      cooldownSeconds: bigint;
      maxExecutionsPerDay: bigint;
    },
    string,
    number,
  ];
};

function buildActionSpec(form: GuardianRuleForm, owner: `0x${string}`) {
  const recipient = (form.recipient || owner) as `0x${string}`;

  if (form.actionKind === "WITHDRAW_FROM_VAULT") {
    if (!isConfiguredAddress(appConfig.addresses.actionWithdrawModule)) {
      throw new Error("NEXT_PUBLIC_ACTION_WITHDRAW_MODULE is not configured.");
    }

    return {
      kind: actionKindMap.WITHDRAW_FROM_VAULT,
      moduleAddress: appConfig.addresses.actionWithdrawModule,
      data: encodeAbiParameters(
        [
          { type: "address", name: "vault" },
          { type: "address", name: "positionOwner" },
          { type: "address", name: "recipient" },
          { type: "uint256", name: "amount" },
        ],
        [form.vaultAddress as `0x${string}`, owner, recipient, parseEther(form.amount)],
      ),
    };
  }

  if (!isConfiguredAddress(appConfig.addresses.actionSwapModule) || !isConfiguredAddress(appConfig.addresses.dex)) {
    throw new Error("NEXT_PUBLIC_ACTION_SWAP_MODULE and NEXT_PUBLIC_MOCK_DEX_ADDRESS are required for swap rules.");
  }

  return {
    kind: actionKindMap.SWAP_TO_STABLE,
    moduleAddress: appConfig.addresses.actionSwapModule,
    data: encodeAbiParameters(
      [
        { type: "address", name: "vault" },
        { type: "address", name: "dex" },
        { type: "address", name: "positionOwner" },
        { type: "address", name: "recipient" },
        { type: "uint256", name: "amountIn" },
        { type: "uint256", name: "minAmountOut" },
      ],
      [
        form.vaultAddress as `0x${string}`,
        appConfig.addresses.dex,
        owner,
        recipient,
        parseEther(form.amount),
        parseEther(form.minAmountOut),
      ],
    ),
  };
}

export function buildGuardianRuleRequests(form: GuardianRuleForm, owner: `0x${string}`): GuardianCreateRequest[] {
  const action = buildActionSpec(form, owner);
  const limits = {
    cooldownSeconds: BigInt(form.cooldownSeconds),
    maxExecutionsPerDay: BigInt(form.maxExecutionsPerDay),
  } as const;

  const priceTopic = encodeEventTopics({
    abi: mockPriceFeedAbi,
    eventName: "PriceUpdated",
  })[0];

  const healthTopic = encodeEventTopics({
    abi: mockVaultAbi,
    eventName: "HealthFactorChanged",
  })[0];

  const priceRequest: GuardianCreateRequest = {
    label: "Price guardian",
    args: [
      {
        kind: 0,
        contractAddress: form.priceFeedAddress as `0x${string}`,
        topicFilters: [priceTopic, emptyTopicFilters[1], emptyTopicFilters[2], emptyTopicFilters[3]],
        filterData: "0x",
      },
      {
        kind: conditionKindMap.LT,
        threshold: parseEther(form.thresholdPrice),
        auxData: "0x",
      },
      action,
      limits,
      `${form.name} / Price`,
      templateKindMap.GUARDIAN,
    ],
  };

  const healthRequest: GuardianCreateRequest = {
    label: "Health guardian",
    args: [
      {
        kind: 1,
        contractAddress: form.vaultAddress as `0x${string}`,
        topicFilters: [healthTopic, emptyTopicFilters[1], emptyTopicFilters[2], emptyTopicFilters[3]],
        filterData: "0x",
      },
      {
        kind: conditionKindMap.LT,
        threshold: parseEther(form.healthFactorThreshold),
        auxData: "0x",
      },
      action,
      limits,
      `${form.name} / Health`,
      templateKindMap.GUARDIAN,
    ],
  };

  return [priceRequest, healthRequest];
}

export async function fetchRulesByOwner(publicClient: PublicClient, owner: `0x${string}`) {
  if (!isConfiguredAddress(appConfig.addresses.ruleRegistry)) {
    return [];
  }

  const ruleIds = await publicClient.readContract({
    address: appConfig.addresses.ruleRegistry,
    abi: ruleRegistryAbi,
    functionName: "getRulesByOwner",
    args: [owner],
  });

  const rules = await Promise.all(
    ruleIds.map(async (ruleId) => {
      const [rule, stats] = await Promise.all([
        publicClient.readContract({
          address: appConfig.addresses.ruleRegistry,
          abi: ruleRegistryAbi,
          functionName: "getRule",
          args: [ruleId],
        }),
        publicClient.readContract({
          address: appConfig.addresses.ruleRegistry,
          abi: ruleRegistryAbi,
          functionName: "getExecutionStats",
          args: [ruleId],
        }),
      ]);

      return {
        id: Number(ruleId),
        rule,
        stats,
      };
    }),
  );

  return rules;
}
