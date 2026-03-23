import * as fs from "node:fs/promises";
import * as path from "node:path";

import { ethers, network } from "hardhat";

type DeploymentRecord = {
  network: string;
  chainId: number;
  deployer: string;
  deployedAt: string;
  addresses: Record<string, string>;
};

async function writeDeployment(record: DeploymentRecord) {
  const deploymentsDir = path.resolve(__dirname, "../../../deployments");
  await fs.mkdir(deploymentsDir, { recursive: true });
  await fs.writeFile(
    path.join(deploymentsDir, `${record.network}.json`),
    `${JSON.stringify(record, null, 2)}\n`,
    "utf8",
  );
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const trustedWatcher = process.env.TRUSTED_WATCHER ?? deployer.address;

  const asset = await ethers.deployContract("MockERC20", ["Guardian Asset", "GAST"]);
  await asset.waitForDeployment();

  const stable = await ethers.deployContract("MockStablecoin");
  await stable.waitForDeployment();

  const priceFeed = await ethers.deployContract("MockPriceFeed", [ethers.parseUnits("1", 18)]);
  await priceFeed.waitForDeployment();

  const vault = await ethers.deployContract("MockVault", [await asset.getAddress(), await priceFeed.getAddress()]);
  await vault.waitForDeployment();

  const dex = await ethers.deployContract("MockDEX", [
    await asset.getAddress(),
    await stable.getAddress(),
    await priceFeed.getAddress(),
  ]);
  await dex.waitForDeployment();

  const withdrawModule = await ethers.deployContract("ActionWithdrawFromVault");
  await withdrawModule.waitForDeployment();

  const swapModule = await ethers.deployContract("ActionSwapToStable");
  await swapModule.waitForDeployment();

  const emitModule = await ethers.deployContract("ActionEmitOnly");
  await emitModule.waitForDeployment();

  const registry = await ethers.deployContract("RuleRegistry");
  await registry.waitForDeployment();

  const executor = await ethers.deployContract("ReactiveExecutor", [await registry.getAddress(), trustedWatcher]);
  await executor.waitForDeployment();

  await (await registry.setExecutor(await executor.getAddress())).wait();
  await (await vault.setOperator(await withdrawModule.getAddress(), true)).wait();
  await (await vault.setOperator(await swapModule.getAddress(), true)).wait();
  await (await stable.setOperator(await dex.getAddress(), true)).wait();

  const record: DeploymentRecord = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    addresses: {
      ruleRegistry: await registry.getAddress(),
      reactiveExecutor: await executor.getAddress(),
      assetToken: await asset.getAddress(),
      stableToken: await stable.getAddress(),
      priceFeed: await priceFeed.getAddress(),
      vault: await vault.getAddress(),
      dex: await dex.getAddress(),
      actionWithdrawModule: await withdrawModule.getAddress(),
      actionSwapModule: await swapModule.getAddress(),
      actionEmitModule: await emitModule.getAddress(),
    },
  };

  await writeDeployment(record);
  console.log(`Deployed Somnia ROP demo to ${network.name}`);
  console.log(record);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
