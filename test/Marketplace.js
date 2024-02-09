const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTokenFixture() {
   
    // Contracts are deployed using the first signer/account by default
    const [owner, acc1, acc2] = await ethers.getSigners();

    const NFT = await ethers.getContractFactory("Card");
    const nft = await NFT.deploy();

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();

    const Market = await ethers.getContractFactory("CardMarketplace");
    const market = await Market.deploy(token, nft);

    return { market, nft, owner, token, acc1, acc2};
  }

  describe("listNft", function(){
    describe("Validation", function(){
      it("should be revert because invalid token nft id", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;
        const price = 1;

        await expect(market.connect(acc1).listNft(nft_id, price)).to.be.revertedWith("ERC721: invalid token ID");
      });

      it("should be revert because not owner of nft", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;
        const price = 1;

        await nft.connect(owner).mint(acc1.address, nft_id);
        await expect(market.connect(acc2).listNft(nft_id, price)).to.be.revertedWith("You are not owner of this nft");
      });

      it("should be revert because Marketplace is not approval to tranfer this nft", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;
        const price = 1;

        await nft.connect(owner).mint(acc1.address, nft_id);
        await expect(market.connect(acc1).listNft(nft_id, price)).to.be.revertedWith("Marketplace is not approval to tranfer this nft");
      });
    });

    describe("listNft", function(){
      it("should be list nft success", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;
        const price = 1;

        await nft.connect(owner).mint(acc1.address, nft_id);
        await nft.connect(acc1).approve(market.getAddress(), nft_id);
        await market.connect(acc1).listNft(nft_id, price);

        // const listDetail = await market.listDetail();
        // expect(await listDetail[1].author).to.be.equal(acc1.address);
        expect(await nft.ownerOf(nft_id)).to.be.equal(await market.getAddress());
        expect(await nft.ownerOf(nft_id)).to.be.not.equal(acc1.address);
      });
    });

    describe("Event", function(){
      it("should be emit list nft success", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;
        const price = 1;

        await nft.connect(owner).mint(acc1.address, nft_id);
        await nft.connect(acc1).approve(market.getAddress(), nft_id);
        await expect(market.connect(acc1).listNft(nft_id, price)).to.emit(market, "ListNft").withArgs(acc1.address, nft_id, price);
      });
    });
  });

  describe("unListnft", function(){
    describe("Validation", function(){
      it("should be revert because token doesn't exit on marketplace", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;
        const price = 1;

        await nft.connect(owner).mint(acc1.address, nft_id);
        await nft.connect(acc1).approve(market.getAddress(), nft_id);
        // await market.connect(acc1).listNft(nft_id, price);

        await expect(market.connect(acc1).unListnft(nft_id)).to.be.revertedWith("This token doesn't exit on marketplace");
      });

      it("should be revert because Only Owner can unlist this nft", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;
        const price = 1;

        await nft.connect(owner).mint(acc1.address, nft_id);
        await nft.connect(acc1).approve(market.getAddress(), nft_id);
        await market.connect(acc1).listNft(nft_id, price);

        await expect(market.connect(acc2).unListnft(nft_id)).to.be.revertedWith("Only Owner can unlist this nft");
      });
    });

    describe("unListnft", function(){
      it("should unlist nft success", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;
        const price = 1;

        await nft.connect(owner).mint(acc1.address, nft_id);
        await nft.connect(acc1).approve(market.getAddress(), nft_id);
        await market.connect(acc1).listNft(nft_id, price);
        await market.connect(acc1).unListnft(nft_id);

        expect(await nft.ownerOf(nft_id)).to.be.equal(acc1.address);
        expect(await nft.ownerOf(nft_id)).to.be.not.equal(market.getAddress());
      });
    });

    describe("Event", function(){
      it("should emit unlist nft success", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;
        const price = 1;

        await nft.connect(owner).mint(acc1.address, nft_id);
        await nft.connect(acc1).approve(market.getAddress(), nft_id);
        await market.connect(acc1).listNft(nft_id, price);

        await expect(market.connect(acc1).unListnft(nft_id)).to.emit(market, "UnListNft").withArgs(acc1.address, price);
      });
    });
  });

  describe("buyNft", function(){
    describe("Validation", function(){
      it("should be revert because This Nft doesn't exit on marketplace", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;
        const price = 1;

        await nft.connect(owner).mint(acc1.address, nft_id);
        //await nft.connect(acc1).approve(market.getAddress(), nft_id);
        // await market.connect(acc1).listNft(nft_id, price);

        await token.connect(owner).transfer(acc2.address, 100);

        await expect(market.connect(acc2).buyNft(nft_id, price)).to.be.revertedWith("This Nft doesn't exit on marketplace");
      });

      it("should be revert because Insufficient account balance", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;
        const price = 1;

        await nft.connect(owner).mint(acc1.address, nft_id);
        await nft.connect(acc1).approve(market.getAddress(), nft_id);
        await market.connect(acc1).listNft(nft_id, price);

        await expect(market.connect(acc2).buyNft(nft_id, price)).to.be.revertedWith("Insufficient account balance");
      });

      it("should be revert because Minimum price has not been reached", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;
        const price = 10;
        const price_buy = 1;

        await nft.connect(owner).mint(acc1.address, nft_id);
        await nft.connect(acc1).approve(market.getAddress(), nft_id);
        await market.connect(acc1).listNft(nft_id, price);
        await token.connect(owner).transfer(acc2.address, 100);

        // price_buy should >= price
        await expect(market.connect(acc2).buyNft(nft_id, price_buy)).to.be.revertedWith("Minimum price has not been reached");
      });

      it("should be revert because ERC20: insufficient allowance", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1;
        const price = 1;

         await nft.connect(owner).mint(acc1.address, nft_id);
        await nft.connect(acc1).approve(market.getAddress(), nft_id);
        await market.connect(acc1).listNft(1, price);
        await token.connect(owner).transfer(acc2.address, 100);

        await expect(market.connect(acc2).buyNft(nft_id, price)).to.be.revertedWith("ERC20: insufficient allowance");
      });
    });

    describe("buyNft", function(){
      it("should buy nft success", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);
        
        const nft_id = 1;
        const price = 1;
        
        await nft.connect(owner).mint(acc1.address, nft_id);
        await nft.connect(acc1).approve(market.getAddress(), nft_id);
        await market.connect(acc1).listNft(1, price);
        await token.connect(owner).transfer(acc2.address, 100);
        await token.connect(acc2).approve(market, price)
        await market.connect(acc2).buyNft(nft_id, price);

        expect(await nft.ownerOf(nft_id)).to.be.equal(acc2.address);
      });
    });

    describe("Event", function(){
      it("should emit BuyNft success", async function(){
        const  { market, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);
        
        const nft_id = 1;
        const price = 1;
        
        await nft.connect(owner).mint(acc1.address, nft_id);
        await nft.connect(acc1).approve(market.getAddress(), nft_id);
        await market.connect(acc1).listNft(1, price);
        await token.connect(owner).transfer(acc2.address, 100);
        await token.connect(acc2).approve(market, price)

        await expect(market.connect(acc2).buyNft(nft_id, price)).to.emit(market, "BuyNft").withArgs(acc2.address, nft_id, price);
      })
    })
  });
});

