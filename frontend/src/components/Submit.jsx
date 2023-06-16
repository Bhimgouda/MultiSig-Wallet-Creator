import { useMoralis, useWeb3Contract } from "react-moralis";
import {ethers, parseEther} from "ethers"
import MULTI_SIG_WALLET_ABI from "../constants/walletAbi.json"
import { useState } from "react";
import { toast } from "react-hot-toast";

const Sumbit = ({walletAddress}) => {
    const [isContract, setIsContract] = useState();
    const [address, setAddress] = useState("");
    const [value, setValue] = useState(0);
    const [callData, setCallData] = useState("0x");

    const onAddressChange = async(e)=>{
        const address = e.target.value;
        setAddress(address)

        if(address.length !== 42) return;
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/"); // changes on production
        const code = await provider.getCode(address)
        
        if(code === "0x") setIsContract(false)
        else setIsContract(true)
    }

    const handleValueChange = (e)=>{
        setValue(e.target.value)
    }

    const handleCallDataChange = (e)=>{
        setCallData(e.target.value)
    }

    const {runContractFunction: submitTransaction} = useWeb3Contract({
        contractAddress: walletAddress,
        abi: MULTI_SIG_WALLET_ABI,
        functionName: "submit",
        params: {
            _to: address,
            value: parseEther(value.toString() || "0"),
            _data: callData
        }
    })

    const handleSubmitTransaction = async(e)=>{
        e.preventDefault()
        await submitTransaction({
            onSuccess: handleSubmitSuccess,
            onError: (e)=>toast.error(e.message, {position: "top-right"})
        })
    }

    const handleSubmitSuccess = async(tx)=>{
        toast("Submitting Your Transaction", {position: "top-right"})
        const receipt = await tx.wait(1)
        const txId = parseInt(receipt.events[0].args.txId)
        toast.success(`Your Transcation is submitted with TxId - ${txId}`, {position: "top-right"})
    }

    return ( 
    <form onSubmit={handleSubmitTransaction}>
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
        <button>SUBMIT</button>
    </form>
    );
}
 
export default Sumbit;