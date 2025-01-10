const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crowdfunding", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {

    const [owner] = await ethers.getSigners();

    const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
    const crowdfunding = await Crowdfunding.deploy();

    return { crowdfunding, owner };
  }

  async function addProjects(crowdfunding, count) {
    const titleBase = "Test Project";
    const description = "Test project description";
    const goal = ethers.parseEther("10");

    for (let i = 0; i < count; i++) {
      await crowdfunding.createProject(`${titleBase} ${i}`, description, goal);
    }
  }

 describe("Deployment", function () {

    it("Should deploy correctly with the right initial values", async () => {
        const { crowdfunding } = await loadFixture(deployContractAndSetVariables);

        // Check the address
        expect(await crowdfunding.getAddress()).to.properAddress;

    });


  });

  describe("Project Creation", function () {

    it("Should have the correct owner", async () => {
      const { crowdfunding, owner } = await loadFixture(deployContractAndSetVariables);

      const title = "Test Project Title";
      const description = "Test Project Description";
      const goal = ethers.parseEther("10");

      const projectTransaction = await crowdfunding.createProject(title, description, goal);
      await projectTransaction.wait();

      const [createdProjectAddress] = await crowdfunding.getProjects(1, 0);

      const Project = await ethers.getContractFactory("Project");
      const project = await Project.attach(createdProjectAddress);

      const projectOwner = await project.owner();
      expect(projectOwner).to.equal(owner.address);
    });

    it("Should emit the ProjectCreated event", async () => {
        const { crowdfunding } = await loadFixture(deployContractAndSetVariables);

        const title = "Test Project Title";
        const description = "Test Project Description";
        const goal = ethers.parseEther("10");

        await expect(
          crowdfunding.createProject(title, description, goal)
        ).to.emit(crowdfunding, "ProjectCreated");
    });

    it("Should add the project to the list successfully", async () => {
        const { crowdfunding } = await loadFixture(deployContractAndSetVariables);

        const title = "Test Project Title";
        const description = "Test Project Description";
        const goal = ethers.parseEther("10");

        const prevCount = await crowdfunding.projectsCount();

        const projectTransaction = await crowdfunding.createProject(title, description, goal);
        await projectTransaction.wait();

        const actualCount = await crowdfunding.projectsCount();

        expect(actualCount).to.equal(prevCount + BigInt(1));


    });

  });

  describe("Fetching Projects", function () {

    it("Should retrieve the correct number of projects when within limit", async () => {
        const { crowdfunding } = await loadFixture(deployContractAndSetVariables);

        // Add 10 projects
        await addProjects(crowdfunding, 10);

        // Fetch 5 projects with offset 0
        const projects = await crowdfunding.getProjects(5, 0);
        expect(projects.length).to.equal(5);

        // Fetch the next 5 projects with offset 5
        const projectsNext = await crowdfunding.getProjects(5, 5);
        expect(projectsNext.length).to.equal(5);
      });

    it("Should retrieve all remaining projects if fewer than limit", async () => {
        const { crowdfunding } = await loadFixture(deployContractAndSetVariables);

        // Add 7 projects
        await addProjects(crowdfunding, 7);

        // Fetch 10 projects (limit is higher than available projects)
        const projects = await crowdfunding.getProjects(10, 0);
        expect(projects.length).to.equal(7);
      });

    it("Should respect the max limit for a single call", async () => {
        const { crowdfunding } = await loadFixture(deployContractAndSetVariables);

        // Add 25 projects
        await addProjects(crowdfunding, 25);

        // Try fetching 25 projects (max limit is 20)
        const projects = await crowdfunding.getProjects(25, 0);
        expect(projects.length).to.equal(20); // Should return only 20 due to max limit
      });

    it("Should return no projects if offset is at the end", async () => {
        const { crowdfunding } = await loadFixture(deployContractAndSetVariables);

        // Add 10 projects
        await addProjects(crowdfunding, 10);

        // Try fetching projects with offset at the end
        const projects = await crowdfunding.getProjects(5, 10);
        expect(projects.length).to.equal(0);
      });

    it("Should revert if offset exceeds the number of projects", async () => {
        const { crowdfunding } = await loadFixture(deployContractAndSetVariables);

        // Add 5 projects
        await addProjects(crowdfunding, 5);

        // Try fetching with an invalid offset
        await expect(crowdfunding.getProjects(5, 6)).to.be.revertedWith("Offset out of bounds");
      });

      it("Should retrieve projects in the correct order", async () => {
        const { crowdfunding } = await loadFixture(deployContractAndSetVariables);

        // Add 5 projects
        await addProjects(crowdfunding, 5);

        // Fetch all projects
        const projects = await crowdfunding.getProjects(5, 0);

        // Verify titles are in the correct order
        for (let i = 0; i < projects.length; i++) {
          const project = await ethers.getContractAt("Project", projects[i]);
          const title = await project.getTitle();
          expect(title).to.equal(`Test Project ${i}`);
        }
      });

  });



});



