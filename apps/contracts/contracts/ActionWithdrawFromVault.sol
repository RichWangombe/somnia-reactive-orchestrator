// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IActionModule} from "./interfaces/IActionModule.sol";
import {MockVault} from "./MockVault.sol";

contract ActionWithdrawFromVault is IActionModule {
    struct Params {
        address vault;
        address positionOwner;
        address recipient;
        uint256 amount;
    }

    event WithdrawActionExecuted(
        uint256 indexed ruleId,
        address indexed vault,
        address indexed positionOwner,
        address recipient,
        uint256 amount
    );

    function execute(
        uint256 ruleId,
        bytes calldata actionData,
        bytes calldata
    ) external returns (bytes memory) {
        Params memory params = abi.decode(actionData, (Params));
        MockVault(params.vault).withdrawFor(params.positionOwner, params.recipient, params.amount);
        emit WithdrawActionExecuted(ruleId, params.vault, params.positionOwner, params.recipient, params.amount);
        return abi.encode(params.positionOwner, params.recipient, params.amount);
    }
}
