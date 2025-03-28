import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RealEstateModule", (m) => {
  // Deploy the RealEstate contract
  const realEstate = m.contract("RealEstate");

  // Return the deployed contract instance for further interaction if needed
  return { realEstate };
});