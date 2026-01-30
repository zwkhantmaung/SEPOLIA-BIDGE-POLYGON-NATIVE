// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./wZETH.sol";

/**
 * @title PolyBridge
 * @dev On Polygon side: mints wZETH when ZETH is locked on EthBridge; burns wZETH when user requests unlock.
 * User must approve this contract for wZETH before calling burnToken.
 */
contract PolyBridge is Ownable {
    wZETH public immutable wzeth;

    event MintToken(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    constructor(address _wzeth) Ownable(msg.sender) {
        wzeth = wZETH(_wzeth);
    }

    /**
     * @dev Owner mints wZETH to user (e.g. after lock on source chain).
     */
    function mintToken(address to, uint256 amount) external onlyOwner {
        wzeth.mint(to, amount);
        emit MintToken(to, amount);
    }

    /**
     * @dev User burns their wZETH. Caller must have approved this contract for `amount` via wZETH.approve.
     */
    function burnToken(uint256 amount) external {
        wzeth.burnFrom(msg.sender, amount);
        emit Burn(msg.sender, amount);
    }
}
