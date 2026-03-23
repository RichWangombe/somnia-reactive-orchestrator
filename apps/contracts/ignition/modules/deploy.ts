import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RopDemoModule", (m) => {
  const asset = m.contract("MockERC20", ["Guardian Asset", "GAST"]);
  const stable = m.contract("MockStablecoin", []);
  const priceFeed = m.contract("MockPriceFeed", [10n ** 18n]);
  const vault = m.contract("MockVault", [asset, priceFeed]);
  const dex = m.contract("MockDEX", [asset, stable, priceFeed]);
  const withdrawModule = m.contract("ActionWithdrawFromVault", []);
  const swapModule = m.contract("ActionSwapToStable", []);
  const emitModule = m.contract("ActionEmitOnly", []);
  const registry = m.contract("RuleRegistry", []);
  const executor = m.contract("ReactiveExecutor", [registry, m.getAccount(0)]);

  return {
    asset,
    stable,
    priceFeed,
    vault,
    dex,
    withdrawModule,
    swapModule,
    emitModule,
    registry,
    executor,
  };
});
