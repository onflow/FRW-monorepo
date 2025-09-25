import { configureFCL, CadenceService } from '@onflow/frw-cadence';
import { describe, it, expect, beforeEach } from 'vitest';

import { accounts } from './utils/accounts';
import { authz, payerAuth, bridgeAuthorization } from './utils/authz';

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
        config.payer = config.name.includes('WithPayer') ? bridgeAuthorization : payerAuth;
        config.proposer = authz;
        config.authorizations = config.name.includes('WithPayer')
          ? [authz, bridgeAuthorization]
          : [authz];
      }
      return config;
    });
  });

  it('Test query coa', async () => {
    const coaAddr = await cadenceService.getAddr(mainAccount.address);
    expect(`0x${coaAddr}`).toBe(mainAccount.evmAddr);
  });

  //   it('Test fee payer', async () => {
  //     const payload = {
  //       type: 'token', // Asset type: token or NFT
  //       assetType: 'flow', // Network type: Flow blockchain or EVM chain
  //       proposer: mainAccount.address, // Flow address of the transaction proposer/signer
  //       receiver: mainAccount.address, // Recipient address (Flow or EVM format)
  //       flowIdentifier: 'A.1654653399040a61.FlowToken.Vault', // Flow resource identifier (e.g., vault
  //       sender: mainAccount.address,
  //       amount: '0.001',
  //       childAddrs: [],
  //       ids: [],
  //       decimal: 8,
  //       coaAddr: mainAccount.evmAddr,
  //       tokenContractAddr: '',
  //     };

  //     const txid = await SendTransaction(payload, cadenceService);

  //     console.log(txid, 'txid===');
  //     expect(txid.length).toBe(64);
  //   });

  //   it('Test FlowToEvmNftBridgeStrategy - Bridge NFT to EVM address', async () => {
  //     const payload = {
  //       type: 'nft',
  //       assetType: 'flow',
  //       proposer: '0xe7aded0979f825d0',
  //       receiver: '0x00000000000000000000000230755851c836914F',
  //       flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
  //       sender: '0xe7aded0979f825d0',
  //       childAddrs: ['0x8e5a02ccc537163f'],
  //       ids: [91259466020066],
  //       amount: '',
  //       decimal: 8,
  //       coaAddr: '0x00000000000000000000000230755851c836914F',
  //       tokenContractAddr: '',
  //     };

  //     const txid = await SendTransaction(payload, cadenceService);
  //     console.log(txid, 'txid===');
  //     expect(txid.length).toBe(64);
  //   });

  //   it('Test FlowToEvmNftBridgeStrategy - Bridge NFT to EVM address', async () => {
  //     const res = await axios.get('https://test.lilico.app/api/v1/payer/status?network=mainnet', {
  //       headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.API_KEY },
  //     });
  //     console.log(res.data, 'data===');
  //     const { status, data } = res.data;
  //     expect(status).toBe(200);
  //     const { surge, feePayer, bridgePayer } = data;
  //     const { active, multiplier } = surge;
  //     expect(active).toBe(false);
  //     expect(feePayer.address).toBe('0x319e67f2ef9d937f');
  //     expect(bridgePayer.address).toBe('0xc33b4f1884ae1ea4');
  //     expect(Number(multiplier)).greaterThanOrEqual(1);
  //   });
});
