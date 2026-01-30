import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ZETH, EthBridge, wZETH, PolyBridge } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MEC Bridge", function () {
  async function deployFixture() {
    const [owner, user] = await ethers.getSigners();

    const ZETH = await ethers.getContractFactory("ZETH");
    const zeth = await ZETH.deploy();
    await zeth.waitForDeployment();

    const EthBridge = await ethers.getContractFactory("EthBridge");
    const ethBridge = await EthBridge.deploy(await zeth.getAddress());
    await ethBridge.waitForDeployment();

    const WZETH = await ethers.getContractFactory("wZETH");
    const wzeth = await WZETH.deploy();
    await wzeth.waitForDeployment();

    const PolyBridge = await ethers.getContractFactory("PolyBridge");
    const polyBridge = await PolyBridge.deploy(await wzeth.getAddress());
    await polyBridge.waitForDeployment();

    const MINTER_ROLE = await wzeth.MINTER_ROLE();
    await wzeth.grantRole(MINTER_ROLE, await polyBridge.getAddress());

    return { zeth, ethBridge, wzeth, polyBridge, owner, user };
  }

  describe("ZETH", function () {
    it("Should mint 1M to deployer", async function () {
      const { zeth, owner } = await loadFixture(deployFixture);
      const supply = await zeth.INITIAL_SUPPLY();
      expect(await zeth.balanceOf(owner.address)).to.eq(supply);
    });

    it("Only owner can mint", async function () {
      const { zeth, user } = await loadFixture(deployFixture);
      await expect(zeth.connect(user).mint(user.address, ethers.parseEther("100"))).to.be.reverted;
    });
  });

  describe("EthBridge", function () {
    it("Lock should transfer ZETH and emit Deposit", async function () {
      const { zeth, ethBridge, owner } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("1000");
      await zeth.approve(await ethBridge.getAddress(), amount);
      await expect(ethBridge.lock(amount)).to.emit(ethBridge, "Deposit").withArgs(owner.address, amount);
      expect(await zeth.balanceOf(await ethBridge.getAddress())).to.eq(amount);
    });

    it("Only owner can unlock", async function () {
      const { ethBridge, user } = await loadFixture(deployFixture);
      await expect(ethBridge.connect(user).unlock(user.address, ethers.parseEther("100"))).to.be.reverted;
    });
  });

  describe("wZETH", function () {
    it("PolyBridge can mint after MINTER_ROLE", async function () {
      const { wzeth, polyBridge, user } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("500");
      await polyBridge.mintToken(user.address, amount);
      expect(await wzeth.balanceOf(user.address)).to.eq(amount);
    });
  });

  describe("PolyBridge", function () {
    it("burnToken burns user wZETH and emits Burn", async function () {
      const { wzeth, polyBridge, user } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("100");
      await polyBridge.mintToken(user.address, amount);
      await wzeth.connect(user).approve(await polyBridge.getAddress(), amount);
      await expect(polyBridge.connect(user).burnToken(amount)).to.emit(polyBridge, "Burn").withArgs(user.address, amount);
      expect(await wzeth.balanceOf(user.address)).to.eq(0);
    });
  });
});
