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
    const address = '0xCa6cA1A7e23cc402bdC6C2e5AcE6B065168Bbbbc';
    const ticketPass = await ethers.getContractAt("TicketPass", address, wallet);

    // // Create a new ticket pass
    // const metadata = {
    //     title: "Tech Conference 2025",
    //     description: "Join us for the annual Tech Conference where industry leaders discuss the latest trends in technology.",
    //     moreInformation: "This event will feature keynote speakers, panel discussions, and networking opportunities. Don't miss out on the chance to connect with professionals from various tech industries.",
    //     media: "https://example.com/event-image.jpg",
    //     location: "San Francisco, CA, USA",
    // };

    // const metadataString = JSON.stringify(metadata);

    // const createTx = await ticketPass.createticketPass(
    //     100, // maxPasses
    //     100000000n, // passPrice in ethers
    //     metadataString, // metadata
    //     "Blockchain Events", // category
    //     Math.floor(Date.now() / 1000) + 7200, // salesEndTime (1 hour from now)
    //     { gasLimit: 8000000, gasPrice: ethers.parseUnits("50000000000000", "wei"), value: ethers.parseEther("10") }
    // );
    // await createTx.wait();
    // Create NFT from precompile
    // const createToken = new ContractExecuteTransaction()
    // .setContractId('0.0.5280342')
    // .setGas(500000) // Increase if revert
    // .setFunction(
    //     "createTicketPass",
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
    console.log("Ticket pass created");

    // Purchase a pass
    // const purchaseTx = await ticketPass.purchasePass(0, "ipfs://bafkreifjk5goeyyo4gfk36zoxw3nnn57hib55mntkqgjpgxti2lgrsg6la", {gasLimit: 8000000, gasPrice: ethers.parseUnits("50000000000000", "wei"), value: ethers.parseEther("10") });
    // await purchaseTx.wait();
    // console.log("Pass purchased");

    // Get all passes
    // const ticketPassCount = await ticketPass.ticketPassCount();
    // for (let i = 0; i < ticketPassCount; i++) {
    //     const pass = await ticketPass.ticketPasses(i);
    //     console.log(`Pass ${i}:`, pass);
    // }
    const passes = await ticketPass.getAllticketPasses();
    console.log("All passes:", passes);

    // Get user passes
    const userPasses = await ticketPass.getUserPasses(wallet.address);
    console.log(`User passes:`, userPasses);
    for (let i = 0; i < userPasses.length; i++) {
        const pass = await ticketPass.ticketPasses(userPasses[i]);
        console.log(`Pass ${i}:`, pass);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});