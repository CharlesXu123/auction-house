// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./AUC.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Auction {
    IERC721 public nft;
    AUC public aucToken;

    uint256 public tokenId;
    address public auctioneer;

    uint256 public endTime;
    uint256 public startingPrice;
    address public highestBidder;
    uint256 public highestBid;

    address public admin;
    /// 10 = 1%
    uint256 public adminFeePercent;

    /// true if the auction contract no longer has the NFT
    /// (either because it was transferred to the highest bidder or back to the auctioneer)
    bool public ended;
    bool public bidPlaced;

    constructor(
        address _nftAddress,
        address _aucAddress,
        uint256 _tokenId,
        uint256 _startingPrice,
        uint256 _duration,
        address _admin,
        uint256 _adminFeePercent
    ) {
        nft = IERC721(_nftAddress);
        _aucAddress = _aucAddress == address(0)
            ? 0xb3828aF7F16edbeEEf43B5403871a5d979efA521
            : _aucAddress;
        aucToken = AUC(_aucAddress);
        tokenId = _tokenId;
        startingPrice = _startingPrice;
        endTime = block.timestamp + _duration;
        auctioneer = msg.sender;
        admin = _admin;
        adminFeePercent = _adminFeePercent;
    }

    /// Event to be emitted when a new bid is placed
    event BidPlaced(address indexed bidder, uint256 amount);
    /// Event to be emitted when the auction ends
    event AuctionEnded(address indexed winner, uint256 amount);
    /// Event to be emitted when starting price lowers
    event StartingPriceLowered(uint256 newStartingPrice);

    modifier onlyBeforeEnd() {
        require(!ended, "Auction already ended.");
        require(block.timestamp < endTime, "Auction already expired.");
        _;
    }

    modifier onlyAfterEndTime() {
        require(block.timestamp > endTime, "Auction still ongoing.");
        _;
    }

    modifier onlyAfterSetEnd() {
        require(ended, "Auction not yet set to ended.");
        _;
    }

    modifier onlyNoBitPlaced() {
        require(!bidPlaced, "Bid already placed.");
        _;
    }

    modifier onlyBitPlaced() {
        require(bidPlaced, "Bid not yet placed.");
        _;
    }

    modifier onlyByAdmin() {
        require(msg.sender == admin, "Only admin can call this function.");
        _;
    }

    modifier onlyByAuctioneer() {
        require(
            msg.sender == auctioneer,
            "Only auctioneer can call this function."
        );
        _;
    }

    /**
     * @notice Allows a user to place a bid in the auction, provided the auction has not ended and the bid is higher than the current highest bid.
     * @dev This function allows bids to be placed only if they are higher than the current highest bid. If there was a previous highest bid, it refunds that amount to the previous highest bidder. Then, it transfers the new bid amount from the bidder to the contract, updating the highest bid and bidder. Emits a BidPlaced event upon a successful bid.
     * @param bidAmount The amount of the bid in AUC tokens.
     * @custom:requirement The function can only be called before the end of the auction.
     * @custom:validation Validates that the new bid is higher than the current highest bid.
     * @custom:refund If there is a previous highest bid, refunds that amount to the previous highest bidder.
     * @custom:transfer Transfers the new bid amount from the bidder to the contract.
     * @custom:update Updates the auction state with the new highest bid and bidder.
     * @custom:event Emits the BidPlaced event with the bidder's address and the bid amount.
     */
    function placeBid(uint256 bidAmount) external onlyBeforeEnd {
        require(bidAmount > highestBid, "There already is a higher bid");

        if (highestBid != 0) {
            aucToken.transfer(highestBidder, highestBid);
        }

        aucToken.transferFrom(msg.sender, address(this), bidAmount);
        highestBid = bidAmount;
        highestBidder = msg.sender;

        bidPlaced = true;

        emit BidPlaced(msg.sender, bidAmount);
    }

    /**
     * @notice Cancels the auction, returning the NFT to the auctioneer and refunding the highest bid, if any.
     * @dev This function can be called by the auctioneer to cancel the auction before it ends. It sets the auction as ended, transfers the NFT back to the auctioneer, and refunds the highest bid to the highest bidder if a bid was placed. Emits the AuctionEnded event upon successful execution.
     * @custom:requirement The function can only be called by the auctioneer.
     * @custom:requirement The auction must not have ended.
     * @custom:modification Marks the auction as ended, preventing any further bids or actions.
     * @custom:transfer Transfers the NFT back to the auctioneer.
     * @custom:refund Refunds the highest bid amount to the highest bidder, if a bid was placed.
     * @custom:event Emits the AuctionEnded event with the auctioneer's address and a final bid amount of 0.
     */
    function cancelAuction() public onlyByAuctioneer onlyBeforeEnd {
        ended = true;

        nft.transferFrom(address(this), auctioneer, tokenId);
        if (highestBid != 0) {
            aucToken.transfer(highestBidder, highestBid);
        }

        emit AuctionEnded(auctioneer, 0);
    }

    /**
     * @notice Ends the auction, transfers the NFT to the highest bidder or back to the auctioneer, and handles the distribution of funds.
     * @dev This function transfers the NFT to the highest bidder if a bid has been placed, and sends the bid amount (minus admin fees) to the auctioneer.
     *      If no bids have been placed, it returns the NFT to the auctioneer. Marks the auction as ended and emits the AuctionEnded event.
     *      Can only be called by the auctioneer.
     * @custom:requirement The function must be called by the auctioneer and only if the auction has not already ended.
     * @custom:modification Sets the auction as ended to prevent further actions.
     * @custom:transfer If a bid was placed, transfers the NFT to the highest bidder and the highest bid amount (minus admin fees) to the auctioneer.
     * @custom:transfer If no bid was placed, returns the NFT to the auctioneer.
     * @custom:event Emits the AuctionEnded event with the address of the recipient (highest bidder or auctioneer) and the final bid amount (or 0 if no bids were placed).
     */
    function endAuction() public onlyByAuctioneer {
        require(!ended, "Auction already ended.");

        ended = true;

        if (bidPlaced) {
            nft.transferFrom(address(this), highestBidder, tokenId);
            uint256 feeAmount = (highestBid * adminFeePercent) / 1000;
            aucToken.transfer(auctioneer, highestBid - feeAmount);
            emit AuctionEnded(highestBidder, highestBid);
        } else {
            nft.transferFrom(address(this), auctioneer, tokenId);
            emit AuctionEnded(auctioneer, 0);
        }
    }

    /**
     * @notice Allows the highest bidder to claim the NFT after the auction has ended and a bid has been placed.
     * @dev Upon claiming, the NFT is transferred to the highest bidder, and the auctioneer receives the highest bid amount minus the admin fee. The function also marks the auction as ended and emits the AuctionEnded event. This function can only be called after the auction end time and if a bid has been placed.
     * @custom:requirement The auction must not have already ended.
     * @custom:modification Marks the auction as ended.
     * @custom:transfer Transfers the NFT from the contract to the highest bidder.
     * @custom:payment Transfers the highest bid amount minus the admin fee to the auctioneer.
     * @custom:event Emits the AuctionEnded event with the highest bidder's address and the highest bid amount.
     */
    function cliamNFT() public onlyAfterEndTime onlyBitPlaced {
        require(!ended, "Auction already ended.");
        ended = true;

        nft.transferFrom(address(this), highestBidder, tokenId);
        uint256 feeAmount = (highestBid * adminFeePercent) / 1000;
        aucToken.transfer(auctioneer, highestBid - feeAmount);

        emit AuctionEnded(highestBidder, highestBid);
    }

    /**
     * @notice Lowers the starting price of the auction.
     * @dev This function allows the auctioneer to reduce the starting price of the auction. It can only be called by the auctioneer, before the auction ends, and only if no bids have been placed. Emits the StartingPriceLowered event upon successful execution.
     * @param newStartingPrice The new, lower starting price for the auction.
     * @custom:requirement The function must be called by the auctioneer.
     * @custom:requirement It can only be executed before the auction ends and if no bids have been placed.
     * @custom:validation Ensures the new starting price is lower than the current starting price.
     * @custom:modification Updates the starting price of the auction to the new value.
     * @custom:event Emits the StartingPriceLowered event with the new starting price.
     */
    function lowerStartingPrice(
        uint256 newStartingPrice
    ) public onlyByAuctioneer onlyBeforeEnd onlyNoBitPlaced {
        require(newStartingPrice < startingPrice, "New price must be lower");
        startingPrice = newStartingPrice;

        emit StartingPriceLowered(newStartingPrice);
    }

    /**
     * @notice Withdraws the accumulated admin fees from the auction contract.
     * @dev Can only be called by the admin, after the auction has ended and if at least one bid was placed.
     *      Transfers the entire balance of AUC tokens from the contract to the admin.
     * @custom:requirement The function can only be called by the admin.
     * @custom:requirement The auction must have ended.
     * @custom:requirement At least one bid must have been placed in the auction.
     * @custom:transfer Transfers the accumulated AUC token balance from the contract to the admin's address.
     */
    function withdraw() public onlyAfterSetEnd onlyBitPlaced onlyByAdmin {
        uint256 amount = aucToken.balanceOf(address(this));
        aucToken.transfer(msg.sender, amount);
    }
}
