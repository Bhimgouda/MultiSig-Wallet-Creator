import { useWeb3Contract } from "react-moralis";
import {ethers, parseEther} from "ethers"
import MULTI_SIG_WALLET_ABI from "../constants/walletAbi.json"
import { useState } from "react";
import { error, info, success } from "../utils/toastWrapper";

const Submit = ({walletAddress, handleSubmitted, handleLoading}) => {
    const [isContract, setIsContract] = useState();
    const [address, setAddress] = useState("");
    const [value, setValue] = useState("");
    const [callData, setCallData] = useState("0x");

    const {runContractFunction} = useWeb3Contract()

    const walletFunctionParams = {
      contractAddress: walletAddress,
      abi: MULTI_SIG_WALLET_ABI,
    }

    function handleContractError(e){
        handleLoading(false)
        error(e.error?.message || e.message)
    }

    const onAddressChange = async(e)=>{
        const address = e.target.value;
        setAddress(address)

        if(address.length !== 42) return;
        try{
            const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/NU-UqlzGIQ-MfsZXjzcdhNAbYCCrw3Ip"); // changes on production
            const code = await provider.getCode(address)
            
            if(code === "0x") setIsContract(false)
            else setIsContract(true)
        }
        catch(e){
            error("Please Enter a Valid Address")
        }
    }

    const handleValueChange = (e)=>{
        setValue(e.target.value)
    }

    const handleCallDataChange = (e)=>{
        setCallData(e.target.value)
    }

    const handleSubmitTransaction = async(e)=>{
        e.preventDefault()
        if(!isContract && !value || value === "0") return error("Invalid Transaction Value")
        handleLoading(true)
        await runContractFunction({
            params: {...walletFunctionParams,functionName: "submit", 
                params: {
                    _to: address,
                    value: parseEther(value.toString() || "0"),
                    _data: callData
               }
            },
            onSuccess: handleSubmitSuccess,
            onError: handleContractError
        })
    }

    const handleSubmitSuccess = async(tx)=>{
        info("Submitting Your Transaction")
        const receipt = await tx.wait(1)
        const txId = parseInt(receipt.events[0].args.txId)
        success(`Transcation submitted with Txn Id - ${txId}`)
        setAddress("")
        setValue("")
        setCallData("0x")
        handleSubmitted(txId)
    }

    return ( 
        <div className="wallet__submit container">
            <form className="container" onSubmit={handleSubmitTransaction}>
            <h2 style={{textAlign: "center"}}>Submit A New Transaction</h2>
                <div>
                    <input placeholder="address" value={address} onChange={onAddressChange} name="address" type="text"/>
                </div>
                <div>
                    <input type="number" value={value} onChange={handleValueChange} name="value" placeholder="value" />
                </div>
                {isContract === true ? 
                    <div className="data">
                        <input type="text" name='data' value={callData} onChange={handleCallDataChange} placeholder="data" />
                    </div>
                    :
                    null
                }
                <button className="btn btn--full btn--yellow">Submit</button>
            </form>
        </div>
    );
}
 
export default Submit;