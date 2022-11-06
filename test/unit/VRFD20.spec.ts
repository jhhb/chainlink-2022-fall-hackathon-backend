import { expect} from "chai"
import { network, deployments, ethers } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { VRFD20, VRFCoordinatorV2Mock } from "../../typechain"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("VRFD20 Unit Tests", async function () {
    let vrfConsumer: VRFD20;
    let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;

    beforeEach(async () => {
      await deployments.fixture(["mocks", "vrfd20"])
      vrfConsumer = await ethers.getContract("VRFD20")

      vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    })

    it('confirms the mock coordinator address is the address used by the contract', async () => {
      const getCoordinatorResult = await vrfConsumer.getVrfCoordinator();
      expect(vrfCoordinatorV2Mock.address).to.not.eq(getCoordinatorResult);
    });

    describe('#rollDice', async () => {
      it("Should successfully request a random number", async () => {
        const [account1] = await ethers.getSigners();

        await expect(vrfConsumer.rollDice(account1.address)).to.emit(
          vrfConsumer,
          "DiceRolled"
        ).withArgs(1, account1.address);
      });

      it("Disallows multiple in-flight requests for the same address", async () => {
        const [account1] = await ethers.getSigners();

        await expect(vrfConsumer.rollDice(account1.address)).to.emit(
          vrfConsumer,
          "DiceRolled"
        ).withArgs(1, account1.address);

        await expect(vrfConsumer.rollDice(account1.address)).to.be.revertedWith(
          "You must wait for your current roll to complete before rolling again"
        );
      });

      it("Allows two different users to make multiple requests simultaneously without error", async () => {
        const [account1, account2] = await ethers.getSigners();

        await expect(vrfConsumer.rollDice(account1.address)).to.emit(
          vrfConsumer,
          "DiceRolled"
        ).withArgs(1, account1.address);

        await expect(vrfConsumer.rollDice(account2.address)).to.emit(
          vrfConsumer,
          "DiceRolled"
        ).withArgs(2, account2.address);
      })

      it('Allows additional requests by the same address after the prior one has completed', async () => {
        const [account1] = await ethers.getSigners();
        await vrfConsumer.rollDice(account1.address);

        const firstRequestId = 1;
        const transformedResult = 2;

        await expect(
          vrfCoordinatorV2Mock.fulfillRandomWords(firstRequestId, vrfConsumer.address)
        ).to.emit(vrfConsumer, "DiceLanded").withArgs(firstRequestId, transformedResult)

        await expect(vrfConsumer.rollDice(account1.address)).to.emit(
          vrfConsumer,
          "DiceRolled"
        ).withArgs(2, account1.address);
      });
    })
  })
