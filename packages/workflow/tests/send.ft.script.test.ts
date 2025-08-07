import { configureFCL, CadenceService } from '@onflow/frw-cadence';
import dotenv from 'dotenv';
import { describe, it, expect, beforeEach } from 'vitest';

import { SendTransaction } from '../src';
import { accounts } from './utils/accounts';
dotenv.config();
import { authz } from './utils/authz';

const mainAccount = accounts.main;
const child1Account = accounts.child1;
const child2Account = accounts.child2;

const cadenceService = new CadenceService();
let configCache: any;

describe('Test send strategies', () => {
  beforeEach(() => {
    configureFCL('mainnet');
    cadenceService.useRequestInterceptor(async (config: any) => {
      configCache = config;
      if (config.type === 'transaction') {
        config.payer = authz;
        config.proposer = authz;
        config.authorizations = [authz];
      }
      return config;
    });
  });

  it('Test query coa', async () => {
    const coaAddr = await cadenceService.getAddr(mainAccount.address);
    expect(`0x${coaAddr}`).toBe(mainAccount.evmAddr);
  });

  it('Test send FLow from main account to main account', async () => {
    const payload = {
      type: 'token', // Asset type: token or NFT
      assetType: 'flow', // Network type: Flow blockchain or EVM chain
      proposer: mainAccount.address, // Flow address of the transaction proposer/signer
      receiver: mainAccount.address, // Recipient address (Flow or EVM format)
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault', // Flow resource identifier (e.g., vault
      sender: mainAccount.address,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);

    expect(configCache.name).toBe('transferTokensV3');
  });

  it('Test send USDC from main account to main account', async () => {
    const payload = {
      type: 'token', // Asset type: token or NFT
      assetType: 'flow', // Network type: Flow blockchain or EVM chain
      proposer: mainAccount.address, // Flow address of the transaction proposer/signer
      receiver: mainAccount.address, // Recipient address (Flow or EVM format)
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault', // Flow resource identifier (e.g., vault
      sender: mainAccount.address,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);

    expect(configCache.name).toBe('transferTokensV3');
  });

  it('Test FlowToEvmTokenStrategy - Bridge USDC token to EVM address', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.evmAddr,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: mainAccount.address,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('bridgeTokensToEvmAddressV2');
  });

  it('Test FlowTokenBridgeToEvmStrategy - FLOW tokens to CoA address', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.evmAddr,
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
      sender: mainAccount.address,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('transferFlowToEvmAddress');
  });

  it('Test FlowTokenBridgeToEvmStrategy - FLOW tokens to EVM address', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
      sender: mainAccount.address,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('transferFlowToEvmAddress');
  });

  it('Test EvmToFlowCoaWithdrawalStrategy - COA withdrawal to Flow address', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('withdrawCoa');
  });

  it('Test EvmToFlowTokenBridgeStrategy - Bridge USDC from EVM to Flow', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x1234567890123456789012345678901234567890',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('bridgeTokensFromEvmToFlowV3');
  });

  it('Test EvmToEvmTokenStrategy - EVM to EVM token transfer', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: '0x3b44f144b97a0402c0e206522c28052c1025a8aa',
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.00001',
      childAddrs: [],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('callContract');
  });

  it('Test ChildToChildTokenStrategy - Child to child token transfer', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: child2Account.address,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('sendChildFtToChild');
  });

  it('Test ChildToOthersTokenStrategy - Child to parent transfer', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('transferChildFt');
  });

  it('Test ChildToOthersTokenStrategy - Bridge child to COA', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.evmAddr,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('bridgeChildFtToEvm');
  });

  it('Test ChildToOthersTokenStrategy - Bridge child to EVM address', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('bridgeChildFtToEvmAddress');
  });

  it('Test ChildToOthersTokenStrategy - Child to Flow address', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: '0x32a6af84f2f54476',
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('sendChildFt');
  });

  it('Test ParentToChildTokenStrategy - Bridge from EVM to child', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: child1Account.address,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('bridgeChildFtFromEvm');
  });
});
