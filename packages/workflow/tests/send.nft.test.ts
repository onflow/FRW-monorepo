import { configureFCL, CadenceService } from '@onflow/frw-cadence';
import dotenv from 'dotenv';
import { describe, it, expect, beforeEach } from 'vitest';

// import { getTrx } from '../src/utils';
// import { SendTransaction } from '../src';
import { accounts } from './utils/accounts';
import { authz, bridgeAuthorizationOnly } from './utils/authz';
// import { convertHexToByteArray } from '../src/send/utils';

dotenv.config();

const mainAccount = accounts.main;
// const child1Account = accounts.child1;
// const child2Account = accounts.child2;

const cadenceService = new CadenceService();

describe('Test NFT send strategies', () => {
  beforeEach(() => {
    configureFCL('mainnet');
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        config.payer = authz;
        config.proposer = authz;
        config.authorizations = config.name.includes('WithPayer')
          ? [authz, bridgeAuthorizationOnly]
          : [authz];
      }
      return config;
    });
  });

  it('Test query coa', async () => {
    const coaAddr = await cadenceService.getAddr(mainAccount.address);
    expect(`0x${coaAddr}`).toBe(mainAccount.evmAddr);
  });

  // it('Test FlowToFlowNftStrategy - Flow NFT transfer to Flow address', async () => {
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.address,
  //     flowIdentifier: 'A.921ea449dffec68a.FlovatarComponent.NFT',
  //     sender: mainAccount.address,
  //     amount: '0.0',
  //     childAddrs: [],
  //     ids: [127190],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test TopShotNftStrategy - TopShot NFT transfer', async () => {
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.address,
  //     flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
  //     sender: mainAccount.address,
  //     amount: '0',
  //     childAddrs: [],
  //     ids: [17884712],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test FlowToEvmNftBridgeStrategy - Bridge NFT to EVM address', async () => {

  //   const payload = {
  //     type: 'nft',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.evmAddr,
  //     flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
  //     sender: mainAccount.address,
  //     childAddrs: ['0x8e5a02ccc537163f'],
  //     ids: [248937581],
  //     amount: '',
  //     decimal: 8,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload, cadenceService);
  //   console.log(txid);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test EvmToFlowNftBridgeStrategy - Bridge NFT from EVM to Flow', async () => {
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'evm',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.address,
  //     flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
  //     sender: mainAccount.evmAddr,
  //     amount: '0',
  //     childAddrs: [],
  //     ids: [75866303338937],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '0x2B7CfE0f24c18690a4E34a154e313859B7c6e342',
  //   };

  //   const txid = await SendTransaction(payload, cadenceService);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test EvmToEvmNftStrategy - EVM to EVM NFT transfer', async () => {
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'evm',
  //     proposer: mainAccount.address,
  //     receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
  //     flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
  //     sender: mainAccount.evmAddr,
  //     amount: '',
  //     childAddrs: [],
  //     ids: [36786962],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '0x50ab3a827ad268e9d5a24d340108fad5c25dad5f',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test EvmToEvmNftStrategy - EVM to EVM 1155 NFT transfer', async () => {
  //   // 1155
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'evm',
  //     proposer: mainAccount.address,
  //     receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
  //     flowIdentifier: '',
  //     sender: mainAccount.evmAddr,
  //     amount: '4.0',
  //     childAddrs: [],
  //     ids: [1],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '0x3E00930ED9DB5b78D2c1B470cF9dC635BB405f39',
  //   };

  //   const txid = await SendTransaction(payload, cadenceService);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test ChildToChildNftStrategy - Child1 to child2 NFT transfer', async () => {
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: child2Account.address,
  //     flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
  //     sender: child1Account.address,
  //     amount: '0',
  //     childAddrs: [child1Account.address, child2Account.address],
  //     ids: [75866303338937],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test ChildToChildNftStrategy - Child2 to child1 NFT transfer', async () => {
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: child1Account.address,
  //     flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
  //     sender: child2Account.address,
  //     amount: '',
  //     childAddrs: [child1Account.address, child2Account.address],
  //     ids: [75866303338937],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test ChildToOthersNftStrategy - Child to parent NFT transfer', async () => {
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.address,
  //     flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
  //     sender: child2Account.address,
  //     amount: '',
  //     childAddrs: [child1Account.address, child2Account.address],
  //     ids: [217703303195673],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test ChildToOthersNftStrategy - Bridge child NFT to COA', async () => {
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
  //     flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
  //     sender: child2Account.address,
  //     amount: '0',
  //     childAddrs: [child1Account.address, child2Account.address],
  //     ids: [75866303338937],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload, cadenceService);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test ChildToOthersNftStrategy - Bridge child NFT to EVM address', async () => {
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
  //     flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
  //     sender: child2Account.address,
  //     amount: '0',
  //     childAddrs: [child1Account.address, child2Account.address],
  //     ids: [102254581997205],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test ChildToOthersNftStrategy - Child NFT to Flow address', async () => {
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'flow',
  //     proposer: mainAccount.address,
  //     receiver: child1Account.address,
  //     flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
  //     sender: child2Account.address,
  //     amount: '0',
  //     childAddrs: [child2Account.address],
  //     ids: [217703303195673],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '',
  //   };

  //   const txid = await SendTransaction(payload);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test ParentToChildNftStrategy - Bridge NFT from EVM to child', async () => {
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'evm',
  //     proposer: mainAccount.address,
  //     receiver: child1Account.address,
  //     flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
  //     sender: mainAccount.evmAddr,
  //     amount: '0.0',
  //     childAddrs: [child1Account.address, child2Account.address],
  //     ids: [239693535195987],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '0x2B7CfE0f24c18690a4E34a154e313859B7c6e342',
  //   };

  //   const txid = await SendTransaction(payload, cadenceService);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test EvmToFlowNftWithEoaBridgeStrategy - Bridge NFT from EVM to Flow with EOA', async () => {
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'evm',
  //     proposer: mainAccount.address,
  //     receiver: mainAccount.address,
  //     flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
  //     sender: mainAccount.eoaAddr,
  //     amount: '0',
  //     childAddrs: [],
  //     ids: [75866303338937],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '0x2B7CfE0f24c18690a4E34a154e313859B7c6e342',
  //   };

  //   const txid = await SendTransaction(payload, cadenceService, {
  //     ethSign: evmTrxCallback,
  //     network: 'mainnet',
  //   });
  //   console.log(txid)
  //   expect(txid.length).toBe(64);
  // });

  // it('Test EoaToChildNftStrategy - Bridge NFT from EOA to Child', async () => {
  //   const payload = {
  //     type: 'nft',
  //     assetType: 'evm',
  //     proposer: mainAccount.address,
  //     receiver: '0x1693baa419804143',
  //     flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
  //     sender: mainAccount.eoaAddr,
  //     amount: '0',
  //     childAddrs: ['0x1693baa419804143'],
  //     ids: [225399885718549],
  //     decimal: 0,
  //     coaAddr: mainAccount.evmAddr,
  //     tokenContractAddr: '0x2B7CfE0f24c18690a4E34a154e313859B7c6e342',
  //   };

  //   const txid = await SendTransaction(payload, cadenceService, {
  //     ethSign: evmTrxCallback,
  //     network: 'mainnet',
  //   });
  //   console.log(txid);
  //   expect(txid.length).toBe(64);
  // });

  // it('Test EoaToChildNftStrategy - Bridge NFT from EOA to Child (manual)', async () => {
  //   const signature = await evmTrxCallback(new Uint8Array(32).fill(0));
  //   expect(signature.length).toBe(65);
  // });
});
