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

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployment = await readDeployment();
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();

  const asset = await ethers.getContractAt("MockERC20", deployment.addresses.assetToken);
  const priceFeed = await ethers.getContractAt("MockPriceFeed", deployment.addresses.priceFeed);
  const vault = await ethers.getContractAt("MockVault", deployment.addresses.vault);
  const registry = await ethers.getContractAt("RuleRegistry", deployment.addresses.ruleRegistry);

  const depositAmount = ethers.parseUnits("100", 18);
  await (await asset.mint(deployer.address, ethers.parseUnits("1000", 18))).wait();
  await (await asset.approve(await vault.getAddress(), depositAmount)).wait();
  await (await vault.deposit(depositAmount)).wait();
  await (await priceFeed.setPrice(ethers.parseUnits("1", 18))).wait();

  const trigger = {
    kind: 0,
    contractAddress: await priceFeed.getAddress(),
    topicFilters: [
      ethers.id("PriceUpdated(uint256,uint256,uint256)"),
      ethers.ZeroHash,
      ethers.ZeroHash,
      ethers.ZeroHash,
    ],
    filterData: "0x",
  } as const;

  const condition = {
    kind: 0,
    threshold: ethers.parseUnits("0.82", 18),
    auxData: "0x",
  } as const;

  const action = {
    kind: 0,
    moduleAddress: deployment.addresses.actionWithdrawModule,
    data: abiCoder.encode(
      ["address", "address", "address", "uint256"],
      [deployment.addresses.vault, deployer.address, deployer.address, ethers.parseUnits("25", 18)],
    ),
  } as const;

  const limits = {
    cooldownSeconds: 60,
    maxExecutionsPerDay: 5,
  } as const;

  await (await registry.createRule(trigger, condition, action, limits, "Seeded Guardian", 0)).wait();

  console.log("Seeded demo vault position and guardian rule for", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
