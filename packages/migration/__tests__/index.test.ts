import { configureFCL, CadenceService } from '@onflow/frw-cadence';
import dotenv from 'dotenv';
import { describe, it, expect, beforeEach } from 'vitest';

// import { getTrx } from '../src/utils';
import { accounts } from './utils/accounts';
import {
  authz,
  // bridgeAuthorizationOnly,
  // payerAuthorization
} from './utils/authz';
// import { convertHexToByteArray } from '../src/send/utils';

dotenv.config();

const mainAccount = accounts.main;

const cadenceService = new CadenceService();

describe('Test NFT send strategies', () => {
  beforeEach(() => {
    configureFCL('mainnet');
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        config.payer = authz;
        config.proposer = authz;
        config.authorizations = config.name.includes('WithPayer') ? [authz] : [authz];
      }
      return config;
    });
  });

  it('Test query coa', async () => {
    const coaAddr = await cadenceService.getAddr(mainAccount.address);
    expect(`0x${coaAddr}`).toBe(mainAccount.evmAddr);
  });

  // it('Test migration fts', async () => {
  //   const assets = {
  //     erc20: [
  //       {
  //         // forth
  //         address: '0xb73bf8e6a4477a952e0338e6cc00cc0ce5ad04ba',
  //         amount: '1',
  //       },
  //       {
  //         // VINYL
  //         address: '0x6a2cd141d75864944318acf272443febc54855a9',
  //         amount: '1',
  //       },
  //       {
  //         // flow
  //         address: '0x0000000000000000000000000000000000000000',
  //         amount: '0.05',
  //       },
  //     ],
  //     erc721: [],
  //     erc1155: [],
  //   };

  //   const res = await migrationTransaction(
  //     cadenceService,
  //     assets,
  //     mainAccount.evmAddr,
  //     mainAccount.eoaAddr
  //   );
  //   console.log(res);
  // });

  // it('Test migration nfts', async () => {
  //   const assets = {
  //     erc20: [
  //       {
  //         // forth
  //         address: '0xb73bf8e6a4477a952e0338e6cc00cc0ce5ad04ba',
  //         amount: '1',
  //       },
  //       {
  //         // VINYL
  //         address: '0x6a2cd141d75864944318acf272443febc54855a9',
  //         amount: '1',
  //       },
  //     ],
  //     erc721: [
  //       {
  //         address: '0x1BFf3f6135e82b7819bCa9153fC6997E519141E9',
  //         id: '2',
  //       },
  //       // {
  //       //   address: '0x1BFf3f6135e82b7819bCa9153fC6997E519141E9',
  //       //   id: '2',
  //       // },
  //     ],
  //     erc1155: [
  //       {
  //         address: '0x3E00930ED9DB5b78D2c1B470cF9dC635BB405f39',
  //         id: '1',
  //         amount: '2',
  //       },
  //     ],
  //   };

  //   const res = await migrationTransaction(
  //     cadenceService,
  //     assets,
  //     mainAccount.evmAddr,
  //     mainAccount.eoaAddr
  //   );
  //   console.log(res);
  // });
});
