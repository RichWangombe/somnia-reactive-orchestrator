import { isAddressEqual, zeroAddress } from "viem";

export type ContractAddresses = {
  ruleRegistry: `0x${string}`;
  reactiveExecutor: `0x${string}`;
  assetToken: `0x${string}`;
  stableToken: `0x${string}`;
  priceFeed: `0x${string}`;
  vault: `0x${string}`;
  dex: `0x${string}`;
  actionWithdrawModule: `0x${string}`;
  actionSwapModule: `0x${string}`;
  actionEmitModule: `0x${string}`;
};

export const emptyContractAddresses: ContractAddresses = {
  ruleRegistry: zeroAddress,
  reactiveExecutor: zeroAddress,
  assetToken: zeroAddress,
  stableToken: zeroAddress,
  priceFeed: zeroAddress,
  vault: zeroAddress,
  dex: zeroAddress,
  actionWithdrawModule: zeroAddress,
  actionSwapModule: zeroAddress,
  actionEmitModule: zeroAddress,
};

export function isConfiguredAddress(address: `0x${string}` | undefined | null): address is `0x${string}` {
  if (!address) {
    return false;
  }
  return !isAddressEqual(address, zeroAddress);
}

export function mergeAddresses(
  partial: Partial<ContractAddresses> | undefined,
): ContractAddresses {
  return {
    ...emptyContractAddresses,
    ...partial,
  };
}
