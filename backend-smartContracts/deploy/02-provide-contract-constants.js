const {ethers, network} = require("hardhat")
const fs = require("fs")

module.exports = async function() {
    if(process.env.UPDATE_CONTRACT_DATA){
        console.log("Updating abi's and addresses in required places>>>>>>>")
        const MultiSigWallet = await ethers.getContract("MultiSigWallet")
        const MultiSigFactory = await ethers.getContract("MultiSigFactory")

        await updateAbi(MultiSigWallet, "../frontend/src/constants/walletAbi.json")

        await updateAbi(MultiSigFactory, "../frontend/src/constants/walletFactoryAbi.json")
        await updateContractAddresses(MultiSigFactory, "../frontend/src/constants/walletFactoryAddresses.json")

        console.log("Updated abi's and addresses.........")
    }
}

async function updateAbi(contract, file) {
    // Getting the abi
    const abi = contract.interface.format(ethers.utils.FormatTypes.json)

    // Writing the new abi to the file
    fs.writeFileSync(file, abi)
}

async function updateContractAddresses(contract, file){
    
    const chainId = network.config.chainId.toString()
    
    const contractAddresses = JSON.parse(fs.readFileSync(file, "utf8"))
    
    if(contractAddresses[chainId]){
        contractAddresses[chainId] = contract.address
    }
    else {
        contractAddresses[chainId] = contract.address
    }
    
    fs.writeFileSync(file, JSON.stringify(contractAddresses))

}
