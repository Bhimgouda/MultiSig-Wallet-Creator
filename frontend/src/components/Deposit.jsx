import {parseEther} from "ethers"
import MULTI_SIG_WALLET_ABI from "../constants/walletAbi.json"
import { useWeb3Contract } from "react-moralis"
import { useState } from "react"
import { error, success } from "../utils/toastWrapper";

const Deposit = ({walletAddress, handleLoading, balance, updateBalance}) => {
    const [depositValue, setDepositValue] = useState("")

    const {runContractFunction} = useWeb3Contract()

    const walletFunctionParams = {
      contractAddress: walletAddress,
      abi: MULTI_SIG_WALLET_ABI,
    }

    function handleContractError(e){
        handleLoading(false)
        error(e.error?.message || e.message)
    }

    const handleDepositChange = (e)=>{
        setDepositValue(e.target.value)
    }


    const handleDeposit = async(e)=>{
        e.preventDefault()
        if(!depositValue || depositValue==="0") return error("Deposit value cannot be empty or 0")
        handleLoading(true)
        await runContractFunction({
            params: {...walletFunctionParams,functionName: "deposit", msgValue: parseEther(`${depositValue || 0}`)},
            onSuccess: handleDepositSuccess,
            onError: handleContractError
        })
    }

    async function handleDepositSuccess(tx){
        success(`Depositing ${depositValue} MATIC`)
        await tx.wait(1)
        await updateBalance()
        handleLoading(false)
        setDepositValue("")
        success(`Deposited ${depositValue} MATIC`)
    }

    return ( 
        <div onSubmit={handleDeposit} className="wallet__deposit container">
            <form className="container">
                <h2 style={{textAlign: "center", fontWeight: "lighter", marginBottom: "10px"}}>Wallet Balance</h2>
                <h1 style={{marginBottom: "10px"}} className="text--yellow">{balance} MATIC</h1>
                <div>
                    <input value={depositValue} onChange={handleDepositChange} placeholder="value in MATIC" name="deposit" type="number" />
                    <button className="btn btn--small">Deposit</button>
                </div>
            </form>
        </div>
     );
}
 
export default Deposit;