pragma solidity >=0.8.4;

import "../registry/ENS.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "./BaseRegistrar.sol";

contract BaseRegistrarImplementation is ERC721Enumerable, BaseRegistrar {
    bytes4 private constant INTERFACE_META_ID =
        bytes4(keccak256("supportsInterface(bytes4)"));
    bytes4 private constant ERC721_ID =
        bytes4(
            keccak256("balanceOf(address)") ^
                keccak256("ownerOf(uint256)") ^
                keccak256("approve(address,uint256)") ^
                keccak256("getApproved(uint256)") ^
                keccak256("setApprovalForAll(address,bool)") ^
                keccak256("isApprovedForAll(address,address)") ^
                keccak256("transferFrom(address,address,uint256)") ^
                keccak256("safeTransferFrom(address,address,uint256)") ^
                keccak256("safeTransferFrom(address,address,uint256,bytes)")
        );
    bytes4 private constant RECLAIM_ID =
        bytes4(keccak256("reclaim(uint256,address)"));
    string public baseURI;
    // Array to keep track of all minted token IDs
    uint256[] private _allTokenIds;

    // Mapping from token ID to index in the _allTokenIds array
    mapping(uint256 => uint256) private _allTokenIdsIndex;

    constructor(ENS _ens, bytes32 _baseNode) ERC721("", "") {
        ens = _ens;
        baseNode = _baseNode;
    }

    modifier live() {
        require(ens.owner(baseNode) == address(this));
        _;
    }

    modifier onlyController() {
        require(controllers[msg.sender]);
        _;
    }

    // Overrides ERC721Enumerable BaseURI function
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    // Allows to set a new BaseURI
    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    // Authorises a controller, who can register domains.
    function addController(address controller) external override onlyOwner {
        controllers[controller] = true;
        emit ControllerAdded(controller);
    }

    // Revoke controller permission for an address.
    function removeController(address controller) external override onlyOwner {
        controllers[controller] = false;
        emit ControllerRemoved(controller);
    }

    // Set the resolver for the TLD this registrar manages.
    function setResolver(address resolver) external override onlyOwner {
        ens.setResolver(baseNode, resolver);
    }

    // Returns true if the specified name is available for registration.
    function available(uint256 id) public view override returns (bool) {
        // Not available if it's registered here
        return !_exists(id);
    }

    /**
     * @dev Register a name.
     * @param id The token ID (keccak256 of the label).
     * @param owner The address that should own the registration.
     */
    function register(uint256 id, address owner) external override {
        _register(id, owner, true);
    }

    /**
     * @dev Register a name, without modifying the registry.
     * @param id The token ID (keccak256 of the label).
     * @param owner The address that should own the registration.
     */
    function registerOnly(uint256 id, address owner) external {
        _register(id, owner, false);
    }

    function _register(
        uint256 id,
        address owner,
        bool updateRegistry
    ) internal live onlyController {
        require(available(id));

        _mint(owner, id);
        _addTokenToAllTokenEnumeration(id);
        if (updateRegistry) {
            ens.setSubnodeOwner(baseNode, bytes32(id), owner);
        }

        emit NameRegistered(id, owner);
    }

function _addTokenToAllTokenEnumeration(uint256 tokenId) private {
        _allTokenIdsIndex[tokenId] = _allTokenIds.length;
        _allTokenIds.push(tokenId);

        
    }

      // Override the _transfer function to update the registry on transfer
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override live {
        super._transfer(from, to, tokenId);
        // Update the registry with the new owner
        ens.setSubnodeOwner(baseNode, bytes32(tokenId), to);
    }
    
    /**
     * @dev Reclaim ownership of a name in ENS, if you own it in the registrar.
     */
    function reclaim(uint256 id, address owner) external override live {
        require(_isApprovedOrOwner(msg.sender, id));
        ens.setSubnodeOwner(baseNode, bytes32(id), owner);
    }

    function supportsInterface(
        bytes4 interfaceID
    ) public view override(ERC721Enumerable, IERC165) returns (bool) {
        return
            interfaceID == INTERFACE_META_ID ||
            interfaceID == ERC721_ID ||
            interfaceID == RECLAIM_ID;
    }
}
