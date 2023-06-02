// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract MultiSigWallet {
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
    }

    uint256 private requiredApprovals;
    Transaction[] private transactions;
    mapping(uint256 => mapping(address => bool)) private approvals;
    address[] private owners;
    mapping(address => bool) private isOwner;

    event Deposit(address indexed sender, uint256 amount);
    event Submit(uint256 indexed txId);
    event Approve(address indexed owner, uint256 indexed txId);
    event Revoke(address indexed owner, uint256 indexed txId);
    event Execute(uint256 indexed txId);

    constructor(uint256 _requiredApprovals, address[] memory _owners) {
        require(_owners.length > 0, "No owners");
        require(
            _requiredApprovals > 0 && _requiredApprovals <= _owners.length,
            "Invalid required owner signatures"
        );

        requiredApprovals = _requiredApprovals;

        for (uint256 i; i < _owners.length; i++) {
            require(_owners[i] != address(0), "Invalid owner address");
            require(!isOwner[_owners[i]], "Not an unique owner");

            isOwner[_owners[i]] = true;
            owners.push(_owners[i]);
        }
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an Onwer");
        _;
    }

    modifier txExists(uint256 _txId) {
        require(_txId < transactions.length, "transaction does'nt exist");
        _;
    }

    modifier isNotApproved(uint256 _txId) {
        require(!approvals[_txId][msg.sender], "Tx not Approved");
        _;
    }

    modifier isNotExecuted(uint256 _txId) {
        require(!transactions[_txId].executed, "Transaction has been executed");
        _;
    }

    function approvalsCount(uint _txId) public view returns (uint count) {
        for (uint i; i < owners.length; i++) {
            count += approvals[_txId][owners[i]] ? 1 : 0;
        }
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submit(
        address _to,
        uint256 value,
        bytes calldata _data
    ) external onlyOwner {
        require(_to != address(0), "Sender address is Invalid");
        transactions.push(Transaction(_to, value, _data, false));
        emit Submit(transactions.length - 1);
    }

    function approve(
        uint256 _txId
    )
        external
        onlyOwner
        txExists(_txId)
        isNotApproved(_txId)
        isNotExecuted(_txId)
    {
        approvals[_txId][msg.sender] = true;
        emit Approve(msg.sender, _txId);
    }

    function execute(
        uint256 _txId
    ) external onlyOwner txExists(_txId) isNotExecuted(_txId) {
        require(
            approvalsCount(_txId) >= requiredApprovals,
            "Is not approved by required members"
        );

        Transaction storage transaction = transactions[_txId];
        transaction.executed = true;

        (bool success, ) = payable(transaction.to).call{
            value: transaction.value
        }(transaction.data);
        require(success, "Tx Failed");
        emit Execute(_txId);
    }

    function revoke(
        uint256 _txId
    ) external onlyOwner txExists(_txId) isNotExecuted(_txId) {
        require(approvals[_txId][msg.sender], "Transaction was never Approved");
        approvals[_txId][msg.sender] = false;
    }

    /////////////////////////
    /////// GETTERS ////////
    ///////////////////////

    function getRequiredApprovals() external view returns (uint) {
        return requiredApprovals;
    }

    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    function getAllTransactions() external view returns (Transaction[] memory) {
        return transactions;
    }
}
