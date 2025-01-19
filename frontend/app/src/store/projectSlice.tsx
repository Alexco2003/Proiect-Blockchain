import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProjectState, ProjectStatus } from "../models/models";
import { RootState } from "./store";
import { createSelector } from "reselect";

const initialState: ProjectState = {
  projects: {},
  userDonations: {},
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {

    addProject: (
      state,
      action: PayloadAction<{
        projectAddress: string;
        ownerAddress: string;
        title: string;
        description: string;
        goal: number;
        currentAmountRaised: number;
        status: number;
      }>
    ) => {
      const {
        projectAddress,
        ownerAddress,
        title,
        description,
        goal,
        currentAmountRaised,
        status,
      } = action.payload;

      state.projects[projectAddress.toLowerCase()] = {
        ownerAddress: ownerAddress.toLowerCase(),
        title,
        description,
        goal,
        currentAmountRaised,
        status,
        donors : {},
      };
    },

    addDonor: (
      state,
      action: PayloadAction<{
        projectAddress: string;
        donorAddress: string;
        totalAmount: number;
        donationCount: number;
      }>
    ) => {
      const { projectAddress, donorAddress, totalAmount, donationCount } = action.payload;
      const normalizedProjectAddress = projectAddress.toLowerCase();
      if (state.projects[normalizedProjectAddress]) {
        state.projects[normalizedProjectAddress].donors[donorAddress.toLowerCase()] = {
          totalAmount,
          donationCount,
        };
      }
    },

    addUserDonation: (
      state,
      action: PayloadAction<{
        userAddress: string;
        projectAddress: string;
        totalAmount: number;
        donationCount: number;
      }>
    ) => {
      const { userAddress, projectAddress, totalAmount, donationCount } = action.payload;

      const normalizedUserAddress = userAddress.toLowerCase();

      if (!state.userDonations[normalizedUserAddress]) {
        state.userDonations[normalizedUserAddress] = [];
      }

      state.userDonations[normalizedUserAddress].push({ projectAddress: projectAddress.toLowerCase(), totalAmount, donationCount, toWithdraw: 0 });
    },

    setUserWithdrawalAmount: (
      state,
      action: PayloadAction<{ userAddress: string; projectAddress: string; amount: number }>
    ) => {
      const { userAddress, projectAddress, amount } = action.payload;
      const userDonations = state.userDonations[userAddress.toLowerCase()];
      if (userDonations) {
        const projectDonation = userDonations.find((projectDonation) => projectDonation.projectAddress === projectAddress.toLowerCase());
        if (projectDonation) {
          projectDonation.toWithdraw = amount;
        }
      }
    },

    resetUserWithdrawalAmount: (
      state,
      action: PayloadAction<{ userAddress: string; projectAddress: string }>
    ) => {
      const { userAddress, projectAddress} = action.payload;
      const userDonations = state.userDonations[userAddress.toLowerCase()];
      if (userDonations) {
        const projectDonation = userDonations.find((projectDonation) => projectDonation.projectAddress === projectAddress.toLowerCase());
        if (projectDonation) {
          projectDonation.toWithdraw = 0;
        }
      }
    },

    cancelProject: (state, action: PayloadAction<{ projectAddress: string }>) => {
      const { projectAddress } = action.payload;
      const normalizedProjectAddress = projectAddress.toLowerCase();
      const project = state.projects[normalizedProjectAddress];
      if (project) {
        project.status = ProjectStatus.Cancelled;
      }
    },

    finishProject: (state, action: PayloadAction<{ projectAddress: string }>) => {
      const { projectAddress } = action.payload;
      const normalizedProjectAddress = projectAddress.toLowerCase();
      const project = state.projects[normalizedProjectAddress];
      if (project) {
        project.status = ProjectStatus.Completed;
      }
    }

  },
});

const selectAllProjects = (state: RootState) => state.projects.projects;

export const selectProjectByAddress = createSelector(
  [selectAllProjects, (_: RootState, projectAddress: string) => projectAddress.toLowerCase()],
  (projects, normalizedProjectAddress) => {
    const project = projects[normalizedProjectAddress];
    if (!project) return null;
    return project;
  }
);

export const selectProjectsByOwner = createSelector(
  [selectAllProjects, (_: RootState, ownerAddress: string) => ownerAddress],
  (projects, ownerAddress) => {
    return Object.entries(projects)
      .filter(
        ([, project]) =>
          project.ownerAddress.toLowerCase() === ownerAddress.toLowerCase()
      )
      .map(([address, project]) => ({ address, ...project }));
  }
);

export const selectOngoingProjects = createSelector(
  [selectAllProjects, (_: RootState) => _],
  (projects) => {
    return Object.entries(projects)
      .filter(([, project]) => project.status === ProjectStatus.Ongoing)
      .map(([address, project]) => ({ projectAddress: address, ...project }));
  }
);

export const selectFinishedProjects = createSelector(
  [selectAllProjects, (_: RootState) => _],
  (projects) => {
    return Object.entries(projects)
      .filter(([, project]) => project.status === ProjectStatus.Completed)
      .map(([address, project]) => ({ projectAddress: address, ...project }));
  }
);

export const selectCancelledProjects = createSelector(
  [selectAllProjects, (_: RootState) => _],
  (projects) => {
    return Object.entries(projects)
      .filter(([, project]) => project.status === ProjectStatus.Cancelled)
      .map(([address, project]) => ({ projectAddress: address, ...project }));
  }
);

export const selectUserActiveDonations = createSelector(
  [
    (state: RootState) => state.projects,
    (_: RootState, userAddress: string) => userAddress,
  ],
  (state, userAddress) => {
    const userDonations = state.userDonations;
    const projects = state.projects;

    if (!userDonations[userAddress.toLowerCase()]) return [];

    return userDonations[userAddress.toLowerCase()].filter(
      (projectDonation) =>
        projects[projectDonation.projectAddress.toLowerCase()].status === ProjectStatus.Ongoing
    ) || [];
  }
);

export const selectUserHistoryDonations = createSelector(
  [
    (state: RootState) => state.projects,
    (_: RootState, userAddress: string) => userAddress,
  ],
  (state, userAddress) => {
    const userDonations = state.userDonations;
    const projects = state.projects;

    if (!userDonations[userAddress.toLowerCase()]) return [];

    return userDonations[userAddress.toLowerCase()].filter(
      (projectDonation) =>
        projects[projectDonation.projectAddress.toLowerCase()].status === ProjectStatus.Completed ||
        projects[projectDonation.projectAddress.toLowerCase()].status === ProjectStatus.Cancelled
    ) || [];
  }
);


export const {
  addProject,
  addDonor,
  addUserDonation,
  setUserWithdrawalAmount,
  resetUserWithdrawalAmount,
  cancelProject,
  finishProject,
} = projectSlice.actions;

export default projectSlice.reducer;
