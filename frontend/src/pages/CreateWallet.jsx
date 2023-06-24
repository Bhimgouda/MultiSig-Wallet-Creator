import React, { useEffect, useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { Link, useNavigate } from "react-router-dom";
import WALLET_FACTORY_ABI from "../constants/walletFactoryAbi.json"
import WALLET_FACTORY_ADDRESSES from "../constants/walletFactoryAddresses.json"
import truncateStr from "../utils/truncate";
import { error } from "../utils/toastWrapper";
import { verifyContractOnEtherscan, verifyContractOnPolygon } from "../utils/verifyContract";
import MULTI_SIG_WALLET_ABI from "../constants/walletAbi.json"

const CreateWallet = ({CHAIN_ID, handleLoading}) => {
  const [owners, setOwners] = useState(["", ""]);
  const [required, setRequired] = useState("")
  const [timelock, setTimelock] = useState("")
  const [recentWallet, setRecentWallet] = useState("")
  const navigate = useNavigate();

  const {runContractFunction} = useWeb3Contract()

  const createWalletFunctionParams = {
    contractAddress: WALLET_FACTORY_ADDRESSES[CHAIN_ID],
    abi: WALLET_FACTORY_ABI,
  }

  function handleContractError(e){
    handleLoading(false)
    error(e.error?.message || e.message)
  }

  useEffect(()=>{
    setRecentWallet(localStorage.getItem("recentWallet"));
  },[])

  const addOwners = () => setOwners([...owners, ""]);
  const removeOwner = (index) => {
    if(owners.length > 1){
        const tempOwners = [...owners];
        tempOwners.splice(index, 1);
        setOwners(tempOwners);
    }
  };

  const handleOwnerChange = (index, value) => {
    const tempOwners = [...owners];
    tempOwners[index] = value;
    setOwners(tempOwners);
  };

  const handleRequiredChange = (e) =>{
    setRequired(e.target.value)
  }
  const handleTimelockChange = (e) =>{
    setTimelock(e.target.value)
  }


  const handleCreateWallet = async (e) => {
    e.preventDefault();

    if(!required || required === "0")
      return error("Required Approvals cannot be 0 or Empty")
    if (required > owners.length)
      return error("Required Approvals should be less than number of owners");
    if(!owners.every(owner=> owner.length === 42))
      return error("Please Remove Invalid/Empty Owner Addresses")
    
    handleLoading(true)
    await runContractFunction({
        params: {...createWalletFunctionParams, functionName: "createWallet", params: {_owners: owners, required, timelock: timelock || 0}},
        onSuccess: handleCreateWalletSuccess,
        onError: handleContractError
    });
  };

  async function handleCreateWalletSuccess(tx){
    const receipt = await tx.wait(1)
    const walletAddress = receipt.events[0].args.walletAddress
    localStorage.setItem("recentWallet", `${walletAddress}`)
    await verifyContractOnEtherscan("AR3IWKEHKRQRZNWJUMCWHBKQPAP8FUKY2T", walletAddress, MULTI_SIG_WALLET_ABI) // changes on production
    navigate(`/wallet/${walletAddress}`)
  }
  
  const redirectToExistingWallet = async (e) => {
    e.preventDefault();
    const walletAddress = e.target.walletAddress.value;
    if (walletAddress.length !== 42)
      return error("Invalid MultiSig Wallet Address");
    navigate(`/wallet/${walletAddress}`);
  };

  return (
    <div className="create-wallet">
      <div className="container">
      <h1 style={{marginBottom: "21px"}}>Create <span className="text--yellow">MultiSig</span> Wallet</h1>
      <form className="create-wallet--new" onSubmit={handleCreateWallet}>
        <div className="scrollable container" style={{display: "flex", flexDirection: "column", alignItems: "center", height: "102px"}}>
          {owners.map((owner, index) => (
            <div key={index} style={{display: "flex", alignItems: "center"}}>
              <input
                type="text"
                placeholder={`address ${index+1}`}
                value={owner.address}
                onChange={(e) => handleOwnerChange(index, e.target.value)}
              />
              <span className="icon" style={{width: "14px", margin: "7px"}} onClick={addOwners}><img src="/icons/plus.svg" alt="" /></span>
              <span className="icon" onClick={() => removeOwner(index)}><img src="/icons/minus.svg" alt="" /></span>
            </div>
          ))}
        </div>
        <div>
          <input value={required} onChange={handleRequiredChange} type="number" placeholder="Required Approvals" name="required" id="required" />
        </div>
        <div>
          <input value={timelock} onChange={handleTimelockChange} type="number" name="timelock" placeholder="Timelock in seconds (optional)" id="timelock" />
        </div>
        <button className="btn btn--yellow">Create New Wallet</button>
      </form>
      </div>

      <form className="create-wallet--existing" onSubmit={redirectToExistingWallet}>
        <h3 className="">Interact with an Existing MultiSig Wallet</h3>
        <div>
          <input type="text" placeholder="wallet address" name="walletAddress" />
          <button className="btn btn--small">Interact</button>
        </div>
      </form>
      
      {recentWallet ? (
        <div className="container">
          <h3>Recently Created Wallet</h3>
          <div className="container" style={{ marginTop: "10px",display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <span>{truncateStr(recentWallet, 21)}</span>
            <Link to={`/wallet/${recentWallet}`}>
              <button className="btn btn--small">Interact</button>
            </Link>
          </div>
        </div>
        )
      :
      null
      }
    </div>
  );
};

export default CreateWallet;
