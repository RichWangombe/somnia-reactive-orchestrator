import * as fs from "node:fs/promises";
import * as path from "node:path";

import { ethers, network } from "hardhat";

type DeploymentFile = {
  addresses: Record<string, string>;
};

async function readDeployment(): Promise<DeploymentFile> {
  const filePath = path.resolve(__dirname, `../../../deployments/${network.name}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as DeploymentFile;
}

function resolvePriceArg() {
  const argIndex = process.argv.findIndex((arg) => arg === "--price");
  if (argIndex >= 0 && process.argv[argIndex + 1]) {
    return process.argv[argIndex + 1];
  }

  return process.env.PRICE ?? "0.75";
}

async function main() {
  const deployment = await readDeployment();
  const priceFeed = await ethers.getContractAt("MockPriceFeed", deployment.addresses.priceFeed);
  const nextPrice = resolvePriceArg();

  const tx = await priceFeed.setPrice(ethers.parseUnits(nextPrice, 18));
  await tx.wait();

  console.log(`Updated price feed to ${nextPrice}`);
  console.log(`Tx hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
