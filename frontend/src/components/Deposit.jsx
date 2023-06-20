import {ethers, formatEther, parseEther, parseUnits} from "ethers"
import MULTI_SIG_WALLET_ABI from "../constants/walletAbi.json"
import { useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import toast from 'react-hot-toast';
import { BigNumber } from "@ethersproject/bignumber";
import { error, success } from "../utils/toastWrapper";

const Deposit = ({walletAddress}) => {
    const [depositValue, setDepositValue] = useState(0)
    const [balance, setBalance] = useState(0)

    useEffect(()=>{
        gettingBalance()
    }, [balance])

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

    const gettingBalance = async() =>{
        const balance = formatEther(BigNumber.from(await getBalance()).toString())
        setBalance(balance)
    }

    const handleDeposit = async(e)=>{
        e.preventDefault()
        await deposit({
            onSuccess: handleDepositSuccess,
            onError: (e)=>{
                error(e.message)
            }
        })
    }

    async function handleDepositSuccess(tx){
        success(`Depositing ${depositValue} ETH`)
        const receipt = await tx.wait(1)
        success(`Deposited - Your New Balance is ${"nothing"}`)
    }

    return ( 
        <div onSubmit={handleDeposit} className="wallet__deposit container">
            <form className="container">
                <h2 style={{textAlign: "center", fontWeight: "lighter"}}>Wallet Balance</h2>
                <h2 style={{marginBottom: "10px"}} className="text--yellow">{balance} ETH</h2>
                <div>
                    <input value={depositValue} onChange={handleDepositChange} name="deposit" type="number" />
                    <button className="btn btn--small">Deposit</button>
                </div>
            </form>
        </div>
     );
}
 
export default Deposit;