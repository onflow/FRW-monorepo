import { type CadenceService } from '@onflow/frw-cadence';
import { type MigrationAssetsData } from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';
import { validateEvmAddress } from '@onflow/frw-workflow';

import { convertAssetsToCalldata } from './utils';

// export * from './migration';

export const migrationTransaction = async (
  cadenceService: CadenceService,
  assets: MigrationAssetsData,
  sender: string,
  receiver: string
): Promise<any> => {
  if (!validateEvmAddress(receiver)) {
    throw new Error('Invalid receiver address');
  }
  if (!validateEvmAddress(sender)) {
    throw new Error('Invalid sender address');
  }

  // Log all assets and amounts before transaction
  console.log('[migrationTransaction] ===== MIGRATION TRANSACTION DETAILS =====');
  console.log('[migrationTransaction] Sender:', sender);
  console.log('[migrationTransaction] Receiver:', receiver);

  if (assets.erc20 && assets.erc20.length > 0) {
    console.log('[migrationTransaction] ERC20 Tokens:');
    assets.erc20.forEach((token, index) => {
      const symbol =
        token.address === '0x0000000000000000000000000000000000000000' ? 'FLOW' : token.address;
      console.log(`  [${index + 1}] ${symbol}: ${token.amount}`);
    });
  } else {
    console.log('[migrationTransaction] ERC20 Tokens: None');
  }

  if (assets.erc721 && assets.erc721.length > 0) {
    console.log('[migrationTransaction] ERC721 NFTs:');
    assets.erc721.forEach((nft, index) => {
      console.log(`  [${index + 1}] Contract: ${nft.address}, Token ID: ${nft.id}`);
    });
  } else {
    console.log('[migrationTransaction] ERC721 NFTs: None');
  }

  if (assets.erc1155 && assets.erc1155.length > 0) {
    console.log('[migrationTransaction] ERC1155 Tokens:');
    assets.erc1155.forEach((token, index) => {
      console.log(
        `  [${index + 1}] Contract: ${token.address}, Token ID: ${token.id}, Amount: ${token.amount}`
      );
    });
  } else {
    console.log('[migrationTransaction] ERC1155 Tokens: None');
  }

  const totalAssets =
    (assets.erc20?.length ?? 0) + (assets.erc721?.length ?? 0) + (assets.erc1155?.length ?? 0);
  console.log(`[migrationTransaction] Total assets to migrate: ${totalAssets}`);
  console.log('[migrationTransaction] ===== EXECUTING TRANSACTION =====');

  const trxs = convertAssetsToCalldata(assets, sender, receiver);

  // Log all assets being sent to the final transaction
  console.log('[migrationTransaction] ===== FINAL TRANSACTION DATA =====');
  console.log('[migrationTransaction] Transaction count:', trxs.addresses.length);
  console.log('[migrationTransaction] Addresses:', JSON.stringify(trxs.addresses, null, 2));
  console.log(
    '[migrationTransaction] Values (FLOW amounts):',
    JSON.stringify(trxs.values, null, 2)
  );
  console.log(
    '[migrationTransaction] Calldata lengths:',
    trxs.datas.map((d) => d.length)
  );

  // Map transaction data back to original assets for clarity
  console.log('[migrationTransaction] ===== TRANSACTION MAPPING =====');
  let txIndex = 0;

  // Map ERC20 tokens
  if (assets.erc20 && assets.erc20.length > 0) {
    console.log('[migrationTransaction] ERC20 Transactions:');
    assets.erc20.forEach((token, index) => {
      const symbol =
        token.address === '0x0000000000000000000000000000000000000000' ? 'FLOW' : token.address;
      console.log(`  [${txIndex + 1}] ${symbol}:`);
      console.log(`      Address: ${trxs.addresses[txIndex]}`);
      console.log(`      Value: ${trxs.values[txIndex]}`);
      console.log(`      Calldata length: ${trxs.datas[txIndex].length} bytes`);
      console.log(`      Original amount: ${token.amount}`);
      txIndex++;
    });
  }

  // Map ERC721 tokens
  if (assets.erc721 && assets.erc721.length > 0) {
    console.log('[migrationTransaction] ERC721 Transactions:');
    assets.erc721.forEach((nft, index) => {
      console.log(`  [${txIndex + 1}] NFT:`);
      console.log(`      Contract: ${nft.address}`);
      console.log(`      Token ID: ${nft.id}`);
      console.log(`      Address: ${trxs.addresses[txIndex]}`);
      console.log(`      Value: ${trxs.values[txIndex]}`);
      console.log(`      Calldata length: ${trxs.datas[txIndex].length} bytes`);
      txIndex++;
    });
  }

  // Map ERC1155 tokens
  if (assets.erc1155 && assets.erc1155.length > 0) {
    console.log('[migrationTransaction] ERC1155 Transactions:');
    assets.erc1155.forEach((token, index) => {
      console.log(`  [${txIndex + 1}] ERC1155:`);
      console.log(`      Contract: ${token.address}`);
      console.log(`      Token ID: ${token.id}`);
      console.log(`      Amount: ${token.amount}`);
      console.log(`      Address: ${trxs.addresses[txIndex]}`);
      console.log(`      Value: ${trxs.values[txIndex]}`);
      console.log(`      Calldata length: ${trxs.datas[txIndex].length} bytes`);
      txIndex++;
    });
  }

  console.log('[migrationTransaction] ===== CALLING batchCallContract =====');
  console.log('[migrationTransaction] Gas limit: 16777216');

  const res = await cadenceService.batchCallContract(
    trxs.addresses,
    trxs.values,
    trxs.datas,
    16_777_216 // evm default gas limit
  );

  logger.info('Migration transaction result:', res);

  return res;
};
