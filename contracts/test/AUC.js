const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AUC Token Contract", function () {
  let AUC;
  let aucToken;
  let owner;
  let addr1;
  let addr2;
  let initialSupply = ethers.parseUnits("1000", 18); // 1000 AUC tokens

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy the AUC contract
    AUC = await ethers.getContractFactory("AUC");
    aucToken = await AUC.deploy(initialSupply);
  });

  describe("Deployment", function () {
    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await aucToken.balanceOf(owner.address);
      expect(await aucToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should mint new tokens correctly", async function () {
      // Mint new tokens for addr1
      const mintAmount = ethers.parseUnits("100", 18);
      await aucToken.connect(addr1).mint(mintAmount);

      // Check addr1's balance
      const addr1Balance = await aucToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(mintAmount);
    });

    it("Should correctly update total supply after minting", async function () {
      const mintAmount = ethers.parseUnits("100", 18);
      await aucToken.connect(addr1).mint(mintAmount);

      // Check the total supply
      const totalSupply = await aucToken.totalSupply();
      const expectedTotalSupply = initialSupply + mintAmount;
      expect(totalSupply).to.equal(expectedTotalSupply);
    });
  });
});
