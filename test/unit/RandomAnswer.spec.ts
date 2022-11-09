import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { network, deployments, ethers, getNamedAccounts } from "hardhat"
import { address } from "hardhat/internal/core/config/config-validation"
import { developmentChains, networkConfig } from "../../helper-hardhat-config"
import { RandomAnswer, VRFCoordinatorV2Mock } from "../../typechain"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomAnswer Unit Tests", async function () {
          let vrfConsumer: RandomAnswer
          let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock

          describe("#rollDice", async () => {
              beforeEach(async () => {
                  await deployments.fixture(["mocks", "randomAnswer"])
                  vrfConsumer = await ethers.getContract("RandomAnswer")

                  vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
              })

              it("Should successfully request a random number", async () => {
                  const [account1] = await ethers.getSigners()

                  await expect(vrfConsumer.rollDice())
                      .to.emit(vrfConsumer, "DiceRolled")
                      .withArgs(1, account1.address)
              })

              it("Disallows multiple in-flight requests for the same address", async () => {
                  const [account1] = await ethers.getSigners()

                  await expect(vrfConsumer.rollDice())
                      .to.emit(vrfConsumer, "DiceRolled")
                      .withArgs(1, account1.address)

                  await expect(vrfConsumer.rollDice()).to.be.revertedWith(
                      "You must wait for your current roll to complete before rolling again"
                  )
              })

              it("Allows two different users to make multiple requests, with no fulfillment, without error", async () => {
                  const [account1, account2] = await ethers.getSigners()

                  await expect(vrfConsumer.connect(account1).rollDice())
                      .to.emit(vrfConsumer, "DiceRolled")
                      .withArgs(1, account1.address)

                  await expect(vrfConsumer.connect(account2).rollDice())
                      .to.emit(vrfConsumer, "DiceRolled")
                      .withArgs(2, account2.address)
              })

              it("Allows additional requests by the same address after the prior one has completed", async () => {
                  const [account1] = await ethers.getSigners()
                  await vrfConsumer.rollDice()

                  const firstRequestId = 1
                  const transformedResult = 2

                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(firstRequestId, vrfConsumer.address)
                  )
                      .to.emit(vrfConsumer, "DiceLanded")
                      .withArgs(firstRequestId, transformedResult)

                  await expect(vrfConsumer.rollDice())
                      .to.emit(vrfConsumer, "DiceRolled")
                      .withArgs(2, account1.address)
              })

              describe("security properties", async () => {
                  it("Allows the signer to call the function", async () => {
                      const [account1] = await ethers.getSigners()

                      expect(await vrfConsumer.signer.getAddress()).to.eq(account1.address)
                      await expect(vrfConsumer.connect(account1).rollDice()).to.emit(
                          vrfConsumer,
                          "DiceRolled"
                      )
                  })

                  it("Allows other addresses to call the function", async () => {
                      const [_account1, account2] = await ethers.getSigners()

                      expect(await vrfConsumer.signer.getAddress()).to.not.eq(account2.address)
                      await expect(vrfConsumer.connect(account2).rollDice()).to.emit(
                          vrfConsumer,
                          "DiceRolled"
                      )
                  })
              })
          })

          describe("#fulfillRandomWords", async () => {
              beforeEach(async () => {
                  await deployments.fixture(["mocks", "randomAnswer"])
                  vrfConsumer = await ethers.getContract("RandomAnswer")

                  vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
              })

              it("emits the expected events even when fulfillments occur out of order", async () => {
                  const [account1, account2] = await ethers.getSigners()

                  await vrfConsumer.connect(account1).rollDice()

                  await vrfConsumer.connect(account2).rollDice()

                  const secondRequestFulfillmentArgs = { requestId: 2, value: 2 }
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(
                          secondRequestFulfillmentArgs.requestId,
                          vrfConsumer.address
                      )
                  )
                      .to.emit(vrfConsumer, "DiceLanded")
                      .withArgs(
                          secondRequestFulfillmentArgs.requestId,
                          secondRequestFulfillmentArgs.value
                      )

                  const firstRequestFulfillmentArgs = { requestId: 1, value: 2 }
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(
                          firstRequestFulfillmentArgs.requestId,
                          vrfConsumer.address
                      )
                  )
                      .to.emit(vrfConsumer, "DiceLanded")
                      .withArgs(
                          firstRequestFulfillmentArgs.requestId,
                          secondRequestFulfillmentArgs.value
                      )
              })

              it("allows the user to roll again on fulfillment", async () => {
                  const [account1] = await ethers.getSigners()

                  await vrfConsumer.connect(account1).rollDice()

                  await expect(vrfConsumer.connect(account1).rollDice()).to.be.revertedWith(
                      "You must wait for your current roll to complete before rolling again"
                  )

                  const initialRequestId = 1
                  const expectedRandomValue = 2
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(initialRequestId, vrfConsumer.address)
                  )
                      .to.emit(vrfConsumer, "DiceLanded")
                      .withArgs(initialRequestId, expectedRandomValue)

                  const secondRequestId = 2
                  await expect(vrfConsumer.connect(account1).rollDice())
                      .to.emit(vrfConsumer, "DiceRolled")
                      .withArgs(secondRequestId, account1.address)
              })
          })

          describe("#house", () => {
              beforeEach(async () => {
                  await deployments.fixture(["mocks", "randomAnswer"])
                  vrfConsumer = await ethers.getContract("RandomAnswer")

                  vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
              })

              describe("failure", async () => {
                  it("reverts if no address has been recorded for the input address", async () => {
                      const [account1] = await ethers.getSigners()
                      await expect(
                          vrfConsumer.connect(account1).house(account1.address)
                      ).to.be.revertedWith(
                          "The requested address must first call rollDice itself before a house is computed."
                      )
                  })

                  it("reverts if the parameterized address is currently rolling", async () => {
                      const [account1] = await ethers.getSigners()
                      await vrfConsumer.connect(account1).rollDice()
                      await expect(
                          vrfConsumer.connect(account1).house(account1.address)
                      ).to.be.revertedWith(
                          "The requested address is currently rolling. Please wait."
                      )
                  })
              })

              describe("success", () => {
                  it("returns a value after randomness has been fulfilled for the requested address", async () => {
                      const [account1] = await ethers.getSigners()
                      await vrfConsumer.connect(account1).rollDice()
                      await vrfCoordinatorV2Mock.fulfillRandomWords(1, vrfConsumer.address)

                      const result = await vrfConsumer.connect(account1).house(account1.address)
                      expect(result).to.eq("Lannister")
                  })

                  it("allows the sender to run the function for other addresses", async () => {
                      const [accountWithResult, account2] = await ethers.getSigners()
                      await vrfConsumer.connect(accountWithResult).rollDice()
                      await vrfCoordinatorV2Mock.fulfillRandomWords(1, vrfConsumer.address)

                      const result = await vrfConsumer
                          .connect(account2)
                          .house(accountWithResult.address)
                      expect(result).to.eq("Lannister")
                  })
              })
          });

          describe("#getUserStatus", () => {
            beforeEach(async () => {
              await deployments.fixture(["mocks", "randomAnswer"])
              vrfConsumer = await ethers.getContract("RandomAnswer");

              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
            });

            context("for each state transition", () => {
              it("returns the expected value", async () => {
                const [_account1, account2] = await ethers.getSigners()

                const result = await vrfConsumer.connect(account2).getUserStatus(account2.address);
                expect(result).to.be.eq('NONE');

                await vrfConsumer.connect(account2).rollDice();

                const resultAfterRoll = await vrfConsumer.connect(account2).getUserStatus(account2.address);
                expect(resultAfterRoll).to.be.eq('RUNNING');

                await vrfCoordinatorV2Mock.fulfillRandomWords(1, vrfConsumer.address)

                const resultAfterFulfill = await vrfConsumer.connect(account2).getUserStatus(account2.address);
                expect(resultAfterFulfill).to.be.eq('RAN');

                await vrfConsumer.connect(account2).rollDice();
                const resultAfterReroll = await vrfConsumer.connect(account2).getUserStatus(account2.address);
                expect(resultAfterReroll).to.be.eq('RUNNING');
              });
            })
          });

          // TODO: JB - Need to see more examples to make sure this is working.
          describe("Deployment", async () => {
              it("emits the expected event", async () => {})
          })
      })
