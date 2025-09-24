import { configureFCL, CadenceService } from '@onflow/frw-cadence';
import { describe, it, expect, beforeEach } from 'vitest';

import { SendTransaction } from '../src';
import { accounts } from './utils/accounts';
import { authz, payerAuth } from './utils/authz';

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
        config.payer = payerAuth;
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

    const txid = await SendTransaction(payload, cadenceService);

    console.log(txid, 'txid===');
    expect(txid.length).toBe(64);

    // const transaction = await getTrx(txid);
  });
});
