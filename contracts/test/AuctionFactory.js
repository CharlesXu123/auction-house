const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuctionFactory", function () {
  let auctionFactory;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let nftContract; // Mock or deployed NFT contract
  let aucContract; // Mock or deployed AUC contract
  let tokenId = 0;
  let startingPrice = ethers.parseUnits("1", 18);
  let duration = 86400; // 1 day in seconds
  let defaultAdminFee = 25; // 2.5% represented as 25 out of 1000

  // Deploy the contract before running tests
  before(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy the AuctionFactory contract
    auctionFactory = await ethers.deployContract("AuctionFactory", [
      defaultAdminFee,
    ]);
    console.log(
      "AuctionFactory deployed to:",
      auctionFactory.target,
      "by",
      owner.address
    );
  });

  it("Should set the right admin and default admin fee", async function () {
    expect(await auctionFactory.admin()).to.equal(owner.address);
    expect(await auctionFactory.adminFeePercent()).to.equal(defaultAdminFee);
  });

  it("Should create an auction correctly", async function () {
    aucContract = await ethers.deployContract("AUC", [
      ethers.parseUnits("1", 18),
    ]);

    nftContract = await ethers.deployContract("AUNFT", ["name", "n"]);
    await nftContract.safeMint(owner.address, "");

    await nftContract.approve(auctionFactory.target, tokenId);

    await expect(
      auctionFactory.createAuction(
        nftContract.target,
        aucContract.target,
        tokenId,
        startingPrice,
        duration
      )
    ).to.emit(auctionFactory, "AuctionCreated");

    // Check if auction contract is created
    const auctionAddress = await auctionFactory.auctions(0);
    expect(auctionAddress).to.be.properAddress;

    // Check if the NFT is transferred to the auction contract
    const tokenOwner = await nftContract.ownerOf(tokenId);
    expect(tokenOwner).to.equal(auctionAddress);
  });
});
