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

  describe("Donations", function () {
    it("Should allow donations and update records correctly", async () => {
      const { project, otherAccount } = await loadFixture(deployContractAndSetVariables);

      const donationAmount = ethers.parseEther("1");
      await project.connect(otherAccount).donate({ value: donationAmount });

      const donationRecord = await project.connect(otherAccount).getDonationRecord();

      expect(donationRecord[0]).to.equal(donationAmount); // Total donated
      expect(donationRecord[1]).to.equal(1); // Count of donations
    });

    it("Should revert if donation is zero", async () => {
      const { project, otherAccount } = await loadFixture(deployContractAndSetVariables);

      await expect(
        project.connect(otherAccount).donate({ value: 0 })
      ).to.be.revertedWith("Donation must be greater than zero");
    });
  });

  describe("Project Completion and Cancellation", function () {
    it("Should allow the owner to complete the project when the goal is reached", async () => {
      const { project, owner, otherAccount } = await loadFixture(deployContractAndSetVariables);

      const donationAmount = ethers.parseEther("10");
      await project.connect(otherAccount).donate({ value: donationAmount });

      await project.connect(owner).completeProject();

      const status = await project.getStatus();
      expect(status).to.equal(1); // Status.Completed
    });

    it("Should revert if completion is attempted before reaching the goal", async () => {
      const { project, owner, otherAccount } = await loadFixture(deployContractAndSetVariables);

      const donationAmount = ethers.parseEther("5");
      await project.connect(otherAccount).donate({ value: donationAmount });

      await expect(
        project.connect(owner).completeProject()
      ).to.be.revertedWith("Goal not met yet");
    });

    it("Should allow the owner to cancel the project", async () => {
      const { project, owner } = await loadFixture(deployContractAndSetVariables);

      await project.connect(owner).cancelProject();

      const status = await project.getStatus();
      expect(status).to.equal(2); // Status.Cancelled
    });
  });

  describe("Withdrawals", function () {
    it("Should allow the owner to withdraw donations after completion", async () => {
      const { project, owner, otherAccount } = await loadFixture(deployContractAndSetVariables);

      const donationAmount = ethers.parseEther("10");
      await project.connect(otherAccount).donate({ value: donationAmount });

      await project.connect(owner).completeProject();

      const initialBalance = await ethers.provider.getBalance(owner.address);
      const withdrawTx = await project.connect(owner).withdrawDonations();
      const withdrawReceipt = await withdrawTx.wait();

      const finalBalance = await ethers.provider.getBalance(owner.address);

      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should allow donors to withdraw if the project is cancelled", async () => {
      const { project, owner, otherAccount } = await loadFixture(deployContractAndSetVariables);

      const donationAmount = ethers.parseEther("5");
      await project.connect(otherAccount).donate({ value: donationAmount });

      await project.connect(owner).cancelProject();

      const initialBalance = await ethers.provider.getBalance(otherAccount.address);
      const refundTx = await project.connect(otherAccount).withdrawDonationsIfCancelled();
      const refundReceipt = await refundTx.wait();

      const finalBalance = await ethers.provider.getBalance(otherAccount.address);

      expect(finalBalance).to.be.greaterThan(initialBalance);
    });
  });

});



