// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // const token = await hre.ethers.deployContract("Floppy");
  // await token.waitForDeployment();
  // const vault = await hre.ethers.deployContract("Vault");

  // await vault.waitForDeployment();

  // console.log(`token address ${token.target}`);
  // console.log(`vault address ${vault.target}`)
  

  // const USDT = await hre.ethers.deployContract("USDT");
  // await USDT.waitForDeployment();
  // console.log(`USDT address ${USDT.target}`)

  // const ICO = await hre.ethers.deployContract("FLPCrowdSale",[1000,100,"0x652C02bE862A244F3BC25eb98B740738f48935cF", "0x87B515F410B44912Bc7625a017d2A2610475FCEA"]);
  // await ICO.waitForDeployment();
  // console.log(`ICO address ${ICO.target}`)

  // const hero = await hre.ethers.deployContract("Hero");
  // await hero.waitForDeployment();
  // console.log(`hero address ${hero.target}`);

  const marketplace = await hre.ethers.deployContract("HeroMarketplace", ["0x87B515F410B44912Bc7625a017d2A2610475FCEA", "0x716aeE5EE46A7C0B3691DD8c9B099237a3629c7A"]);
  await marketplace.waitForDeployment();
  console.log(`heromarket address ${marketplace.target}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
