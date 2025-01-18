export const StatusColors = {
    0: "status-ongoing",
    1: "status-completed",
    2: "status-cancelled",
};

export const StatusLabels = {
    0: "Ongoing",
    1: "Completed",
    2: "Cancelled",
};

export enum ProjectStatus {
    Ongoing = 0,
    Completed = 1,
    Cancelled = 2,
}

export interface Donor {
    totalAmount: number;
    donationCount: number;
}

export interface Project {
    ownerAddress: string;
    title: string;
    description: string;
    goal: number;
    currentAmountRaised: number;
    status: number;
    donors: Record<string, Donor>;
}

  export interface ProjectState {
    projects: Record<string, Project>;
    userDonations: {
        [userAddress: string]: Array<{
            projectAddress: string;
            totalAmount: number;
            donationCount: number;
            toWithdraw: number;
        }>;
    };
}
