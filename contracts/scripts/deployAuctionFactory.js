// Import ethers from Hardhat package
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const auctionFactory = await hre.ethers.deployContract("AuctionFactory", [
    25,
  ]);
  await auctionFactory.waitForDeployment();
  console.log("auctionFactory deployed to:", auctionFactory.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
