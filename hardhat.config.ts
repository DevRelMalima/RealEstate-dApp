import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition";

const config = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      gas: 12000000
    },
    moonbaseAlpha: {
      url: "https://moonbeam-alpha.api.onfinality.io/rpc?apikey=3c5eeeda-61a9-415c-aea2-4dff37496677", // Replace with the correct RPC endpoint
      chainId: 1287, // Moonbase Alpha Testnet chain ID
      accounts: {
        mnemonic: "craft bullet clay staff chef twist two chuckle pact pretty more salute", // Replace with your mnemonic
      },
    },
  },
 };
 
 
 export default config;
 