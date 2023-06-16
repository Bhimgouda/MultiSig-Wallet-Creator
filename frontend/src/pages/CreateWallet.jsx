import React, { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { Link, useNavigate } from "react-router-dom";
import WALLET_FACTORY_ABI from "../constants/walletFactoryAbi.json"
import WALLET_FACTORY_ADDRESSES from "../constants/walletFactoryAddresses.json"

const CreateWallet = ({CHAIN_ID}) => {
  const [owners, setOwners] = useState([""]);
  const [required, setRequired] = useState(0)
  const [timelock, setTimelock] = useState(0)
  const [recentWallet, setRecentWallet] = useState("")
  const navigate = useNavigate();

  const {runContractFunction: createWallet, waitForTransaction} = useWeb3Contract({
    contractAddress: WALLET_FACTORY_ADDRESSES[CHAIN_ID],
    abi: WALLET_FACTORY_ABI,
    params: {_owners: owners, required, timelock},
    functionName: "createWallet"
  })

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
    const required = e.target.required.value;
    if (required > owners.length)
      return alert("Required Approvals should be less than number of owners");
    if(!owners.every(owner=> owner.length === 42))
      return alert ("Invalid owner address")
    
    await createWallet({
        onSuccess: handleCreateWalletSuccess,
        onError: (e)=>alert(e)
    });
  };

  async function handleCreateWalletSuccess(tx){
    const receipt = await tx.wait(1)
    const walletAddress = receipt.events[0].args.walletAddress
    localStorage.setItem("recentWallet", `${walletAddress}`)
    navigate(`/wallet/${walletAddress}`)
  }
  
  const redirectToExistingWallet = async (e) => {
    e.preventDefault();
    const walletAddress = e.target.walletAddress.value;
    if (walletAddress.length !== 42)
      return alert("Invalid MultiSig Wallet Address");
    navigate(`/wallet/${walletAddress}`);
  };

  return (
    <div className="create-wallet">
      <form onSubmit={handleCreateWallet}>
        {owners.map((owner, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="address"
              value={owner.address}
              onChange={(e) => handleOwnerChange(index, e.target.value)}
            />
            <span className="btn" onClick={addOwners}>plus</span>
            <span className="btn" onClick={() => removeOwner(index)}>minus</span>
          </div>
        ))}
        <div>
          <input value={required} onChange={handleRequiredChange} type="number" placeholder="Required Approvals" name="required" id="required" />
        </div>
        <div>
          <input value={timelock} onChange={handleTimelockChange} type="number" name="timelock" placeholder="Timelock" id="timelock" />
        </div>
        <button>Create New Wallet</button>
      </form>
      <form onSubmit={redirectToExistingWallet}>
        <input type="text" name="walletAddress" />
        <button>Interact with an Existing Multisig Wallet</button>
      </form>
      
      {recentWallet ? (
          <div>
            <h3>Your Most Recent Wallet</h3>
            <span>{recentWallet}</span>
            <Link to={`/wallet/${recentWallet}`}>
              <button>Interact</button>
            </Link>
          </div>
        )
      :
      null
      }
    </div>
  );
};

export default CreateWallet;
