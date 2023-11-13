require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");

require("dotenv").config();

const { API_URL, PRIVATE_KEY, ETHER_KEY } = process.env;

module.exports = {
  solidity: "0.8.20",
  // defaultNetwork: "sepolia",
  etherscan: {
    apiKey: ETHER_KEY,
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};
