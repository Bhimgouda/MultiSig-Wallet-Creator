// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "hardhat/console.sol";
import "./MultiSigWallet.sol";

contract MultiSigFactory {
    mapping(address => bool) private s_multiSigWallets;

    function createWallet(
        address[] memory _owners,
        uint256 required,
        uint256 timelock
    ) external returns (address) {
        MultiSigWallet walletAddress = new MultiSigWallet(
            _owners,
            required,
            timelock
        );
        s_multiSigWallets[address(walletAddress)] = true;
        return address(walletAddress);
    }

    function walletExists(address walletAddress) external view returns (bool) {
        return s_multiSigWallets[walletAddress];
    }
}
