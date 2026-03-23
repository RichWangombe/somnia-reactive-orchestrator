// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {MockPriceFeed} from "./MockPriceFeed.sol";
import {MockStablecoin} from "./MockStablecoin.sol";

contract MockDEX {
    using SafeERC20 for IERC20;

    error SlippageExceeded(uint256 expected, uint256 minimum);
    error AmountZero();

    IERC20 public immutable assetToken;
    MockStablecoin public immutable stableToken;
    MockPriceFeed public immutable priceFeed;

    event SwappedToStable(address indexed recipient, uint256 amountIn, uint256 amountOut);

    constructor(address assetToken_, address stableToken_, address priceFeed_) {
        assetToken = IERC20(assetToken_);
        stableToken = MockStablecoin(stableToken_);
        priceFeed = MockPriceFeed(priceFeed_);
    }

    function swapToStable(address recipient, uint256 amountIn, uint256 minAmountOut) external returns (uint256 amountOut) {
        if (amountIn == 0) {
            revert AmountZero();
        }

        assetToken.safeTransferFrom(msg.sender, address(this), amountIn);
        amountOut = (amountIn * priceFeed.latestPrice()) / 1e18;
        if (amountOut < minAmountOut) {
            revert SlippageExceeded(amountOut, minAmountOut);
        }

        stableToken.mint(recipient, amountOut);
        emit SwappedToStable(recipient, amountIn, amountOut);
    }
}
