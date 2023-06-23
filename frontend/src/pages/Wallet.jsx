import { useMoralis, useWeb3Contract } from 'react-moralis';
import MULTI_SIG_WALLET_ABI from "../constants/walletAbi.json"
import WALLET_FACTORY_ABI from "../constants/walletFactoryAbi.json"
import WALLET_FACTORY_ADDRESSES from "../constants/walletFactoryAddresses.json"
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Deposit from '../components/Deposit';
import { formatEther } from 'ethers';
import Submit from '../components/Submit';
import Transactions from '../components/Transactions.jsx'
import { error } from '../utils/toastWrapper';
import Owners from '../components/Owners';
import { BigNumber } from '@ethersproject/bignumber';

const Wallet = ({CHAIN_ID, handleLoading}) => {
    const {account} = useMoralis()
    const [isWalletOwner, setIsWalletOwner] = useState();
    const [owners, setOwners] = useState([])
    // const [submitOpen, setSubmitOpen] = useState(false)
    const [submitted, setSubmitted] = useState();
    const walletAddressRef = useRef(null);
    const [balance, setBalance] = useState(0)
    const [isHovered, setIsHovered] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    
    const navigate = useNavigate()
    const {address: walletAddress}= useParams()

    console.log(walletAddress)

    const {runContractFunction} = useWeb3Contract()

    const walletFunctionParams = {
      contractAddress: walletAddress,
      abi: MULTI_SIG_WALLET_ABI,
    }

    const createWalletFunctionParams = {
      contractAddress: WALLET_FACTORY_ADDRESSES[CHAIN_ID],
      abi: WALLET_FACTORY_ABI,
    }
    
    const handleSubmitted = (txID)=>{
        setSubmitted(txID);
    }
    
    const handleMouseEnter = () => {
      setIsHovered(true);
    };
  
    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const handleCopyClick = () => {
        if (walletAddressRef.current) {
          const range = document.createRange();
          range.selectNode(walletAddressRef.current.children[2]);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
          document.execCommand('copy');
          window.getSelection().removeAllRanges();
        }
        setIsHovered(false)
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 500);
    };
    
    useEffect(()=>{
        if(walletAddress.length !== 42) {
            error("Invalid URL Path")
            return navigate("/")
        }

        checkWalletExists()

    }, [account, isWalletOwner])

    const checkWalletExists = async()=>{
        handleLoading(true)
        await runContractFunction({
            params: {...createWalletFunctionParams, functionName: "walletExists", params: {walletAddress: walletAddress}},
            onSuccess: (data)=>{
                if(!data){
                    error("MultiSig Wallet doesn't exist with US")
                    return navigate("/")
                }
                else {
                  gettingOwners()
                }
            },
            onError: (e)=> {
                error(e.error?.message || e.message)
                return navigate("/")
            }
        })
    }

    async function gettingOwners(){
        await runContractFunction({
          params: {...walletFunctionParams, functionName: "getOwners"},
          onSuccess: (data)=>{
            data = data.map(walletAddress=>walletAddress.toLowerCase())
            setOwners(data)
            if(data.includes(account.toLowerCase())){
              setIsWalletOwner(true)
              gettingBalance()
            }
            else setIsWalletOwner(false)
          },
          onError: (e)=>{
            error(e.error?.message || e.message)
          }
        })
    }

    const gettingBalance = async() =>{
      const balance = formatEther(BigNumber.from(await runContractFunction({
        params: {...walletFunctionParams, functionName: "getBalance"},
        onError: (e)=>error(e.error?.message || e.message)
      })).toString())
      setBalance(balance)
      handleLoading(false)
    }

    return (
        isWalletOwner ? (
          <div className="app">
            <div className="wallet">
              <div>
                {/* <span>Copy your multi-sig wallet address**</span> */}
                <p
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  ref={walletAddressRef}
                  onClick={handleCopyClick}
                  style={{ fontSize: "14px", marginBottom: "10px" }}
                  className="address"
                >
                  <h3>
                    Your <span className="text--yellow">MultiSig</span> Wallet Address
                  </h3>
                  <img className="icon icon--copy" src="/icons/copy.svg" alt="" />
                  <span>{walletAddress}</span>
                  {isHovered ? (
                    <span className="copy-notice">Click to copy</span>
                  ) : isCopied ? (
                    <span className="copy-notice">Copied!</span>
                  ) : null}
                </p>
              </div>
              <div className="container wallet__mid">
                <Owners handleLoading={handleLoading} owners={owners} />
                <Deposit
                  handleLoading={handleLoading}
                  walletAddress={walletAddress}
                  balance={balance}
                  updateBalance={gettingBalance}
                />
              </div>
              {/* <button onClick={} className='btn'>Submit A Transaction</button> */}
              <Submit
                handleLoading={handleLoading}
                handleSubmitted={handleSubmitted}
                CHAIN_ID={CHAIN_ID}
                walletAddress={walletAddress}
              />
            </div>
            <Transactions
              handleLoading={handleLoading}
              balance={balance}
              updateBalance={gettingBalance}
              submitted={submitted}
              walletAddress={walletAddress}
            />
          </div>
        ) : (
          <p style={{ marginTop: "20px", fontSize: "21px", margin: "a" }}>
            This wallet can only be accessed by its owners
          </p>
        )
      );
}      
 
export default Wallet;