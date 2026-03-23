import { mergeAddresses } from "@rop/shared";

import { clientEnv } from "./env";

export const appConfig = {
  chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
  rpcUrl: clientEnv.NEXT_PUBLIC_RPC_URL,
  wsUrl: clientEnv.NEXT_PUBLIC_WS_URL,
  watcherUrl: clientEnv.NEXT_PUBLIC_WATCHER_URL,
  mockMode: clientEnv.NEXT_PUBLIC_MOCK_MODE,
  addresses: mergeAddresses({
    ruleRegistry: clientEnv.NEXT_PUBLIC_RULE_REGISTRY_ADDRESS as `0x${string}`,
    reactiveExecutor: clientEnv.NEXT_PUBLIC_REACTIVE_EXECUTOR_ADDRESS as `0x${string}`,
    priceFeed: clientEnv.NEXT_PUBLIC_MOCK_PRICE_FEED_ADDRESS as `0x${string}`,
    vault: clientEnv.NEXT_PUBLIC_MOCK_VAULT_ADDRESS as `0x${string}`,
    dex: clientEnv.NEXT_PUBLIC_MOCK_DEX_ADDRESS as `0x${string}`,
    actionWithdrawModule: clientEnv.NEXT_PUBLIC_ACTION_WITHDRAW_MODULE as `0x${string}`,
    actionSwapModule: clientEnv.NEXT_PUBLIC_ACTION_SWAP_MODULE as `0x${string}`,
  }),
};
