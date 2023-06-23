const {network, ethers} = require("hardhat");
const {developmentChains, networkConfig} = require("../helper-hardhat.config")
const {verify} = require("../utils/verify")

// hre = hardhat runtime environment gives all this arguments to deploy scripts

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log, get} = deployments
    const {deployer} = await getNamedAccounts()

    const MultiSigFactory =  await deploy("MultiSigFactory", {
        from: deployer,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    const requiredApprovals = 2
    const owners = ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"]
    const timelock = 21
    const args = [owners, requiredApprovals, timelock]

    const MultiSigWallet = await deploy("MultiSigWallet", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    // Verify the deployment
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY || process.env.POLYGON_SCAN_API_KEY){
    log("Verifying...")
    await verify(MultiSigFactory.address);
    await verify(MultiSigWallet.address, args)
    }
    log("--------------------------------------")
}

module.exports.tags = ["all", "main"];
