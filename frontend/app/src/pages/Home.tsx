import { Box } from "@mui/material";
import CrowdfundingInformation from "../components/CrowdfundingInformation";
import CreateProject from "../components/CreateProject";

const Home = ({ account, balance, updateBalance }: { account: string; balance: string; updateBalance: () => void }) => {
  return (
    <Box p={3}>
      <CrowdfundingInformation account={account} balance={balance} />
      <CreateProject updateBalance={updateBalance} />
    </Box>
  );
};

export default Home;