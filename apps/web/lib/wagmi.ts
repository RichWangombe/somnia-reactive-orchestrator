"use client";

import { somniaShannon } from "@rop/shared";
import { createConfig, http, injected } from "wagmi";
import { defineChain } from "viem";

import { clientEnv } from "./env";

const configuredChain =
  clientEnv.NEXT_PUBLIC_CHAIN_ID === somniaShannon.id
    ? somniaShannon
    : defineChain({
        id: clientEnv.NEXT_PUBLIC_CHAIN_ID,
        name: clientEnv.NEXT_PUBLIC_CHAIN_ID === 31337 ? "Local Hardhat" : `Chain ${clientEnv.NEXT_PUBLIC_CHAIN_ID}`,
        network: clientEnv.NEXT_PUBLIC_CHAIN_ID === 31337 ? "localhost" : `chain-${clientEnv.NEXT_PUBLIC_CHAIN_ID}`,
        nativeCurrency: {
          name: "ETH",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [clientEnv.NEXT_PUBLIC_RPC_URL],
          },
          public: {
            http: [clientEnv.NEXT_PUBLIC_RPC_URL],
          },
        },
      });

export const wagmiConfig = createConfig({
  chains: [configuredChain],
  connectors: [injected()],
  transports: {
    [configuredChain.id]: http(clientEnv.NEXT_PUBLIC_RPC_URL),
  },
});
