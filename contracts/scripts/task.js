const { ethers } = require("ethers");
const contractABI = require("../artifacts/contracts/AUC.sol/AUC.json");
const contractAddress = "0xb3828aF7F16edbeEEf43B5403871a5d979efA521";

async function main() {
  let provider = new ethers.JsonRpcProvider(
    "https://eth-sepolia.g.alchemy.com/v2/pcjjcQcOuS85p6sydyA_3o7fUhxir6wL"
  );
  let contract = new ethers.Contract(
    contractAddress,
    contractABI.abi,
    provider
  );
  let res = await contract.balanceOf(
    "0x761BEE0287f1a68952750a178D23385575ba6Da9"
  );
  console.log("res: ", res.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
