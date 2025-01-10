const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Project", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {

    const projectTitle = "Test Project Title";
    const projectDescription = "This is a test project description";
    const projectGoal = "10"; // 10 ETH
    const [owner, otherAccount] = await ethers.getSigners();

    const Project = await ethers.getContractFactory("Project");

    const project = await Project.deploy(
      projectTitle,
      projectDescription,
      ethers.parseEther(projectGoal),
      owner.address
    );

    return { project, projectTitle, projectDescription, projectGoal, owner, otherAccount };
  }

 describe("Deployment", function () {

    it("Should deploy correctly with the right initial values", async () => {
        const { project, projectTitle, projectDescription, projectGoal, owner } = await loadFixture(deployContractAndSetVariables);

        // Check the address
        expect(await project.getAddress()).to.properAddress;

        // Check initial values
        expect(await project.getTitle()).to.equal(projectTitle);
        expect(await project.getDescription()).to.equal(projectDescription);
        expect(await project.getGoal()).to.equal(ethers.parseEther(projectGoal));
        expect(await project.getStatus()).to.equal(0); // Status.Ongoing is 0
        expect(await project.owner()).to.equal(owner.address);
    });

      it("Should revert if the title is empty", async () => {
        const Project = await ethers.getContractFactory("Project");
        const [owner] = await ethers.getSigners();

        await expect(
          Project.deploy(
            "", // Empty title
            "Valid description",
            ethers.parseEther("10"),
            owner.address
          )
        ).to.be.revertedWith("Title is required");
    });

      it("Should revert if the description is empty", async () => {
        const Project = await ethers.getContractFactory("Project");
        const [owner] = await ethers.getSigners();

        await expect(
          Project.deploy(
            "Valid Title",
            "", // Empty description
            ethers.parseEther("10"),
            owner.address
          )
        ).to.be.revertedWith("Description is required");
    });

    it("Should revert if the goal is zero", async () => {
        const Project = await ethers.getContractFactory("Project");
        const [owner] = await ethers.getSigners();

        await expect(
          Project.deploy(
            "Valid Title",
            "Valid description",
            0, // Goal of 0
            owner.address
          )
        ).to.be.revertedWith("Goal must be greater than zero");
    });


  });




});



