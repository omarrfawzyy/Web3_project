const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Tests", () => {
  describe("mint test", () => {
    let deployedContract;
    let accounts;
    beforeEach(async () => {
      accounts = await ethers.getSigners();
      let contract = await ethers.getContractFactory("NFT", accounts[0]);
      deployedContract = await contract.deploy();
      deployedContract = await deployedContract.deployed();
    });

    it("total Supply test", async () => {
      expect(await deployedContract.totalSupply()).to.equal(0);
    });

    it("tests Mint", async () => {
      let balanceBefore = await ethers.provider.getBalance(accounts[0].address);
      await deployedContract.connect(accounts[0]).mint(
        accounts[0].address, //to
        1, //amount
        {
          value: ethers.utils.parseEther("1"), //msg.value
        }
      );

      let balanceAfter = await ethers.provider.getBalance(accounts[0].address);

      balanceBefore = ethers.utils.formatEther(balanceBefore);
      balanceAfter = ethers.utils.formatEther(balanceAfter);
      expect(Math.floor(balanceBefore - balanceAfter)).to.equal(1);
      expect(await deployedContract.totalSupply()).to.equal(1);

      expect(await deployedContract.balanceOf(accounts[0].address)).to.equal(1);
      expect(await deployedContract.balances(accounts[0].address)).to.equal(1);

      expect(await deployedContract.ownerOf(0)).to.equal(accounts[0].address);
    });

    it("allows minting 3 times per user", async () => {
      const contract = await deployedContract.connect(accounts[1]);
      let balanceBefore = await ethers.provider.getBalance(accounts[1].address);

      await contract.mint(accounts[1].address, 3, {
        value: ethers.utils.parseEther("3"),
      });
      expect(await contract.balances(accounts[1].address)).to.equal(3);
      let balanceAfter = await ethers.provider.getBalance(accounts[1].address);

      balanceBefore = ethers.utils.formatEther(balanceBefore);
      balanceAfter = ethers.utils.formatEther(balanceAfter);
      expect(Math.floor(balanceBefore - balanceAfter)).to.equal(3);
    });

    it("prevent minting more than limit", async () => {
      const contract = await deployedContract.connect(accounts[2]);

      await contract.mint(accounts[2].address, 1, {
        value: ethers.utils.parseEther("1"),
      });

      let tx = contract.mint(accounts[2].address, 3, {
        value: ethers.utils.parseEther("3"),
      });

      await expect(tx).to.be.revertedWith("mint: limit reached");
    });

    it("prevent minting with no funds", async () => {
      const contract = await deployedContract.connect(accounts[3]);

      let tx = contract.mint(accounts[3].address, 1, {
        value: ethers.utils.parseEther("0"),
      });

      await expect(tx).to.be.revertedWith("error: funds sent is not enough");
    });

    it("prevent minting with amount of 0", async () => {
      const contract = await deployedContract.connect(accounts[3]);

      let tx = contract.mint(accounts[3].address, 0, {
        value: ethers.utils.parseEther("0"),
      });

      await expect(tx).to.be.revertedWith("mint: amount is 0");
    });
  });
});
