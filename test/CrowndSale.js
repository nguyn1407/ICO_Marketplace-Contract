const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers} = require("hardhat");
const {BigNumber} = ethers;
require('dotenv').config()

describe("CrownSale", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTokenFixture() {
    const [owner, acc1, acc2] = await ethers.getSigners();

    const UsdtToken = await ethers.getContractFactory("USDT");
    const usdtToken = await UsdtToken.deploy(); 

    const IcoToken = await ethers.getContractFactory("Token");
    const icoToken = await IcoToken.deploy(); 

    const Contract = await ethers.getContractFactory("CrowdSale");
    const contract = await Contract.deploy(1, 1, owner.address, icoToken);

    return { usdtToken, icoToken, contract, owner, acc1, acc2};
  }

  describe("setUSDTToken", function(){
    describe("Validation", function () {
      it("should be reverted if not owner", async function (){
        const {contract, usdtToken, owner, acc1} = await loadFixture(deployTokenFixture);

         await expect(contract.connect(acc1).setUSDTToken(await usdtToken.getAddress())).to.be.revertedWith("Ownable: caller is not the owner")
      });
    });
    describe("Event", function() {
      it("emit EventSetUSDTToken", async function(){
        const {contract, usdtToken, owner} = await loadFixture(deployTokenFixture);
        
        await expect(contract.connect(owner).setUSDTToken(await usdtToken.getAddress()))
        .to.emit(contract, "SetUSDTToken")
        .withArgs(await usdtToken.getAddress());
      });
    });

    describe("setUSDTToken", function(){
      it("should success set usdt token", async function(){
        const {contract, usdtToken, owner} = await loadFixture(deployTokenFixture);
        await contract.connect(owner).setUSDTToken(await usdtToken.getAddress());

        expect(await contract.usdtToken()).to.be.equal(await usdtToken.getAddress());
      })
    });
  });

  describe("buy Token by BNB", function(){
    describe("Validation", function(){
      it("should be revert because amount not greater than 0", async function(){
        const {contract, acc1} = await loadFixture(deployTokenFixture);

        await expect(contract.connect(acc1).buyTokenByBNB({
          value: ethers.parseEther('0')
        })).to.be.revertedWith("Amount is Zero");
      })

      it("should be revert because usdtToken.balanceOf(msg.sender) Insufficient", async function(){
        const {contract, acc1} = await loadFixture(deployTokenFixture);

        await expect(contract.connect(acc1).buyTokenByBNB({
          value: ethers.parseEther('1')
        })).to.be.revertedWith("Insufficient contract ballance");
      })

      /*it.only("should be revert because msg.sender.balance not equal or greater than amount", async function(){
        const {contract, icoToken, owner, acc1, acc2} = await loadFixture(deployTokenFixture);

        await icoToken.connect(owner).transfer(contract.getAddress(),100);
        expect (await icoToken.balanceOf(contract.getAddress())).to.be.equal(100);

         const provider = ethers.provider;

        const wallet = new ethers.Wallet(process.env.PRIV_KEY, provider);
        console.log("wallet balance: ", await provider.getBalance(await wallet.getAddress()));

        //const etherHex = ethers.parseEther("20000");
        // const ether = ethers.stripZerosLeft(
        //   ethers.toBeHex(etherHex)
        // );
        // await provider.send("hardhat_setBalance", [await wallet.getAddress(),etherHex]);
        // await acc1.sendTransaction({
        //   gasLimit: 21000,
        //   gasPrice: (await provider.getFeeData()).gasPrice,
        //   to: `${await wallet.getAddress()}`,
        //   value: ethers.parseEther("0.000000000000000001"), 
        // });
        console.log("wallet balance: ", await provider.getBalance(await wallet.getAddress()));
        // console.log("balance icoToken of contract",await icoToken.balanceOf(contract.getAddress()));
        //  console.log("balance ethers of acc1",await provider.getBalance(acc1.address));

        await expect(contract.connect(wallet).buyTokenByBNB({
          value: ethers.parseEther('0.00000000000000001')
        })).to.be.revertedWith("Insufficient account ballance");
      })*/
    });

    describe("buyTokenByBNB", function(){
      it("should success buy Token by BNB", async function(){
        const {contract, icoToken, owner, acc1, acc2} = await loadFixture(deployTokenFixture);

        await icoToken.connect(owner).transfer(contract.getAddress(),100);
        expect (await icoToken.balanceOf(contract.getAddress())).to.be.equal(100);

          //const provider = ethers.provider;
        // const twentyHex = ethers.parseEther("2000");
        // const twentyThousandEther = ethers.stripZerosLeft(
        //   ethers.toBeHex(twentyHex)
        // );
        // await provider.send("hardhat_setBalance", [acc1.address, twentyThousandEther]);

        // console.log("balance icoToken of contract",await icoToken.balanceOf(contract.getAddress()));
        // console.log("balance ethers of acc1",await provider.getBalance(owner.address));

        await (contract.connect(acc1).buyTokenByBNB({
          value: ethers.parseEther('0.000000000000000001')
        }));

        // console.log("balance ethers of acc1",await provider.getBalance(owner.address));

        expect(await icoToken.balanceOf(acc1.address)).to.be.equal(1);
      });
    });

    describe("Event", function(){
      it("should be emit event BuyTokenByBNB", async function(){
        const {contract, icoToken, owner, acc1, acc2} = await loadFixture(deployTokenFixture);

        await icoToken.connect(owner).transfer(contract.getAddress(), 100);
        // expect (await icoToken.balanceOf(contract.getAddress())).to.be.equal(100);

        await expect(contract.connect(acc1).buyTokenByBNB({
          value: ethers.parseEther('0.000000000000000001')
        })).to.emit(contract, "BuyTokenByBNB").withArgs(acc1.address, 1);
      });
    });
  });

  describe("buyTokenByUSDT", function(){
    describe("Validation", function(){
      it("should be revert because usdtToken.balanceOf(msg.sender) not equal or greater than amount", async function(){
        const {contract, usdtToken, icoToken, owner, acc1} = await loadFixture(deployTokenFixture);

        await contract.connect(owner).setUSDTToken(await usdtToken.getAddress());
        // expect(await contract.usdtToken()).to.be.equal(await usdtToken.getAddress());
        await expect(contract.connect(acc1).buyTokenByUSDT(1)).to.be.revertedWith("Insufficient account balance");
      });

      it("should be revert because amount not greater than 0", async function(){
        const {contract, usdtToken, icoToken, owner, acc1} = await loadFixture(deployTokenFixture);

        await contract.connect(owner).setUSDTToken(await usdtToken.getAddress());
        await usdtToken.connect(owner).transfer(acc1.address, 100);        
        
        await expect(contract.connect(acc1).buyTokenByUSDT(0)).to.be.revertedWith("Amount is zero");
      });

      it("should be revert because token.balanceOf(address(this) not greater than amount", async function(){
        const {contract, usdtToken, icoToken, owner, acc1} = await loadFixture(deployTokenFixture);

        await contract.connect(owner).setUSDTToken(await usdtToken.getAddress());
        await usdtToken.connect(owner).transfer(acc1.address, 100);        
        
        await expect(contract.connect(acc1).buyTokenByUSDT(1)).to.be.revertedWith("Insufficient contract balance");
      });

      it("should be revert because contract insufficient allowance", async function(){
        const {contract, usdtToken, icoToken, owner, acc1} = await loadFixture(deployTokenFixture);

        await contract.connect(owner).setUSDTToken(await usdtToken.getAddress());
        await usdtToken.connect(owner).transfer(acc1.address, 100);        
        await icoToken.connect(owner).transfer(contract.getAddress(), 100);

        await expect(contract.connect(acc1).buyTokenByUSDT(1)).to.be.revertedWith("ERC20: insufficient allowance");
      })
    });

    describe("buyTokenByUSDT", function(){
      it("should be buy Token by USDT success", async function(){
        const {contract, usdtToken, icoToken, owner, acc1} = await loadFixture(deployTokenFixture);

        await contract.connect(owner).setUSDTToken(await usdtToken.getAddress());
        await usdtToken.connect(owner).transfer(acc1.address, 100);        
        await icoToken.connect(owner).transfer(contract.getAddress(), 100);
        await usdtToken.connect(acc1).approve(contract.getAddress(), 1);

        // console.log("balance usdt of owner: ", await usdtToken.balanceOf(owner.address));
        await contract.connect(acc1).buyTokenByUSDT(1);
        expect(await icoToken.balanceOf(acc1.address)).to.be.equal(1);

        // console.log("balance usdt of owner: ", await usdtToken.balanceOf(owner.address));
        // console.log("balance ico of acc1: ", await icoToken.balanceOf(acc1.address));
      });
    });

    describe("Event", function(){
      it("should be emit success", async function(){
        const {contract, usdtToken, icoToken, owner, acc1} = await loadFixture(deployTokenFixture);

        await contract.connect(owner).setUSDTToken(await usdtToken.getAddress());
        await usdtToken.connect(owner).transfer(acc1.address, 100);        
        await icoToken.connect(owner).transfer(contract.getAddress(), 100);
        await usdtToken.connect(acc1).approve(contract.getAddress(), 1);

        await expect(contract.connect(acc1).buyTokenByUSDT(1)).to.emit(contract, "BuyTokenByUSDT").withArgs(acc1.address, 1);
      })
    })
  })
});
