// Import ethers from Hardhat package
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const AUNFT = await hre.ethers.getContractFactory("AUNFT");
  const aunft = await AUNFT.deploy(
    "0x761BEE0287f1a68952750a178D23385575ba6Da9",
    "first auction token",
    "AUNFT1"
  );

  await aunft.waitForDeployment();

  console.log("AUC deployed to:", aunft.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
