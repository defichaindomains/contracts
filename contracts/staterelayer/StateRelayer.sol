// SPDX-License-Identifier: UNLICENSE
pragma solidity >=0.8.4;

import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import './IStateRelayer.sol';

error ERROR_IN_LOW_LEVEL_CALLS();
error NOT_BOT_ROLE_OR_NOT_IN_BATCH_CALL_IN_BOT();
error DEX_AND_DEXINFO_NOT_HAVE_THE_SAME_LENGTH();

// @NOTE: if a uint256 is equal to 2**256 - 1, the value is not reliable and therefore should not be used
contract StateRelayer is UUPSUpgradeable, AccessControlUpgradeable, IStateRelayer {
    bytes32 public constant BOT_ROLE = keccak256('BOT_ROLE');
    uint256 public constant DECIMALS = 18;

    // total value locked in DeFiChain DEX (USD)
    uint256 private totalValueLockInPoolPair;
    // total 24h volume of the pool pairs on DeFiChain (USD)
    uint256 private total24HVolume;
    // integer value, no decimals
    uint256 private lastUpdatedVaultInfoTimestampNoDecimals;
    // integer value, no decimals
    uint256 private lastUpdatedMasterNodeInfoTimestampNoDecimals;
    // integer value, no decimals
    uint256 private lastUpdatedDexInfoTimestampNoDecimals;
    bool private inBatchCallByBot;

    mapping(string => DEXInfo) private DEXInfoMapping;

    VaultGeneralInformation private vaultInfo;

    MasterNodeInformation private masterNodeInformation;

    event UpdateDEXInfo();
    event UpdateVaultGeneralInformation();
    event UpdateMasterNodeInformation(); 

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    constructor() {
        _disableInitializers();
    }

    modifier allowUpdate() {
        if (!(hasRole(BOT_ROLE, msg.sender) || inBatchCallByBot)) revert NOT_BOT_ROLE_OR_NOT_IN_BATCH_CALL_IN_BOT();
        _;
    }

    /**
     @notice Function to initialize the proxy contract
     @param _admin the address to be admin of the proxy contract
     @param _bot the address to play the bot role of proxy contract
     */
    function initialize(address _admin, address _bot) external initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(BOT_ROLE, _bot);
    }

    /**
     @notice Function to update the dex info
     @param _dex The names of the pool pairs
     @param _dexInfo Information about the dexes
     @param _totalValueLocked TVL of the whole dex ecosystem
     @param _total24HVolume Total 24H volume of the whole dex ecosystem
     */
    function updateDEXInfo(
        string[] calldata _dex,
        DEXInfo[] calldata _dexInfo,
        uint256 _totalValueLocked,
        uint256 _total24HVolume
    ) external allowUpdate {
        if (_dex.length != _dexInfo.length) revert DEX_AND_DEXINFO_NOT_HAVE_THE_SAME_LENGTH();
        for (uint256 i = 0; i < _dex.length; ++i) {
            DEXInfoMapping[_dex[i]] = _dexInfo[i];
        }
        totalValueLockInPoolPair = _totalValueLocked;
        total24HVolume = _total24HVolume;
        uint256 _lastUpdatedDexInfo = block.timestamp;
        lastUpdatedDexInfoTimestampNoDecimals = _lastUpdatedDexInfo;
        emit UpdateDEXInfo();
    }

    /**
     @notice Function to update the vault general information
     @param _vaultInfo the general vault information
     */
    function updateVaultGeneralInformation(VaultGeneralInformation calldata _vaultInfo) external allowUpdate {
        vaultInfo = _vaultInfo;
        uint256 _lastUpdatedVaultInfoTimestamp = block.timestamp;
        lastUpdatedVaultInfoTimestampNoDecimals = _lastUpdatedVaultInfoTimestamp;
        emit UpdateVaultGeneralInformation();
    }

    /**
     @notice Function to update master node information
     @param _masterNodeInformation information about masternodes
    */
    function updateMasterNodeInformation(MasterNodeInformation calldata _masterNodeInformation) external allowUpdate {
        masterNodeInformation = _masterNodeInformation;
        uint256 _lastUpdatedMasterNodeInfoTimestamp = block.timestamp;
        lastUpdatedMasterNodeInfoTimestampNoDecimals = _lastUpdatedMasterNodeInfoTimestamp;
        emit UpdateMasterNodeInformation(); 
    }

    /**
     *  @notice function for the bot to update a lot of data at the same time
     *  DONT grant any roles to the StateRelayerProxy contract address
     *  @param funcCalls the calldata used to make call back to this smart contract
     */
    function batchCallByBot(bytes[] calldata funcCalls) external onlyRole(BOT_ROLE) {
        inBatchCallByBot = true;
        for (uint256 i = 0; i < funcCalls.length; ++i) {
            (bool success, bytes memory returnData) = address(this).call(funcCalls[i]);
            if (!success) {
                if (returnData.length > 0) {
                    // solhint-disable-next-line max-line-length
                    // reference from openzeppelin: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/e50c24f5839db17f46991478384bfda14acfb830/contracts/utils/Address.sol#L233
                    assembly {
                        let returndata_size := mload(returnData)
                        revert(add(32, returnData), returndata_size)
                    }
                } else revert ERROR_IN_LOW_LEVEL_CALLS();
            }
        }
        inBatchCallByBot = false;
    }

    /**
     * @inheritdoc IStateRelayer
     */
    function getDexInfo() override external view returns (uint256, uint256, uint256) {
        return (lastUpdatedDexInfoTimestampNoDecimals, total24HVolume, totalValueLockInPoolPair);
    }

    /**
     * @inheritdoc IStateRelayer
     */
    function getDexPairInfo(string calldata _pair) override external view returns (uint256, DEXInfo memory) {
        return (lastUpdatedDexInfoTimestampNoDecimals, DEXInfoMapping[_pair]);
    }

    /**
     * @inheritdoc IStateRelayer
     */
    function getVaultInfo() override external view returns (uint256, VaultGeneralInformation memory) {
        return (lastUpdatedVaultInfoTimestampNoDecimals, vaultInfo);
    }

    /**
     * @inheritdoc IStateRelayer
     */
    function getMasterNodeInfo() override external view returns (uint256, MasterNodeInformation memory) {
        return (lastUpdatedMasterNodeInfoTimestampNoDecimals, masterNodeInformation);
    }
}