import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { mergeAddresses, watcherDefaultPort, type ContractAddresses } from "@rop/shared";
import * as dotenv from "dotenv";
import { z } from "zod";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const WATCHER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

dotenv.config({ path: path.join(ROOT_DIR, ".env") });
dotenv.config({ path: path.join(WATCHER_DIR, ".env") });
dotenv.config({ path: path.join(WATCHER_DIR, ".env.local"), override: true });

const envSchema = z.object({
  SOMNIA_RPC_URL: z.string().url().default("https://dream-rpc.somnia.network/"),
  SOMNIA_WS_URL: z.string().url().optional(),
  SOMNIA_CHAIN_ID: z.coerce.number().default(50312),
  PRIVATE_KEY_WATCHER: z.string().optional(),
  REACTIVITY_WS_URL: z.string().url().optional(),
  REACTIVITY_API_KEY: z.string().optional(),
  MOCK_MODE: z
    .string()
    .optional()
    .transform((value) => value === undefined || value === "true"),
  WATCHER_API_PORT: z.coerce.number().default(watcherDefaultPort),
  WATCHER_ALLOWED_ORIGIN: z.string().default("http://localhost:3000"),
  RULE_REGISTRY_ADDRESS: z.string().optional(),
  REACTIVE_EXECUTOR_ADDRESS: z.string().optional(),
  MOCK_PRICE_FEED_ADDRESS: z.string().optional(),
  MOCK_VAULT_ADDRESS: z.string().optional(),
  WATCHER_OBSERVED_USER: z.string().optional(),
});

function normalizePrivateKey(privateKey?: string): `0x${string}` | undefined {
  if (!privateKey) {
    return undefined;
  }
  return (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as `0x${string}`;
}

async function readDeploymentAddresses(networkName: string): Promise<Partial<ContractAddresses> | undefined> {
  try {
    const filePath = path.join(ROOT_DIR, "deployments", `${networkName}.json`);
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as { addresses?: Partial<ContractAddresses> };
    return parsed.addresses;
  } catch {
    return undefined;
  }
}

export type WatcherConfig = {
  rpcUrl: string;
  wsUrl?: string;
  chainId: number;
  privateKey?: `0x${string}`;
  reactivityWsUrl?: string;
  reactivityApiKey?: string;
  mockMode: boolean;
  apiPort: number;
  allowedOrigin: string;
  idempotencyFile: string;
  addresses: ContractAddresses;
  observedUser?: `0x${string}`;
};

export async function loadConfig(): Promise<WatcherConfig> {
  const env = envSchema.parse(process.env);
  const deploymentName = env.SOMNIA_CHAIN_ID === 31337 ? "localhost" : "somniaTestnet";
  const deploymentAddresses = await readDeploymentAddresses(deploymentName);

  const addresses = mergeAddresses({
    ...deploymentAddresses,
    ruleRegistry: (env.RULE_REGISTRY_ADDRESS ?? deploymentAddresses?.ruleRegistry) as `0x${string}` | undefined,
    reactiveExecutor: (env.REACTIVE_EXECUTOR_ADDRESS ??
      deploymentAddresses?.reactiveExecutor) as `0x${string}` | undefined,
    priceFeed: (env.MOCK_PRICE_FEED_ADDRESS ?? deploymentAddresses?.priceFeed) as `0x${string}` | undefined,
    vault: (env.MOCK_VAULT_ADDRESS ?? deploymentAddresses?.vault) as `0x${string}` | undefined,
  });

  return {
    rpcUrl: env.SOMNIA_RPC_URL,
    wsUrl: env.SOMNIA_WS_URL,
    chainId: env.SOMNIA_CHAIN_ID,
    privateKey: normalizePrivateKey(env.PRIVATE_KEY_WATCHER),
    reactivityWsUrl: env.REACTIVITY_WS_URL,
    reactivityApiKey: env.REACTIVITY_API_KEY,
    mockMode: env.MOCK_MODE,
    apiPort: env.WATCHER_API_PORT,
    allowedOrigin: env.WATCHER_ALLOWED_ORIGIN,
    idempotencyFile: path.join(ROOT_DIR, ".cache", "watcher-idempotency.json"),
    addresses,
    observedUser: env.WATCHER_OBSERVED_USER as `0x${string}` | undefined,
  };
}
