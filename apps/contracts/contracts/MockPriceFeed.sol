// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MockPriceFeed is Ownable {
    uint256 private _latestPrice;

    event PriceUpdated(uint256 oldPrice, uint256 newPrice, uint256 timestamp);

    constructor(uint256 initialPrice) Ownable(msg.sender) {
        _latestPrice = initialPrice;
    }

    function latestPrice() external view returns (uint256) {
        return _latestPrice;
    }

    function setPrice(uint256 newPrice) external onlyOwner {
        uint256 previous = _latestPrice;
        _latestPrice = newPrice;
        emit PriceUpdated(previous, newPrice, block.timestamp);
    }
}
