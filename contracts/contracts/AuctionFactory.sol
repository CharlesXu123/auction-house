// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./Auction.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

contract AuctionFactory {
    address public admin;
    uint256 public adminFeePercent;
    address[] public auctions;
    address[] public managers;

    event AuctionCreated(address auctionContract);

    constructor(uint256 _defaultAdminFeePercent) {
        admin = msg.sender;
        adminFeePercent = _defaultAdminFeePercent;
    }

    function createAuction(
        address _nftAddress,
        address _aucAddress,
        uint256 _tokenId,
        uint256 _startingPrice,
        uint256 _duration
    ) public {
        Auction newAuction = new Auction(
            _nftAddress,
            _aucAddress,
            _tokenId,
            _startingPrice,
            _duration,
            admin,
            adminFeePercent
        );

        console.log(
            "Auction created at address: %s and msg.sender is %s",
            address(newAuction),
            msg.sender
        );

        auctions.push(address(newAuction));

        IERC721 nftContract = IERC721(_nftAddress);

        nftContract.transferFrom(msg.sender, address(newAuction), _tokenId);
        emit AuctionCreated(address(newAuction));
    }
}
