import { success, error } from "./toastWrapper";

const handleNetworkSwitch = async (isWeb3Enabled, chainId, web3, CHAIN_ID) => {
    // Enable Web3 if not already enabled
    if (!isWeb3Enabled) {
      return;
    }

    // Check if the current network is already Polygon
    if (parseInt(chainId) === CHAIN_ID) {
      success("You're wallet is connected to Sepolia network")
      return;
    }


    // Switch to Polygon network or add Polygon and then switch
    async function switchToPolygon() {
      try {
        await web3.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],                 // changes on production
        });
      } catch (e) {
        if (e.code === 4902) {
          try {
            await web3.provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xaa36a7",
                  chainName: "Sepolia test network",
                  rpcUrls: [
                    "https://eth-sepolia.g.alchemy.com/v2/NU-UqlzGIQ-MfsZXjzcdhNAbYCCrw3Ip",
                  ],
                  nativeCurrency: {
                    name: "Sepolia Eth",
                    symbol: "SepoliaETH",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } catch (e) {
            return error(e.message);
          }
        }
      }
    }

    switchToPolygon();
};

export default handleNetworkSwitch;