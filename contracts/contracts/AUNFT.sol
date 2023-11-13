// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title AUNFT - Auction NFT Contract
/// @author Shengsong Xu
/// @dev Extends ERC721 Non-Fungible Token Standard with URI storage capabilities
contract AUNFT is ERC721, ERC721URIStorage {
    uint256 private _nextTokenId;

    /// @notice Initializes the contract by setting a `name` and a `symbol` to the token collection.
    /// @param name Name of the NFT collection.
    /// @param symbol Symbol of the NFT collection.
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    /// @notice Safely mints a new NFT and assigns it to an address with a metadata URI.
    /// @dev Increments the `_nextTokenId` after successful minting.
    /// @param to The address that will own the minted NFT.
    /// @param uri URI of the NFT's metadata.
    function safeMint(address to, string memory uri) public {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
