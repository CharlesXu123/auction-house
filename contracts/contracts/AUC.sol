// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Auction House Coin (AUC)
/// @author Shengsong Xu
/// @dev ERC20 token for use in an auction house system.
contract AUC is ERC20 {
    /// @notice Creates an instance of AUC token with initial supply minted to the deployer.
    /// @param initialSupply The amount of tokens to mint upon creation.
    constructor(uint256 initialSupply) ERC20("Auction House Coin", "AUC") {
        _mint(msg.sender, initialSupply);
    }

    /// @notice Mints AUC tokens to the caller's address.
    /// @dev This function allows any user to mint tokens to their own address.
    /// @param amount The amount of tokens to be minted.
    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}
