// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IActionModule {
    function execute(
        uint256 ruleId,
        bytes calldata actionData,
        bytes calldata triggerPayload
    ) external returns (bytes memory);
}
