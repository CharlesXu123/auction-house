const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuctionFactory", function () {
  let auctionFactory;
  let auctions = [];
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

  it("Should create auctions correctly", async function () {
    aucContract = await ethers.deployContract("AUC", [
      ethers.parseUnits("1", 18),
    ]);

    nftContract = await ethers.deployContract("AUNFT", ["name", "n"]);

    // create three tokens and auction them
    for (let i = 0; i < 3; i++) {
      await nftContract.safeMint(owner.address, "");
      await nftContract.approve(auctionFactory.target, i);

      await expect(
        auctionFactory.createAuction(
          nftContract.target,
          aucContract.target,
          i,
          startingPrice,
          duration
        )
      ).to.emit(auctionFactory, "AuctionCreated");

      // Check if auction contract is created
      const auctionAddress = await auctionFactory.auctions(i);
      expect(auctionAddress).to.be.properAddress;
      auctions.push(await ethers.getContractAt("Auction", auctionAddress));

      // Check if the NFT is transferred to the auction contract
      const tokenOwner = await nftContract.ownerOf(i);
      expect(tokenOwner).to.equal(auctionAddress);

      // Check if the auction is marked as created
      const created = await auctionFactory.isAuction(nftContract.target, i);
      expect(created).to.be.true;
    }
  });

  it("Should not create an auction for an NFT item if it already exists", async function () {
    await expect(
      auctionFactory.createAuction(
        nftContract.target,
        aucContract.target,
        tokenId,
        startingPrice,
        duration
      )
    ).to.be.revertedWith("Auction already exists for this NFT item.");

    // Check if auction contract is created
    const auctionAddress = await auctionFactory.auctions(0);
    expect(auctionAddress).to.be.properAddress;

    // Check if the NFT is transferred to the auction contract
    const tokenOwner = await nftContract.ownerOf(tokenId);
    expect(tokenOwner).to.equal(auctionAddress);
  });

  it("Should allow admin to change the admin address", async function () {
    await auctionFactory.connect(owner).changeAdmin(addr1.address);
    expect(await auctionFactory.admin()).to.equal(addr1.address);

    // change back to owner
    await auctionFactory.connect(addr1).changeAdmin(owner.address);
  });

  it("Should allow admin to add a new manager", async function () {
    await auctionFactory.connect(owner).addManager(addr2.address);
    expect(
      await auctionFactory.hasRole(auctionFactory.MANAGER_ROLE(), addr2.address)
    ).to.be.true;
  });

  it("Should allow admin to remove a manager", async function () {
    await auctionFactory.connect(owner).addManager(addr2.address);
    await auctionFactory.connect(owner).removeManager(addr2.address);
    expect(
      await auctionFactory.hasRole(auctionFactory.MANAGER_ROLE(), addr2.address)
    ).to.be.false;
  });

  it("Should allow manager to set admin fee percent", async function () {
    const newAdminFee = 50; // 5%
    await auctionFactory.connect(owner).addManager(addr1.address);
    await auctionFactory.connect(addr1).setAdminFeePercent(newAdminFee);
    expect(await auctionFactory.adminFeePercent()).to.equal(newAdminFee);
  });

  it("Should allow manager to withdraw fees from ended auctions", async function () {
    const bidAmount = ethers.parseUnits("15", 18); // 15 AUC
    await aucContract.connect(addr1).approve(auctions[0].target, bidAmount);
    await aucContract.connect(addr1).mint(bidAmount);
    await auctions[0].connect(addr1).placeBid(bidAmount);
    await auctions[0].connect(owner).endAuction();

    await auctionFactory.connect(owner).addManager(addr1.address);
    await expect(auctionFactory.connect(addr1).withdrawFees()).to.not.be
      .reverted;
  });

  it("Should allow auction to be created again if it was ended", async function () {
    await auctions[1].connect(owner).endAuction();
    await nftContract.approve(auctionFactory.target, 1);

    await expect(
      auctionFactory.createAuction(
        nftContract.target,
        aucContract.target,
        1,
        startingPrice,
        duration
      )
    ).to.not.be.reverted;
  });
});
