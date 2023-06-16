// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./MultiSigWallet.sol";

contract MultiSigFactory {
    event WalletCreated(address walletAddress);

    mapping(address => bool) private s_multiSigWallets;

    function createWallet(
        address[] memory _owners,
        uint256 required,
        uint256 timelock
    ) external {
        MultiSigWallet wallet = new MultiSigWallet(_owners, required, timelock);
        s_multiSigWallets[address(wallet)] = true;
        emit WalletCreated(address(wallet));
    }

    function walletExists(address walletAddress) external view returns (bool) {
        return s_multiSigWallets[walletAddress];
    }
}
