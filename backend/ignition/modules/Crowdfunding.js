const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Crowdfunding", (m) => {
    const crowdfunding = m.contract("Crowdfunding", []);

    return { crowdfunding };
});
