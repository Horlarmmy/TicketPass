import { ethers } from "ethers";

const network = "testnet";

function walletConnectFcn() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Please install a web3 wallet like MetaMask");
  }

  const connect = async () => {
    console.log(`\n=======================================`);
    const provider = new ethers.BrowserProvider(window.ethereum, "any");
    
    console.log(`- Switching network to the Hedera ${network}...🟠`);
    const chainId = network === "testnet" ? "0x128" : 
                   network === "previewnet" ? "0x129" : "0x127";

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainName: `Hedera ${network}`,
            chainId: chainId,
            nativeCurrency: { name: "HBAR", symbol: "ℏℏ", decimals: 18 },
            rpcUrls: [`https://${network}.hashio.io/api`],
            blockExplorerUrls: [`https://hashscan.io/${network}/`],
          },
        ],
      });
      console.log("- Switched ✅");
      
      console.log("- Connecting wallet...🟠");
      const accounts = await provider.send("eth_requestAccounts", []);
      const selectedAccount = accounts[0];
      console.log(`- Selected account: ${selectedAccount} ✅`);
      
      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          // Handle disconnect
          return null;
        }
        return accounts[0];
      });

      return [selectedAccount, provider, network];
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  };

  const disconnect = async () => {
    // Note: MetaMask doesn't have a direct disconnect method
    // We can only "forget" the site connection from MetaMask itself
    return null;
  };

  return { connect, disconnect };
}

export default walletConnectFcn;