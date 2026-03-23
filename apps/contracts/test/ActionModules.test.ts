import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

async function deployFixture() {
  const [, user] = await ethers.getSigners();
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

  await vault.setOperator(await withdrawModule.getAddress(), true);
  await vault.setOperator(await swapModule.getAddress(), true);
  await stable.setOperator(await dex.getAddress(), true);

  await asset.mint(user.address, ethers.parseUnits("200", 18));
  await asset.connect(user).approve(await vault.getAddress(), ethers.parseUnits("100", 18));
  await vault.connect(user).deposit(ethers.parseUnits("100", 18));

  return { abiCoder, asset, stable, user, vault, dex, withdrawModule, swapModule };
}

describe("Action modules", () => {
  it("withdraws assets from the mock vault", async () => {
    const { abiCoder, asset, user, vault, withdrawModule } = await loadFixture(deployFixture);

    const before = await asset.balanceOf(user.address);
    const actionData = abiCoder.encode(
      ["address", "address", "address", "uint256"],
      [await vault.getAddress(), user.address, user.address, ethers.parseUnits("15", 18)],
    );

    await withdrawModule.execute(1, actionData, "0x");
    const after = await asset.balanceOf(user.address);
    expect(after - before).to.equal(ethers.parseUnits("15", 18));
  });

  it("swaps withdrawn collateral into the stable token", async () => {
    const { abiCoder, stable, user, vault, dex, swapModule } = await loadFixture(deployFixture);

    const before = await stable.balanceOf(user.address);
    const actionData = abiCoder.encode(
      ["address", "address", "address", "address", "uint256", "uint256"],
      [
        await vault.getAddress(),
        await dex.getAddress(),
        user.address,
        user.address,
        ethers.parseUnits("10", 18),
        ethers.parseUnits("5", 18),
      ],
    );

    await swapModule.execute(1, actionData, "0x");
    const after = await stable.balanceOf(user.address);
    expect(after - before).to.equal(ethers.parseUnits("10", 18));
  });
});
