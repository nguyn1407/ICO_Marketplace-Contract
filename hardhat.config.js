require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
console.log(process.env.PRIV_KEY)
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