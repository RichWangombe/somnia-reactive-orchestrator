import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_CHAIN_ID: z.coerce.number().default(50312),
  NEXT_PUBLIC_RPC_URL: z.string().url().default("https://dream-rpc.somnia.network/"),
  NEXT_PUBLIC_WS_URL: z.string().url().optional(),
  NEXT_PUBLIC_RULE_REGISTRY_ADDRESS: z.string().default("0x0000000000000000000000000000000000000000"),
  NEXT_PUBLIC_REACTIVE_EXECUTOR_ADDRESS: z.string().default("0x0000000000000000000000000000000000000000"),
  NEXT_PUBLIC_MOCK_PRICE_FEED_ADDRESS: z.string().default("0x0000000000000000000000000000000000000000"),
  NEXT_PUBLIC_MOCK_VAULT_ADDRESS: z.string().default("0x0000000000000000000000000000000000000000"),
  NEXT_PUBLIC_MOCK_DEX_ADDRESS: z.string().default("0x0000000000000000000000000000000000000000"),
  NEXT_PUBLIC_ACTION_WITHDRAW_MODULE: z.string().default("0x0000000000000000000000000000000000000000"),
  NEXT_PUBLIC_ACTION_SWAP_MODULE: z.string().default("0x0000000000000000000000000000000000000000"),
  NEXT_PUBLIC_WATCHER_URL: z.string().url().default("http://localhost:4100"),
  NEXT_PUBLIC_MOCK_MODE: z
    .string()
    .optional()
    .transform((value) => value === undefined || value === "true"),
});

export const clientEnv = envSchema.parse(process.env);
