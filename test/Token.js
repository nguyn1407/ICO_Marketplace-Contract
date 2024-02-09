const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Token", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTokenFixture() {
   
    // Contracts are deployed using the first signer/account by default
    const [owner, acc1, acc2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();

    return { token, owner, acc1};
  }

  describe("Deployment", function () {
    it("should set right owner", async function () {
      const {token, owner} = await loadFixture(deployTokenFixture);

      expect (await token.owner()).to.equal(owner.address)
    });

    it("should assign total supply equal owner balance", async function() {
      const {token, owner} = await loadFixture(deployTokenFixture);

      expect(await token.totalSupply()).to.equal(await token.balanceOf(owner.address));
    });
  });

  describe("Mint", function(){
    it("should be owner", async function(){
      const {acc1} = await loadFixture(deployTokenFixture);

      expect (acc1.address).to.revertedWith("Ownable: caller is not the owner");
    });
    it("should total supply add amount equal or less than cap", async function() {
      const {token, owner} = await loadFixture(deployTokenFixture);
      
     const amount = 1000;
     await expect (token.mint(owner.address, amount)).to.be.revertedWith("VND: cap exceeded");
    });
  });
});
