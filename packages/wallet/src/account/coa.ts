/**
 * Cadence Owned Account (COA) - matches iOS COA
 * An EVM account owned by a Flow account on the Flow-EVM network
 */

import { type FlowVMProtocol, FlowVM } from '../types/account';
import { type FlowChainID } from '../types/key';

export class COA implements FlowVMProtocol {
  readonly vm = FlowVM.EVM;
  readonly address: string; // EVM address
  readonly chainID: FlowChainID;

  constructor(address: string, network: FlowChainID) {
    this.address = address.startsWith('0x') ? address : `0x${address}`;
    this.chainID = network;
  }

  get id(): string {
    return this.address;
  }
}
