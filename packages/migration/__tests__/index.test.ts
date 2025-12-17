import { configureFCL, CadenceService } from '@onflow/frw-cadence';
import dotenv from 'dotenv';
import { describe, it, expect, beforeEach } from 'vitest';

// import { getTrx } from '../src/utils';
import { accounts } from './utils/accounts';
import { authz, bridgeAuthorizationOnly, payerAuthorization } from './utils/authz';
// import { convertHexToByteArray } from '../src/send/utils';

dotenv.config();

const mainAccount = accounts.main;

const cadenceService = new CadenceService();

describe('Test NFT send strategies', () => {
  beforeEach(() => {
    configureFCL('mainnet');
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        config.payer = payerAuthorization;
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

  it('Test migration fts', async () => {});

  it('Test migration nfts', async () => {});
});
