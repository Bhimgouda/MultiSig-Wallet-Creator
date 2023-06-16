import { useMoralis, useWeb3Contract } from 'react-moralis';
import MULTI_SIG_WALLET_ABI from "../constants/walletAbi.json"
import WALLET_FACTORY_ABI from "../constants/walletFactoryAbi.json"
import WALLET_FACTORY_ADDRESSES from "../constants/walletFactoryAddresses.json"
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Deposit from '../components/Deposit';
import { parseEther } from 'ethers';
import toast from 'react-hot-toast';
import Sumbit from '../components/Submit';
import Transactions from '../components/Transactions.jsx'

const Wallet = ({CHAIN_ID}) => {
    const {account} = useMoralis()
    const [isWalletOwner, setIsWalletOwner] = useState();
    const [submitOpen, setSubmitOpen] = useState(false)

    const navigate = useNavigate()
    const {address: walletAddress}= useParams()

    const {runContractFunction: walletExists} = useWeb3Contract({
        contractAddress: WALLET_FACTORY_ADDRESSES[CHAIN_ID],
        abi: WALLET_FACTORY_ABI,
        functionName: "walletExists",
        params: {
            walletAddress: walletAddress
        }
    }) 

    const {runContractFunction: getOwners} = useWeb3Contract({
        abi: MULTI_SIG_WALLET_ABI,
        contractAddress: walletAddress,
        functionName: "getOwners",
    })
    
    useEffect(()=>{
        if(walletAddress.length !== 42) {
            console.log("Invalid URL Path")
            return navigate("/")
        }

        checkWalletExists()

        gettingOwners()
    }, [account, isWalletOwner])

    const checkWalletExists = async()=>{
        await walletExists({
            onSuccess: (data)=>{
                if(!data){
                    // Alert
                    console.log("MultiSig Wallet doesn't exist with US")
                    return navigate("/")
                }
            },
            onError: (e)=> {
                // Alert
                return navigate("/")
            }
        })
    }

    async function gettingOwners(){
        await getOwners({
          onSuccess: (data)=>{
            data = data.map(walletAddress=>walletAddress.toLowerCase())
            if(data.includes(account.toLowerCase())){
              setIsWalletOwner(true)
            }
            else setIsWalletOwner(false)
          },
          onError: (e)=>console.log(e)
        })
    }

    return (
    <>
        {
            isWalletOwner ? 
            <div className="wallet">
                <p>{walletAddress}</p>
                <Deposit walletAddress={walletAddress} />
                {/* <button onClick={} className='btn'>Submit A Transaction</button> */}
                <Sumbit CHAIN_ID={CHAIN_ID} walletAddress={walletAddress}/>
                <Transactions walletAddress={walletAddress}/>
            </div>
            : 
            <p style={{marginTop: "20px", fontSize: "21px"}}>This wallet can only be accessed by it's owners</p>
        }
    </>
    )
}
 
export default Wallet;