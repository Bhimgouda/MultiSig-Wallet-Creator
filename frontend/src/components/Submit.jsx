import { useMoralis, useWeb3Contract } from "react-moralis";
import {ethers} from "ethers"
import MULTI_SIG_WALLET_ABI from "../constants/contractAbi.json"
import MULTI_SIG_WALLET_ADDRESSES from "../constants/contractAddresses.json"
import { useState } from "react";

const CHAIN_ID = 31337;
const MULTI_SIG_WALLET_ADDRESS = MULTI_SIG_WALLET_ADDRESSES[CHAIN_ID]["MultiSigWallet"]

const Sumbit = () => {
    const [isContract, setIsContract] = useState();
    const [address, setAddress] = useState();
    const [value, setValue] = useState();
    const [callData, setCallData] = useState("0x");

    const validateAddress = async(e)=>{
        const address = e.target.value;
        if(address.length !== 42) return;
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/"); // changes on production
        const code = await provider.getCode(address)
        
        if(code === "0x") setIsContract(false)
        else setIsContract(true)
    }

    const {runContractFunction: submitTransaction} = useWeb3Contract({
        contractAddress: MULTI_SIG_WALLET_ADDRESS,
        abi: MULTI_SIG_WALLET_ABI,
        functionName: "submit",
        params: {
            _to: address,
            value,
            callData
        }
    })

    return ( 
    <form onSubmit={()=>{
        submitTransaction({
            onSuccess: (data)=>{
                console.log(data)
            },
            onError: (e)=>console.log(e)
        })
    }}>
        <input placeholder="address" onChange={validateAddress} name="address" type="text"/>
        {isContract === false ? 
            <div>
                <input type="number" name="value" placeholder="value" />
            </div>
            :
            null
        }
        <button>SUBMIT</button>
    </form>
    );
}
 
export default Sumbit;