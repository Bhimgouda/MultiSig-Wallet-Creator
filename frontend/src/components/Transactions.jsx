import React, { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import MULTI_SIG_WALLET_ABI from "../constants/walletAbi.json";
import { formatEther } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import truncateStr from "../utils/truncate";
import { error, info } from "../utils/toastWrapper";

const Transactions = ({ walletAddress, submitted, handleLoading, updateBalance }) => {
  const [transactions, setTransactions] = useState([]);
  const [requiredApprovals, setRequiredApprovals] = useState(0);

  const { account } = useMoralis();
  const { runContractFunction } = useWeb3Contract();

  const walletFunctionParams = {
    contractAddress: walletAddress,
    abi: MULTI_SIG_WALLET_ABI,
  };

  function handleContractError(e) {
    handleLoading(false);
    error(e.error?.message || e.message);
  }

  useEffect(() => {
    getAllTransactions();
    getRequiredApprovals();
  }, [account]);

  useEffect(() => {
    if (submitted === undefined) return;
    handleTransaction(null, submitted);
  }, [submitted]);

  async function getAllTransactions() {
    await runContractFunction({
      params: { ...walletFunctionParams, functionName: "getAllTransactions" },
      onSuccess: async (txns) => {
        const transactions = [];
        for (let txn of txns) {
          if (txn.executed) transactions.push(txn);
          else {
            const approved = await checkIfApproved(transactions.length);
            const approvals = parseInt(await getApprovalsCount(transactions.length))

            transactions.push({ ...txn, approved, approvals});
          }
        }
        setTransactions(transactions);
      },
      onError: handleContractError,
    });
  }

  async function getApprovalsCount(_txId) {
    const params = { ...walletFunctionParams, functionName: "approvalsCount", params: { _txId } };
    return runContractFunction({
      params,
      onError: handleContractError,
    });
  }

  async function checkIfApproved(_txId) {
    const params = { ...walletFunctionParams, functionName: "checkIfApproved", params: { _txId } };
    return runContractFunction({
      params,
      onError: handleContractError,
    });
  }

  async function getRequiredApprovals() {
    const params = { ...walletFunctionParams, functionName: "getRequiredApprovals" };
    const required = parseInt(
      await runContractFunction({
        params,
        onError: handleContractError,
      })
    );
    setRequiredApprovals(required);
  }

  const handleExecute = async (_txId) => {
    const params = { ...walletFunctionParams, functionName: "execute", params: { _txId } };
    handleLoading(true);
    await runContractFunction({
      params,
      onSuccess: async (tx) => {
        await handleTransaction(tx, _txId);
        await updateBalance();
      },
      onError: handleContractError,
    });
  };

  const handleRevoke = async (_txId) => {
    handleLoading(true);
    const params = { ...walletFunctionParams, functionName: "revoke", params: { _txId } };
    await runContractFunction({
      params,
      onSuccess: async (tx) => {
        await handleTransaction(tx, _txId);
      },
      onError: handleContractError,
    });
  };

  const handleApprove = async (_txId) => {
    handleLoading(true);
    const params = { ...walletFunctionParams, functionName: "approve", params: { _txId } };
    await runContractFunction({
      params,
      onSuccess: async (tx) => await handleTransaction(tx, _txId),
      onError: handleContractError,
    });
  };

  async function handleTransaction(tx, _txId){
    if(tx){
        await tx.wait(1)
    }
    let transaction = await runContractFunction({
        params: {...walletFunctionParams, functionName: "getTransaction", params: {_txId}},
        onError: handleContractError,
    })
    const approved = await checkIfApproved(_txId)
    const approvals = await getApprovalsCount(_txId)
    transaction = {...transaction, approved, approvals}

    const updatedTransactions = [...transactions]
    updatedTransactions[_txId] = transaction
    handleLoading(false)
    setTransactions(updatedTransactions)
}

  return (
    <>
      {transactions.length ? (
        <div className="wallet__transactions">
          <h2>Wallet Transactions</h2>
          <div className="transaction">
            <span className="transactions__header">Approvals</span>
            <span className="transactions__header">Value</span>
            <span className="transactions__header">To</span>
            <span className="transactions__header">Data</span>
            <span className="transactions__header">States</span>
          </div>
          <div className="container scrollable" style={{ height: "100%", padding: "10px 0" }}>
            {transactions.map((tx, txId) => (
                <div key={txId} className="transaction">
                  <div>
                    <span>
                      {!tx.executed ? `${tx.approvals}/${requiredApprovals}` : `${requiredApprovals}/${requiredApprovals}`}
                    </span>
                  </div>
                  <span>{typeof formatEther(BigNumber.from(tx.value).toString()) === "string" ? formatEther(BigNumber.from(tx.value).toString()) : null}</span>
                  <span>{truncateStr(tx.to, 11)}</span>
                  <span>{tx.data}</span>
                  <div className="transaction__status">
                    {tx.executed && <span className="btn--disabled">Executed</span> ||
                      !tx.approved && (
                        <span onClick={() => handleApprove(txId)} className="btn btn--yellow">
                          Approve
                        </span>
                      )}
                    {tx.approved && !tx.executed && (
                      <span onClick={() => handleRevoke(txId)} className="btn">
                        Revoke
                      </span>
                    )}
                    {tx.approvals >= requiredApprovals && !tx.executed && (
                      <span onClick={() => handleExecute(txId)} className="btn btn--yellow">
                        Execute
                      </span>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="wallet__transactions">
          <h2 style={{ margin: "auto" }}>No Transactions Yet</h2>
        </div>
      )}
    </>
  );
};

export default Transactions;
