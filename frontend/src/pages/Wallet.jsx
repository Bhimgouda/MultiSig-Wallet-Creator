import { useMoralis, useWeb3Contract } from 'react-moralis';
import MULTI_SIG_WALLET_ABI from "../constants/walletAbi.json"
import WALLET_FACTORY_ABI from "../constants/walletFactoryAbi.json"
import WALLET_FACTORY_ADDRESSES from "../constants/walletFactoryAddresses.json"
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CHAIN_ID = 31337;

const Wallet = () => {
    const {isWeb3Enabled, account, chainId} = useMoralis()
    const [isWalletOwner, setIsWalletOwner] = useState();
    const [wallet, setWallet] = useState("")
    
    const navigate = useNavigate()
    const {address}= useParams()

    const {runContractFunction: walletExists} = useWeb3Contract({
        contractAddress: WALLET_FACTORY_ADDRESSES[CHAIN_ID],
        abi: WALLET_FACTORY_ABI,
        functionName: "walletExists",
        params: {
            walletAddress: wallet
        }
    }) 

    const {runContractFunction: getOwners} = useWeb3Contract({
        abi: MULTI_SIG_WALLET_ABI,
        contractAddress: wallet,
        functionName: "getOwners",
    })
    
    useEffect(()=>{
        if(!isWeb3Enabled || CHAIN_ID !== parseInt(chainId)) return setIsWalletOwner(false)

        if(address.length !== 42) {
            alert("Invalid URL Path")
            return navigate("/")
        }

        setWallet(address)
        checkWalletExists()

        gettingOwners()
    }, [isWeb3Enabled, chainId, account])

    const checkWalletExists = async()=>{
        await walletExists({
            onSuccess: (data)=>{
                if(!data){
                    alert("MultiSig Wallet doesn't exist with US")
                    return navigate("/")
                }
            },
            onError: (e)=> alert(e)
        })
    }

    async function gettingOwners(){
        await getOwners({
          onSuccess: (data)=>{
            data = data.map(address=>address.toLowerCase())
            if(data.includes(account.toLowerCase())){
              setIsWalletOwner(true)
            }
          },
          onError: (e)=>console.log(e)
        })
    }

    return (isWeb3Enabled ? (isWalletOwner ? 
            <div className="wallet">
            </div>
            : 
            <p style={{marginTop: "20px", fontSize: "21px"}}>This wallet can only be accessed by it's owners</p>)
            :
            <p>Please Enable Web3 and Swicth to Polygon Mainnet</p>
    );
}
 
export default Wallet;