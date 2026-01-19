import { configureFCL, CadenceService } from '@onflow/frw-cadence';
import dotenv from 'dotenv';

import { migrationTransaction } from '../src';
import { convertAssetsToCalldata } from '../src/migration/utils';
import { accounts } from '../tests/utils/accounts';
import { authz } from '../tests/utils/authz';

dotenv.config();

const main = async () => {
  let count = 200;
  const nfts: any = [];

  while (count > 0) {
    nfts.push({
      address: '0xF0fca99e91031C40842E9E234cc77C0045fE3dB7',
      id: (count + 419).toString(),
    });
    count = count - 1;
  }
  const assets = {
    erc20: [],
    erc721: nfts,
    erc1155: [],
  };

  const sender = accounts.main.evmAddr || '';
  const receiver = accounts.main.eoaAddr;
  const mainAccount = accounts.main;

  const callDatas = convertAssetsToCalldata(assets, sender, receiver);

  configureFCL('mainnet');
  const cadenceService = new CadenceService();
  cadenceService.useRequestInterceptor(async (config: any) => {
    if (config.type === 'transaction') {
      config.payer = authz;
      config.proposer = authz;
      config.authorizations = [authz];
    }
    return config;
  });

  const res = await migrationTransaction(
    cadenceService,
    assets,
    mainAccount.evmAddr,
    mainAccount.eoaAddr
  );
  console.log(res);
};

main();
