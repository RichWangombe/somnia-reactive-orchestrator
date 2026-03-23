import { parseAbi, parseAbiItem } from "viem";

export const ruleRegistryAbi = parseAbi([
  "function createRule((uint8 kind,address contractAddress,bytes32[4] topicFilters,bytes filterData) trigger,(uint8 kind,uint256 threshold,bytes auxData) condition,(uint8 kind,address moduleAddress,bytes data) action,(uint64 cooldownSeconds,uint32 maxExecutionsPerDay) limits,string name,uint8 templateKind) returns (uint256 ruleId)",
  "function setRuleActive(uint256 ruleId,bool active)",
  "function getRule(uint256 ruleId) view returns ((address owner,bool active,(uint8 kind,address contractAddress,bytes32[4] topicFilters,bytes filterData) trigger,(uint8 kind,uint256 threshold,bytes auxData) condition,(uint8 kind,address moduleAddress,bytes data) action,(uint64 cooldownSeconds,uint32 maxExecutionsPerDay) limits,(string name,uint8 templateKind,uint64 createdAt,uint64 updatedAt) metadata))",
  "function getRulesByOwner(address owner) view returns (uint256[])",
  "function getRuleCount() view returns (uint256)",
  "function getExecutionStats(uint256 ruleId) view returns (uint64 lastExecutedAt,uint32 executionsToday,uint32 currentDayBucket)",
  "event RuleCreated(uint256 indexed ruleId,address indexed owner,uint8 templateKind,address indexed triggerContract,address actionModule)",
  "event RuleUpdated(uint256 indexed ruleId)",
  "event RuleStatusChanged(uint256 indexed ruleId,bool active)",
  "event RuleExecutionRecorded(uint256 indexed ruleId,uint256 executedAt,uint256 dayBucket,uint256 executionsToday)",
]);

export const reactiveExecutorAbi = parseAbi([
  "function fire(uint256 ruleId,bytes triggerPayload)",
  "function previewCanFire(uint256 ruleId) view returns (bool canFire,string reason,uint256 nextAllowedAt)",
  "function setTrustedWatcher(address watcher)",
  "function trustedWatcher() view returns (address)",
  "event RuleFired(uint256 indexed ruleId,address indexed watcher,address indexed actionModule,bytes32 triggerHash,bool success,uint256 executedAt,uint256 gasUsed,bytes result)",
]);

export const mockPriceFeedAbi = parseAbi([
  "function latestPrice() view returns (uint256)",
  "function setPrice(uint256 newPrice)",
  "event PriceUpdated(uint256 oldPrice,uint256 newPrice,uint256 timestamp)",
]);

export const mockVaultAbi = parseAbi([
  "function deposit(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function getHealthFactor(address user) view returns (uint256)",
  "function collateralOf(address user) view returns (uint256)",
  "function debtOf(address user) view returns (uint256)",
  "function refreshHealthFactor(address user)",
  "function setOperator(address operator,bool allowed)",
  "event Deposited(address indexed user,uint256 amount,uint256 debtAssigned)",
  "event Withdrawn(address indexed owner,address indexed recipient,uint256 amount)",
  "event HealthFactorChanged(address indexed user,uint256 oldHealthFactor,uint256 newHealthFactor)",
]);

export const mockDexAbi = parseAbi([
  "function swapToStable(address recipient,uint256 amountIn,uint256 minAmountOut) returns (uint256 amountOut)",
  "event SwappedToStable(address indexed recipient,uint256 amountIn,uint256 amountOut)",
]);

export const erc20MintableAbi = parseAbi([
  "function approve(address spender,uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function mint(address to,uint256 amount)",
  "function allowance(address owner,address spender) view returns (uint256)",
]);

export const priceUpdatedEvent = parseAbiItem(
  "event PriceUpdated(uint256 oldPrice,uint256 newPrice,uint256 timestamp)",
);

export const vaultHealthChangedEvent = parseAbiItem(
  "event HealthFactorChanged(address indexed user,uint256 oldHealthFactor,uint256 newHealthFactor)",
);

export const ruleFiredEvent = parseAbiItem(
  "event RuleFired(uint256 indexed ruleId,address indexed watcher,address indexed actionModule,bytes32 triggerHash,bool success,uint256 executedAt,uint256 gasUsed,bytes result)",
);
