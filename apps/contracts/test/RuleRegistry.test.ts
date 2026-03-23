import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

async function deployFixture() {
  const [owner, user, other] = await ethers.getSigners();
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();

  const priceFeed = await ethers.deployContract("MockPriceFeed", [ethers.parseUnits("1", 18)]);
  const withdrawModule = await ethers.deployContract("ActionWithdrawFromVault");
  const registry = await ethers.deployContract("RuleRegistry");

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
    moduleAddress: await withdrawModule.getAddress(),
    data: abiCoder.encode(["address", "address", "address", "uint256"], [owner.address, owner.address, owner.address, 1n]),
  } as const;

  const limits = { cooldownSeconds: 60, maxExecutionsPerDay: 3 } as const;

  return { owner, user, other, priceFeed, withdrawModule, registry, trigger, condition, action, limits };
}

describe("RuleRegistry", () => {
  it("creates a rule and stores ownership", async () => {
    const { user, registry, trigger, condition, action, limits } = await loadFixture(deployFixture);

    await expect(registry.connect(user).createRule(trigger, condition, action, limits, "Guardian", 0))
      .to.emit(registry, "RuleCreated")
      .withArgs(1n, user.address, 0, trigger.contractAddress, action.moduleAddress);

    const rule = await registry.getRule(1);
    expect(rule.owner).to.equal(user.address);
    expect(rule.active).to.equal(true);
    expect(rule.metadata.name).to.equal("Guardian");
  });

  it("restricts updates and status changes to the rule owner", async () => {
    const { user, other, registry, trigger, condition, action, limits } = await loadFixture(deployFixture);

    await registry.connect(user).createRule(trigger, condition, action, limits, "Guardian", 0);

    await expect(
      registry.connect(other).updateRule(1, trigger, condition, action, limits, "Mutated", 0),
    ).to.be.revertedWithCustomError(registry, "NotRuleOwner");

    await expect(registry.connect(other).setRuleActive(1, false)).to.be.revertedWithCustomError(
      registry,
      "NotRuleOwner",
    );
  });
});
