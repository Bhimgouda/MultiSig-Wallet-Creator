import { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Wallet from './components/Wallet';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import MULTI_SIG_WALLET_ABI from "./constants/contractAbi.json"
import MULTI_SIG_WALLET_ADDRESSES from "./constants/contractAddresses.json"

const CHAIN_ID = 31337;
const MULTI_SIG_WALLET_ADDRESS = MULTI_SIG_WALLET_ADDRESSES[CHAIN_ID]["MultiSigWallet"]

function App() {
  const {isWeb3Enabled, account, chainId, web3} = useMoralis()
  const [isWalletOwner, setIsWalletOwner] = useState();


  const {runContractFunction: getOwners} = useWeb3Contract({
    abi: MULTI_SIG_WALLET_ABI,
    contractAddress: MULTI_SIG_WALLET_ADDRESS,
    functionName: "getOwners",
  })

  useEffect(()=>{
    if(!isWeb3Enabled || CHAIN_ID !== parseInt(chainId)) return setIsWalletOwner(false)

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

    gettingOwners()
  },[isWeb3Enabled, chainId, account])

  return (
    <div className='main'>
      <Header />
      {isWeb3Enabled && isWalletOwner ? <Wallet /> : <p style={{marginTop: "20px", fontSize: "21px"}}>This wallet can only be accessed by it's owners</p>}
    </div>
  );
}

export default App;
