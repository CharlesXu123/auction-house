// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const initialSupply = ethers.parseUnits("1000", 18); // 1000 tokens
  console.log("Initial supply:", initialSupply);

  const AUC = await hre.ethers.getContractFactory("AUC");
  const auc = await AUC.deploy(initialSupply);

  await auc.waitForDeployment();

  console.log("AUC deployed to:", auc.target);

  // We also save the contract's artifacts and address in the frontend directory
  // saveFrontendFiles(token);
}

function saveFrontendFiles(token) {
  const fs = require("fs");
  const contractsDir = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "contracts"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Token: token.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("Token");

  fs.writeFileSync(
    path.join(contractsDir, "Token.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
