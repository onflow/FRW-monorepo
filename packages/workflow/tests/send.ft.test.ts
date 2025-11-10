import { configureFCL, CadenceService } from '@onflow/frw-cadence';
import { describe, it, expect, beforeEach } from 'vitest';

import { accounts } from './utils/accounts';
import { authz } from './utils/authz';
// import { SendTransaction } from '../src';

// dotenv.config();

const mainAccount = accounts.main;
// const child1Account = accounts.child1;
// const child2Account = accounts.child2;

const cadenceService = new CadenceService();

describe('Test send strategies', () => {
  beforeEach(() => {
    configureFCL('mainnet');

    cadenceService.useRequestInterceptor(async (config: any) => {
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

  // it('Test send FLow from main account to main account', async () => {
  //   const payload = {
  //     type: 'token', // Asset type: token or NFT
  //     assetType: 'flow', // Network type: Flow blockchain or EVM chain
  //     proposer: mainAccount.address, // Flow address of the transaction proposer/signer
  //     receiver: mainAccount.address, // Recipient address (Flow or EVM format)
  //     flowIdentifier: 'A.1654653399040a61.FlowToken.Vault', // Flow resource identifier (e.g., vault
  //     sender: mainAccount.address,
  //     amount: '0.001',
  //     childAddrs: [],
  //     ids: [],
  //     decimal: 8,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);

  //   expect(txid.length).toBe(64);

  //   // const transaction = await getTrx(txid);
  // });

  // it('Test send USDC from main account to main account', async () => {
  //   const payload = {
  //     type: 'token', // Asset type: token or NFT
  //     assetType: 'flow', // Network type: Flow blockchain or EVM chain
  //     proposer: mainAccount.address, // Flow address of the transaction proposer/signer
  //     receiver: mainAccount.address, // Recipient address (Flow or EVM format)
  //     flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault', // Flow resource identifier (e.g., vault
  //     sender: mainAccount.address,
  //     amount: '0.001',
  //     childAddrs: [],
  //     ids: [],
  //     decimal: 8,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);

  //   expect(txid.length).toBe(64);

  //   // const transaction = await getTrx(txid);
  // });

  // it('Test FlowToEvmTokenStrategy - Bridge USDC token to EVM address', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.evmAddr,
  //     flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
  //     sender: mainAccount.address,
  //     amount: '0.001',
  //     childAddrs: [],
  //     ids: [],
  //     decimal: 8,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test FlowTokenBridgeToEvmStrategy - FLOW tokens to CoA address', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.evmAddr,
  //     flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
  //     sender: mainAccount.address,
  //     amount: '0.001',
  //     childAddrs: [],
  //     ids: [],
  //     decimal: 8,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test FlowTokenBridgeToEvmStrategy - FLOW tokens to EVM address', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.evmAddr,
  //     flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
  //     sender: mainAccount.address,
  //     amount: '0.001',
  //     childAddrs: [],
  //     ids: [],
  //     decimal: 8,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload, cadenceService);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test EvmToFlowCoaWithdrawalStrategy - COA withdrawal to Flow address', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'evm',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.address,
  //     flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
  //     sender: mainAccount.evmAddr,
  //     amount: '0.001',
  //     childAddrs: [],
  //     ids: [],
  //     decimal: 8,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test EvmToFlowTokenBridgeStrategy - Bridge USDC from EVM to Flow', async () => {
  // const payload = {
  //   type: 'token',
  //   assetType: 'evm',
  //   proposer: mainAccount.address,
  //   // receiver: mainAccount.address,
  //   receiver: '0xc8955e600863871e',
  //   flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
  //   sender: mainAccount.evmAddr,
  //   amount: '0.000001',
  //   childAddrs: [],
  //   ids: [],
  //   decimal: 8,
  //   coaAddr: mainAccount.evmAddr,
  //   tokenContractAddr: '0x1234567890123456789012345678901234567890',
  // };

  //   // const payload = {
  //   //   "type": "token",
  //   //   "assetType": "evm",
  //   //   "proposer": mainAccount.address,
  //   //   "receiver": mainAccount.address,
  //   //   "flowIdentifier": "A.1e4aa0b87d10b141.EVMVMBridgedToken_1b97100ea1d7126c4d60027e231ea4cb25314bdb.Vault",
  //   //   "sender": mainAccount.evmAddr,
  //   //   "childAddrs": [
  //   //     "0x8e5a02ccc537163f"
  //   //   ],
  //   //   "ids": [],
  //   //   "amount": "0.001",
  //   //   "decimal": 18,
  //   //   "coaAddr": mainAccount.evmAddr,
  //   //   "tokenContractAddr": "0x1b97100ea1d7126c4d60027e231ea4cb25314bdb"
  //   // }

  //   const txid = await SendTransaction(payload, cadenceService);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test EvmToEvmTokenStrategy - EVM to EVM token transfer', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'evm',
  //     proposer: mainAccount.address,
  //     receiver: '0x3b44f144b97a0402c0e206522c28052c1025a8aa',
  //     flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
  //     sender: mainAccount.evmAddr,
  //     amount: '0.0001',
  //     childAddrs: [],
  //     ids: [],
  //     decimal: 8,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '0x0000000000000000000000000000000000000000',
  //   };

  //   const txid = await SendTransaction(payload, cadenceService);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test ChildToChildTokenStrategy - Child to child token transfer', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: child2Account.address,
  //     flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
  //     sender: child1Account.address,
  //     amount: '0.001',
  //     childAddrs: [child1Account.address, child2Account.address],
  //     ids: [],
  //     decimal: 8,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test ChildToOthersTokenStrategy - Child to parent transfer', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.address,
  //     flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
  //     sender: child1Account.address,
  //     amount: '0.001',
  //     childAddrs: [child1Account.address, child2Account.address],
  //     ids: [],
  //     decimal: 8,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test ChildToOthersTokenStrategy - Bridge child to COA', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.evmAddr,
  //     flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
  //     sender: child1Account.address,
  //     amount: '0.001',
  //     childAddrs: [child1Account.address, child2Account.address],
  //     ids: [],
  //     decimal: 8,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test ChildToOthersTokenStrategy - Bridge child to EVM address', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
  //     flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
  //     sender: child1Account.address,
  //     amount: '0.001',
  //     childAddrs: [child1Account.address, child2Account.address],
  //     ids: [],
  //     decimal: 6,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test ChildToOthersTokenStrategy - Child to Flow address', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: '0x32a6af84f2f54476',
  //     flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
  //     sender: child1Account.address,
  //     amount: '0.001',
  //     childAddrs: [child1Account.address, child2Account.address],
  //     ids: [],
  //     decimal: 6,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test ParentToChildTokenStrategy - Bridge from EVM to child', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'evm',
  //     proposer: mainAccount.address,
  //     receiver: child1Account.address,
  //     flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
  //     sender: mainAccount.evmAddr,
  //     amount: '0.001',
  //     childAddrs: [child1Account.address, child2Account.address],
  //     ids: [],
  //     decimal: 6,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test bridge Flow - Bridge from EVM to Flow', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'evm',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.address,
  //     flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
  //     sender: mainAccount.evmAddr,
  //     amount: '0.001',
  //     childAddrs: [child1Account.address, child2Account.address],
  //     ids: [],
  //     decimal: 6,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '0x0000000000000000000000000000000000000000',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test EoaToChildFtStrategy - Bridge FT from EOA to Child', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'evm',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.address,
  //     flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
  //     sender: mainAccount.eoaAddr,
  //     amount: '0.00001',
  //     childAddrs: [],
  //     ids: [],
  //     decimal: 6,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52',
  //   };

  //   const txid = await SendTransaction(payload, cadenceService, evmTrxCallback);
  //   console.log(txid);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test bridge Flow - Bridge from EOA to Coa to Flow', async () => {
  //   const payload = {
  //     type: 'token',
  //     assetType: 'evm',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.address,
  //     flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
  //     sender: mainAccount.eoaAddr,
  //     amount: '0.00001',
  //     childAddrs: [],
  //     ids: [],
  //     decimal: 18,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '0x0000000000000000000000000000000000000000',
  //   };

  //   const txid = await SendTransaction(payload, cadenceService, evmTrxCallback);
  //   console.log(txid, '----txid----');
  //   expect(txid.length).toBe(64);
  // });
});
