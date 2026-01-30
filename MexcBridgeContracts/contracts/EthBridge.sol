// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title EthBridge
 * @dev Holds ZETH. Users lock (deposit) ZETH; owner can unlock (withdraw) to users.
 */
contract EthBridge is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    event Deposit(address indexed user, uint256 amount);
    event Unlock(address indexed user, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }

    /**
     * @dev User locks ZETH by transferring to this contract. Caller must approve this contract first.
     */
    function lock(uint256 amount) external {
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount);
    }

    /**
     * @dev Owner unlocks ZETH to a user (e.g. after burn on other chain).
     */
    function unlock(address user, uint256 amount) external onlyOwner {
        token.safeTransfer(user, amount);
        emit Unlock(user, amount);
    }
}
