import { Interface } from '@ethersproject/abi';
import { type CadenceService } from '@onflow/frw-cadence';
import { type MigrationAssetsData } from '@onflow/frw-types';
import { logger, validateEvmAddress } from '@onflow/frw-utils';

import { convertAssetsToCalldata } from './utils';

// export * from './migration';

export const migrationTransaction = async (
  cadenceService: CadenceService,
  assets: MigrationAssetsData,
  sender: string,
  receiver: string,
  onProgress?: (progress: number, current: number, total: number) => void,
  estimatedSecondsPerTransaction?: number
): Promise<any> => {
  if (!validateEvmAddress(receiver)) {
    throw new Error('Invalid receiver address');
  }
  if (!validateEvmAddress(sender)) {
    throw new Error('Invalid sender address');
  }

  // Log all assets and amounts before transaction
  logger.debug('═══════════════════════════════════════════════════════════════');
  logger.debug('[migrationTransaction] ===== MIGRATION TRANSACTION START =====');
  logger.debug('═══════════════════════════════════════════════════════════════');
  logger.debug('[migrationTransaction] Sender:', sender);
  logger.debug('[migrationTransaction] Receiver:', receiver);

  // Comprehensive FT (Fungible Token) logging - PRINT ALL FTs HERE
  logger.debug('');
  logger.debug('═══════════════════════════════════════════════════════════════');
  logger.debug('[migrationTransaction] ===== ALL FUNGIBLE TOKENS (FT) DETAILS =====');
  logger.debug('═══════════════════════════════════════════════════════════════');
  if (assets.erc20 && assets.erc20.length > 0) {
    logger.debug(`[migrationTransaction] Total ERC20/FT tokens: ${assets.erc20.length}`);
    logger.debug('[migrationTransaction] Full ERC20/FT token list:');
    assets.erc20.forEach((token, index) => {
      const isFlow = token.address === '0x0000000000000000000000000000000000000000';
      const symbol = isFlow ? 'FLOW' : token.address;
      logger.debug(`  [${index + 1}] Token Details:`);
      logger.debug(`      Symbol/Address: ${symbol}`);
      logger.debug(`      Contract Address: ${token.address}`);
      logger.debug(`      Amount: ${token.amount}`);
      logger.debug(`      Amount Type: ${typeof token.amount}`);
      logger.debug(`      Is FLOW Token: ${isFlow}`);
      // Log raw JSON for debugging
      logger.debug(`      Raw Token Data:`, JSON.stringify(token, null, 2));
    });
    logger.debug('[migrationTransaction] ERC20/FT Summary:');
    logger.debug(
      `  - FLOW tokens: ${assets.erc20.filter((t) => t.address === '0x0000000000000000000000000000000000000000').length}`
    );
    logger.debug(
      `  - Other ERC20 tokens: ${assets.erc20.filter((t) => t.address !== '0x0000000000000000000000000000000000000000').length}`
    );
    // Calculate total FLOW amount
    const flowTokens = assets.erc20.filter(
      (t) => t.address === '0x0000000000000000000000000000000000000000'
    );
    if (flowTokens.length > 0) {
      const totalFlow = flowTokens.reduce((sum, token) => {
        return sum + parseFloat(token.amount || '0');
      }, 0);
      logger.debug(`  - Total FLOW amount: ${totalFlow}`);
    }
  } else {
    logger.debug('[migrationTransaction] ERC20/FT Tokens: None');
  }
  logger.debug('═══════════════════════════════════════════════════════════════');
  logger.debug('[migrationTransaction] ===== END FT DETAILS =====');
  logger.debug('═══════════════════════════════════════════════════════════════');
  logger.debug('');

  if (assets.erc721 && assets.erc721.length > 0) {
    logger.debug('[migrationTransaction] ERC721 NFTs:');
    assets.erc721.forEach((nft, index) => {
      logger.debug(`  [${index + 1}] Contract: ${nft.address}, Token ID: ${nft.id}`);
    });
  } else {
    logger.debug('[migrationTransaction] ERC721 NFTs: None');
  }

  if (assets.erc1155 && assets.erc1155.length > 0) {
    logger.debug('[migrationTransaction] ERC1155 Tokens:');
    assets.erc1155.forEach((token, index) => {
      logger.debug(
        `  [${index + 1}] Contract: ${token.address}, Token ID: ${token.id}, Amount: ${token.amount}`
      );
    });
  } else {
    logger.debug('[migrationTransaction] ERC1155 Tokens: None');
  }

  const totalAssets =
    (assets.erc20?.length ?? 0) + (assets.erc721?.length ?? 0) + (assets.erc1155?.length ?? 0);
  logger.debug(`[migrationTransaction] Total assets to migrate: ${totalAssets}`);
  logger.debug('[migrationTransaction] ===== EXECUTING TRANSACTION =====');

  const trxs = convertAssetsToCalldata(assets, sender, receiver);

  // Log all assets being sent to the final transaction
  logger.debug('[migrationTransaction] ===== FINAL TRANSACTION DATA =====');
  logger.debug('[migrationTransaction] Transaction count:', trxs.addresses.length);
  logger.debug('[migrationTransaction] Addresses:', JSON.stringify(trxs.addresses, null, 2));
  logger.debug(
    '[migrationTransaction] Values (FLOW amounts):',
    JSON.stringify(trxs.values, null, 2)
  );
  logger.debug(
    '[migrationTransaction] Calldata lengths:',
    trxs.datas.map((d) => d.length)
  );

  // Map transaction data back to original assets for clarity
  logger.debug('[migrationTransaction] ===== TRANSACTION MAPPING =====');
  let txIndex = 0;

  // Map ERC20 tokens
  if (assets.erc20 && assets.erc20.length > 0) {
    logger.debug('[migrationTransaction] ERC20 Transactions:');
    assets.erc20.forEach((token, index) => {
      const symbol =
        token.address === '0x0000000000000000000000000000000000000000' ? 'FLOW' : token.address;
      logger.debug(`  [${txIndex + 1}] ${symbol}:`);
      logger.debug(`      Address: ${trxs.addresses[txIndex]}`);
      logger.debug(`      Value: ${trxs.values[txIndex]}`);
      logger.debug(`      Calldata length: ${trxs.datas[txIndex].length} bytes`);
      logger.debug(`      Original amount: ${token.amount}`);
      txIndex++;
    });
  }

  // Map ERC721 tokens
  if (assets.erc721 && assets.erc721.length > 0) {
    logger.debug('[migrationTransaction] ERC721 Transactions:');
    assets.erc721.forEach((nft, index) => {
      logger.debug(`  [${txIndex + 1}] NFT:`);
      logger.debug(`      Contract: ${nft.address}`);
      logger.debug(`      Token ID: ${nft.id}`);
      logger.debug(`      Address: ${trxs.addresses[txIndex]}`);
      logger.debug(`      Value: ${trxs.values[txIndex]}`);
      logger.debug(`      Calldata length: ${trxs.datas[txIndex].length} bytes`);
      txIndex++;
    });
  }

  // Map ERC1155 tokens
  if (assets.erc1155 && assets.erc1155.length > 0) {
    logger.debug('[migrationTransaction] ERC1155 Transactions:');
    assets.erc1155.forEach((token, index) => {
      logger.debug(`  [${txIndex + 1}] ERC1155:`);
      logger.debug(`      Contract: ${token.address}`);
      logger.debug(`      Token ID: ${token.id}`);
      logger.debug(`      Amount: ${token.amount}`);
      logger.debug(`      Address: ${trxs.addresses[txIndex]}`);
      logger.debug(`      Value: ${trxs.values[txIndex]}`);
      logger.debug(`      Calldata length: ${trxs.datas[txIndex].length} bytes`);
      txIndex++;
    });
  }

  // Final summary: Compare received vs sent
  logger.debug('[migrationTransaction] ===== FINAL FT MIGRATION SUMMARY =====');
  logger.debug(`[migrationTransaction] FTs received in assets: ${assets.erc20?.length ?? 0}`);
  logger.debug(`[migrationTransaction] FTs in transaction: ${trxs.addresses.length}`);
  logger.debug(`[migrationTransaction] ERC721 NFTs: ${assets.erc721?.length ?? 0}`);
  logger.debug(`[migrationTransaction] ERC1155 Tokens: ${assets.erc1155?.length ?? 0}`);

  if (assets.erc20 && assets.erc20.length > 0) {
    const flowCount = assets.erc20.filter(
      (t) => t.address === '0x0000000000000000000000000000000000000000'
    ).length;
    const erc20Count = assets.erc20.length - flowCount;
    logger.debug(`[migrationTransaction] Breakdown:`);
    logger.debug(`  - FLOW tokens: ${flowCount}`);
    logger.debug(`  - ERC20 tokens: ${erc20Count}`);

    // List all FT addresses for verification
    logger.debug('[migrationTransaction] All FT addresses being migrated:');
    assets.erc20.forEach((token, idx) => {
      const isFlow = token.address === '0x0000000000000000000000000000000000000000';
      logger.debug(`  ${idx + 1}. ${isFlow ? 'FLOW' : token.address}: ${token.amount}`);
    });
  }

  logger.debug('[migrationTransaction] ===== END FINAL SUMMARY =====');
  logger.debug(
    '[migrationTransaction] ===== TESTING MODE: PROCESSING 1 ASSET PER TRANSACTION ====='
  );
  logger.debug('[migrationTransaction] Gas limit: 16777216');

  // CRITICAL: Verify what we're passing to batchCallContract
  logger.debug('[migrationTransaction] ===== PRE-CALL VERIFICATION =====');
  logger.debug(`[migrationTransaction] Total assets to process: ${trxs.addresses.length}`);
  logger.debug(`[migrationTransaction] Addresses count: ${trxs.addresses.length}`);
  logger.debug(`[migrationTransaction] Values count: ${trxs.values.length}`);
  logger.debug(`[migrationTransaction] Datas count: ${trxs.datas.length}`);

  // Verify each data array
  trxs.datas.forEach((data, index) => {
    logger.debug(`[migrationTransaction] Data ${index + 1}:`);
    logger.debug(`  Length: ${data.length} bytes`);
    logger.debug(`  First 20 bytes: [${data.slice(0, 20).join(', ')}]`);
    // Reconstruct hex to verify
    const reconstructedHex = '0x' + data.map((b) => b.toString(16).padStart(2, '0')).join('');
    logger.debug(`  Reconstructed hex (first 100 chars): ${reconstructedHex.substring(0, 100)}...`);

    // Try to decode if it's an ERC20 transfer
    if (
      index < assets.erc20?.length &&
      assets.erc20[index].address !== '0x0000000000000000000000000000000000000000'
    ) {
      try {
        const abi = ['function transfer(address to, uint256 value)'];
        const iface = new Interface(abi);
        const decoded = iface.decodeFunctionData('transfer', reconstructedHex);
        logger.debug(`  ✅ Decoded amount: ${decoded.value.toString()}`);
        logger.debug(`  ✅ Decoded receiver: ${decoded.to}`);
        logger.debug(`  ✅ Original amount: ${assets.erc20[index].amount}`);
        if (decoded.value.toString() !== assets.erc20[index].amount) {
          logger.error(`  ❌❌❌ AMOUNT MISMATCH IN FINAL DATA! ❌❌❌`);
        }
      } catch (error) {
        logger.error(`  ❌ Failed to decode:`, error);
      }
    }
  });
  logger.debug('[migrationTransaction] ===== END PRE-CALL VERIFICATION =====');

  // Verify data types and structure
  logger.debug('[migrationTransaction] ===== DATA TYPE VERIFICATION =====');
  logger.debug(
    `[migrationTransaction] addresses type: ${Array.isArray(trxs.addresses) ? 'Array' : typeof trxs.addresses}`
  );
  logger.debug(
    `[migrationTransaction] values type: ${Array.isArray(trxs.values) ? 'Array' : typeof trxs.values}`
  );
  logger.debug(
    `[migrationTransaction] datas type: ${Array.isArray(trxs.datas) ? 'Array' : typeof trxs.datas}`
  );
  logger.debug(
    `[migrationTransaction] datas[0] type: ${Array.isArray(trxs.datas[0]) ? 'Array' : typeof trxs.datas[0]}`
  );
  logger.debug(`[migrationTransaction] datas[0][0] type: ${typeof trxs.datas[0]?.[0]}`);
  logger.debug(
    `[migrationTransaction] datas[0] sample: [${trxs.datas[0]?.slice(0, 10).join(', ')}...]`
  );

  // Verify all data arrays are valid number arrays
  let invalidDataFound = false;
  trxs.datas.forEach((data, idx) => {
    if (!Array.isArray(data)) {
      logger.error(`[migrationTransaction] ❌ Data ${idx} is not an array:`, typeof data, data);
      invalidDataFound = true;
    } else {
      const invalidItems = data.filter(
        (item) => typeof item !== 'number' || isNaN(item) || item < 0 || item > 255
      );
      if (invalidItems.length > 0) {
        logger.error(
          `[migrationTransaction] ❌ Data ${idx} has invalid items:`,
          invalidItems.slice(0, 5)
        );
        invalidDataFound = true;
      }
    }
  });

  if (invalidDataFound) {
    logger.error(
      '[migrationTransaction] ❌❌❌ INVALID DATA DETECTED - THIS WILL CAUSE TRANSACTION TO FAIL ❌❌❌'
    );
  } else {
    logger.debug('[migrationTransaction] ✅ All data arrays are valid');
  }
  logger.debug('[migrationTransaction] ===== END DATA TYPE VERIFICATION =====');

  // Verify COA EVM address matches sender
  logger.debug('[migrationTransaction] ===== COA ADDRESS VERIFICATION =====');
  logger.debug(`[migrationTransaction] Sender address (from params): ${sender}`);

  let actualCoaEvmAddress: string | null = null;
  let signerFlowAddress: string | null = null;

  try {
    // Try to get the Flow account that will sign the transaction
    // This is the account whose COA will actually execute the transfers
    try {
      const fcl = await import('@onflow/fcl');
      const user = await fcl.currentUser.snapshot();
      signerFlowAddress = user?.addr || null;
      logger.debug(
        `[migrationTransaction] Attempted to get Flow account from FCL: ${signerFlowAddress || 'null'}`
      );
    } catch (fclError: any) {
      logger.warn(
        `[migrationTransaction] Could not get Flow account from FCL: ${fclError?.message || fclError}`
      );
    }

    // Alternative: Try to extract Flow address from sender if it's in Flow format
    // The sender might be a Flow address converted to EVM format
    // Flow addresses are 16 characters (8 bytes), EVM addresses are 20 bytes
    // If sender starts with 0x000000000000000000000000, the last part might be a Flow address
    if (!signerFlowAddress && sender.startsWith('0x')) {
      const senderWithoutPrefix = sender.slice(2);
      // Check if it looks like a Flow address padded with zeros
      if (senderWithoutPrefix.startsWith('000000000000000000000000')) {
        const possibleFlowAddr = senderWithoutPrefix.slice(-16); // Last 16 chars (8 bytes = Flow address)
        logger.debug(
          `[migrationTransaction] Extracted possible Flow address from sender: 0x${possibleFlowAddr}`
        );
        // Try to get COA from this address
        try {
          const coaAddr = await cadenceService.getAddr(`0x${possibleFlowAddr}`);
          if (coaAddr) {
            actualCoaEvmAddress = coaAddr.startsWith('0x') ? coaAddr : `0x${coaAddr}`;
            signerFlowAddress = `0x${possibleFlowAddr}`;
            logger.debug(
              `[migrationTransaction] ✅ Got COA from extracted Flow address: ${actualCoaEvmAddress}`
            );
          }
        } catch (err) {
          logger.warn(
            `[migrationTransaction] Could not get COA from extracted Flow address: ${err}`
          );
        }
      }
    }

    // If we still don't have the COA, try to get it from the sender directly
    if (!actualCoaEvmAddress && signerFlowAddress) {
      logger.debug(`[migrationTransaction] Flow account signing transaction: ${signerFlowAddress}`);
      // Get the COA EVM address from the Flow account that's signing
      const coaAddr = await cadenceService.getAddr(signerFlowAddress);
      if (coaAddr) {
        actualCoaEvmAddress = coaAddr.startsWith('0x') ? coaAddr : `0x${coaAddr}`;
        logger.debug(
          `[migrationTransaction] ✅ Actual COA EVM address (from signer's Flow account): ${actualCoaEvmAddress}`
        );
      } else {
        logger.warn(
          `[migrationTransaction] ⚠️  No COA found for Flow account ${signerFlowAddress}`
        );
      }
    }

    // Compare with sender parameter
    const senderNormalized = sender.startsWith('0x') ? sender.toLowerCase() : sender.toLowerCase();
    const actualCoaNormalized = actualCoaEvmAddress?.toLowerCase() || '';

    if (actualCoaEvmAddress && senderNormalized !== actualCoaNormalized) {
      logger.error(`[migrationTransaction] ❌❌❌ COA ADDRESS MISMATCH ❌❌❌`);
      logger.error(`[migrationTransaction] Sender param: ${sender}`);
      logger.error(`[migrationTransaction] Actual COA (from signer): ${actualCoaEvmAddress}`);
      logger.error(
        `[migrationTransaction] ⚠️  Tokens must be in the COA at: ${actualCoaEvmAddress}`
      );
      logger.error(`[migrationTransaction] ⚠️  NOT in the COA at: ${sender}`);
    } else if (actualCoaEvmAddress) {
      logger.debug(`[migrationTransaction] ✅ COA addresses match: ${actualCoaEvmAddress}`);
    } else {
      logger.warn(
        `[migrationTransaction] ⚠️  Could not determine actual COA address. The COA executing transfers is from the Flow account that signs the transaction.`
      );
      logger.warn(
        `[migrationTransaction] ⚠️  Make sure tokens are in the COA associated with the Flow account signing this transaction.`
      );
    }

    logger.debug(`[migrationTransaction] Receiver address: ${receiver}`);
    logger.debug('[migrationTransaction] ===== END COA ADDRESS VERIFICATION =====');
  } catch (error: any) {
    logger.error('[migrationTransaction] Failed to verify COA address:', error);
    logger.error('[migrationTransaction] Error details:', error?.message, error?.stack);
  }

  // Process assets in batches of 30 per transaction
  const BATCH_SIZE = 30;
  logger.debug('[migrationTransaction] ===== STARTING BATCHED TRANSACTION PROCESSING =====');
  logger.debug(`[migrationTransaction] Batch size: ${BATCH_SIZE} assets per transaction`);
  const transactionResults: string[] = [];
  const totalAssetsToProcess = trxs.addresses.length;
  const totalBatches = Math.ceil(totalAssetsToProcess / BATCH_SIZE);
  const estimatedMsPerTransaction = estimatedSecondsPerTransaction
    ? estimatedSecondsPerTransaction * 1000
    : null;

  // Initialize progress to 0%
  if (onProgress) {
    onProgress(0, 0, totalAssetsToProcess);
  }

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const startIndex = batchIndex * BATCH_SIZE;
    const endIndex = Math.min(startIndex + BATCH_SIZE, totalAssetsToProcess);
    const batchSize = endIndex - startIndex;
    const batchNumber = batchIndex + 1;

    logger.debug(
      `[migrationTransaction] ===== Processing batch ${batchNumber}/${totalBatches} (assets ${startIndex + 1}-${endIndex}/${totalAssets}) =====`
    );

    // Extract batch data
    const batchAddresses = trxs.addresses.slice(startIndex, endIndex);
    const batchValues = trxs.values.slice(startIndex, endIndex);
    const batchDatas = trxs.datas.slice(startIndex, endIndex);

    logger.debug(`[migrationTransaction] Batch ${batchNumber} contains ${batchSize} assets`);
    logger.debug(`[migrationTransaction] Batch addresses: ${batchAddresses.length}`);
    logger.debug(`[migrationTransaction] Batch values: ${batchValues.length}`);
    logger.debug(`[migrationTransaction] Batch datas: ${batchDatas.length}`);

    try {
      // Process batch transaction (up to 30 assets in one transaction)
      const batchResult = await cadenceService.batchCallContract(
        batchAddresses,
        batchValues,
        batchDatas,
        16_777_216 // evm default gas limit
      );

      logger.debug(
        `[migrationTransaction] ✅ Batch ${batchNumber}/${totalBatches} transaction submitted: ${batchResult}`
      );
      transactionResults.push(batchResult);

      // Wait for transaction to be sealed before proceeding to next batch
      const { waitForTransaction } = await import('@onflow/frw-cadence');
      logger.debug(
        `[migrationTransaction] Waiting for batch ${batchNumber} transaction to be sealed...`
      );
      const txResult = await waitForTransaction(batchResult, 120000, 2000);
      logger.debug(
        `[migrationTransaction] Batch ${batchNumber} transaction sealed - Status: ${txResult.status}`
      );

      if (txResult.status === 5) {
        logger.error(`[migrationTransaction] ⚠️ Batch ${batchNumber} transaction expired`);
      }

      // Update progress callback - jump to estimated time for this batch
      // Each batch processes up to 30 assets, so progress is based on assets processed
      const assetsProcessed = endIndex; // Total assets processed so far
      if (onProgress && estimatedSecondsPerTransaction) {
        const estimatedTotalSeconds = estimatedSecondsPerTransaction * totalAssetsToProcess;
        const estimatedElapsedSeconds = assetsProcessed * estimatedSecondsPerTransaction;
        const estimatedProgress = Math.min(
          99,
          Math.floor((estimatedElapsedSeconds / estimatedTotalSeconds) * 100)
        );
        logger.debug(
          `[migrationTransaction] Jumping progress to estimated time: ${estimatedElapsedSeconds}s / ${estimatedTotalSeconds}s (${estimatedProgress}%) - ${assetsProcessed}/${totalAssetsToProcess} assets`
        );
        onProgress(estimatedProgress, assetsProcessed, totalAssetsToProcess);
      } else {
        // Fallback: use asset count if no timing estimate
        const progressPercent = Math.round((assetsProcessed / totalAssetsToProcess) * 100);
        if (onProgress) {
          onProgress(progressPercent, assetsProcessed, totalAssetsToProcess);
        }
      }

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error: any) {
      logger.error(
        `[migrationTransaction] ❌ Failed to process batch ${batchNumber}/${totalBatches}:`,
        error
      );
      // Continue with next batch even if one fails
      logger.error(`[migrationTransaction] Batch ${batchNumber} transaction failed`, error);

      // Update progress even on failure - jump to estimated time
      const assetsProcessed = endIndex; // Total assets processed so far (including failed batch)
      if (onProgress && estimatedSecondsPerTransaction) {
        const estimatedTotalSeconds = estimatedSecondsPerTransaction * totalAssetsToProcess;
        const estimatedElapsedSeconds = assetsProcessed * estimatedSecondsPerTransaction;
        const estimatedProgress = Math.min(
          99,
          Math.floor((estimatedElapsedSeconds / estimatedTotalSeconds) * 100)
        );
        onProgress(estimatedProgress, assetsProcessed, totalAssetsToProcess);
      } else {
        const progressPercent = Math.round((assetsProcessed / totalAssetsToProcess) * 100);
        if (onProgress) {
          onProgress(progressPercent, assetsProcessed, totalAssetsToProcess);
        }
      }

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log('[migrationTransaction] ===== ALL BATCHED TRANSACTIONS COMPLETED =====');
  console.log(`[migrationTransaction] Total batches: ${transactionResults.length}/${totalBatches}`);
  console.log(`[migrationTransaction] Total assets processed: ${totalAssetsToProcess}`);

  // Ensure progress is at 100% after all transactions complete
  if (onProgress) {
    onProgress(100, totalAssetsToProcess, totalAssetsToProcess);
  }

  // Return the last transaction ID (or first if available) for compatibility
  const res =
    transactionResults.length > 0 ? transactionResults[transactionResults.length - 1] : '';
  logger.info('Migration transaction results:', {
    total: transactionResults.length,
    results: transactionResults,
  });

  // Summary of all transactions
  logger.debug('[migrationTransaction] ===== FINAL MIGRATION SUMMARY =====');
  logger.debug(`[migrationTransaction] Total assets processed: ${totalAssetsToProcess}`);
  logger.debug(`[migrationTransaction] Total batches: ${totalBatches}`);
  logger.debug(
    `[migrationTransaction] Successful batch transactions: ${transactionResults.length}`
  );
  logger.debug(`[migrationTransaction] Transaction IDs:`, transactionResults);
  logger.debug('[migrationTransaction] ===== END FINAL SUMMARY =====');

  return res;
};
