require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("dotenv").config(); // Import dotenv library to access the .env file

//define hardhat task here, which can be accessed in our test file (test/rpc.js) by using hre.run('taskName')
task("deploy-contract", async () => {
  const deployContract = require("./scripts/deployContract");
  return deployContract();
});

task("interact", async (taskArgs) => {
  const contractCall = require("./scripts/interact");
  return contractCall(taskArgs.contractAddress, taskArgs.msg);
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  mocha: {
    timeout: 3600000,
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500,
      },
    },
  },

  // Specifies which network configuration will be used by default when you run Hardhat commands.
  defaultNetwork: "testnet",
  networks: {
    // Defines the configuration settings for connecting to Hedera testnet
    testnet: {
      // Specifies URL endpoint for Hedera testnet pulled from the .env file
      url: process.env.TESTNET_ENDPOINT,
      // Your ECDSA testnet account private key pulled from the .env file
      accounts: [process.env.TESTNET_OPERATOR_PRIVATE_KEY],
    },
  },
};