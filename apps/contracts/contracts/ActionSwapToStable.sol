// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IActionModule} from "./interfaces/IActionModule.sol";
import {MockDEX} from "./MockDEX.sol";
import {MockVault} from "./MockVault.sol";

contract ActionSwapToStable is IActionModule {
    using SafeERC20 for IERC20;

    struct Params {
        address vault;
        address dex;
        address positionOwner;
        address recipient;
        uint256 amountIn;
        uint256 minAmountOut;
    }

    event SwapActionExecuted(
        uint256 indexed ruleId,
        address indexed vault,
        address indexed dex,
        address recipient,
        uint256 amountIn,
        uint256 amountOut
    );

    function execute(
        uint256 ruleId,
        bytes calldata actionData,
        bytes calldata
    ) external returns (bytes memory) {
        Params memory params = abi.decode(actionData, (Params));
        MockVault vault = MockVault(params.vault);
        vault.withdrawFor(params.positionOwner, address(this), params.amountIn);

        IERC20 assetToken = IERC20(address(vault.assetToken()));
        assetToken.forceApprove(params.dex, params.amountIn);

        uint256 amountOut = MockDEX(params.dex).swapToStable(params.recipient, params.amountIn, params.minAmountOut);
        emit SwapActionExecuted(ruleId, params.vault, params.dex, params.recipient, params.amountIn, amountOut);
        return abi.encode(params.recipient, amountOut);
    }
}
