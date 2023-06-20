import './App.css';
import Header from './components/Header';
import { Route, Routes } from 'react-router-dom';
import Wallet from './pages/Wallet';
import CreateWallet from './pages/CreateWallet';
import { useMoralis } from 'react-moralis';
import { useEffect } from 'react';
import handleNetworkSwitch from './utils/networkSwitcher';
import { Toaster } from 'react-hot-toast';

function App() {
  const {isWeb3Enabled, chainId, web3} = useMoralis()
  const CHAIN_ID = 31337;

  useEffect(()=>{
    handleNetworkSwitch(isWeb3Enabled, chainId, web3, CHAIN_ID)
  },[isWeb3Enabled, chainId])

  return (
    <div className='main'>
      <Header />
      <Toaster />
      {isWeb3Enabled ? 
            parseInt(chainId) === CHAIN_ID ? 
            (<Routes>
            <Route path="/" element={<CreateWallet CHAIN_ID={CHAIN_ID}/>}/>
            <Route path="/wallet/:address" element={<Wallet CHAIN_ID={CHAIN_ID}/>}/>
            {/* <Route path="*" element={<CreateWallet CHAIN_ID={CHAIN_ID}/>}/> */}
            </Routes>)
            : <h2 className="notice">Please Switch to Polygon network</h2>
          :
          <h2 className="notice">Please Connect your Wallet</h2>
      }
    </div>
  );
}

export default App;
