import { expect } from "chai";
import { ethers } from "hardhat";
import { RealEstate } from "../typechain-types";

describe("RealEstate Contract", function () {
  let realEstate: RealEstate;
  let owner: any, buyer: any, other: any;
  const PROPERTY_LOCATION = "123 Main St";
  const PROPERTY_PRICE = ethers.parseEther("1"); // 1 ETH

  beforeEach(async function () {
    [owner, buyer, other] = await ethers.getSigners();
    const RealEstateFactory = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstateFactory.deploy();
    await realEstate.waitForDeployment();
  });

  describe("listProperty", function () {
    it("should list a property successfully", async function () {
      const tx = await realEstate.connect(owner).listProperty(PROPERTY_LOCATION, PROPERTY_PRICE);
      const receipt = await tx.wait();

      const property = await realEstate.getProperty(0);
      expect(property.id).to.equal(0);
      expect(property.location).to.equal(PROPERTY_LOCATION);
      expect(property.price).to.equal(PROPERTY_PRICE);
      expect(property.owner).to.equal(owner.address);
      expect(property.sold).to.be.false;

      expect(await realEstate.nextPropertyId()).to.equal(1);
      expect(receipt).to.emit(realEstate, "PropertyListed").withArgs(0, PROPERTY_LOCATION, PROPERTY_PRICE);
    });

    it("should revert if price is 0", async function () {
      await expect(
        realEstate.connect(owner).listProperty(PROPERTY_LOCATION, 0)
      ).to.be.revertedWith("Price must be greater than 0");
    });
  });

  describe("buyProperty", function () {
    beforeEach(async function () {
      await realEstate.connect(owner).listProperty(PROPERTY_LOCATION, PROPERTY_PRICE);
    });

    it("should allow buying a property", async function () {
      const ownerInitialBalance = await ethers.provider.getBalance(owner.address);
      const tx = await realEstate.connect(buyer).buyProperty(0, { value: PROPERTY_PRICE });
      const receipt = await tx.wait();

      const property = await realEstate.getProperty(0);
      expect(property.sold).to.be.true;

      const ownerNewBalance = await ethers.provider.getBalance(owner.address);
      expect(ownerNewBalance).to.be.above(ownerInitialBalance);

      expect(receipt).to.emit(realEstate, "PropertySold").withArgs(0, buyer.address);
    });

    it("should revert if property is already sold", async function () {
      await realEstate.connect(buyer).buyProperty(0, { value: PROPERTY_PRICE });
      await expect(
        realEstate.connect(other).buyProperty(0, { value: PROPERTY_PRICE })
      ).to.be.revertedWith("Property already sold");
    });

    it("should revert if payment amount is incorrect", async function () {
      await expect(
        realEstate.connect(buyer).buyProperty(0, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("should revert if property ID is invalid", async function () {
      await expect(
        realEstate.connect(buyer).buyProperty(999, { value: PROPERTY_PRICE })
      ).to.be.revertedWith("Invalid property ID");
    });
  });

  describe("getProperty", function () {
    it("should return correct property details after listing", async function () {
      await realEstate.connect(owner).listProperty(PROPERTY_LOCATION, PROPERTY_PRICE);
      const property = await realEstate.getProperty(0);

      expect(property.id).to.equal(0);
      expect(property.location).to.equal(PROPERTY_LOCATION);
      expect(property.price).to.equal(PROPERTY_PRICE);
      expect(property.owner).to.equal(owner.address);
      expect(property.sold).to.be.false;
    });

    it("should return default values for non-existent property", async function () {
      const property = await realEstate.getProperty(999);
      expect(property.id).to.equal(0);
      expect(property.location).to.equal("");
      expect(property.price).to.equal(0);
      expect(property.owner).to.equal(ethers.ZeroAddress);
      expect(property.sold).to.be.false;
    });
  });
});