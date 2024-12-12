const { ethers } = require("hardhat");
require("dotenv").config();

const {
    AccountId,
    PrivateKey,
    Client,
    ContractCreateFlow,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    AccountCreateTransaction,
    Hbar,
  } = require("@hashgraph/sdk");

async function main() {
    // Assign the first signer to a wallet variable
    const wallet = (await ethers.getSigners())[0];
    const operatorKey = PrivateKey.fromStringECDSA(process.env.TESTNET_OPERATOR_PRIVATE_KEY);
    const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);

    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    const maxTransactionFee = new Hbar(50);
    client.setDefaultMaxTransactionFee(maxTransactionFee);

    // Address of the deployed TicketPass contract
    const address = '0xE299953b72A20D4D4522035c9C827Ec32640B552';
    const ticketPass = await ethers.getContractAt("TicketPass", address, wallet);

    // Create a new block pass
    // const createTx = await ticketPass.createBlockPass(
    //     100, // maxPasses
    //     100000000n, // passPrice in ethers
    //     "Event Metadata", // metadata
    //     "Category", // category
    //     Math.floor(Date.now() / 1000) + 3600, // salesEndTime (1 hour from now)
    //     { gasLimit: 8000000, gasPrice: ethers.parseUnits("50000000000000", "wei"), value: ethers.parseEther("10") }
    // );
    // await createTx.wait();
    // Create NFT from precompile
    // const createToken = new ContractExecuteTransaction()
    // .setContractId('0.0.5280342')
    // .setGas(500000) // Increase if revert
    // .setFunction(
    //     "createBlockPass",
    //     new ContractFunctionParameters()
    //     .addInt64(100)
    //     .addUint256(1)
    //     .addString("Event Metadata")
    //     .addString("Category") // NFT symbol
    //     .addUint256(Math.floor(Date.now() / 1000) + 3600) // Expiration: Needs to be between 6999999 and 8000001
    // );
    // const createTokenTx = await createToken.execute(client);
    // const createTokenRx = await createTokenTx.getRecord(client);
    // const tokenIdSolidityAddr =
    // createTokenRx.contractFunctionResult.getAddress(0);
    // console.log(tokenIdSolidityAddr);
    // const tokenId = AccountId.fromEvmAddress(tokenIdSolidityAddr);
    // console.log(tokenIdSolidityAddr, tokenId);

    // console.log(`Token created with ID: ${tokenId} \n`);
    console.log("Block pass created");

    // Purchase a pass
    // const purchaseTx = await ticketPass.purchasePass(0, {gasLimit: 8000000, gasPrice: ethers.parseUnits("50000000000000", "wei"), value: ethers.parseEther("10") });
    // await purchaseTx.wait();
    console.log("Pass purchased");

    // Get all passes
    const blockPassCount = await ticketPass.blockPassCount();
    for (let i = 0; i < blockPassCount; i++) {
        const pass = await ticketPass.blockPasses(i);
        console.log(`Pass ${i}:`, pass);
    }

    // Get user passes
    const userPasses = await ticketPass.getUserPasses(wallet.address);
    console.log(`User passes:`, userPasses);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});