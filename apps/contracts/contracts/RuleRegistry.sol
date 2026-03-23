// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IRuleRegistry} from "./interfaces/IRuleRegistry.sol";
import {RuleTypes} from "./libraries/RuleTypes.sol";

contract RuleRegistry is Ownable, IRuleRegistry {
    error RuleNotFound(uint256 ruleId);
    error NotRuleOwner(uint256 ruleId, address caller);
    error ExecutorOnly(address caller);
    error ZeroAddress();

    event RuleCreated(
        uint256 indexed ruleId,
        address indexed owner,
        uint8 templateKind,
        address indexed triggerContract,
        address actionModule
    );
    event RuleUpdated(uint256 indexed ruleId);
    event RuleStatusChanged(uint256 indexed ruleId, bool active);
    event RuleExecutionRecorded(uint256 indexed ruleId, uint256 executedAt, uint256 dayBucket, uint256 executionsToday);

    struct ExecutionStats {
        uint64 lastExecutedAt;
        uint32 executionsToday;
        uint32 currentDayBucket;
    }

    uint256 private _nextRuleId = 1;
    address public executor;

    mapping(uint256 => RuleTypes.Rule) private _rules;
    mapping(address => uint256[]) private _ownerRules;
    mapping(uint256 => ExecutionStats) private _executionStats;

    constructor() Ownable(msg.sender) {}

    function setExecutor(address newExecutor) external onlyOwner {
        if (newExecutor == address(0)) {
            revert ZeroAddress();
        }
        executor = newExecutor;
    }

    function createRule(
        RuleTypes.TriggerSpec calldata trigger,
        RuleTypes.ConditionSpec calldata condition,
        RuleTypes.ActionSpec calldata action,
        RuleTypes.RuleLimits calldata limits,
        string calldata name,
        RuleTypes.TemplateKind templateKind
    ) external returns (uint256 ruleId) {
        if (trigger.contractAddress == address(0) || action.moduleAddress == address(0)) {
            revert ZeroAddress();
        }

        ruleId = _nextRuleId++;
        RuleTypes.Rule storage rule = _rules[ruleId];

        rule.owner = msg.sender;
        rule.active = true;
        _setTrigger(rule, trigger);
        _setCondition(rule, condition);
        _setAction(rule, action);
        _setLimits(rule, limits);
        rule.metadata = RuleTypes.RuleMetadata({
            name: name,
            templateKind: templateKind,
            createdAt: uint64(block.timestamp),
            updatedAt: uint64(block.timestamp)
        });

        _ownerRules[msg.sender].push(ruleId);

        emit RuleCreated(ruleId, msg.sender, uint8(templateKind), trigger.contractAddress, action.moduleAddress);
    }

    function updateRule(
        uint256 ruleId,
        RuleTypes.TriggerSpec calldata trigger,
        RuleTypes.ConditionSpec calldata condition,
        RuleTypes.ActionSpec calldata action,
        RuleTypes.RuleLimits calldata limits,
        string calldata name,
        RuleTypes.TemplateKind templateKind
    ) external {
        RuleTypes.Rule storage rule = _requireRule(ruleId);
        if (msg.sender != rule.owner) {
            revert NotRuleOwner(ruleId, msg.sender);
        }
        if (trigger.contractAddress == address(0) || action.moduleAddress == address(0)) {
            revert ZeroAddress();
        }

        _setTrigger(rule, trigger);
        _setCondition(rule, condition);
        _setAction(rule, action);
        _setLimits(rule, limits);
        rule.metadata.name = name;
        rule.metadata.templateKind = templateKind;
        rule.metadata.updatedAt = uint64(block.timestamp);

        emit RuleUpdated(ruleId);
    }

    function setRuleActive(uint256 ruleId, bool active) external {
        RuleTypes.Rule storage rule = _requireRule(ruleId);
        if (msg.sender != rule.owner) {
            revert NotRuleOwner(ruleId, msg.sender);
        }

        rule.active = active;
        rule.metadata.updatedAt = uint64(block.timestamp);

        emit RuleStatusChanged(ruleId, active);
    }

    function getRule(uint256 ruleId) external view returns (RuleTypes.Rule memory) {
        RuleTypes.Rule storage rule = _requireRule(ruleId);
        return rule;
    }

    function getRulesByOwner(address owner) external view returns (uint256[] memory) {
        return _ownerRules[owner];
    }

    function getRuleCount() external view returns (uint256) {
        return _nextRuleId - 1;
    }

    function getExecutionStats(
        uint256 ruleId
    ) external view returns (uint64 lastExecutedAt, uint32 executionsToday, uint32 currentDayBucket) {
        _requireRule(ruleId);
        ExecutionStats memory stats = _executionStats[ruleId];
        return (stats.lastExecutedAt, stats.executionsToday, stats.currentDayBucket);
    }

    function recordExecution(
        uint256 ruleId
    ) external returns (uint64 lastExecutedAt, uint32 executionsToday, uint32 currentDayBucket) {
        if (msg.sender != executor) {
            revert ExecutorOnly(msg.sender);
        }

        _requireRule(ruleId);

        uint32 dayBucket = uint32(block.timestamp / 1 days);
        ExecutionStats storage stats = _executionStats[ruleId];
        if (stats.currentDayBucket != dayBucket) {
            stats.currentDayBucket = dayBucket;
            stats.executionsToday = 0;
        }

        stats.lastExecutedAt = uint64(block.timestamp);
        stats.executionsToday += 1;

        emit RuleExecutionRecorded(ruleId, block.timestamp, dayBucket, stats.executionsToday);
        return (stats.lastExecutedAt, stats.executionsToday, stats.currentDayBucket);
    }

    function _requireRule(uint256 ruleId) private view returns (RuleTypes.Rule storage rule) {
        rule = _rules[ruleId];
        if (rule.owner == address(0)) {
            revert RuleNotFound(ruleId);
        }
    }

    function _setTrigger(RuleTypes.Rule storage rule, RuleTypes.TriggerSpec calldata trigger) private {
        rule.trigger.kind = trigger.kind;
        rule.trigger.contractAddress = trigger.contractAddress;
        rule.trigger.topicFilters = trigger.topicFilters;
        rule.trigger.filterData = trigger.filterData;
    }

    function _setCondition(RuleTypes.Rule storage rule, RuleTypes.ConditionSpec calldata condition) private {
        rule.condition.kind = condition.kind;
        rule.condition.threshold = condition.threshold;
        rule.condition.auxData = condition.auxData;
    }

    function _setAction(RuleTypes.Rule storage rule, RuleTypes.ActionSpec calldata action) private {
        rule.action.kind = action.kind;
        rule.action.moduleAddress = action.moduleAddress;
        rule.action.data = action.data;
    }

    function _setLimits(RuleTypes.Rule storage rule, RuleTypes.RuleLimits calldata limits) private {
        rule.limits.cooldownSeconds = limits.cooldownSeconds;
        rule.limits.maxExecutionsPerDay = limits.maxExecutionsPerDay;
    }
}
