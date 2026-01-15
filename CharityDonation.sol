// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CharityDonation
 * @dev A transparent donation platform where users can donate ETH to a verified charity
 */
contract CharityDonation {
    // State variables
    address public charityAddress;
    address public owner;
    uint256 public totalDonations;
    uint256 public totalDonors;
    bool public isActive;
    
    // Mapping to track individual donations
    mapping(address => uint256) public donations;
    mapping(address => bool) public hasDonated;
    
    // Array to track all donors
    address[] public donors;
    
    // Events
    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);
    event FundsWithdrawn(address indexed charity, uint256 amount, uint256 timestamp);
    event CharityAddressUpdated(address indexed oldCharity, address indexed newCharity);
    event ContractStatusChanged(bool isActive);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyCharity() {
        require(msg.sender == charityAddress, "Only charity can withdraw funds");
        _;
    }
    
    modifier whenActive() {
        require(isActive, "Contract is not active");
        _;
    }
    
    /**
     * @dev Constructor sets the charity address and owner
     * @param _charityAddress The verified charity address
     */
    constructor(address _charityAddress) {
        require(_charityAddress != address(0), "Invalid charity address");
        charityAddress = _charityAddress;
        owner = msg.sender;
        isActive = true;
    }
    
    /**
     * @dev Allows users to donate ETH to the charity
     */
    function donate() public payable whenActive {
        require(msg.value > 0, "Donation must be greater than 0");
        
        // Track if this is a new donor
        if (!hasDonated[msg.sender]) {
            hasDonated[msg.sender] = true;
            donors.push(msg.sender);
            totalDonors++;
        }
        
        // Update donation tracking
        donations[msg.sender] += msg.value;
        totalDonations += msg.value;
        
        emit DonationReceived(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Allows the charity to withdraw all funds
     */
    function withdrawFunds() public onlyCharity {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = charityAddress.call{value: balance}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(charityAddress, balance, block.timestamp);
    }
    
    /**
     * @dev Allows the charity to withdraw a specific amount
     * @param amount The amount to withdraw
     */
    function withdrawAmount(uint256 amount) public onlyCharity {
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = charityAddress.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(charityAddress, amount, block.timestamp);
    }
    
    /**
     * @dev Updates the charity address (only owner)
     * @param _newCharityAddress The new charity address
     */
    function updateCharityAddress(address _newCharityAddress) public onlyOwner {
        require(_newCharityAddress != address(0), "Invalid charity address");
        address oldCharity = charityAddress;
        charityAddress = _newCharityAddress;
        emit CharityAddressUpdated(oldCharity, _newCharityAddress);
    }
    
    /**
     * @dev Toggle contract active status (only owner)
     */
    function toggleContractStatus() public onlyOwner {
        isActive = !isActive;
        emit ContractStatusChanged(isActive);
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get donation amount for a specific donor
     * @param donor The donor address
     */
    function getDonationAmount(address donor) public view returns (uint256) {
        return donations[donor];
    }
    
    /**
     * @dev Get total number of donors
     */
    function getTotalDonors() public view returns (uint256) {
        return totalDonors;
    }
    
    /**
     * @dev Get all donors
     */
    function getAllDonors() public view returns (address[] memory) {
        return donors;
    }
    
    /**
     * @dev Get top donors (limited to first 10)
     */
    function getTopDonors() public view returns (address[] memory, uint256[] memory) {
        uint256 length = donors.length > 10 ? 10 : donors.length;
        address[] memory topDonorAddresses = new address[](length);
        uint256[] memory topDonationAmounts = new uint256[](length);
        
        // Simple selection of first N donors (in production, you'd want to sort)
        for (uint256 i = 0; i < length; i++) {
            topDonorAddresses[i] = donors[i];
            topDonationAmounts[i] = donations[donors[i]];
        }
        
        return (topDonorAddresses, topDonationAmounts);
    }
    
    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {
        donate();
    }
}
