import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import MULTI_SIG_WALLET_ABI from "../constants/walletAbi.json"
import { formatEther } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import truncateStr from "../utils/truncate";
import {error, info} from "../utils/toastWrapper"

const Transactions = ({walletAddress, submitted, handleLoading, updateBalance, balance}) => {
    const [transactions, setTransactions] = useState([])
    const {account} = useMoralis()
    const [requiredApprovals, setRequiredApprovals] = useState(0)

    const {runContractFunction} = useWeb3Contract()

    const walletFunctionParams = {
        contractAddress: walletAddress,
        abi: MULTI_SIG_WALLET_ABI,
    }

    useEffect(()=>{
        getAllTransactions()
        getRequiredApprovals()
    },[account, requiredApprovals])

    useEffect(()=>{
        if(submitted === undefined) return
        handleTransaction(null, submitted)
    }, [submitted])

    async function getAllTransactions(){
        const txns = await runContractFunction({
            params: {...walletFunctionParams, functionName: "getAllTransactions"}
        }) 
        const transactions = []
        for(let txn of txns){
            if(txn.executed) transactions.push(txn)
            else{
                const approved = await checkIfApproved(transactions.length)
                const approvals = await getApprovalsCount(transactions.length)
                transactions.push({...txn, approved, approvals})
            }
        }
        setTransactions(transactions)
    }
    async function getApprovalsCount(_txId){
        const params = {...walletFunctionParams, functionName: "approvalsCount", params:{_txId}}
        return parseInt(await runContractFunction({
            params
        }))
    }
    async function checkIfApproved(_txId){
        const params = {...walletFunctionParams, functionName: "checkIfApproved", params:{_txId}}
        return (await runContractFunction({
            params,
            onError: (e)=>error(e.message)
        }))
    }

    async function getRequiredApprovals(){
        const params = {...walletFunctionParams, functionName: "getRequiredApprovals"}
        const required = parseInt(await runContractFunction({
            params
        }))
        setRequiredApprovals(required)
    }
    

    const handleExecute = async (_txId)=>{
        const params = {...walletFunctionParams, functionName: "execute", params: {_txId}}
        if(balance < formatEther(BigNumber.from(transactions[_txId].value).toString())) return error('Insufficient balance in your multi-sig wallet')
        handleLoading(true)
        await runContractFunction({
            params,
            onSuccess: async(tx)=>{
                await handleTransaction(tx, _txId)
                await updateBalance()
            },
            onError: (e)=>{
                handleLoading(false)
                e.code === -32603 ? error("Transaction doesn't have required number of approvals") : info(e.message)
            }
        })
    }
    const handleRevoke = async (_txId)=>{
        handleLoading(true)
        const params = {...walletFunctionParams, functionName: "revoke", params: {_txId}}
        await runContractFunction({
            params,
            onSuccess: async(tx)=>{await handleTransaction(tx, _txId)},
            onError: (e)=>{
                handleLoading(false)
                error(e.message)
            }
        })
    }
    const handleApprove = async (_txId)=>{
        handleLoading(true)
        const params = {...walletFunctionParams, functionName: "approve", params: {_txId}}
        await runContractFunction({
            params,
            onSuccess: async(tx)=>await handleTransaction(tx, _txId),
            onError: (e)=>{
                handleLoading(false)
                error(e.message)
            }
        })
    }

    async function handleTransaction(tx, _txId){
        if(tx){
            await tx.wait(1)
        }
        let transaction = await runContractFunction({
            params: {...walletFunctionParams, functionName: "getTransaction", params: {_txId}}
        })
        const approved = await checkIfApproved(_txId)
        const approvals = await getApprovalsCount(_txId)
        transaction = {...transaction, approved, approvals}

        const updatedTransactions = [...transactions]
        updatedTransactions[_txId] = transaction
        handleLoading(false)
        setTransactions(updatedTransactions)
    }

    
    return transactions.length ? 
        (<div className="wallet__transactions">
            <h2>Wallet Transactions</h2>
            <div className="transaction">
                <span className="transactions__header">Approvals</span>
                <span className="transactions__header">Value</span>
                <span className="transactions__header">To</span>
                <span className="transactions__header">Data</span>
                <span className="transactions__header">States</span>
            </div>
            <div className="container scrollable" style={{height: "100%", padding: "10px 0"}}>
                {transactions.map((tx, txId)=>(
                    <div key={txId} className="transaction">
                        <div>
                            <span>{!tx.executed ? tx.approvals : requiredApprovals}/{requiredApprovals}</span>
                        </div>
                        <span>{formatEther(BigNumber.from(tx.value).toString())}</span>
                        <span>{truncateStr(tx.to, 11)}</span>
                        <span>{tx.data}</span>
                        <div className="transaction__status">
                            {tx.executed && <span className="btn--disabled">Executed</span>
                            ||
                            !tx.approved && <span onClick={()=>handleApprove(txId)} className="btn btn--yellow">Approve</span>}
                            {tx.approved && !tx.executed && <span onClick={()=>handleRevoke(txId)} className="btn">Revoke</span>}
                            {tx.approvals >= requiredApprovals && !tx.executed && <span onClick={()=>handleExecute(txId)} className="btn btn--yellow">Execute</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>)
        :
        <div className="wallet__transactions">
            <h2 style={{margin: "auto"}}>No Transactions Yet</h2>
        </div>
}
 
export default Transactions;