import { type CadenceService } from '@onflow/frw-cadence';
import { type MigrationAssetsData } from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';
import { validateEvmAddress } from '@onflow/frw-workflow';

import { convertAssetsToCalldata } from './utils';

// export * from './migration';

export const migrationTransaction = async (
  cadenceService: CadenceService,
  assets: MigrationAssetsData,
  receiver: string,
  sender: string
): Promise<any> => {
  if (!validateEvmAddress(receiver)) {
    throw new Error('Invalid receiver address');
  }
  if (!validateEvmAddress(sender)) {
    throw new Error('Invalid sender address');
  }
  const trxs = convertAssetsToCalldata(assets, sender, receiver);

  const res = await cadenceService.batchCallContract(
    trxs.addresses,
    trxs.values,
    trxs.datas,
    16_777_216 // evm default gas limit
  );

  logger.info('Migration transaction result:', res);

  return res;
};
