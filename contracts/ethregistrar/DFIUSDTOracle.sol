pragma solidity >=0.8.4;

import "../staterelayer/IStateRelayer.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract DFIUSDTOracle is Ownable{
   address private _stateRelayer;


constructor(address initialOwner, address initializedStateRelayer) {
    transferOwnership(initialOwner);
    _stateRelayer = initializedStateRelayer;
}

   function setStateRelayer(address _address) onlyOwner public {
        _stateRelayer = _address;
    }

   function latestAnswer() public view returns (uint256) {
    (, IStateRelayer.DEXInfo memory dex) = IStateRelayer(_stateRelayer).getDexPairInfo('dUSDT-DFI');
    uint256 result = (dex.firstTokenBalance * 10**8) / dex.secondTokenBalance; 
    return result;
}

}
