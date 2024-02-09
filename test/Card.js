const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Card", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTokenFixture() {
   
    // Contracts are deployed using the first signer/account by default
    const [owner, acc1, acc2] = await ethers.getSigners();

    const Card = await ethers.getContractFactory("Card");
    const card = await Card.deploy();

    return { card, owner, acc1, acc2};
  }

  describe("Deployment", function () {
    it("should set right symbol", async function () {
      const {card, owner, acc1} = await loadFixture(deployTokenFixture);

      expect (await card.symbol()).to.equal("Card");
    });

    it("should set right name", async function () {
      const {card, owner} = await loadFixture(deployTokenFixture);

      expect (await card.name()).to.equal("Sticky Card");
    });
  });

  describe("setBaseUrl", function(){
    describe("Validation", function(){
      it("Should be revert because not owner", async function(){
        const {card, acc1} = await loadFixture(deployTokenFixture);

        await expect(card.connect(acc1).setBaseUrl("https://ipfs.io/ipfs/QmXTvuP7cp2vbgU5TTzUyLjRJHAF6vf1bdZrQhecdVWQLD/"))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    // describe("setBaseUrl", function(){
    //   it.only("Should set base url success", async function(){
    //     const {card, owner} = await loadFixture(deployTokenFixture);

    //     await card.connect(owner).setBaseUrl("https://ipfs.io/ipfs/QmXTvuP7cp2vbgU5TTzUyLjRJHAF6vf1bdZrQhecdVWQLD/");
    //     expect(await card._baseURI()).to.be.equal("https://ipfs.io/ipfs/QmXTvuP7cp2vbgU5TTzUyLjRJHAF6vf1bdZrQhecdVWQLD/");
    //   });
    // })
  });

  describe("mint", function(){
    describe("Validation", function(){
      it("should be revert because not owner", async function(){
        const {card, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;

        await expect(card.connect(acc1).mint(acc2.address, nft_id))
          .to.be.revertedWith("Caller is not minter");
      });
    });

    describe("Mint", function(){
      it("should mint success", async function(){
        const {card, owner, acc1} = await loadFixture(deployTokenFixture);

        const nft_id = 1;

        await card.connect(owner).mint(acc1.address, nft_id);
        
        // 0 - the first index in list nft of acc1
        expect(await card.tokenOfOwnerByIndex(acc1.address, 0)).to.be.equal(1);
      });
    });

    describe("Event", function(){
      it("should emit success", async function(){
        const {card, owner, acc1} = await loadFixture(deployTokenFixture);

        const nft_id = 1;

        await expect(card.connect(owner).mint(acc1.address, nft_id)).to.emit(card, "Mint")
          .withArgs(acc1.address, nft_id, 1);
      });
    });

  });
});
