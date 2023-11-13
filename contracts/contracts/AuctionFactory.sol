// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./Auction.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

import "hardhat/console.sol";

/**
 * @title Auction Factory Contract
 * @author Shengsong Xu
 * @dev Factory contract to create and manage Auction contracts. Utilizes AccessControl for role-based permissions.
 */
contract AuctionFactory is AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    address public admin;
    uint256 public adminFeePercent;
    address[] public auctions;
    mapping(address => mapping(uint256 => bool)) public isAuction;

    /// @notice Emitted when a new auction is created.
    event AuctionCreated(address auctionContract);

    /// @notice Emitted when the AUC is withdrawed.
    event AucWithdrawed(address auctionContract);

    /// @notice Emitted when the admin is changed.
    event AdminChanged(address newAdmin);

    /// @notice Emitted when a new manager is added.
    event ManagerAdded(address newManager);

    /// @notice Emitted when a manager is removed.
    event ManagerRemoved(address manager);

    /// @notice Emitted when the admin fee percentage is changed.
    event AdminFeePercentChanged(uint256 newAdminFeePercent);

    /**
     * @notice Creates a new AuctionFactory contract.
     * @param _defaultAdminFeePercent The default admin fee percentage for auctions.
     */
    constructor(uint256 _defaultAdminFeePercent) {
        adminFeePercent = _defaultAdminFeePercent;
        admin = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
    }

    /**
     * @notice Creates a new auction contract for an NFT.
     * @dev Transfers the NFT to the newly created auction contract.
     * @param _nftAddress Address of the NFT contract.
     * @param _aucAddress Address of the AUC token contract.
     * @param _tokenId ID of the NFT to be auctioned.
     * @param _startingPrice Initial price of the auction.
     * @param _duration Duration of the auction in seconds.
     */
    function createAuction(
        address _nftAddress,
        address _aucAddress,
        uint256 _tokenId,
        uint256 _startingPrice,
        uint256 _duration
    ) public {
        require(
            isAuction[_nftAddress][_tokenId] == false,
            "Auction already exists for this NFT item."
        );
        require(
            _duration >= 1 minutes,
            "Auction duration must be at least 1 minute."
        );

        IERC721 nftContract = IERC721(_nftAddress);
        require(
            nftContract.ownerOf(_tokenId) == msg.sender,
            "You are not the owner of this NFT."
        );

        Auction newAuction = new Auction(
            _nftAddress,
            _aucAddress,
            msg.sender,
            _tokenId,
            _startingPrice,
            _duration,
            admin,
            adminFeePercent,
            address(this)
        );

        console.log(
            "Auction created at address: %s and msg.sender is %s",
            address(newAuction),
            msg.sender
        );

        auctions.push(address(newAuction));

        nftContract.transferFrom(msg.sender, address(newAuction), _tokenId);

        isAuction[_nftAddress][_tokenId] = true;
        emit AuctionCreated(address(newAuction));
    }

    /// @notice Notifies that an auction has ended and updates internal state accordingly.
    /// @dev Can only be called by the auction contract itself.
    /// @param _auctionAddress The address of the auction contract signaling its conclusion.
    function notifyAuctionEnded(address _auctionAddress) external {
        require(
            msg.sender == _auctionAddress,
            "Only the auction contract can call this"
        );
        // Update the mapping or perform other tasks
        Auction auction = Auction(_auctionAddress);
        isAuction[address(auction.nft())][auction.tokenId()] = false;
    }

    /// @notice Changes the admin of the contract.
    /// @dev Can only be called by an account with the DEFAULT_ADMIN_ROLE.
    /// @param _newAdmin The address to be granted the DEFAULT_ADMIN_ROLE.
    function changeAdmin(
        address _newAdmin
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(DEFAULT_ADMIN_ROLE, _newAdmin);
        _grantRole(MANAGER_ROLE, _newAdmin);
        renounceRole(DEFAULT_ADMIN_ROLE, admin);
        admin = _newAdmin;

        emit AdminChanged(_newAdmin);
    }

    /// @notice Adds a new manager to the contract.
    /// @dev Can only be called by an account with the DEFAULT_ADMIN_ROLE.
    /// @param _newManager The address to be granted the MANAGER_ROLE.
    function addManager(
        address _newManager
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MANAGER_ROLE, _newManager);
        emit ManagerAdded(_newManager);
    }

    /// @notice Removes a manager from the contract.
    /// @dev Can only be called by an account with the DEFAULT_ADMIN_ROLE.
    /// @param _manager The address to have the MANAGER_ROLE revoked.
    function removeManager(
        address _manager
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MANAGER_ROLE, _manager);
        emit ManagerRemoved(_manager);
    }

    /// @notice Sets the percentage of admin fees for auctions.
    /// @dev Can only be called by an account with the MANAGER_ROLE.
    /// @param _adminFeePercent The new admin fee percentage.
    function setAdminFeePercent(
        uint256 _adminFeePercent
    ) public onlyRole(MANAGER_ROLE) {
        adminFeePercent = _adminFeePercent;
        emit AdminFeePercentChanged(_adminFeePercent);
    }

    /// @notice Withdraws fees from finished auctions.
    /// @dev Iterates over all auctions and attempts to withdraw fees from each ended auction.
    ///      Can only be called by an account with the MANAGER_ROLE.
    function withdrawFees() public onlyRole(MANAGER_ROLE) {
        // iterate over auctions and attempt to withdraw fees
        for (uint256 i = 0; i < auctions.length; i++) {
            Auction auction = Auction(auctions[i]);
            if (auction.ended()) {
                try auction.withdraw() {
                    emit AucWithdrawed(auctions[i]);
                    // remove auction from array
                    auctions[i] = auctions[auctions.length - 1];
                    auctions.pop();
                } catch {
                    console.log("Withdraw failed for auction %s", auctions[i]);
                }
            }
        }
    }
}
