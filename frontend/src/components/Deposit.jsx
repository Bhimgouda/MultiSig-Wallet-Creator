import {ethers, formatEther, parseEther, parseUnits} from "ethers"
import MULTI_SIG_WALLET_ABI from "../constants/walletAbi.json"
import { useWeb3Contract } from "react-moralis"
import { useState } from "react"
import toast from 'react-hot-toast';
import { BigNumber } from "@ethersproject/bignumber";

const Deposit = ({walletAddress}) => {
    const [depositValue, setDepositValue] = useState(0)

    const handleDepositChange = (e)=>{
        setDepositValue(e.target.value)
    }

    const {runContractFunction: deposit} = useWeb3Contract({
        abi: MULTI_SIG_WALLET_ABI,
        contractAddress: walletAddress,
        functionName: "deposit",
        msgValue: parseEther(`${depositValue || 0}`)
    })

    const {runContractFunction: getBalance} = useWeb3Contract({
        abi: MULTI_SIG_WALLET_ABI,
        contractAddress: walletAddress,
        functionName: "getBalance",
    })

    const handleGetBalance = async() =>{
        const balance = BigNumber.from(await getBalance()).toString(10)
        console.log(formatEther(balance))
    }

    const handleDeposit = async(e)=>{
        e.preventDefault()
        await deposit({
            onSuccess: handleDepositSuccess,
            onError: (e)=>{
                toast.error(e.message, {
                    position: "top-right"
                })
            }
        })
    }

    async function handleDepositSuccess(tx){
        toast.success(`Depositing ${depositValue} ETH`, {
            position: "top-right"
        })
        const receipt = await tx.wait(1)
        toast.success(`Deposited ${depositValue} ETH`, {
            position: "top-right"
        })
    }

    return ( 
        <div onSubmit={handleDeposit} className="wallet__deposit">
            <form>
                <input value={depositValue} onChange={handleDepositChange} name="deposit" type="number" />
                <button>Deposit</button>
            </form>
            <button onClick={handleGetBalance}>Get Balance</button>
        </div>
     );
}
 
export default Deposit;