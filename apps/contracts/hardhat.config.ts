import "@nomicfoundation/hardhat-ignition-ethers";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const somniaRpcUrl = process.env.SOMNIA_RPC_URL ?? "https://dream-rpc.somnia.network/";
const privateKey = process.env.PRIVATE_KEY_DEPLOYER;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    somniaTestnet: {
      url: somniaRpcUrl,
      chainId: 50312,
      accounts: privateKey ? [privateKey] : [],
    },
  },
};

export default config;
