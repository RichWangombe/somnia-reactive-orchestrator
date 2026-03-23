// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {IActionModule} from "./interfaces/IActionModule.sol";
import {IRuleRegistry} from "./interfaces/IRuleRegistry.sol";
import {RuleTypes} from "./libraries/RuleTypes.sol";

contract ReactiveExecutor is Ownable, ReentrancyGuard {
    error NotTrustedWatcher(address caller);
    error RuleInactive(uint256 ruleId);
    error CooldownActive(uint256 ruleId, uint256 nextAllowedAt);
    error DailyLimitReached(uint256 ruleId);
    error ZeroAddress();

    enum FireEligibility {
        OK,
        INACTIVE,
        COOLDOWN,
        DAILY_LIMIT
    }

    event RuleFired(
        uint256 indexed ruleId,
        address indexed watcher,
        address indexed actionModule,
        bytes32 triggerHash,
        bool success,
        uint256 executedAt,
        uint256 gasUsed,
        bytes result
    );

    IRuleRegistry public immutable ruleRegistry;
    address public trustedWatcher;

    constructor(address registry_, address trustedWatcher_) Ownable(msg.sender) {
        if (registry_ == address(0) || trustedWatcher_ == address(0)) {
            revert ZeroAddress();
        }
        ruleRegistry = IRuleRegistry(registry_);
        trustedWatcher = trustedWatcher_;
    }

    function setTrustedWatcher(address watcher) external onlyOwner {
        if (watcher == address(0)) {
            revert ZeroAddress();
        }
        trustedWatcher = watcher;
    }

    function previewCanFire(
        uint256 ruleId
    ) external view returns (bool canFire, string memory reason, uint256 nextAllowedAt) {
        RuleTypes.Rule memory rule = ruleRegistry.getRule(ruleId);
        (uint64 lastExecutedAt, uint32 executionsToday, uint32 currentDayBucket) = ruleRegistry.getExecutionStats(ruleId);
        (FireEligibility eligibility, uint256 previewTimestamp) = _evaluateEligibility(
            rule,
            lastExecutedAt,
            executionsToday,
            currentDayBucket
        );

        if (eligibility == FireEligibility.OK) {
            return (true, "Rule can fire", 0);
        }
        if (eligibility == FireEligibility.INACTIVE) {
            return (false, "Rule is inactive", 0);
        }
        if (eligibility == FireEligibility.COOLDOWN) {
            return (false, "Cooldown active", previewTimestamp);
        }
        return (false, "Daily execution limit reached", previewTimestamp);
    }

    function fire(uint256 ruleId, bytes calldata triggerPayload) external nonReentrant {
        if (msg.sender != trustedWatcher) {
            revert NotTrustedWatcher(msg.sender);
        }

        RuleTypes.Rule memory rule = ruleRegistry.getRule(ruleId);
        (uint64 lastExecutedAt, uint32 executionsToday, uint32 currentDayBucket) = ruleRegistry.getExecutionStats(ruleId);
        (FireEligibility eligibility, uint256 previewTimestamp) = _evaluateEligibility(
            rule,
            lastExecutedAt,
            executionsToday,
            currentDayBucket
        );

        if (eligibility == FireEligibility.INACTIVE) {
            revert RuleInactive(ruleId);
        }
        if (eligibility == FireEligibility.COOLDOWN) {
            revert CooldownActive(ruleId, previewTimestamp);
        }
        if (eligibility == FireEligibility.DAILY_LIMIT) {
            revert DailyLimitReached(ruleId);
        }

        uint256 gasAtStart = gasleft();
        ruleRegistry.recordExecution(ruleId);

        bytes memory result;
        bool success;
        try IActionModule(rule.action.moduleAddress).execute(ruleId, rule.action.data, triggerPayload) returns (
            bytes memory moduleResult
        ) {
            result = moduleResult;
            success = true;
        } catch (bytes memory moduleError) {
            result = moduleError;
            success = false;
        }

        emit RuleFired(
            ruleId,
            msg.sender,
            rule.action.moduleAddress,
            keccak256(triggerPayload),
            success,
            block.timestamp,
            gasAtStart - gasleft(),
            result
        );
    }

    function _evaluateEligibility(
        RuleTypes.Rule memory rule,
        uint64 lastExecutedAt,
        uint32 executionsToday,
        uint32 currentDayBucket
    ) private view returns (FireEligibility, uint256 previewTimestamp) {
        if (!rule.active) {
            return (FireEligibility.INACTIVE, 0);
        }

        if (
            rule.limits.cooldownSeconds > 0 &&
            lastExecutedAt > 0 &&
            block.timestamp < uint256(lastExecutedAt) + uint256(rule.limits.cooldownSeconds)
        ) {
            return (FireEligibility.COOLDOWN, uint256(lastExecutedAt) + uint256(rule.limits.cooldownSeconds));
        }

        if (
            rule.limits.maxExecutionsPerDay > 0 &&
            currentDayBucket == uint32(block.timestamp / 1 days) &&
            executionsToday >= rule.limits.maxExecutionsPerDay
        ) {
            return (FireEligibility.DAILY_LIMIT, ((block.timestamp / 1 days) + 1) * 1 days);
        }

        return (FireEligibility.OK, 0);
    }
}
