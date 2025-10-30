import type { CadenceService } from '@onflow/frw-cadence';

import type { SendPayload, TransferStrategy } from './types';
import { encodeEvmContractCallData, GAS_LIMITS, convertHexToByteArray } from './utils';
import { validateEvmAddress, validateFlowAddress } from './validation';

/**
 * Strategy for child account to child account NFT transfers
 */
export class ChildToChildNftStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { childAddrs, receiver, sender, type } = payload;
    return (
      type === 'nft' &&
      childAddrs.length > 0 &&
      childAddrs.includes(receiver) &&
      childAddrs.includes(sender)
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, sender, receiver, ids } = payload;
    return await this.cadenceService.batchSendChildNftToChild(
      flowIdentifier,
      sender,
      receiver,
      ids
    );
  }
}

/**
 * Strategy for sending NFTs from child account
 */
export class ChildToOthersNftStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { childAddrs, sender, assetType, type } = payload;
    return (
      type === 'nft' && childAddrs.length > 0 && childAddrs.includes(sender) && assetType === 'flow'
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { proposer, receiver, coaAddr, flowIdentifier, sender, ids } = payload;

    // Send child NFT to parent account
    if (receiver === proposer) {
      return await this.cadenceService.batchTransferChildNft(flowIdentifier, sender, ids);
    }

    // Bridge to COA (Cadence Owned Account)
    if (receiver === coaAddr) {
      return await this.cadenceService.batchBridgeChildNftToEvmWithPayer(
        flowIdentifier,
        sender,
        ids
      );
    }

    // Bridge to EOA (Externally Owned Account) - EVM address
    if (validateEvmAddress(receiver)) {
      return await this.cadenceService.batchBridgeChildNftToEvmAddressWithPayer(
        flowIdentifier,
        sender,
        ids,
        receiver
      );
    }

    // Default child NFT transfer within Flow network
    return await this.cadenceService.batchSendChildNft(flowIdentifier, sender, receiver, ids);
  }
}

/**
 * Strategy for sending NFTs to child account
 */
export class ParentToChildNftStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { childAddrs, receiver, assetType, sender, coaAddr, type } = payload;
    return (
      type === 'nft' &&
      childAddrs.length > 0 &&
      childAddrs.includes(receiver) &&
      assetType === 'evm' &&
      sender === coaAddr
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, receiver, ids } = payload;
    return await this.cadenceService.batchBridgeChildNftFromEvmWithPayer(
      flowIdentifier,
      receiver,
      ids.map((id) => `${id}`)
    );
  }
}

/**
 * Strategy for sending NFTs to child account
 */
export class EoaToChildNftStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { childAddrs, receiver, assetType, sender, coaAddr, type } = payload;
    return (
      type === 'nft' &&
      childAddrs.length > 0 &&
      childAddrs.includes(receiver) &&
      assetType === 'evm' &&
      sender !== coaAddr
    );
  }

  async execute(payload: SendPayload, callback: any): Promise<any> {
    const { flowIdentifier, ids, receiver, tokenContractAddr, sender, coaAddr } = payload;
    const callData = encodeEvmContractCallData({ ...payload, receiver: coaAddr }, true);
    const signedTx = await callback({
      state: 'EVM_TRX_BUILDING',
      trxData: {
        from: payload.sender,
        to: payload.tokenContractAddr,
        data: callData,
        gasLimit: GAS_LIMITS.EVM_DEFAULT,
      },
    });

    const rlpEncoded = convertHexToByteArray(signedTx);
    return await this.cadenceService.batchBridgeChildNftFromEoaWithPayer(
      rlpEncoded,
      sender,
      flowIdentifier,
      receiver,
      ids.map((id) => `${id}`)
    );
  }
}

/**
 * Strategy for TopShot NFT transfers
 */
export class TopShotNftStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, flowIdentifier, type, receiver } = payload;
    return (
      type === 'nft' &&
      assetType === 'flow' &&
      flowIdentifier.indexOf('TopShot') > -1 &&
      validateFlowAddress(receiver)
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, receiver, ids } = payload;
    return await this.cadenceService.batchSendNbaNftV3(flowIdentifier, receiver, ids);
  }
}

/**
 * Strategy for Flow to Flow NFT transfers
 */
export class FlowToFlowNftStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, ids, type } = payload;
    return (
      type === 'nft' && assetType === 'flow' && validateFlowAddress(receiver) && ids.length > 0
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, receiver, ids } = payload;
    return await this.cadenceService.batchSendNftV3(flowIdentifier, receiver, ids);
  }
}

/**
 * Strategy for Flow NFT bridge to EVM
 */
export class FlowToEvmNftBridgeStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, type } = payload;
    return type === 'nft' && assetType === 'flow' && validateEvmAddress(receiver);
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, ids, receiver } = payload;
    return await this.cadenceService.batchBridgeNftToEvmAddressWithPayer(
      flowIdentifier,
      ids,
      receiver
    );
  }
}

/**
 * Strategy for EVM to Flow NFT bridge
 */
export class EvmToFlowNftBridgeStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, type, sender, coaAddr } = payload;
    return (
      type === 'nft' && assetType === 'evm' && validateFlowAddress(receiver) && sender === coaAddr
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { flowIdentifier, ids, receiver } = payload;
    return await this.cadenceService.batchBridgeNftFromEvmToFlowWithPayer(
      flowIdentifier,
      ids.map((id) => `${id}`),
      receiver
    );
  }
}

/**
 * Strategy for EVM to Flow NFT bridge
 */
export class EvmToFlowNftWithEoaBridgeStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, type, sender, coaAddr } = payload;
    return (
      type === 'nft' && assetType === 'evm' && validateFlowAddress(receiver) && sender !== coaAddr
    );
  }

  async execute(payload: SendPayload, callback: any): Promise<any> {
    const { flowIdentifier, ids, receiver, tokenContractAddr, sender, coaAddr } = payload;

    const callData = encodeEvmContractCallData({ ...payload, receiver: coaAddr }, true);
    const signedTx = await callback({
      state: 'EVM_TRX_BUILDING',
      trxData: {
        from: payload.sender,
        to: payload.tokenContractAddr,
        data: callData,
        gasLimit: GAS_LIMITS.EVM_DEFAULT,
      },
    });

    try {
      const rlpEncoded = convertHexToByteArray(signedTx);
      return await this.cadenceService.batchBridgeNftFromEoaToFlowWithPayer(
        rlpEncoded,
        sender,
        flowIdentifier,
        ids.map((id) => `${id}`),
        receiver
      );
    } catch (e: any) {
      await callback({ error: e.message, state: 'EVM_TRX_ERROR' });
    }
  }
}

/**
 * Strategy for EVM to EVM NFT transfers
 */
export class EvmToEvmNftStrategy implements TransferStrategy {
  constructor(private cadenceService: CadenceService) {}

  canHandle(payload: SendPayload): boolean {
    const { assetType, receiver, type, tokenContractAddr } = payload;
    return (
      type === 'nft' &&
      assetType === 'evm' &&
      validateEvmAddress(receiver) &&
      validateEvmAddress(tokenContractAddr)
    );
  }

  async execute(payload: SendPayload): Promise<any> {
    const { tokenContractAddr, ids } = payload;

    if (ids.length > 1) {
      const contracts = ids.map(() => tokenContractAddr);
      const datas = ids.map((id) => encodeEvmContractCallData({ ...payload, ids: [id] }));
      const values = ids.map(() => '0.0');

      return await this.cadenceService.batchCallContract(
        contracts,
        values,
        datas as number[][],
        GAS_LIMITS.EVM_DEFAULT
      );
    }

    const data = encodeEvmContractCallData(payload);
    const value = '0.0';
    return await this.cadenceService.callContract(
      tokenContractAddr,
      value,
      data as number[],
      GAS_LIMITS.EVM_DEFAULT
    );
  }
}
