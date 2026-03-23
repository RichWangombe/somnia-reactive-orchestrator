// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {RuleTypes} from "../libraries/RuleTypes.sol";

interface IRuleRegistry {
    function getRule(uint256 ruleId) external view returns (RuleTypes.Rule memory);

    function getRulesByOwner(address owner) external view returns (uint256[] memory);

    function getRuleCount() external view returns (uint256);

    function getExecutionStats(
        uint256 ruleId
    ) external view returns (uint64 lastExecutedAt, uint32 executionsToday, uint32 currentDayBucket);

    function recordExecution(
        uint256 ruleId
    ) external returns (uint64 lastExecutedAt, uint32 executionsToday, uint32 currentDayBucket);
}
