const {ethers, network} = require("hardhat")
const fs = require("fs")

module.exports = async function() {
    if(process.env.UPDATE_CONTRACT_DATA){
        console.log("Updating abi's and addresses in required places>>>>>>>")
        const MultiSigWallet = await ethers.getContract("MultiSigWallet")
        await updateAbi(MultiSigWallet);
        await updateContractAddresses(MultiSigWallet)
        console.log("Updated abi's and addresses.........")
    }
}

const ADDRESSES_FILES = ["../frontend/src/constants/contractAddresses.json"]
const ABI_FILES = ["../frontend/src/constants/contractAbi.json"]

async function updateAbi(contract) {
    // Getting the abi
    const abi = contract.interface.format(ethers.utils.FormatTypes.json)

    // Writing the new abi to the file
    ABI_FILES.forEach(FILE=>fs.writeFileSync(FILE, abi))
}

async function updateContractAddresses(contract){
    
    const chainId = network.config.chainId.toString()
    
    const contractAddresses = JSON.parse(fs.readFileSync(ADDRESSES_FILES[0], "utf8"))
    
    if(contractAddresses[chainId]){
        contractAddresses[chainId]["MultiSigWallet"] = contract.address
    }
    else {
        contractAddresses[chainId] = {
            "MultiSigWallet": contract.address
        }
    }
    
    ADDRESSES_FILES.forEach(FILE=>{
    fs.writeFileSync(FILE, JSON.stringify(contractAddresses))
    })
}
