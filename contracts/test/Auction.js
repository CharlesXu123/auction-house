const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Auction", function () {
  let auction;
  let auc;
  let aunft;
  let auctionFactory;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let admin;

  const tokenId = 0;
  const startingPrice = ethers.parseUnits("10", "ether"); // 10 AUC
  const duration = 86400; // 1 day in seconds
  const adminFeePercent = 25; // 2.5%

  beforeEach(async function () {
    // Deploy AUC (ERC20) and AUNFT (ERC721) contracts
    auc = await ethers.deployContract("AUC", [ethers.parseUnits("1000", 18)]);
    aunft = await ethers.deployContract("AUNFT", ["test NFT", "TNFT"]);
    auctionFactory = await ethers.deployContract("AuctionFactory", [
      adminFeePercent,
    ]);

    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    admin = owner;

    // Deploy the Auction contract
    auction = await ethers.deployContract("Auction", [
      aunft.target,
      auc.target,
      owner.address,
      tokenId,
      startingPrice,
      duration,
      owner.address,
      adminFeePercent,
      auctionFactory.target,
    ]);

    // Mint AUC tokens to test addresses
    await auc.transfer(addr1.address, ethers.parseUnits("100", 18));
    await auc.transfer(addr2.address, ethers.parseUnits("100", 18));

    // Mint AUNFT token and approve Auction contract
    await aunft.safeMint(owner.address, tokenId);
    await aunft.transferFrom(owner.address, auction.target, tokenId);
  });

  describe("Auction Creation", function () {
    it("Should correctly initialize the auction", async function () {
      expect(await auction.nft()).to.equal(aunft.target);
      expect(await auction.aucToken()).to.equal(auc.target);
      expect(await auction.tokenId()).to.equal(tokenId);
      expect(await auction.startingPrice()).to.equal(startingPrice);
      expect(await auction.admin()).to.equal(owner.address);
      expect(await auction.adminFeePercent()).to.equal(adminFeePercent);
    });
  });

  describe("Bidding", function () {
    it("Should accept a valid bid", async function () {
      // Approve AUC spending and place a bid
      const bidAmount = ethers.parseUnits("15", 18); // 15 AUC
      await auc.connect(addr1).approve(auction.target, bidAmount);
      await auction.connect(addr1).placeBid(bidAmount);

      expect(await auction.bidPlaced()).to.equal(true);
      expect(await auction.highestBid()).to.equal(bidAmount);
      expect(await auction.highestBidder()).to.equal(addr1.address);
    });

    it("Should not accept a lower bid", async function () {
      const firstBidAmount = ethers.parseUnits("15", 18);
      const secondBidAmount = ethers.parseUnits("12", 18); // Lower than first bid

      await auc.connect(addr1).approve(auction.target, firstBidAmount);
      await auction.connect(addr1).placeBid(firstBidAmount);

      await expect(
        auction.connect(addr2).placeBid(secondBidAmount)
      ).to.be.revertedWith("There already is a higher bid");
    });
  });

  describe("Auction Cancel", function () {
    it("Should cancel the auction", async function () {
      const bidAmount = ethers.parseUnits("15", 18); // 15 AUC
      await auc.connect(addr1).approve(auction.target, bidAmount);
      await auction.connect(addr1).placeBid(bidAmount);

      await expect(auction.connect(owner).cancelAuction()).to.emit(
        auction,
        "AuctionEnded"
      );

      expect(await auction.ended()).to.equal(true);
      expect(await aunft.ownerOf(tokenId)).to.equal(owner.address);
      expect(await auc.balanceOf(addr1)).to.equal(ethers.parseUnits("100", 18));
    });
  });

  describe("Auction End", function () {
    it("Should end the auction and transfer NFT to highest bidder, transfer hughest bid - admin fee to auctionner if there is bid placed", async function () {
      const bidAmount = ethers.parseUnits("20", 18);
      await auc.connect(addr1).approve(auction.target, bidAmount);
      await auction.connect(addr1).placeBid(bidAmount);

      await auction.connect(owner).endAuction();
      expect(await auction.ended()).to.equal(true);

      // Calculate the admin fee
      const adminFee =
        (bidAmount * ethers.getBigInt(adminFeePercent)) /
        ethers.getBigInt(1000);

      expect(await auc.balanceOf(auction.target)).to.equal(adminFee);

      // Calculate the seller's share
      const sellerShare = bidAmount - adminFee;
      expect(await auc.balanceOf(owner.address)).to.equal(
        sellerShare + ethers.parseUnits("800", 18)
      );

      // Check if the NFT is transferred to the highest bidder
      expect(await aunft.ownerOf(tokenId)).to.equal(addr1.address);
    });

    it("Should end the auction and transfer NFT to auctionner if there is no bid placed", async function () {
      await auction.connect(owner).endAuction();
      expect(await auction.ended()).to.equal(true);

      // Check if the NFT is transferred to the auctionner
      expect(await aunft.ownerOf(tokenId)).to.equal(owner.address);
    });
  });

  describe("Lower Starting Price", function () {
    it("Should lower the starting price if no bid is placed", async function () {
      const newStartingPrice = ethers.parseUnits("8", "ether");
      await auction.connect(owner).lowerStartingPrice(newStartingPrice);
      expect(await auction.startingPrice()).to.equal(newStartingPrice);
    });

    it("Should not lower the starting price if there is a bid placed", async function () {
      const bidAmount = ethers.parseUnits("20", 18);
      await auc.connect(addr1).approve(auction.target, bidAmount);
      await auction.connect(addr1).placeBid(bidAmount);

      const newStartingPrice = ethers.parseUnits("8", "ether");
      await expect(
        auction.connect(owner).lowerStartingPrice(newStartingPrice)
      ).to.be.revertedWith("Bid already placed.");
    });
  });

  describe("claimNFT", function () {
    it("should allow the highest bidder to claim the NFT after the auction ends", async function () {
      const bidAmount = ethers.parseUnits("20", 18);
      await auc.connect(addr1).approve(auction.target, bidAmount);
      await auction.connect(addr1).placeBid(bidAmount);

      // Fast-forward time to simulate auction end
      await ethers.provider.send("evm_increaseTime", [duration]);
      await ethers.provider.send("evm_mine", []);

      // Claim the NFT
      await expect(auction.connect(addr2).claimNFT())
        .to.emit(auction, "AuctionEnded")
        .withArgs(addr1.address, bidAmount);

      // Calculate the admin fee
      const adminFee =
        (bidAmount * ethers.getBigInt(adminFeePercent)) /
        ethers.getBigInt(1000);

      expect(await auc.balanceOf(auction.target)).to.equal(adminFee);

      // Calculate the seller's share
      const sellerShare = bidAmount - adminFee;
      expect(await auc.balanceOf(owner.address)).to.equal(
        sellerShare + ethers.parseUnits("800", 18)
      );

      // Check if the NFT is transferred to the highest bidder
      expect(await aunft.ownerOf(tokenId)).to.equal(addr1.address);
    });

    it("should fail if the auction has not ended", async function () {
      // Attempt to claim the NFT before auction ends
      await expect(auction.connect(addr1).claimNFT()).to.be.revertedWith(
        "Auction still ongoing."
      );
    });
  });

  describe("Auction Contract - Withdraw Functionality", function () {
    it("should allow to withdraw the accumulated fees after the auction ends", async function () {
      const bidAmount = ethers.parseUnits("20", 18);
      await auc.connect(addr1).approve(auction.target, bidAmount);
      await auction.connect(addr1).placeBid(bidAmount);

      await auction.connect(owner).endAuction();

      // Admin withdraws the accumulated fees
      const initialBalance = await auc.balanceOf(admin.address);
      const contractBalance = await auc.balanceOf(auction.target);
      await auction.connect(admin).withdraw();

      // Check the admin's balance post-withdrawal
      const finalBalance = await auc.balanceOf(admin.address);
      expect(finalBalance - initialBalance).to.equal(contractBalance);
    });

    it("should fail if the auction has not ended", async function () {
      // Attempt withdrawal before the auction ends
      await expect(auction.connect(admin).withdraw()).to.be.revertedWith(
        "Auction not yet set to ended."
      );
    });
  });
});
