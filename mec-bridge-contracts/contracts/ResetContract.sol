// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ResetContract
 * @dev Optional helper for testing: stores a version counter; owner can increment to "reset" or signal new epoch.
 * Does not modify other contracts; use for integration tests or off-chain tracking.
 */
contract ResetContract is Ownable {
    uint256 public version;

    event Reset(uint256 newVersion);

    constructor() Ownable(msg.sender) {
        version = 0;
    }

    /**
     * @dev Owner increments version (e.g. after manual state reset in tests).
     */
    function reset() external onlyOwner {
        version += 1;
        emit Reset(version);
    }
}
