// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {MockPriceFeed} from "./MockPriceFeed.sol";

contract MockVault is Ownable {
    using SafeERC20 for IERC20;

    error OperatorOnly(address caller);
    error AmountZero();
    error InsufficientCollateral(address owner, uint256 requested, uint256 available);

    IERC20 public immutable assetToken;
    MockPriceFeed public immutable priceFeed;

    mapping(address => uint256) public collateralOf;
    mapping(address => uint256) public debtOf;
    mapping(address => bool) public operators;
    mapping(address => uint256) private _lastHealthFactor;

    event Deposited(address indexed user, uint256 amount, uint256 debtAssigned);
    event Withdrawn(address indexed owner, address indexed recipient, uint256 amount);
    event HealthFactorChanged(address indexed user, uint256 oldHealthFactor, uint256 newHealthFactor);

    constructor(address assetToken_, address priceFeed_) Ownable(msg.sender) {
        assetToken = IERC20(assetToken_);
        priceFeed = MockPriceFeed(priceFeed_);
    }

    modifier onlyOperator() {
        if (!operators[msg.sender]) {
            revert OperatorOnly(msg.sender);
        }
        _;
    }

    function setOperator(address operator, bool allowed) external onlyOwner {
        operators[operator] = allowed;
    }

    function deposit(uint256 amount) external {
        if (amount == 0) {
            revert AmountZero();
        }

        uint256 oldHealthFactor = getHealthFactor(msg.sender);

        assetToken.safeTransferFrom(msg.sender, address(this), amount);
        collateralOf[msg.sender] += amount;
        uint256 debtAssigned = _marketValue(amount) / 2;
        debtOf[msg.sender] += debtAssigned;

        emit Deposited(msg.sender, amount, debtAssigned);
        _emitHealthFactor(msg.sender, oldHealthFactor);
    }

    function withdraw(uint256 amount) external returns (uint256) {
        uint256 oldHealthFactor = getHealthFactor(msg.sender);
        _withdrawFromPosition(msg.sender, msg.sender, amount);
        _emitHealthFactor(msg.sender, oldHealthFactor);
        return amount;
    }

    function withdrawFor(address positionOwner, address recipient, uint256 amount) external onlyOperator returns (uint256) {
        uint256 oldHealthFactor = getHealthFactor(positionOwner);
        _withdrawFromPosition(positionOwner, recipient, amount);
        _emitHealthFactor(positionOwner, oldHealthFactor);
        return amount;
    }

    function refreshHealthFactor(address user) external {
        uint256 previous = _lastHealthFactor[user];
        uint256 current = getHealthFactor(user);
        _lastHealthFactor[user] = current;
        emit HealthFactorChanged(user, previous, current);
    }

    function getHealthFactor(address user) public view returns (uint256) {
        uint256 debt = debtOf[user];
        if (debt == 0) {
            return type(uint256).max;
        }

        uint256 collateralValue = _marketValue(collateralOf[user]);
        return (collateralValue * 1e18) / debt;
    }

    function _withdrawFromPosition(address positionOwner, address recipient, uint256 amount) private {
        if (amount == 0) {
            revert AmountZero();
        }

        uint256 collateralBefore = collateralOf[positionOwner];
        if (amount > collateralBefore) {
            revert InsufficientCollateral(positionOwner, amount, collateralBefore);
        }

        collateralOf[positionOwner] = collateralBefore - amount;

        uint256 debtReduction = collateralBefore == 0 ? 0 : (debtOf[positionOwner] * amount) / collateralBefore;
        if (debtReduction > debtOf[positionOwner]) {
            debtReduction = debtOf[positionOwner];
        }
        debtOf[positionOwner] -= debtReduction;

        assetToken.safeTransfer(recipient, amount);
        emit Withdrawn(positionOwner, recipient, amount);
    }

    function _emitHealthFactor(address user, uint256 oldHealthFactor) private {
        uint256 newHealthFactor = getHealthFactor(user);
        _lastHealthFactor[user] = newHealthFactor;
        emit HealthFactorChanged(user, oldHealthFactor, newHealthFactor);
    }

    function _marketValue(uint256 amount) private view returns (uint256) {
        return (amount * priceFeed.latestPrice()) / 1e18;
    }
}
