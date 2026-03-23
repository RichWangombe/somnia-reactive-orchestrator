// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IActionModule} from "./interfaces/IActionModule.sol";

contract ActionEmitOnly is IActionModule {
    event EmitOnlyAction(uint256 indexed ruleId, bytes32 indexed triggerHash, bytes actionData, bytes triggerPayload);

    function execute(
        uint256 ruleId,
        bytes calldata actionData,
        bytes calldata triggerPayload
    ) external returns (bytes memory) {
        bytes32 triggerHash = keccak256(triggerPayload);
        emit EmitOnlyAction(ruleId, triggerHash, actionData, triggerPayload);
        return abi.encode(triggerHash);
    }
}
