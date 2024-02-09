const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Auction", function () {
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

    const Auction = await ethers.getContractFactory("Auction");
    const auction = await Auction.deploy(token, nft);

    const nft_id = 1;
    await nft.connect(owner).mint(acc1.address, nft_id);

    return { auction, nft, owner, token, acc1, acc2};
  }

  describe("createAuction", function(){
    describe("Validation", function(){
      it("should be revert because time stamp not right time start", async function(){
        const { auction, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1
        const initialPrice = 1
        const startTime = 18
        const endTime = 20

        await expect(auction.connect(acc1).createAuction(nft_id, initialPrice, startTime, endTime)).to.be
          .revertedWith("Auction can not start");
      });

      it("should be revert because time start least than time end", async function(){
        const { auction, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1
        const initialPrice = 1
        const startTime = 1807148728
        const endTime = 20

        await expect(auction.connect(acc1).createAuction(nft_id, initialPrice, startTime, endTime)).to.be
          .revertedWith("Auction can not end before it starts");
      });

      it("should be revert because Initial price must be greater than 0", async function(){
        const { auction, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1
        const initialPrice = 0
        const startTime = 1807148728
        const endTime = 1907148728

        await expect(auction.connect(acc1).createAuction(nft_id, initialPrice, startTime, endTime)).to.be
          .revertedWith("Initial price must be greater than 0");
      });

      it("should be revert because not owner of nft", async function(){
        const { auction, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1
        const initialPrice = 1
        const startTime = 1807148728
        const endTime = 1907148728

        await expect(auction.connect(acc2).createAuction(nft_id, initialPrice, startTime, endTime)).to.be
          .revertedWith("Must stake your own token");
      });

      it("should be revert because This contract must be approved to transfer the token", async function(){
        const { auction, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1
        const initialPrice = 1
        const startTime = 1807148728
        const endTime = 1907148728

        await expect(auction.connect(acc1).createAuction(nft_id, initialPrice, startTime, endTime)).to.be
          .revertedWith("This contract must be approved to transfer the token");
      });
    });
    describe("createAuction", function(){
      it("should create auction success", async function(){
        const { auction, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        const nft_id = 1
        const initialPrice = 1
        const startTime = 1807148728
        const endTime = 1907148728

        await nft.connect(acc1).approve(auction.getAddress(), nft_id);

        await auction.connect(acc1).createAuction(nft_id, initialPrice, startTime, endTime);
        expect(await nft.ownerOf(nft_id)).to.be.equal(await auction.getAddress());
      });
    });

    describe("joinAuction", function(){
      describe("Validation", function(){
        it("should be revert because Auction has not started", async function(){
          const { auction, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

          const nft_id = 1
          const initialPrice = 1
          const startTime = 1807148728
          const endTime = 1907148728

          await nft.connect(acc1).approve(auction.getAddress(), nft_id);
          await auction.connect(acc1).createAuction(nft_id, initialPrice, startTime, endTime);
          
          const auction_id = 0  // index of auction in list auctions 
          const bid = 1

          await expect(auction.connect(acc2).joinAuction(auction_id, bid)).to.be
            .revertedWith("Auction has not started");
        });

        // it.only("should be revert because Auction is already completed", async function(){
        //   const { auction, nft, owner, token, acc1, acc2} = await loadFixture(deployTokenFixture);

        //   const nft_id = 1
        //   const initialPrice = 1
        //   const startTime = 1707151530
        //   const endTime = 1707151533

        //   console.log("bllock time stamp: ", await time.latest());

        //   await nft.connect(acc1).approve(auction.getAddress(), nft_id);
        //   await auction.connect(acc1).createAuction(nft_id, initialPrice, startTime, endTime);
          
        //   const auction_id = 0  // index of auction in list auctions 
        //   const bid = 1

        //   await expect(auction.connect(acc2).joinAuction(auction_id, bid)).to.be
        //     .revertedWith("Auction is already completed");
        // });
      });
    });
  });
 
});

