import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { verifyEnv } from "./verify-env";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function printCommands() {
  console.log("");
  console.log("Local MOCK_MODE flow");
  console.log("1. pnpm install");
  console.log("2. pnpm --filter @rop/contracts exec hardhat node");
  console.log("3. pnpm deploy:local");
  console.log("4. pnpm seed:demo");
  console.log("5. Copy addresses from deployments\\localhost.json into apps\\web\\.env.local and apps\\watcher\\.env.local");
  console.log("6. Set PRIVATE_KEY_WATCHER in apps\\watcher\\.env.local to a funded local account");
  console.log("7. pnpm dev:watcher");
  console.log("8. pnpm dev:web");
  console.log("");
  console.log("Somnia TESTNET flow");
  console.log("1. Fill .env with SOMNIA_RPC_URL, PRIVATE_KEY_DEPLOYER, PRIVATE_KEY_WATCHER");
  console.log("2. pnpm deploy:testnet");
  console.log("3. Copy deployments\\somniaTestnet.json addresses into apps\\web\\.env.local and apps\\watcher\\.env.local");
  console.log("4. pnpm dev:watcher");
  console.log("5. pnpm dev:web");
  console.log("");
}

async function main() {
  const status = await verifyEnv();

  console.log("ROP guided demo launcher");
  console.log(`Workspace root: ${ROOT_DIR}`);
  console.log(`Root .env present: ${status.hasRootEnv ? "yes" : "no"}`);
  console.log(
    `Detected deployment artifacts: ${status.deploymentFiles.length > 0 ? status.deploymentFiles.join(", ") : "none"}`,
  );

  printCommands();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
