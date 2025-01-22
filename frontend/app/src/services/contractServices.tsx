import Crowdfunding from '../artifacts/contracts/Crowdfunding.sol/Crowdfunding.json';
import Project from '../artifacts/contracts/Project.sol/Project.json';
import { ethers } from 'ethers';
import { contractAddress } from '../others/contractAddress';

// Global variables
let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;
let crowdfundingContract: ethers.Contract | null = null;


// Initialization
export const initialization = async () => {
    if (!provider || !signer || !crowdfundingContract) {
      if (window.ethereum) {

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();

        crowdfundingContract = new ethers.Contract(
          contractAddress,
          Crowdfunding.abi,
          signer
        );

        console.log("Initialization completed");
      } else {
        console.error("MetaMask is not installed!");
        throw new Error("MetaMask is required.");
      }
    }
  };



// Initialize Specific Project Contract
const initializeProjectContract = async (address: string) => {
    await initialization();
    return new ethers.Contract(address, Project.abi, signer);
  };




// Account Management
export const requestAccount = async () => {
    await initialization();
    try {
      const accounts = await provider!.send("eth_requestAccounts", []);
      console.log("Account request successful.");
      return accounts[0];
    } catch (error: any) {
      console.error("Error requesting account.", error.message);
      return null;
    }
  };

  export const getBalance = async (account: string) => {
    await initialization();
    try {
      const balance = await provider!.getBalance(account);
      console.log("Balance retrieved.");
      return ethers.formatEther(balance);
    } catch (error: any) {
      console.error("Error retrieving balance.", error.message);
      return null;
    }
  };



// Crowdfunding Functions
export const createProject = async (title: string, description: string, goal: number) => {
    await initialization();
    try {
      const tx = await crowdfundingContract!.createProject(title, description, goal);
      await tx.wait();
      console.log("Project created.");
    } catch (error: any) {
      console.error("Error creating project.", error.message);
    }
  };



// Project Functions
export const donateToProject = async (address: string, amount: string) => {
    const projectContract = await initializeProjectContract(address);
    try {
      const tx = await projectContract.donate({ value: ethers.parseEther(amount) });
      await tx.wait();
      console.log(`Donation successful. Amount: ${amount}`);
      return true;
    } catch (error: any) {
      console.error("Error donating to project.", error.message);
      return false;
    }
  };

export const completeProject = async (projectAddress: string): Promise<boolean> => {
    const projectContract = await initializeProjectContract(projectAddress);
    try {
      const tx = await projectContract.completeProject();
      await tx.wait();
      console.log(`Project at ${projectAddress} completed successfully.`);
      return true;
    } catch (error: any) {
      console.error(`Error completing project at ${projectAddress} :`, error.message);
      return false;
    }
  };

export const cancelProject = async (projectAddress: string): Promise<boolean> => {
    const projectContract = await initializeProjectContract(projectAddress);
    try {
      const tx = await projectContract.cancelProject();
      await tx.wait();
      console.log(`Project at ${projectAddress} canceled successfully.`);
      return true;
    } catch (error: any) {
      console.error(`Error canceling project at ${projectAddress} :`, error.message);
      return false;
    }
  };

export const withdrawAllDonations = async (userAddress: string, projectAddress: string): Promise<boolean> => {
    const projectContract = await initializeProjectContract(projectAddress);
    try {
      const tx = await projectContract.withdrawDonations({ from: userAddress });
      await tx.wait();
      console.log(`All donations withdrawn successfully for project at ${projectAddress} by user ${userAddress}`);
      return true;
    } catch (error: any) {
      console.error(`Error withdrawing donations for project at ${projectAddress} by user ${userAddress}`, error.message);
      return false;
    }
  };

export const withdrawDonationsIfCancelled = async (userAddress: string, projectAddress: string): Promise<boolean> => {
    const projectContract = await initializeProjectContract(projectAddress);
    try {
      const tx = await projectContract.withdrawDonationsIfCancelled({ from: userAddress });
      await tx.wait();
      console.log(`Donations withdrawn successfully for canceled project at ${projectAddress} by user ${userAddress}`);
      return true;
    } catch (error: any) {
      console.error(`Error withdrawing donations for canceled project at ${projectAddress} by user ${userAddress}`, error.message);
      return false;
    }
  };

export const fetchFinalTopDonors = async (projectAddress: string) => {
    const projectContract = await initializeProjectContract(projectAddress);
    try {
      const [finalTopDonors, finalTopDonations] = await projectContract.getFinalTopDonors();
      const finalDonorsList = finalTopDonors.map((donor: string, index: number) => ({
        donor,
        amount: ethers.formatEther(finalTopDonations[index]),
      }));

      console.log("Final top donors fetched successfully", finalDonorsList);
      return finalDonorsList;
    } catch (error: any) {
      console.error("Error fetching final top donors", error.message);
      return [];
    }
  };

export const fetchLiveTopDonors = async (projectAddress: string, count: number) => {
    const projectContract = await initializeProjectContract(projectAddress);
    try {

      const [topDonors, topDonations] = await projectContract.getTopDonors(count);

      const liveDonorsList = topDonors.map((donor: string, index: number) => ({
        donor,
        amount: ethers.formatEther(topDonations[index]),
      }));

      console.log("Live top donors fetched successfully", liveDonorsList);
      return liveDonorsList;
    } catch (error: any) {
      console.error("Error fetching live top donors", error.message);
      return [];
    }
  };

export const fetchDonationsFromContract = async (projectAddress: string): Promise<{ donor: string; totalAmount: number; donationCount: number }[]> => {

    const projectContract = await initializeProjectContract(projectAddress);

    try {
      const [donors, amounts, counts] = await projectContract.getAllDonations();

      const donations = donors.map((donor: string, index: number) => ({
        donor,
        totalAmount: Number(amounts[index]),
        donationCount: Number(counts[index]),
      }));

      return donations;
    } catch (error: any) {
      console.error("Error fetching donations:", error.message);
      return [];
    }
  };


