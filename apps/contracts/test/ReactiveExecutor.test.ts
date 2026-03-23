import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

async function deployFixture() {
  const [deployer, watcher, user, other] = await ethers.getSigners();
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();

  const asset = await ethers.deployContract("MockERC20", ["Guardian Asset", "GAST"]);
  const stable = await ethers.deployContract("MockStablecoin");
  const priceFeed = await ethers.deployContract("MockPriceFeed", [ethers.parseUnits("1", 18)]);
  const vault = await ethers.deployContract("MockVault", [await asset.getAddress(), await priceFeed.getAddress()]);
  const dex = await ethers.deployContract("MockDEX", [
    await asset.getAddress(),
    await stable.getAddress(),
    await priceFeed.getAddress(),
  ]);
  const withdrawModule = await ethers.deployContract("ActionWithdrawFromVault");
  const swapModule = await ethers.deployContract("ActionSwapToStable");
  const emitModule = await ethers.deployContract("ActionEmitOnly");
  const registry = await ethers.deployContract("RuleRegistry");
  const executor = await ethers.deployContract("ReactiveExecutor", [await registry.getAddress(), watcher.address]);

  await registry.setExecutor(await executor.getAddress());
  await vault.setOperator(await withdrawModule.getAddress(), true);
  await vault.setOperator(await swapModule.getAddress(), true);
  await stable.setOperator(await dex.getAddress(), true);

  await asset.mint(user.address, ethers.parseUnits("200", 18));
  await asset.connect(user).approve(await vault.getAddress(), ethers.parseUnits("100", 18));
  await vault.connect(user).deposit(ethers.parseUnits("100", 18));

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

  const withdrawAction = {
    kind: 0,
    moduleAddress: await withdrawModule.getAddress(),
    data: abiCoder.encode(
      ["address", "address", "address", "uint256"],
      [await vault.getAddress(), user.address, user.address, ethers.parseUnits("20", 18)],
    ),
  } as const;

  const swapAction = {
    kind: 1,
    moduleAddress: await swapModule.getAddress(),
    data: abiCoder.encode(
      ["address", "address", "address", "address", "uint256", "uint256"],
      [
        await vault.getAddress(),
        await dex.getAddress(),
        user.address,
        user.address,
        ethers.parseUnits("10", 18),
        ethers.parseUnits("5", 18),
      ],
    ),
  } as const;

  const emitAction = {
    kind: 2,
    moduleAddress: await emitModule.getAddress(),
    data: "0x1234",
  } as const;

  const cooldownRuleLimits = {
    cooldownSeconds: 60,
    maxExecutionsPerDay: 5,
  } as const;

  const dailyRuleLimits = {
    cooldownSeconds: 0,
    maxExecutionsPerDay: 1,
  } as const;

  await registry.connect(user).createRule(trigger, condition, withdrawAction, cooldownRuleLimits, "Withdraw", 0);
  await registry.connect(user).createRule(trigger, condition, emitAction, cooldownRuleLimits, "Emit", 0);
  await registry.connect(user).createRule(trigger, condition, swapAction, dailyRuleLimits, "Swap", 0);

  return {
    watcher,
    user,
    other,
    asset,
    stable,
    registry,
    executor,
  };
}

describe("ReactiveExecutor", () => {
  it("allows only the trusted watcher to fire rules", async () => {
    const { executor, other } = await loadFixture(deployFixture);

    await expect(executor.connect(other).fire(1, "0x1234")).to.be.revertedWithCustomError(
      executor,
      "NotTrustedWatcher",
    );
  });

  it("executes a withdrawal action and enforces cooldown", async () => {
    const { executor, watcher, user, asset } = await loadFixture(deployFixture);

    const beforeBalance = await asset.balanceOf(user.address);
    await expect(executor.connect(watcher).fire(1, "0xaaaa")).to.emit(executor, "RuleFired");

    const afterBalance = await asset.balanceOf(user.address);
    expect(afterBalance - beforeBalance).to.equal(ethers.parseUnits("20", 18));

    await expect(executor.connect(watcher).fire(1, "0xbbbb")).to.be.revertedWithCustomError(
      executor,
      "CooldownActive",
    );

    await time.increase(61);
    await expect(executor.connect(watcher).fire(1, "0xcccc")).to.emit(executor, "RuleFired");
  });

  it("tracks daily execution limits and rule inactivity", async () => {
    const { executor, watcher, registry, user, stable } = await loadFixture(deployFixture);

    const stableBefore = await stable.balanceOf(user.address);
    await expect(executor.connect(watcher).fire(3, "0x11")).to.emit(executor, "RuleFired");
    const stableAfter = await stable.balanceOf(user.address);
    expect(stableAfter - stableBefore).to.equal(ethers.parseUnits("10", 18));

    await expect(executor.connect(watcher).fire(3, "0x22")).to.be.revertedWithCustomError(
      executor,
      "DailyLimitReached",
    );

    await registry.connect(user).setRuleActive(2, false);
    await expect(executor.connect(watcher).fire(2, "0x33")).to.be.revertedWithCustomError(
      executor,
      "RuleInactive",
    );
  });
});
