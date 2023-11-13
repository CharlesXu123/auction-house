const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AUNFT Contract", function () {
  let AUNFT;
  let aunft;
  let owner;
  let addr1;
  let tokenURI1 = "https://example.com/nft1.json";

  beforeEach(async function () {
    [owner, addr1, ...addrs] = await ethers.getSigners();

    // Deploy the AUNFT contract
    AUNFT = await ethers.getContractFactory("AUNFT");
    aunft = await AUNFT.deploy("Auction NFT", "AUNFT");
  });

  describe("Deployment", function () {
    it("Should have the correct name and symbol", async function () {
      expect(await aunft.name()).to.equal("Auction NFT");
      expect(await aunft.symbol()).to.equal("AUNFT");
    });
  });

  describe("Minting NFTs", function () {
    it("Should mint an NFT and assign it to the right owner", async function () {
      await aunft.safeMint(addr1.address, tokenURI1);
      expect(await aunft.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should set the right token URI for the minted NFT", async function () {
      await aunft.safeMint(addr1.address, tokenURI1);
      expect(await aunft.tokenURI(0)).to.equal(tokenURI1);
    });
  });
});
