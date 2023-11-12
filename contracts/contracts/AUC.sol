// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AUC is ERC20 {
    constructor(uint256 initialSupply) ERC20("Auction House Coin", "AUC") {
        _mint(msg.sender, initialSupply);
    }

    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}
