// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./Project.sol";

contract Crowdfunding {
    uint256 private _maxLimit = 20; // Maximum number of projects to fetch in a single call
    Project[] private _deployedProjects; // Array to store all deployed project contracts

    // Event emitted when a new project is created
    event ProjectCreated(address indexed creator, address indexed projectAddress, string title);

    // Function to create a new project
    function createProject(
        string memory _title,
        string memory _description,
        uint _goal
    ) public {
        require(bytes(_title).length > 0, "Title is required");
        require(bytes(_description).length > 0, "Description is required");
        require(_goal > 0, "Goal must be greater than zero");

        Project newProject = new Project(_title, _description, _goal, msg.sender);

        _deployedProjects.push(newProject);

        emit ProjectCreated(msg.sender, address(newProject), _title);
    }

    // Function to retrieve a list of projects (for gas optimization)
    function getProjects(uint256 limit, uint256 offset) public view returns (Project[] memory projects) {
        require(offset <= projectsCount(), "Offset out of bounds");

        uint256 size = projectsCount() - offset;

        if (size > limit) {
            size = limit;
        }

        if (size > _maxLimit) {
            size = _maxLimit;
        }

        projects = new Project[](size);

        for (uint256 i = 0; i < size; i++) {
            projects[i] = _deployedProjects[offset + i];
        }

        return projects;
    }

    // Function to retrieve the total number of projects
    function projectsCount() public view returns (uint256) {
        return _deployedProjects.length;
    }
}
