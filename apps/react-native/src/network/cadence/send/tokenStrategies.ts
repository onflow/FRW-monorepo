import { cadenceService } from '../index';
import type { SendPayload, TransferStrategy } from './types';
import { convertToUFix64, encodeEvmContractCallData, GAS_LIMITS, isFlowToken } from './utils';
import { validateEvmAddress, validateFlowAddress } from './validation';

/**
 * Strategy for child account to child account token transfers
 */
export class ChildToChildTokenStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { childAddrs, receiver, sender } = payload;
    return childAddrs.length > 0 && childAddrs.includes(receiver) && childAddrs.includes(sender);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, sender, receiver, amount } = payload;
    const validatedAmount = convertToUFix64(amount);
    return await cadenceService.sendChildFtToChild(
      flowIdentifier,
      sender,
      receiver,
      validatedAmount
    );
  }
}

/**
 * Strategy for sending tokens from child account
 */
export class ChildToOthersTokenStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { childAddrs, sender, assetType } = payload;
    return childAddrs.length > 0 && childAddrs.includes(sender) && assetType === 'flow';
  }

  async execute(payload: SendPayload): Promise<any> {
    const { proposer, receiver, coaAddr, flowIdentifier, sender, amount } = payload;
    const validatedAmount = convertToUFix64(amount);

    // Send child tokens to parent account
    if (receiver === proposer) {
      return await cadenceService.transferChildFt(flowIdentifier, sender, validatedAmount);
    }

    // Bridge to COA (Cadence Owned Account)
    if (receiver === coaAddr) {
      return await cadenceService.bridgeChildFtToEvm(flowIdentifier, sender, validatedAmount);
    }

    // Bridge to EOA (Externally Owned Account) - EVM address
    if (validateEvmAddress(receiver)) {
      return await cadenceService.bridgeChildFtToEvmAddress(
        flowIdentifier,
        sender,
        validatedAmount,
        receiver
      );
    }

    // Default child token transfer within Flow network
    return await cadenceService.sendChildFt(flowIdentifier, sender, receiver, validatedAmount);
  }
}

/**
 * Strategy for sending tokens to child account
 */
export class ParentToChildTokenStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { childAddrs, receiver, assetType, sender, coaAddr } = payload;
    return (
      childAddrs.length > 0 &&
      childAddrs.includes(receiver) &&
      assetType === 'evm' &&
      sender === coaAddr
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, receiver, amount } = payload;
    const validatedAmount = convertToUFix64(amount);
    return await cadenceService.bridgeChildFtFromEvm(flowIdentifier, receiver, validatedAmount);
  }
}

/**
 * Strategy for Flow to Flow token transfers
 */
export class FlowToFlowTokenStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver } = payload;
    return assetType === 'flow' && validateFlowAddress(receiver);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, receiver, amount } = payload;
    const validatedAmount = convertToUFix64(amount);
    return await cadenceService.transferTokensV3(flowIdentifier, receiver, validatedAmount);
  }
}

/**
 * Strategy for Flow to EVM token transfers
 */
export class FlowToEvmTokenStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { assetType, flowIdentifier, receiver } = payload;
    return assetType === 'flow' && isFlowToken(flowIdentifier) && validateEvmAddress(receiver);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { receiver, amount } = payload;
    const validatedAmount = convertToUFix64(amount);
    return await cadenceService.transferFlowToEvmAddress(
      receiver,
      validatedAmount,
      GAS_LIMITS.EVM_DEFAULT
    );
  }
}

/**
 * Strategy for Flow token bridge to EVM
 */
export class FlowTokenBridgeToEvmStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver } = payload;
    return assetType === 'flow' && validateEvmAddress(receiver);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, amount, receiver } = payload;
    const validatedAmount = convertToUFix64(amount);

    console.log('[FlowTokenBridgeToEvmStrategy] bridgeTokensToEvmAddressV2', {
      flowIdentifier,
      validatedAmount,
      receiver,
    });
    return await cadenceService.bridgeTokensToEvmAddressV2(
      flowIdentifier,
      validatedAmount,
      receiver
    );
  }
}

/**
 * Strategy for EVM to Flow token transfers (COA withdrawal)
 */
export class EvmToFlowCoaWithdrawalStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { assetType, flowIdentifier, receiver } = payload;
    return assetType === 'evm' && isFlowToken(flowIdentifier) && validateFlowAddress(receiver);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { amount, receiver } = payload;
    const validatedAmount = convertToUFix64(amount);
    return await cadenceService.withdrawCoa(validatedAmount, receiver);
  }
}

/**
 * Strategy for EVM to Flow token bridge
 */
export class EvmToFlowTokenBridgeStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver } = payload;
    return assetType === 'evm' && validateFlowAddress(receiver);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, amount, receiver } = payload;
    const validatedAmount = convertToUFix64(amount);
    return await cadenceService.bridgeTokensFromEvmToFlowV3(
      flowIdentifier,
      validatedAmount,
      receiver
    );
  }
}

/**
 * Strategy for EVM to EVM token transfers
 */
export class EvmToEvmTokenStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver } = payload;
    return assetType === 'evm' && validateEvmAddress(receiver);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { tokenContractAddr, amount } = payload;
    const validatedAmount = convertToUFix64(amount);
    const data = encodeEvmContractCallData(payload);
    return await cadenceService.callContract(
      tokenContractAddr,
      validatedAmount,
      data,
      GAS_LIMITS.EVM_DEFAULT
    );
  }
}
