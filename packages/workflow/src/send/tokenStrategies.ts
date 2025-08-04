import { parseUnits } from 'ethers';

import { cadenceService } from '../index';
import type { SendPayload, TransferStrategy } from './types';
import { encodeEvmContractCallData } from './utils';
import { validateEvmAddress, validateFlowAddress } from './validation';
/**
 * Strategy for child account to child account token transfers
 */
export class ChildToChildTokenStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { childAddrs, receiver, sender, type } = payload;
    return (
      type === 'token' &&
      childAddrs.length > 0 &&
      childAddrs.includes(receiver) &&
      childAddrs.includes(sender)
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, sender, receiver, amount } = payload;
    return await cadenceService.sendChildFtToChild(flowIdentifier, sender, receiver, amount);
  }
}

/**
 * Strategy for sending tokens from child account
 */
export class ChildToOthersTokenStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { childAddrs, sender, assetType, type } = payload;
    return (
      type === 'token' &&
      childAddrs.length > 0 &&
      childAddrs.includes(sender) &&
      assetType === 'flow'
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { proposer, receiver, coaAddr, flowIdentifier, sender, amount } = payload;

    // Send child tokens to parent account
    if (receiver === proposer) {
      return await cadenceService.transferChildFt(flowIdentifier, sender, amount);
    }

    // Bridge to COA (Cadence Owned Account)
    if (receiver === coaAddr) {
      return await cadenceService.bridgeChildFtToEvm(flowIdentifier, sender, amount);
    }

    // Bridge to EOA (Externally Owned Account) - EVM address
    if (validateEvmAddress(receiver)) {
      return await cadenceService.bridgeChildFtToEvmAddress(
        flowIdentifier,
        sender,
        amount,
        receiver
      );
    }

    // Default child token transfer within Flow network
    return await cadenceService.sendChildFt(flowIdentifier, sender, receiver, amount);
  }
}

/**
 * Strategy for sending tokens to child account
 */
export class ParentToChildTokenStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { childAddrs, receiver, assetType, sender, coaAddr, type } = payload;
    return (
      type === 'token' &&
      childAddrs.length > 0 &&
      childAddrs.includes(receiver) &&
      assetType === 'evm' &&
      sender === coaAddr
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, receiver, amount, decimal } = payload;
    const valueBig = parseUnits(amount, decimal);
    return await cadenceService.bridgeChildFtFromEvm(flowIdentifier, receiver, valueBig.toString());
  }
}

/**
 * Strategy for Flow to Flow token transfers
 */
export class FlowToFlowTokenStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, type } = payload;
    return type === 'token' && assetType === 'flow' && validateFlowAddress(receiver);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, receiver, amount } = payload;
    return await cadenceService.transferTokensV3(flowIdentifier, receiver, amount);
  }
}

/**
 * Strategy for Flow to EVM token transfers
 */
export class FlowToEvmTokenStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { assetType, flowIdentifier, receiver, type } = payload;
    return (
      type === 'token' &&
      assetType === 'flow' &&
      flowIdentifier.indexOf('FlowToken') > -1 &&
      validateEvmAddress(receiver)
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { receiver, amount } = payload;
    return await cadenceService.transferFlowToEvmAddress(receiver, amount, 30_000_000);
  }
}

/**
 * Strategy for Flow token bridge to EVM
 */
export class FlowTokenBridgeToEvmStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, type } = payload;
    return type === 'token' && assetType === 'flow' && validateEvmAddress(receiver);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, amount, receiver } = payload;
    return await cadenceService.bridgeTokensToEvmAddressV2(flowIdentifier, amount, receiver);
  }
}

/**
 * Strategy for EVM to Flow token transfers (COA withdrawal)
 */
export class EvmToFlowCoaWithdrawalStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { assetType, flowIdentifier, receiver, type } = payload;
    return (
      type === 'token' &&
      assetType === 'evm' &&
      flowIdentifier.indexOf('FlowToken') > -1 &&
      validateFlowAddress(receiver)
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { amount, receiver } = payload;
    return await cadenceService.withdrawCoa(amount, receiver);
  }
}

/**
 * Strategy for EVM to Flow token bridge
 */
export class EvmToFlowTokenBridgeStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, type } = payload;
    return type === 'token' && assetType === 'evm' && validateFlowAddress(receiver);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, amount, receiver } = payload;
    return await cadenceService.bridgeTokensFromEvmToFlowV3(flowIdentifier, amount, receiver);
  }
}

/**
 * Strategy for EVM to EVM token transfers
 */
export class EvmToEvmTokenStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, type } = payload;
    return type === 'token' && assetType === 'evm' && validateEvmAddress(receiver);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { tokenContractAddr, amount, flowIdentifier, decimal } = payload;
    if (flowIdentifier.includes('FlowToken')) {
      return await cadenceService.callContract(
        '0x0000000000000000000000000000000000000000',
        amount,
        [],
        30000000
      );
    } else {
      const data = encodeEvmContractCallData(payload);
      return await cadenceService.callContract(tokenContractAddr, '0.0', data, 30000000);
    }
  }
}
