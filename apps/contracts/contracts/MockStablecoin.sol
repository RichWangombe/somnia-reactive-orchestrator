// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockStablecoin is ERC20, Ownable {
    mapping(address => bool) public operators;

    error OperatorOnly(address caller);

    constructor() ERC20("Guardian Stable", "GUSD") Ownable(msg.sender) {}

    function setOperator(address operator, bool allowed) external onlyOwner {
        operators[operator] = allowed;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != owner() && !operators[msg.sender]) {
            revert OperatorOnly(msg.sender);
        }
        _mint(to, amount);
    }
}
