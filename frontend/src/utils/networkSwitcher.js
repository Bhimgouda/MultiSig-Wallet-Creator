import { success } from "./toastWrapper";

const handleNetworkSwitch = async (isWeb3Enabled, chainId, web3, CHAIN_ID) => {
    // Enable Web3 if not already enabled
    if (!isWeb3Enabled) {
      return;
    }

    // Check if the current network is already Polygon
    if (parseInt(chainId) === CHAIN_ID) {
      success("You're wallet is connected to Polygon network")
      return;
    }


    // Switch to Polygon network or add Polygon and then switch
    async function switchToPolygon() {
      try {
        await web3.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],                 // changes on production
        });
      } catch (error) {
        if (error.code === 4902) {
          try {
            await web3.provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x89",
                  chainName: "Polygon Mainnet",
                  rpcUrls: [
                    "https://polygon-rpc.com/",
                  ],
                  nativeCurrency: {
                    name: "Matic",
                    symbol: "MATIC",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://polygonscan.com/"],
                },
              ],
            });
          } catch (error) {
            error(error);
          }
        }
      }
    }

    switchToPolygon();
};

export default handleNetworkSwitch;