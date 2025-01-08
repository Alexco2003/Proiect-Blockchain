require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  paths: {
    artifacts: '../frontend/app/src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
  },
};
