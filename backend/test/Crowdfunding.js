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

  async function addProject(crowdfunding, title, description, goal) {
    await crowdfunding.createProject(title, description, goal);
  }

 describe("Deployment", function () {

    it("Should deploy correctly with the right initial values", async () => {
        const { crowdfunding } = await loadFixture(deployContractAndSetVariables);

        // Check the address
        expect(await crowdfunding.getAddress()).to.properAddress;

    });


  });




});



