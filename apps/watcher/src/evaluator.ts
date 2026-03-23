import { isAddressEqual, keccak256, stringToHex, zeroAddress, encodeAbiParameters } from "viem";

import type { NormalizedReactiveEvent } from "./types/events";
import type { MatchEvaluation, WatcherRule } from "./types/rules";

function compare(conditionKind: number, observedValue: bigint, threshold: bigint): boolean {
  switch (conditionKind) {
    case 0:
      return observedValue < threshold;
    case 1:
      return observedValue <= threshold;
    case 2:
      return observedValue > threshold;
    case 3:
      return observedValue >= threshold;
    case 4:
      return observedValue === threshold;
    default:
      return false;
  }
}

export function evaluateRule(rule: WatcherRule, event: NormalizedReactiveEvent): MatchEvaluation {
  if (!rule.active) {
    return { matches: false, reason: "Rule inactive" };
  }

  if (rule.trigger.kind !== event.kindIndex) {
    return { matches: false, reason: "Trigger kind mismatch" };
  }

  if (!isAddressEqual(rule.trigger.contractAddress, event.contractAddress)) {
    return { matches: false, reason: "Emitter mismatch" };
  }

  if (!compare(rule.condition.kind, event.observedValue, rule.condition.threshold)) {
    return {
      matches: false,
      reason: "Condition did not pass",
      observedValue: event.observedValue,
    };
  }

  return {
    matches: true,
    reason: "Condition matched",
    observedValue: event.observedValue,
  };
}

export function encodeTriggerPayload(event: NormalizedReactiveEvent): `0x${string}` {
  return encodeAbiParameters(
    [
      { name: "triggerKind", type: "uint8" },
      { name: "contractAddress", type: "address" },
      { name: "user", type: "address" },
      { name: "observedValue", type: "uint256" },
      { name: "auxiliaryValue", type: "uint256" },
      { name: "blockNumber", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "eventKeyHash", type: "bytes32" },
    ],
    [
      event.kindIndex,
      event.contractAddress,
      event.user ?? zeroAddress,
      event.observedValue,
      event.auxiliaryValue ?? 0n,
      event.blockNumber ?? 0n,
      BigInt(event.timestamp),
      keccak256(stringToHex(event.key)),
    ],
  );
}
