import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProjectState } from "../models/models";
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

  },
});


const selectAllProjects = (state: RootState) => state.projects.projects;

export const testSelector = (projectAddress: string) =>
  createSelector(selectAllProjects, (projects) => projects[projectAddress]);


export const {
  addProject,
} = projectSlice.actions;

export default projectSlice.reducer;
