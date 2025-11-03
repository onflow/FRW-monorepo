import { parseUnits } from '@ethersproject/units';
import type { CadenceService } from '@onflow/frw-cadence';

import type { SendPayload, TransferStrategy } from './types';
import {
  encodeEvmContractCallData,
  GAS_LIMITS,
  isFlowToken,
  isVaultIdentifier,
  safeConvertToUFix64,
  convertHexToByteArray,
} from './utils';
import { validateEvmAddress, validateFlowAddress } from './validation';

/**
 * Strategy for child account to child account token transfers
 */
export class ChildToChildTokenStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}
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
    const formattedAmount = safeConvertToUFix64(amount);
    return await this.cadenceService.sendChildFtToChild(
      flowIdentifier,
      sender,
      receiver,
      formattedAmount
    );
  }
}

/**
 * Strategy for sending tokens from child account
 */
export class ChildToOthersTokenStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

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
      const formattedAmount = safeConvertToUFix64(amount);
      return await this.cadenceService.transferChildFt(flowIdentifier, sender, formattedAmount);
    }

    // Bridge to COA (Cadence Owned Account)
    if (receiver === coaAddr) {
      const formattedAmount = safeConvertToUFix64(amount);
      return await this.cadenceService.bridgeChildFtToEvm(flowIdentifier, sender, formattedAmount);
    }

    // Bridge to EOA (Externally Owned Account) - EVM address
    if (validateEvmAddress(receiver)) {
      const formattedAmount = safeConvertToUFix64(amount);
      return await this.cadenceService.bridgeChildFtToEvmAddress(
        flowIdentifier,
        sender,
        formattedAmount,
        receiver
      );
    }

    // Default child token transfer within Flow network
    const formattedAmount = safeConvertToUFix64(amount);
    return await this.cadenceService.sendChildFt(flowIdentifier, sender, receiver, formattedAmount);
  }
}

/**
 * Strategy for sending tokens to child account
 */
export class ParentToChildTokenStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

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
    const valueBig = parseUnits(safeConvertToUFix64(amount), decimal);
    return await this.cadenceService.bridgeChildFtFromEvm(
      flowIdentifier,
      receiver,
      valueBig.toString()
    );
  }
}

/**
 * Strategy for Flow to Flow token transfers
 */
export class FlowToFlowTokenStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, type } = payload;
    return type === 'token' && assetType === 'flow' && validateFlowAddress(receiver);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, receiver, amount } = payload;
    const formattedAmount = safeConvertToUFix64(amount);
    return await this.cadenceService.transferTokensV3(flowIdentifier, receiver, formattedAmount);
  }
}

/**
 * Strategy for Flow to EVM token transfers
 */
export class FlowToEvmTokenStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, flowIdentifier, receiver, type } = payload;
    return (
      type === 'token' &&
      assetType === 'flow' &&
      isFlowToken(flowIdentifier) &&
      validateEvmAddress(receiver)
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { receiver, amount } = payload;
    const formattedAmount = safeConvertToUFix64(amount);
    return await this.cadenceService.transferFlowToEvmAddress(
      receiver,
      formattedAmount,
      GAS_LIMITS.EVM_DEFAULT
    );
  }
}

/**
 * Strategy for Flow token bridge to EVM
 */
export class FlowTokenBridgeToEvmStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, type } = payload;
    return type === 'token' && assetType === 'flow' && validateEvmAddress(receiver);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, amount, receiver } = payload;
    const formattedAmount = safeConvertToUFix64(amount);
    return await this.cadenceService.bridgeTokensToEvmAddressV2(
      flowIdentifier,
      formattedAmount,
      receiver
    );
  }
}

/**
 * Strategy for EVM to Flow token transfers (COA withdrawal)
 */
export class EvmToFlowCoaWithdrawalStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, flowIdentifier, receiver, type, sender, coaAddr } = payload;
    return (
      type === 'token' &&
      assetType === 'evm' &&
      isFlowToken(flowIdentifier) &&
      validateFlowAddress(receiver) &&
      sender === coaAddr
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { amount, receiver } = payload;
    const formattedAmount = safeConvertToUFix64(amount);
    return await this.cadenceService.withdrawCoa(formattedAmount, receiver);
  }
}

/**
 * Strategy for EVM to Flow token transfers (COA withdrawal)
 */
export class EoaToFlowCoaWithdrawalStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, flowIdentifier, receiver, type, sender, coaAddr } = payload;
    return (
      type === 'token' &&
      assetType === 'evm' &&
      isFlowToken(flowIdentifier) &&
      validateFlowAddress(receiver) &&
      sender !== coaAddr
    );
  }

  async execute(payload: SendPayload, callback: any): Promise<any> {
    const { amount, receiver, sender, coaAddr, decimal } = payload;
    const valueBig = parseUnits(safeConvertToUFix64(amount), decimal);

    // const callData = encodeEvmContractCallData({ ...payload, receiver: coaAddr }, true);
    const formattedAmount = safeConvertToUFix64(amount);

    const signedTx = await callback({
      state: 'EVM_TRX_BUILDING',
      trxData: {
        from: payload.sender,
        to: payload.coaAddr,
        data: '0x',
        gasLimit: GAS_LIMITS.EVM_DEFAULT,
        value: valueBig.toString(),
      },
    });

    const rlpEncoded = convertHexToByteArray(signedTx);
    return await this.cadenceService.eoaToCoaToFlow(rlpEncoded, sender, formattedAmount, receiver);
  }
}

/**
 * Strategy for EVM to Flow token bridge
 */
export class EvmToFlowTokenBridgeStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, type, flowIdentifier, sender, coaAddr } = payload;
    return (
      type === 'token' &&
      assetType === 'evm' &&
      validateFlowAddress(receiver) &&
      isVaultIdentifier(flowIdentifier) &&
      !isFlowToken(flowIdentifier) &&
      sender === coaAddr
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, amount, receiver, decimal } = payload;
    const valueBig = parseUnits(safeConvertToUFix64(amount), decimal);
    return await this.cadenceService.bridgeTokensFromEvmToFlowV3(
      flowIdentifier,
      valueBig.toString(),
      receiver
    );
  }
}

/**
 * Strategy for EVM to Flow token with Eoa bridge
 */
export class EvmToFlowTokenWithEoaBridgeStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, type, flowIdentifier, sender, coaAddr } = payload;
    return (
      type === 'token' &&
      assetType === 'evm' &&
      validateFlowAddress(receiver) &&
      isVaultIdentifier(flowIdentifier) &&
      !isFlowToken(flowIdentifier) &&
      sender !== coaAddr
    );
  }

  async execute(payload: SendPayload, callback: any): Promise<any> {
    const { flowIdentifier, amount, receiver, decimal, sender, coaAddr, tokenContractAddr } =
      payload;
    const valueBig = parseUnits(safeConvertToUFix64(amount), decimal);

    const callData = encodeEvmContractCallData({ ...payload, receiver: coaAddr }, true);

    const signedTx = await callback({
      state: 'EVM_TRX_BUILDING',
      trxData: {
        from: payload.sender,
        to: payload.tokenContractAddr,
        data: callData as string,
        gasLimit: GAS_LIMITS.EVM_DEFAULT,
      },
    });
    const rlpEncoded = convertHexToByteArray(signedTx);
    return await this.cadenceService.bridgeTokensFromEoaToFlowV3(
      rlpEncoded,
      sender,
      flowIdentifier,
      valueBig.toString(),
      receiver
    );
  }
}

/**
 * Strategy for EVM to EVM token transfers
 */
export class EvmToEvmTokenStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, type } = payload;
    return type === 'token' && assetType === 'evm' && validateEvmAddress(receiver);
  }

  async execute(payload: SendPayload, callback: any): Promise<any> {
    const { tokenContractAddr, amount, flowIdentifier, receiver, coaAddr, sender } = payload;
    if (isFlowToken(flowIdentifier)) {
      const formattedAmount = safeConvertToUFix64(amount);
      return await this.cadenceService.callContract(
        receiver,
        formattedAmount,
        [],
        GAS_LIMITS.EVM_DEFAULT
      );
    } else {
      if (validateEvmAddress(receiver) && sender !== coaAddr) {
        // eoa as sender
        const callData = encodeEvmContractCallData({ ...payload, receiver: receiver }, true);
        const signedTx = await callback({
          state: 'EVM_TRX_BUILDING',
          trxData: {
            from: sender,
            to: tokenContractAddr,
            data: callData,
            gasLimit: GAS_LIMITS.EVM_DEFAULT,
          },
        });
        const rlpEncoded = convertHexToByteArray(signedTx);
        return await this.cadenceService.eoaCallContract(rlpEncoded, sender);
      } else {
        // coa as sender
        const data = encodeEvmContractCallData(payload);
        return await this.cadenceService.callContract(
          tokenContractAddr,
          '0.0',
          data as number[],
          GAS_LIMITS.EVM_DEFAULT
        );
      }
    }
  }
}
