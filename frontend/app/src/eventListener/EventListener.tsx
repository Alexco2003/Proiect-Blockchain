import React from 'react';
import { useEffect } from 'react';
import { ethers } from 'ethers';
import { useDispatch } from 'react-redux';
import { addProject, addDonor, addUserDonation, setUserWithdrawalAmount, resetUserWithdrawalAmount, cancelProject, finishProject } from '../store/projectSlice';
import Crowdfunding from '../artifacts/contracts/Crowdfunding.sol/Crowdfunding.json';
import Project from '../artifacts/contracts/Project.sol/Project.json';
import { AppDispatch } from '../store/store';
import { contractAddress } from '../others/contractAddress';
import { fetchDonationsFromContract } from '../services/contractServices';

const CrowdfundingABI = Crowdfunding.abi;
const ProjectABI = Project.abi;

const EventListener: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        let provider: ethers.BrowserProvider | null = null;
        if (window.ethereum) {
            provider = new ethers.BrowserProvider(window.ethereum);
        } else {
            console.error('Ethereum provider not found');
        }
        const contract = new ethers.Contract(contractAddress, CrowdfundingABI, provider);

    // Fetch past ProjectCreated events
    const fetchPastProjects = async () => {
        console.log('Fetching past projects');
        const filter = contract.filters.ProjectCreated();
        if (provider) {
         const logs = await provider.getLogs({ ...filter, fromBlock: 0, toBlock: 'latest' });

            for (const log of logs) {
                const parsedLog = contract.interface.parseLog(log);
                if (parsedLog === null || parsedLog.name !== "ProjectCreated") {
                    continue;
                }

                const { userAddress, projectAddress } = parsedLog.args;

                console.log("Adding project", projectAddress);

                // Fetch project details
                const projectContract = new ethers.Contract(projectAddress, ProjectABI, provider);
                const title = await projectContract.getTitle();
                const description = await projectContract.getDescription();
                const goal = await projectContract.getGoal();
                const status = await projectContract.getStatus();

                // Dispatch to add the project
                const currentAmountRaised = 0;
                dispatch(addProject({projectAddress,ownerAddress: userAddress,title,description,goal,currentAmountRaised,status,}));

                // Fetch donors for this project
                fetchPastDonors(projectAddress);

                // Fetch donations for this project
                fetchDonations(projectAddress);

                // Initialize event listeners for this project
                listenToProjectEvents(projectAddress);
            }
        }
    };

            // Fetch past donors for a project
            const fetchPastDonors = async (projectAddress: string) => {
                const projectContract = new ethers.Contract(projectAddress, ProjectABI, provider);
                const projectFilter = projectContract.filters.DonationReceived();
                const projectLogs = await provider?.getLogs({ ...projectFilter, fromBlock: 0, toBlock: 'latest' });

                projectLogs?.forEach((projectLog) => {
                    if (projectLog.address!==projectAddress) {
                        return;}

                    const parsedProjectLog = projectContract.interface.parseLog(projectLog);
                    if (parsedProjectLog === null || parsedProjectLog.name !== "DonationReceived") {
                        return;
                    }

                    if (parsedProjectLog) {
                        const { donor, totalAmount } = parsedProjectLog.args;
                        console.log("Found past DonationReceived event", donor, totalAmount);
                        // Dispatch to add the donor
                        dispatch(addDonor({projectAddress, donorAddress: donor, totalAmount, donationCount: 1}));
                        dispatch(addUserDonation({userAddress: donor, projectAddress, totalAmount, donationCount: 1}));
                    }
                });
             }

            // Fetch donations for a project
             const fetchDonations = async (projectAddress: string) => {
                const donations = await fetchDonationsFromContract(projectAddress);

                if (donations.length > 0) {
                  donations.forEach((donation) => {
                    dispatch(
                      setUserWithdrawalAmount({
                        userAddress: donation.donor,
                        projectAddress,
                        amount: donation.totalAmount,
                      })
                    );
                  });
                } else {
                  console.error("No donations found for this project.");
                }
              };

            // Listen to new Project events
            const listenForNewProjects = async () => {
                contract.on("ProjectCreated", async (userAddress: string, projectAddress: string) => {
                    console.log("New project created", projectAddress);
                    listenToProjectEvents(projectAddress);
                    const projectContract = new ethers.Contract(projectAddress, ProjectABI, provider);
                    const title = await projectContract.getTitle();
                    const description = await projectContract.getDescription();
                    const goal = await projectContract.getGoal();
                    const status = await projectContract.getStatus();
                    const currentAmountRaised = 0;
                    dispatch(addProject({projectAddress, ownerAddress: userAddress, title, description, goal, currentAmountRaised, status}));

                });
            };

            // Listen to project events
            const listenToProjectEvents = async (projectAddress: string) => {
                const projectContract = new ethers.Contract(projectAddress, ProjectABI, provider);

                projectContract.on("DonationReceived", async (donor: string, totalAmount: number) => {
                    console.log("Donation received", donor, totalAmount);
                    dispatch(addDonor({projectAddress, donorAddress: donor, totalAmount, donationCount: 1}));
                    dispatch(addUserDonation({userAddress: donor, projectAddress, totalAmount, donationCount: 1}));
                });

                projectContract.on("ProjectCanceled", async () => {
                    console.log("Project canceled", projectAddress);
                    dispatch(cancelProject({ projectAddress }));
                });

                projectContract.on("ProjectCompleted", async () => {
                    console.log("Project finished", projectAddress);
                    dispatch(finishProject({ projectAddress }));
                });

                projectContract.on("DonationsWithdrawnEvent", async (donor: string, amount: number) => {
                    console.log("Donations withdrawn", donor, amount);
                    dispatch(
                      setUserWithdrawalAmount({
                        userAddress: donor,
                        projectAddress,
                        amount,
                      })
                    );
                    dispatch(resetUserWithdrawalAmount({ userAddress: donor, projectAddress }));
                });

                projectContract.on("DonationsWithdrawnEventIfCancelled", async (donor: string, amount: number) => {
                    console.log("Donations withdrawn if cancelled", donor, amount);
                    dispatch(
                      setUserWithdrawalAmount({
                        userAddress: donor,
                        projectAddress,
                        amount,
                      })
                    );
                    dispatch(resetUserWithdrawalAmount({ userAddress: donor, projectAddress }));
                });
            }

        fetchPastProjects();
        listenForNewProjects();

}, [dispatch]);

return null;

};

export default EventListener;