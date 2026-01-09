import { parseUnits } from '@ethersproject/units';
import type { CadenceService } from '@onflow/frw-cadence';

import type { SendPayload, TransferStrategy, TransferExecutionHelpers } from './types';
import {
  encodeEvmContractCallData,
  GAS_LIMITS,
  isFlowToken,
  isVaultIdentifier,
  safeConvertToUFix64,
  convertHexToByteArray,
  signLegacyEvmTransaction,
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

  async execute(payload: SendPayload, _helpers?: TransferExecutionHelpers): Promise<any> {
    const { flowIdentifier, sender, receiver, amount, type, assetType, childAddrs, proposer } =
      payload;
    const formattedAmount = safeConvertToUFix64(amount);

    _helpers?.session?.strategySelected({
      strategyName: 'ChildToChildTokenStrategy',
      assetType: type,
      networkType: assetType,
      sender: sender,
      receiver: receiver,
      flowIdentifier: flowIdentifier,
      amount: formattedAmount,
      childAddrs: childAddrs,
      parentAddress: proposer,
    });

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

  async execute(payload: SendPayload, _helpers?: TransferExecutionHelpers): Promise<any> {
    const {
      proposer,
      receiver,
      coaAddr,
      flowIdentifier,
      sender,
      amount,
      type,
      assetType,
      childAddrs,
    } = payload;
    const formattedAmount = safeConvertToUFix64(amount);

    _helpers?.session?.strategySelected({
      strategyName: 'ChildToOthersTokenStrategy',
      assetType: type,
      networkType: assetType,
      sender: sender,
      receiver: receiver,
      flowIdentifier: flowIdentifier,
      amount: formattedAmount,
      childAddrs: childAddrs,
      parentAddress: proposer,
    });

    // Send child tokens to parent account
    if (receiver === proposer) {
      return await this.cadenceService.transferChildFt(flowIdentifier, sender, formattedAmount);
    }

    // Bridge to COA (Cadence Owned Account)
    if (receiver === coaAddr) {
      return await this.cadenceService.bridgeChildFtToEvm(flowIdentifier, sender, formattedAmount);
    }

    // Bridge to EOA (Externally Owned Account) - EVM address
    if (validateEvmAddress(receiver)) {
      return await this.cadenceService.bridgeChildFtToEvmAddress(
        flowIdentifier,
        sender,
        formattedAmount,
        receiver
      );
    }

    // Default child token transfer within Flow network
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

  async execute(payload: SendPayload, _helpers?: TransferExecutionHelpers): Promise<any> {
    const {
      flowIdentifier,
      receiver,
      amount,
      decimal,
      sender,
      type,
      assetType,
      childAddrs,
      proposer,
    } = payload;
    const formattedAmount = safeConvertToUFix64(amount);

    _helpers?.session?.strategySelected({
      strategyName: 'ParentToChildTokenStrategy',
      assetType: type,
      networkType: assetType,
      sender: sender,
      receiver: receiver,
      flowIdentifier: flowIdentifier,
      amount: formattedAmount,
      childAddrs: childAddrs,
      parentAddress: proposer,
    });

    const valueBig = parseUnits(formattedAmount, decimal);
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

  async execute(payload: SendPayload, _helpers?: TransferExecutionHelpers): Promise<any> {
    const { flowIdentifier, receiver, amount, sender, type, assetType } = payload;
    const formattedAmount = safeConvertToUFix64(amount);

    _helpers?.session?.strategySelected({
      strategyName: 'FlowToFlowTokenStrategy',
      assetType: type,
      networkType: assetType,
      sender: sender,
      receiver: receiver,
      flowIdentifier: flowIdentifier,
      amount: formattedAmount,
    });

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

  async execute(payload: SendPayload, _helpers?: TransferExecutionHelpers): Promise<any> {
    const { receiver, amount, sender, type, assetType, flowIdentifier } = payload;
    const formattedAmount = safeConvertToUFix64(amount);

    _helpers?.session?.strategySelected({
      strategyName: 'FlowToEvmTokenStrategy',
      assetType: type,
      networkType: assetType,
      sender: sender,
      receiver: receiver,
      flowIdentifier: flowIdentifier,
      amount: formattedAmount,
    });

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

  async execute(payload: SendPayload, _helpers?: TransferExecutionHelpers): Promise<any> {
    const { flowIdentifier, amount, receiver, sender, type, assetType } = payload;
    const formattedAmount = safeConvertToUFix64(amount);

    _helpers?.session?.strategySelected({
      strategyName: 'FlowTokenBridgeToEvmStrategy',
      assetType: type,
      networkType: assetType,
      sender: sender,
      receiver: receiver,
      flowIdentifier: flowIdentifier,
      amount: formattedAmount,
    });

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

  async execute(payload: SendPayload, _helpers?: TransferExecutionHelpers): Promise<any> {
    const { amount, receiver, sender, type, assetType, flowIdentifier } = payload;
    const formattedAmount = safeConvertToUFix64(amount);

    _helpers?.session?.strategySelected({
      strategyName: 'EvmToFlowCoaWithdrawalStrategy',
      assetType: type,
      networkType: assetType,
      sender: sender,
      receiver: receiver,
      flowIdentifier: flowIdentifier,
      amount: formattedAmount,
    });

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

  async execute(payload: SendPayload, _helpers?: TransferExecutionHelpers): Promise<any> {
    const { amount, receiver, sender, coaAddr, decimal, type, assetType, flowIdentifier } = payload;
    const formattedAmount = safeConvertToUFix64(amount);

    _helpers?.session?.strategySelected({
      strategyName: 'EoaToFlowCoaWithdrawalStrategy',
      assetType: type,
      networkType: assetType,
      sender: sender,
      receiver: receiver,
      flowIdentifier: flowIdentifier,
      amount: formattedAmount,
    });

    const valueBig = parseUnits(formattedAmount, decimal);

    const signedTx = await signLegacyEvmTransaction(
      {
        from: sender,
        to: coaAddr,
        data: '0x',
        gasLimit: GAS_LIMITS.EVM_DEFAULT,
        value: valueBig,
      },
      _helpers
    );

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

  async execute(payload: SendPayload, _helpers?: TransferExecutionHelpers): Promise<any> {
    const { flowIdentifier, amount, receiver, decimal, sender, type, assetType } = payload;
    const formattedAmount = safeConvertToUFix64(amount);

    _helpers?.session?.strategySelected({
      strategyName: 'EvmToFlowTokenBridgeStrategy',
      assetType: type,
      networkType: assetType,
      sender: sender,
      receiver: receiver,
      flowIdentifier: flowIdentifier,
      amount: formattedAmount,
    });

    const valueBig = parseUnits(formattedAmount, decimal);
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

  async execute(payload: SendPayload, _helpers?: TransferExecutionHelpers): Promise<any> {
    const {
      flowIdentifier,
      amount,
      receiver,
      decimal,
      sender,
      coaAddr,
      tokenContractAddr,
      type,
      assetType,
    } = payload;
    const formattedAmount = safeConvertToUFix64(amount);

    _helpers?.session?.strategySelected({
      strategyName: 'EvmToFlowTokenWithEoaBridgeStrategy',
      assetType: type,
      networkType: assetType,
      sender: sender,
      receiver: receiver,
      flowIdentifier: flowIdentifier,
      amount: formattedAmount,
    });

    const valueBig = parseUnits(formattedAmount, decimal);

    const callData = encodeEvmContractCallData({ ...payload, receiver: coaAddr }, true);
    const signedTx = await signLegacyEvmTransaction(
      {
        from: sender,
        to: tokenContractAddr,
        data: callData as string,
        gasLimit: GAS_LIMITS.EVM_DEFAULT,
      },
      _helpers
    );
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

  async execute(payload: SendPayload, _helpers?: TransferExecutionHelpers): Promise<any> {
    const {
      tokenContractAddr,
      amount,
      flowIdentifier,
      receiver,
      coaAddr,
      sender,
      type,
      assetType,
    } = payload;
    const formattedAmount = safeConvertToUFix64(amount);

    _helpers?.session?.strategySelected({
      strategyName: 'EvmToEvmTokenStrategy',
      assetType: type,
      networkType: assetType,
      sender: sender,
      receiver: receiver,
      flowIdentifier: flowIdentifier,
      amount: formattedAmount,
    });

    if (isFlowToken(flowIdentifier)) {
      if (sender !== coaAddr) {
        const weiValue = parseUnits(formattedAmount, 18);
        const signedTx = await signLegacyEvmTransaction(
          {
            from: sender,
            to: receiver,
            data: '0x',
            gasLimit: GAS_LIMITS.EVM_DEFAULT,
            value: weiValue,
          },
          _helpers
        );
        const rlpEncoded = convertHexToByteArray(signedTx);
        return await this.cadenceService.eoaCallContract(rlpEncoded, sender);
      } else {
        return await this.cadenceService.callContract(
          receiver,
          formattedAmount,
          [],
          GAS_LIMITS.EVM_DEFAULT
        );
      }
    } else {
      if (validateEvmAddress(receiver) && sender !== coaAddr) {
        // eoa as sender
        const callData = encodeEvmContractCallData({ ...payload, receiver: receiver }, true);
        const signedTx = await signLegacyEvmTransaction(
          {
            from: sender,
            to: tokenContractAddr,
            data: callData as string,
            gasLimit: GAS_LIMITS.EVM_DEFAULT,
          },
          _helpers
        );
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
