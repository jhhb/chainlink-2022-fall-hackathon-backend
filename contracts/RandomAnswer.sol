// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "hardhat/console.sol";

/**
 * @notice A Chainlink VRF consumer which uses randomness to mimic the rolling
 * of a 20 sided dice
 */

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

contract RandomAnswer is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface private coordinator;
    
    uint8 constant private ROLL_STATUS_RUNNING = 1;
    uint8 constant private ROLL_STATUS_RAN = 2;

    uint64 private subscriptionId;
    bytes32 private keyHash;

    // Goerli coordinator. For other networks,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    // bytes32 keyHash = 0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 40,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 private callbackGasLimit = 40000;

    // The default is 3, but you can set this higher.
    uint16 private requestConfirmations = 3;

    // For this example, retrieve 1 random value in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 private numWords = 1;

    // map request IDs to user address
    mapping(uint256 => address) private rollers;
    mapping(address => uint256) private userAddressToStatus;
    mapping(address => uint256) private userAddressToResult;

    event DiceRolled(uint256 indexed requestId, address indexed roller);
    event DiceLanded(uint256 indexed requestId, uint256 indexed result);

    /**
     * @notice Constructor inherits VRFConsumerBaseV2
     *
     * @param _subscriptionId - the subscription ID that this contract uses for funding requests
     * @param vrfCoordinator - coordinator, check https://docs.chain.link/docs/vrf-contracts/#configurations
     * @param _keyHash - the gas lane to use, which specifies the maximum gas price to bump to
     */
    constructor(uint64 _subscriptionId, address vrfCoordinator, bytes32 _keyHash) VRFConsumerBaseV2(vrfCoordinator) {
        coordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
    }

    /**
     * @notice Requests randomness
     * @dev Warning: if the VRF response is delayed, avoid calling requestRandomness repeatedly
     * as that would give miners/VRF operators latitude about which VRF response arrives first.
     * @dev You must review your implementation details with extreme care.
     */
    function rollDice() public returns (uint256 requestId) {
        address roller = msg.sender;
        // If roll is currently in progress for user, do not allow.
        require(userAddressToStatus[roller] != ROLL_STATUS_RUNNING, "You must wait for your current roll to complete before rolling again");
        
        // Will revert if subscription is not set and funded.
        requestId = coordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        rollers[requestId] = roller;
        userAddressToStatus[roller] = ROLL_STATUS_RUNNING;
        // TODO - zero out previous result ?
        emit DiceRolled(requestId, roller);
    }

    /**
     * @notice Callback function used by VRF Coordinator to return the random number to this contract.
     *
     * @dev Some action on the contract state should be taken here, like storing the result.
     * @dev WARNING: take care to avoid having multiple VRF requests in flight if their order of arrival would result
     * in contract states with different outcomes. Otherwise miners or the VRF operator would could take advantage
     * by controlling the order.
     * @dev The VRF Coordinator will only send this function verified responses, and the parent VRFConsumerBaseV2
     * contract ensures that this method only receives randomness from the designated VRFCoordinator.
     *
     * @param requestId uint256
     * @param randomWords  uint256[] The random result returned by the oracle.
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        // TODO: JB - May need handling for a non-existent request. However, I can"t figure out a way to test that
        // without trigerring a mock-side error.
        address userAddress = rollers[requestId];
        uint256 d20Value = (randomWords[0] % 20) + 1;

        userAddressToResult[userAddress] = d20Value;
        userAddressToStatus[userAddress] = ROLL_STATUS_RAN;
        
        emit DiceLanded(requestId, d20Value);
    }

    /**
     * @notice Get the house assigned to the user once the address has rolled
     * @param userAddress address
     * @return house as a string
     */
    function house(address userAddress) public view returns (string memory) {
        // TODO: JB - See if there is a way to simplify the state management.
        require(userAddressToStatus[userAddress] != ROLL_STATUS_RUNNING, "The requested address is currently rolling. Please wait.");
        require(userAddressToResult[userAddress] != 0, "The requested address must first call rollDice itself before a house is computed.");

        return getHouseName(userAddressToResult[userAddress]);
    }

    /**
     * @notice Get the house namne from the id
     * @param id uint256
     * @return house name string
     */
    function getHouseName(uint256 id) private pure returns (string memory) {
        string[20] memory houseNames = [
            "Targaryen",
            "Lannister",
            "Stark",
            "Tyrell",
            "Baratheon",
            "Martell",
            "Tully",
            "Bolton",
            "Greyjoy",
            "Arryn",
            "Frey",
            "Mormont",
            "Tarley",
            "Dayne",
            "Umber",
            "Valeryon",
            "Manderly",
            "Clegane",
            "Glover",
            "Karstark"
        ];
        return houseNames[id - 1];
    }

    function getUserStatus(address addr) public view returns (string memory) {
        uint256 status = userAddressToStatus[addr];
        return _getUserStatus(status);
    }

    function _getUserStatus(uint256 status) private pure returns (string memory) {
        string[3] memory statuses = [
            "NONE",
            "RUNNING",
            "RAN"
        ];
        return statuses[status];
    }
}
