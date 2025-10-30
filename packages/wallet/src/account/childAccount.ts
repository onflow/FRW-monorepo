/**
 * Child Account implementation - matches iOS ChildAccount
 */

import { type ChildAccount as ChildAccountType } from '../types/account';
import { type FlowAddress, type FlowChainID } from '../types/key';

/**
 * Child Account class for managing child accounts in HybridCustody
 */
export class ChildAccount implements ChildAccountType {
  readonly id: FlowAddress;
  readonly address: FlowAddress;
  readonly network: FlowChainID;
  readonly parentAddress: FlowAddress;
  readonly name?: string;
  readonly description?: string;
  readonly icon?: string; // URL string

  constructor(data: ChildAccountType) {
    this.id = data.id;
    this.address = data.address;
    this.network = data.network;
    this.parentAddress = data.parentAddress;
    this.name = data.name;
    this.description = data.description;
    this.icon = data.icon;
  }

  get displayName(): string {
    return this.name || `Child Account (${this.address.slice(0, 8)}...)`;
  }

  get shortAddress(): string {
    return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
  }
}
