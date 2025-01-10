// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

abstract contract DonationsManager {
    mapping(address => uint) public donations; // Account -> Amount donated
    address[] public donors; // List of donors

    address[] public finalTopDonors; // Stores final top donors
    uint[] public finalTopDonations; // Stores final top donations

    event DonationsWithdrawnEvent(address indexed account, uint totalDonations); // Event to log withdrawals
    event DonationsWithdrawnEventIfCancelled (address indexed account); // Event to log withdrawals if project is cancelled

    // Function to withdraw all donations by summing up donations and resetting the mapping
    function withdrawDonations() public {
        uint totalDonations = 0;

        // Capture the top donors before resetting
        captureFinalTopDonors();

        // Sum up all donations
        for (uint i = 0; i < donors.length; i++) {
            totalDonations += donations[donors[i]];
            donations[donors[i]] = 0; // Reset each donor's donation to zero
        }

        require(totalDonations > 0, "No donations available to withdraw");

        // Transfer the total donations to the msg.sender
        payable(msg.sender).transfer(totalDonations);

        emit DonationsWithdrawnEvent(msg.sender, totalDonations);
    }

    // Function to withdraw donations if the project is cancelled
     function withdrawDonationsIfCancelled() public {
        uint amount = donations[msg.sender];
        require(amount > 0, "No donations available to withdraw");
        donations[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit DonationsWithdrawnEventIfCancelled(msg.sender);
    }

    // Capture the current top donors before resetting donations
    function captureFinalTopDonors() internal {
        uint count = donors.length < 10 ? donors.length : 10; // Limit to top 10
        (address[] memory topDonors, uint[] memory topDonations) = getTopDonors(count);

        // Reset the finalTopDonors and finalTopDonations arrays
        delete finalTopDonors;
        delete finalTopDonations;

        for (uint i = 0; i < count; i++) {
            finalTopDonors.push(topDonors[i]);
            finalTopDonations.push(topDonations[i]);
        }
    }

    // Retrieve the final top donors after the withdrawal
    function getFinalTopDonors() public view returns (address[] memory, uint[] memory) {
        return (finalTopDonors, finalTopDonations);
    }

    // Retrieve top N donors
    function getTopDonors(uint count) public view returns (address[] memory, uint[] memory) {
        require(count > 0 && count <= donors.length, "Invalid count");

        address[] memory topDonors = new address[](count);
        uint[] memory topDonations = new uint[](count);

        address[] memory donorList = donors;
        uint[] memory donationAmounts = new uint[](donors.length);

        for (uint i = 0; i < donors.length; i++) {
            donationAmounts[i] = donations[donorList[i]];
        }

        for (uint i = 0; i < count; i++) {
            uint maxIndex = i;
            for (uint j = i + 1; j < donorList.length; j++) {
                if (donationAmounts[j] > donationAmounts[maxIndex]) {
                    maxIndex = j;
                }
            }

            (donorList[i], donorList[maxIndex]) = (donorList[maxIndex], donorList[i]);
            (donationAmounts[i], donationAmounts[maxIndex]) = (donationAmounts[maxIndex], donationAmounts[i]);

            topDonors[i] = donorList[i];
            topDonations[i] = donationAmounts[i];
        }

        return (topDonors, topDonations);
    }

    function updateDonation(address account, uint amount) internal {
        if (donations[account] == 0) {
            donors.push(account); // Add donor if first-time donor
        }
        donations[account] += amount;
    }

    function getUserDonation(address account) public view returns (uint) {
        return donations[account];
    }

    function tax(uint amount) public pure returns (uint) {
    return (amount * 95) / 100;
    }

}
