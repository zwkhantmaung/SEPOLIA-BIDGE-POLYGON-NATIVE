import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // 1. Deploy ZETH
  const ZETH = await ethers.getContractFactory("ZETH");
  const zeth = await ZETH.deploy();
  await zeth.waitForDeployment();
  const zethAddress = await zeth.getAddress();
  console.log("ZETH deployed to:", zethAddress);

  // 2. Deploy EthBridge (needs ZETH address)
  const EthBridge = await ethers.getContractFactory("EthBridge");
  const ethBridge = await EthBridge.deploy(zethAddress);
  await ethBridge.waitForDeployment();
  const ethBridgeAddress = await ethBridge.getAddress();
  console.log("EthBridge deployed to:", ethBridgeAddress);

  // 3. Deploy wZETH
  const WZETH = await ethers.getContractFactory("wZETH");
  const wzeth = await WZETH.deploy();
  await wzeth.waitForDeployment();
  const wzethAddress = await wzeth.getAddress();
  console.log("wZETH deployed to:", wzethAddress);

  // 4. Deploy PolyBridge (needs wZETH address)
  const PolyBridge = await ethers.getContractFactory("PolyBridge");
  const polyBridge = await PolyBridge.deploy(wzethAddress);
  await polyBridge.waitForDeployment();
  const polyBridgeAddress = await polyBridge.getAddress();
  console.log("PolyBridge deployed to:", polyBridgeAddress);

  // 5. Grant MINTER_ROLE to PolyBridge so it can mint wZETH
  const MINTER_ROLE = await wzeth.MINTER_ROLE();
  const tx = await wzeth.grantRole(MINTER_ROLE, polyBridgeAddress);
  await tx.wait();
  console.log("Granted MINTER_ROLE to PolyBridge");

  // 6. Optional: Deploy ResetContract
  const ResetContract = await ethers.getContractFactory("ResetContract");
  const resetContract = await ResetContract.deploy();
  await resetContract.waitForDeployment();
  console.log("ResetContract deployed to:", await resetContract.getAddress());

  console.log("\n--- Summary ---");
  console.log("ZETH:", zethAddress);
  console.log("EthBridge:", ethBridgeAddress);
  console.log("wZETH:", wzethAddress);
  console.log("PolyBridge:", polyBridgeAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
