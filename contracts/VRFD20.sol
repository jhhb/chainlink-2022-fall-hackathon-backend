// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
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

contract VRFD20 is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;
    
    uint8 ROLL_STATUS_RUNNING = 1;
    uint8 ROLL_STATUS_RAN = 2;

    uint64 s_subscriptionId;
    bytes32 s_keyHash;

    // Goerli coordinator. For other networks,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    // bytes32 s_keyHash = 0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 40,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 callbackGasLimit = 40000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // For this example, retrieve 1 random value in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords = 1;
    address s_owner;

    // map request IDs to user address
    mapping(uint256 => address) private s_rollers;
    // map vrf results to rollers
    // The default value in a mapping if nothing has been set is 0
    mapping(address => uint256) private s_results;

    mapping(address => uint256) private user_address_to_status;
    mapping(address => uint256) private user_address_to_result;

    event DiceRolled(uint256 indexed requestId, address indexed roller);
    event DiceLanded(uint256 indexed requestId, uint256 indexed result);

    /**
     * @notice Constructor inherits VRFConsumerBaseV2
     *
     * @dev NETWORK: Goerli
     *
     * @param subscriptionId subscription id that this consumer contract can use
     */
    constructor(uint64 subscriptionId, address vrfCoordinator, bytes32 keyHash) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_owner = msg.sender;
        s_subscriptionId = subscriptionId;
        s_keyHash = keyHash;
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
        require(user_address_to_status[roller] != ROLL_STATUS_RUNNING, 'You must wait for your current roll to complete before rolling again');
        
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        s_rollers[requestId] = roller;
        user_address_to_status[roller] = ROLL_STATUS_RUNNING;
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
        // TODO: JB - May need handling for a non-existent request. However, I can't figure out a way to test that
        // without trigerring a mock-side error.
        address user_address = s_rollers[requestId];
        uint256 d20Value = (randomWords[0] % 20) + 1;

        user_address_to_result[user_address] = d20Value;
        user_address_to_status[user_address] = ROLL_STATUS_RAN;
        
        emit DiceLanded(requestId, d20Value);
    }

    /**
     * @notice Get the house assigned to the user once the address has rolled
     * @param user_address address
     * @return house as a string
     */
    function house(address user_address) public view returns (string memory) {
        // TODO: JB - See if there is a way to simplify the state management.
        require(user_address_to_status[user_address] != ROLL_STATUS_RUNNING, 'The requested address is currently rolling. Please wait.');
        require(user_address_to_result[user_address] != 0, 'The requested address must first call rollDice itself before a house is computed.');

        return getHouseName(user_address_to_result[user_address]);
    }

    /**
     * @notice Get the house namne from the id
     * @param id uint256
     * @return house name string
     */
    function getHouseName(uint256 id) private pure returns (string memory) {
        string[20] memory houseNames = [
            'Targaryen',
            'Lannister',
            'Stark',
            'Tyrell',
            'Baratheon',
            'Martell',
            'Tully',
            'Bolton',
            'Greyjoy',
            'Arryn',
            'Frey',
            'Mormont',
            'Tarley',
            'Dayne',
            'Umber',
            'Valeryon',
            'Manderly',
            'Clegane',
            'Glover',
            'Karstark'
        ];
        return houseNames[id - 1];
    }
}