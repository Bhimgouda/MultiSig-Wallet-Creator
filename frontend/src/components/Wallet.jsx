import { useMoralis, useWeb3Contract } from "react-moralis";
import MULTI_SIG_WALLET_ABI from "../constants/contractAbi.json"
import MULTI_SIG_WALLET_ADDRESSES from "../constants/contractAddresses.json"

const CHAIN_ID = 31337;
const MULTI_SIG_WALLET_ADDRESS = MULTI_SIG_WALLET_ADDRESSES[CHAIN_ID]["MultiSigWallet"]

const Wallet = () => {

    return ( 
        <div className="wallet">
          
        </div>
    );
}
 
export default Wallet;