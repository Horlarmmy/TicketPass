const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TicketModule", (m) => {
  const storage = m.contract("TicketPass");

  return { storage };
});