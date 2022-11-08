/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export interface VRFD20Interface extends utils.Interface {
  functions: {
    "getUserStatus(address)": FunctionFragment;
    "house(address)": FunctionFragment;
    "rawFulfillRandomWords(uint256,uint256[])": FunctionFragment;
    "rollDice()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "getUserStatus"
      | "house"
      | "rawFulfillRandomWords"
      | "rollDice"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getUserStatus",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "house",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "rawFulfillRandomWords",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>[]]
  ): string;
  encodeFunctionData(functionFragment: "rollDice", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "getUserStatus",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "house", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "rawFulfillRandomWords",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "rollDice", data: BytesLike): Result;

  events: {
    "DiceLanded(uint256,uint256)": EventFragment;
    "DiceRolled(uint256,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "DiceLanded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "DiceRolled"): EventFragment;
}

export interface DiceLandedEventObject {
  requestId: BigNumber;
  result: BigNumber;
}
export type DiceLandedEvent = TypedEvent<
  [BigNumber, BigNumber],
  DiceLandedEventObject
>;

export type DiceLandedEventFilter = TypedEventFilter<DiceLandedEvent>;

export interface DiceRolledEventObject {
  requestId: BigNumber;
  roller: string;
}
export type DiceRolledEvent = TypedEvent<
  [BigNumber, string],
  DiceRolledEventObject
>;

export type DiceRolledEventFilter = TypedEventFilter<DiceRolledEvent>;

export interface VRFD20 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: VRFD20Interface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    getUserStatus(
      addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    house(
      user_address: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    rawFulfillRandomWords(
      requestId: PromiseOrValue<BigNumberish>,
      randomWords: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    rollDice(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  getUserStatus(
    addr: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  house(
    user_address: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  rawFulfillRandomWords(
    requestId: PromiseOrValue<BigNumberish>,
    randomWords: PromiseOrValue<BigNumberish>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  rollDice(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    getUserStatus(
      addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    house(
      user_address: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    rawFulfillRandomWords(
      requestId: PromiseOrValue<BigNumberish>,
      randomWords: PromiseOrValue<BigNumberish>[],
      overrides?: CallOverrides
    ): Promise<void>;

    rollDice(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {
    "DiceLanded(uint256,uint256)"(
      requestId?: PromiseOrValue<BigNumberish> | null,
      result?: PromiseOrValue<BigNumberish> | null
    ): DiceLandedEventFilter;
    DiceLanded(
      requestId?: PromiseOrValue<BigNumberish> | null,
      result?: PromiseOrValue<BigNumberish> | null
    ): DiceLandedEventFilter;

    "DiceRolled(uint256,address)"(
      requestId?: PromiseOrValue<BigNumberish> | null,
      roller?: PromiseOrValue<string> | null
    ): DiceRolledEventFilter;
    DiceRolled(
      requestId?: PromiseOrValue<BigNumberish> | null,
      roller?: PromiseOrValue<string> | null
    ): DiceRolledEventFilter;
  };

  estimateGas: {
    getUserStatus(
      addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    house(
      user_address: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    rawFulfillRandomWords(
      requestId: PromiseOrValue<BigNumberish>,
      randomWords: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    rollDice(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getUserStatus(
      addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    house(
      user_address: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    rawFulfillRandomWords(
      requestId: PromiseOrValue<BigNumberish>,
      randomWords: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    rollDice(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
