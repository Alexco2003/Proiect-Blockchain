// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DonationsManager.sol";

contract Project is Ownable, DonationsManager{

    enum Status { Ongoing, Completed, Cancelled } // Enum to track project status
    struct DonationRecord {
        uint totalAmount; // Total amount donated by the donor
        uint donationCount; // Number of times the donor has donated
    }

    Status public status;
    string public title;
    string public description;
    uint public goal; // Goal amount to be raised
    uint public currentAmountRaised; // Current amount raised

    mapping(address => DonationRecord) public donationRecords; // Account -> DonationRecord

    // Events
    event DonationReceived(address indexed donor, uint amount);
    event ProjectCompleted(uint totalFunds);
    event ProjectCancelled();

    constructor(
    string memory _title,
    string memory _description,
    uint _goal,
    address _projectCreator
    ) Ownable(msg.sender) {
    require(bytes(_title).length > 0, "Title is required");
    require(bytes(_description).length > 0, "Description is required");
    require(_goal > 0, "Goal must be greater than zero");
    title = _title;
    description = _description;
    goal = _goal;
    currentAmountRaised = 0;
    status = Status.Ongoing;
    transferOwnership(_projectCreator); // Transfer ownership to the project creator
    }

    // Modifier to check if a user can donate
    modifier canDonate() {
        require(status == Status.Ongoing, "Project is not accepting donations");
        require(msg.value > 0, "Donation must be greater than zero");
        _;
    }

    // Function for display of donations
    function getAllDonations() public view returns (address[] memory, uint[] memory, uint[] memory) {
    uint totalDonors = donors.length;

    // Initialize arrays to store donor details
    address[] memory donorsDisplay = new address[](totalDonors);
    uint[] memory amountDisplay = new uint[](totalDonors);
    uint[] memory countDisplay = new uint[](totalDonors);

    // Populate the arrays
    for (uint i = 0; i < totalDonors; i++) {
        address donor = donors[i];
        donorsDisplay[i] = donor;
        amountDisplay[i] = donationRecords[donor].totalAmount;
        countDisplay[i] = donationRecords[donor].donationCount;
    }

    return (donorsDisplay, amountDisplay, countDisplay);
    }


    // Getters
    function getTitle() public view returns (string memory) {
        return title;
    }

    function getDescription() public view returns (string memory) {
        return description;
    }

    function getGoal() public view returns (uint) {
        return goal;
    }

    function getStatus() public view returns (Status) {
        return status;
    }

    function getDonationRecord() external view returns (uint, uint) {
        DonationRecord memory donationRecord = donationRecords[msg.sender];
        return (donationRecord.totalAmount, donationRecord.donationCount);
    }

    // Function to donate to the project
    function donate() external payable canDonate {
        address donor = msg.sender;
        uint amount = msg.value;

        // Update the donation records
        donationRecords[donor].totalAmount += amount;
        donationRecords[donor].donationCount += 1;

        updateDonation(donor, amount);

        currentAmountRaised += amount;

        emit DonationReceived(donor, amount);
    }

    // Function to complete the project
    function completeProject() public onlyOwner {
        require(status == Status.Ongoing, "Project is not ongoing");
        require(currentAmountRaised >= goal, "Goal not met yet");

        status = Status.Completed;

        emit ProjectCompleted(currentAmountRaised);
    }

    // Function to cancel the project
    function cancelProject() public onlyOwner {
        require(status == Status.Ongoing, "Project is not ongoing");

        status = Status.Cancelled;

        emit ProjectCancelled();
    }











}