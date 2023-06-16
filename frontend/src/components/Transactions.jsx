import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import MULTI_SIG_WALLET_ABI from "../constants/walletAbi.json"
import { formatEther } from "ethers";

const Transactions = ({walletAddress, }) => {
    const [transactions, setTransactions] = useState([])

    const walletFunctionParams = {
        contractAddress: walletAddress,
        abi: MULTI_SIG_WALLET_ABI,
    }

    useEffect(()=>{
        getAllTransactions()
    },[])

    const {runContractFunction} = useWeb3Contract({
        contractAddress: walletAddress,
        abi: MULTI_SIG_WALLET_ABI,
        functionName: "getAllTransactions",
    })

    const {runContractFunction: checkIfApproved} = useWeb3Contract({
        contractAddress: walletAddress,
        abi: MULTI_SIG_WALLET_ABI,
        functionName: "checkIfApproved",
    })

    const handleExecute = async (_txId)=>{
        const params = {...walletFunctionParams, functionName: "execute", params: {_txId}}
        await runContractFunction({
            params,
            onError: (e)=>console.log(e)
        })
    }
    const handleRevoke = async (_txId)=>{
        const params = {...walletFunctionParams, functionName: "revoke", params: {_txId}}
        await runContractFunction({
            params,
            onError: (e)=>console.log(e)
        })
    }
    const handleApprove = async (_txId)=>{
        const params = {...walletFunctionParams, functionName: "approve", params: {_txId}}
        
        await runContractFunction({
            params,
            onError: (e)=>console.log(e)
        })
    }

    async function getAllTransactions(){
        let txns = await runContractFunction()
        const transactions = []
        for(let txn of txns){
            if(txn.executed) transactions.push(txn)
            else{
                const params = {...walletFunctionParams, functionName: "checkIfApproved", params:{_txId: transactions.length}}
                const approved = await runContractFunction({
                    params,
                    onError: (e)=>console.log(e)
                })
                transactions.push({...txn, approved})
            }
        }
        console.log(transactions)
        setTransactions(transactions)
    }

    return ( 
        <div className="wallet__transactions">
            {transactions.length? transactions.map((tx, txId)=>(
                <div key={txId} className="transaction">
                    <span>{formatEther(parseInt(tx.value).toString())}</span>
                    <span>{tx.to}</span>
                    <span>{tx.data}</span>
                    {tx.executed && <span>Executed</span>
                    ||
                    !tx.approved && <span onClick={()=>handleApprove(txId)} className="btn">Approve</span>}
                    {}
                    {tx.approved && !tx.executed && <span onClick={()=>handleRevoke(txId)} className="btn">Revoke</span>}
                    {tx.approved && !tx.executed && <span onClick={()=>handleExecute(txId)} className="btn">Execute</span>}
                </div>
            )): null}
        </div>
     );
}
 
export default Transactions;