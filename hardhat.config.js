require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia.publicnode.com",
      accounts: [process.env.PRIV_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.API_KEY,
    },
  
  },
};