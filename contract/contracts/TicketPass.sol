// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

import "./HederaResponseCodes.sol";
import "./IHederaTokenService.sol";
import "./HederaTokenService.sol";
import "./ExpiryHelper.sol";
import "./KeyHelper.sol";

contract TicketPass is ExpiryHelper, KeyHelper, HederaTokenService {

    // Struct to store details of each ticket pass
    struct ticketPassDetails {
        address organizer;
        string metadata;
        string category;
        address tokenAddress;
        int64 passesSold;
        int64 max_passes;
        uint256 passPrice;
        uint256 startTime;
        uint256 salesEndTime;
        bool bpEnded;
    }

    uint256 public ticketPassCount;
    mapping(uint256 => ticketPassDetails) public ticketPasses;
    mapping(address => uint256[]) public passesPurchasedByUser;

    int64 autoRenewPeriod = 2592000; // 30 days

    event ticketPassCreated(address indexed organizer, uint256 ticketPassId, address tokenAddress);
    event PassPurchased(address indexed buyer, uint256 ticketPassId, uint256 amount);

    function createNonFungibleToken(IHederaTokenService.HederaToken memory token, uint256 value) nonEmptyExpiry(token)
    internal returns (int responseCode, address tokenAddress) {
        (bool success, bytes memory result) = precompileAddress.call{value : value}(
            abi.encodeWithSelector(IHederaTokenService.createNonFungibleToken.selector, token));
        (responseCode, tokenAddress) = success ? abi.decode(result, (int32, address)) : (HederaResponseCodes.UNKNOWN, address(0));
    }

    function createticketPass(
        int64 _maxPasses,
        uint256 _passPrice,
        string memory _metadata,
        string memory _category,
        uint256 _salesEndTime
    ) payable external returns (address) {
        require(_maxPasses > 0, "Max passes must be greater than 0");
        require(_salesEndTime > block.timestamp, "End time must be in the future");

        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);
        // Set this contract as supply for the token
        keys[0] = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, address(this));

        IHederaTokenService.HederaToken memory token;
        token.name = 'TicketPassToken';
        token.symbol = 'TPT';
        token.memo = 'TicketPass NFTs';
        token.treasury = address(this);
        token.tokenSupplyType = true; // set supply to FINITE
        token.maxSupply = _maxPasses;
        token.tokenKeys = keys;
        token.freezeDefault = false;
        token.expiry = createAutoRenewExpiry(address(this), autoRenewPeriod); // Contract auto-renews the token

        (int responseCode, address createdToken) = createNonFungibleToken(token, msg.value);
        
        // Store ticket pass details
        ticketPasses[ticketPassCount] = ticketPassDetails({
            organizer: msg.sender,
            metadata: _metadata,
            category: _category,
            tokenAddress: createdToken,
            passesSold: 0,
            max_passes: _maxPasses,
            passPrice: _passPrice,
            startTime: block.timestamp,
            salesEndTime: _salesEndTime,
            bpEnded: false
        });

        emit ticketPassCreated(msg.sender, ticketPassCount, createdToken);
        ticketPassCount++; // Increment ticket pass count
        return createdToken;
    }

    function purchasePass(uint256 _ticketPassId) external payable {
        ticketPassDetails memory pass = ticketPasses[_ticketPassId];
        require(msg.value >= pass.passPrice, "Insufficient payment");
        require(block.timestamp <= pass.salesEndTime, "Sales ended");
        require(pass.passesSold < pass.max_passes, "Sold out");
        require(!pass.bpEnded, "Event ended");

        // Convert metadata from string to bytes
        bytes memory metadataBytes = bytes(pass.metadata);
        bytes[] memory metadataArray = new bytes[](1);
        metadataArray[0] = metadataBytes;

        // Mint an NFT to the buyer
        (int response, , int64[] memory serial) = HederaTokenService.mintToken(pass.tokenAddress, 0, metadataArray);

        if(response != HederaResponseCodes.SUCCESS){
            revert("Failed to mint non-fungible token");
        }

        int txresponse = HederaTokenService.transferNFT(pass.tokenAddress, address(this), msg.sender, serial[0]);

        // if(txresponse != HederaResponseCodes.SUCCESS){
        //     revert("Failed to transfer non-fungible token");
        // }

        // Update passes sold
        ticketPasses[_ticketPassId].passesSold++;

        // Record the purchase
        passesPurchasedByUser[msg.sender].push(_ticketPassId);

        emit PassPurchased(msg.sender, _ticketPassId, msg.value); // Emit event
    }

    function getAllticketPasses() external view returns (ticketPassDetails[] memory) {
        ticketPassDetails[] memory result = new ticketPassDetails[](ticketPassCount);
        for (uint256 i = 0; i < ticketPassCount; i++) {
            result[i] = ticketPasses[i];
        }
        return result;
    }

    function getUserPasses(address _user) external view returns (uint256[] memory) {
        return passesPurchasedByUser[_user];
    }
}