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
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('[migrationTransaction] ===== MIGRATION TRANSACTION START =====');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('[migrationTransaction] Sender:', sender);
  console.log('[migrationTransaction] Receiver:', receiver);

  // Comprehensive FT (Fungible Token) logging - PRINT ALL FTs HERE
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('[migrationTransaction] ===== ALL FUNGIBLE TOKENS (FT) DETAILS =====');
  console.log('═══════════════════════════════════════════════════════════════');
  if (assets.erc20 && assets.erc20.length > 0) {
    console.log(`[migrationTransaction] Total ERC20/FT tokens: ${assets.erc20.length}`);
    console.log('[migrationTransaction] Full ERC20/FT token list:');
    assets.erc20.forEach((token, index) => {
      const isFlow = token.address === '0x0000000000000000000000000000000000000000';
      const symbol = isFlow ? 'FLOW' : token.address;
      console.log(`  [${index + 1}] Token Details:`);
      console.log(`      Symbol/Address: ${symbol}`);
      console.log(`      Contract Address: ${token.address}`);
      console.log(`      Amount: ${token.amount}`);
      console.log(`      Amount Type: ${typeof token.amount}`);
      console.log(`      Is FLOW Token: ${isFlow}`);
      // Log raw JSON for debugging
      console.log(`      Raw Token Data:`, JSON.stringify(token, null, 2));
    });
    console.log('[migrationTransaction] ERC20/FT Summary:');
    console.log(
      `  - FLOW tokens: ${assets.erc20.filter((t) => t.address === '0x0000000000000000000000000000000000000000').length}`
    );
    console.log(
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
      console.log(`  - Total FLOW amount: ${totalFlow}`);
    }
  } else {
    console.log('[migrationTransaction] ERC20/FT Tokens: None');
  }
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('[migrationTransaction] ===== END FT DETAILS =====');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

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

  // Final summary: Compare received vs sent
  console.log('[migrationTransaction] ===== FINAL FT MIGRATION SUMMARY =====');
  console.log(`[migrationTransaction] FTs received in assets: ${assets.erc20?.length ?? 0}`);
  console.log(`[migrationTransaction] FTs in transaction: ${trxs.addresses.length}`);
  console.log(`[migrationTransaction] ERC721 NFTs: ${assets.erc721?.length ?? 0}`);
  console.log(`[migrationTransaction] ERC1155 Tokens: ${assets.erc1155?.length ?? 0}`);

  if (assets.erc20 && assets.erc20.length > 0) {
    const flowCount = assets.erc20.filter(
      (t) => t.address === '0x0000000000000000000000000000000000000000'
    ).length;
    const erc20Count = assets.erc20.length - flowCount;
    console.log(`[migrationTransaction] Breakdown:`);
    console.log(`  - FLOW tokens: ${flowCount}`);
    console.log(`  - ERC20 tokens: ${erc20Count}`);

    // List all FT addresses for verification
    console.log('[migrationTransaction] All FT addresses being migrated:');
    assets.erc20.forEach((token, idx) => {
      const isFlow = token.address === '0x0000000000000000000000000000000000000000';
      console.log(`  ${idx + 1}. ${isFlow ? 'FLOW' : token.address}: ${token.amount}`);
    });
  }

  console.log('[migrationTransaction] ===== END FINAL SUMMARY =====');
  console.log('[migrationTransaction] ===== CALLING batchCallContract =====');
  console.log('[migrationTransaction] Gas limit: 16777216');

  // CRITICAL: Verify what we're passing to batchCallContract
  console.log('[migrationTransaction] ===== PRE-CALL VERIFICATION =====');
  console.log(`[migrationTransaction] Addresses count: ${trxs.addresses.length}`);
  console.log(`[migrationTransaction] Values count: ${trxs.values.length}`);
  console.log(`[migrationTransaction] Datas count: ${trxs.datas.length}`);

  // Verify each data array
  trxs.datas.forEach((data, index) => {
    console.log(`[migrationTransaction] Data ${index + 1}:`);
    console.log(`  Length: ${data.length} bytes`);
    console.log(`  First 20 bytes: [${data.slice(0, 20).join(', ')}]`);
    // Reconstruct hex to verify
    const reconstructedHex = '0x' + data.map((b) => b.toString(16).padStart(2, '0')).join('');
    console.log(`  Reconstructed hex (first 100 chars): ${reconstructedHex.substring(0, 100)}...`);

    // Try to decode if it's an ERC20 transfer
    if (
      index < assets.erc20?.length &&
      assets.erc20[index].address !== '0x0000000000000000000000000000000000000000'
    ) {
      try {
        const { Interface } = require('@ethersproject/abi');
        const abi = ['function transfer(address to, uint256 value)'];
        const iface = new Interface(abi);
        const decoded = iface.decodeFunctionData('transfer', reconstructedHex);
        console.log(`  ✅ Decoded amount: ${decoded.value.toString()}`);
        console.log(`  ✅ Decoded receiver: ${decoded.to}`);
        console.log(`  ✅ Original amount: ${assets.erc20[index].amount}`);
        if (decoded.value.toString() !== assets.erc20[index].amount) {
          console.error(`  ❌❌❌ AMOUNT MISMATCH IN FINAL DATA! ❌❌❌`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to decode:`, error);
      }
    }
  });
  console.log('[migrationTransaction] ===== END PRE-CALL VERIFICATION =====');

  // Verify data types and structure
  console.log('[migrationTransaction] ===== DATA TYPE VERIFICATION =====');
  console.log(
    `[migrationTransaction] addresses type: ${Array.isArray(trxs.addresses) ? 'Array' : typeof trxs.addresses}`
  );
  console.log(
    `[migrationTransaction] values type: ${Array.isArray(trxs.values) ? 'Array' : typeof trxs.values}`
  );
  console.log(
    `[migrationTransaction] datas type: ${Array.isArray(trxs.datas) ? 'Array' : typeof trxs.datas}`
  );
  console.log(
    `[migrationTransaction] datas[0] type: ${Array.isArray(trxs.datas[0]) ? 'Array' : typeof trxs.datas[0]}`
  );
  console.log(`[migrationTransaction] datas[0][0] type: ${typeof trxs.datas[0]?.[0]}`);
  console.log(
    `[migrationTransaction] datas[0] sample: [${trxs.datas[0]?.slice(0, 10).join(', ')}...]`
  );

  // Verify all data arrays are valid number arrays
  let invalidDataFound = false;
  trxs.datas.forEach((data, idx) => {
    if (!Array.isArray(data)) {
      console.error(`[migrationTransaction] ❌ Data ${idx} is not an array:`, typeof data, data);
      invalidDataFound = true;
    } else {
      const invalidItems = data.filter(
        (item) => typeof item !== 'number' || isNaN(item) || item < 0 || item > 255
      );
      if (invalidItems.length > 0) {
        console.error(
          `[migrationTransaction] ❌ Data ${idx} has invalid items:`,
          invalidItems.slice(0, 5)
        );
        invalidDataFound = true;
      }
    }
  });

  if (invalidDataFound) {
    console.error(
      '[migrationTransaction] ❌❌❌ INVALID DATA DETECTED - THIS WILL CAUSE TRANSACTION TO FAIL ❌❌❌'
    );
  } else {
    console.log('[migrationTransaction] ✅ All data arrays are valid');
  }
  console.log('[migrationTransaction] ===== END DATA TYPE VERIFICATION =====');

  // Verify COA EVM address matches sender
  console.log('[migrationTransaction] ===== COA ADDRESS VERIFICATION =====');
  console.log(`[migrationTransaction] Sender address (from params): ${sender}`);

  let actualCoaEvmAddress: string | null = null;
  let signerFlowAddress: string | null = null;

  try {
    // Try to get the Flow account that will sign the transaction
    // This is the account whose COA will actually execute the transfers
    try {
      const fcl = await import('@onflow/fcl');
      const user = await fcl.currentUser.snapshot();
      signerFlowAddress = user?.addr || null;
      console.log(
        `[migrationTransaction] Attempted to get Flow account from FCL: ${signerFlowAddress || 'null'}`
      );
    } catch (fclError: any) {
      console.warn(
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
        console.log(
          `[migrationTransaction] Extracted possible Flow address from sender: 0x${possibleFlowAddr}`
        );
        // Try to get COA from this address
        try {
          const coaAddr = await cadenceService.getAddr(`0x${possibleFlowAddr}`);
          if (coaAddr) {
            actualCoaEvmAddress = coaAddr.startsWith('0x') ? coaAddr : `0x${coaAddr}`;
            signerFlowAddress = `0x${possibleFlowAddr}`;
            console.log(
              `[migrationTransaction] ✅ Got COA from extracted Flow address: ${actualCoaEvmAddress}`
            );
          }
        } catch (err) {
          console.warn(
            `[migrationTransaction] Could not get COA from extracted Flow address: ${err}`
          );
        }
      }
    }

    // If we still don't have the COA, try to get it from the sender directly
    if (!actualCoaEvmAddress && signerFlowAddress) {
      console.log(`[migrationTransaction] Flow account signing transaction: ${signerFlowAddress}`);
      // Get the COA EVM address from the Flow account that's signing
      const coaAddr = await cadenceService.getAddr(signerFlowAddress);
      if (coaAddr) {
        actualCoaEvmAddress = coaAddr.startsWith('0x') ? coaAddr : `0x${coaAddr}`;
        console.log(
          `[migrationTransaction] ✅ Actual COA EVM address (from signer's Flow account): ${actualCoaEvmAddress}`
        );
      } else {
        console.warn(
          `[migrationTransaction] ⚠️  No COA found for Flow account ${signerFlowAddress}`
        );
      }
    }

    // Compare with sender parameter
    const senderNormalized = sender.startsWith('0x') ? sender.toLowerCase() : sender.toLowerCase();
    const actualCoaNormalized = actualCoaEvmAddress?.toLowerCase() || '';

    if (actualCoaEvmAddress && senderNormalized !== actualCoaNormalized) {
      console.error(`[migrationTransaction] ❌❌❌ COA ADDRESS MISMATCH ❌❌❌`);
      console.error(`[migrationTransaction] Sender param: ${sender}`);
      console.error(`[migrationTransaction] Actual COA (from signer): ${actualCoaEvmAddress}`);
      console.error(
        `[migrationTransaction] ⚠️  Tokens must be in the COA at: ${actualCoaEvmAddress}`
      );
      console.error(`[migrationTransaction] ⚠️  NOT in the COA at: ${sender}`);
    } else if (actualCoaEvmAddress) {
      console.log(`[migrationTransaction] ✅ COA addresses match: ${actualCoaEvmAddress}`);
    } else {
      console.warn(
        `[migrationTransaction] ⚠️  Could not determine actual COA address. The COA executing transfers is from the Flow account that signs the transaction.`
      );
      console.warn(
        `[migrationTransaction] ⚠️  Make sure tokens are in the COA associated with the Flow account signing this transaction.`
      );
    }

    console.log(`[migrationTransaction] Receiver address: ${receiver}`);
    console.log('[migrationTransaction] ===== END COA ADDRESS VERIFICATION =====');
  } catch (error: any) {
    console.error('[migrationTransaction] Failed to verify COA address:', error);
    console.error('[migrationTransaction] Error details:', error?.message, error?.stack);
  }

  const res = await cadenceService.batchCallContract(
    trxs.addresses,
    trxs.values,
    trxs.datas,
    16_777_216 // evm default gas limit
  );

  logger.info('Migration transaction result:', res);

  // Wait for transaction to be sealed and log events
  try {
    const { waitForTransaction } = await import('@onflow/frw-cadence');
    console.log('[migrationTransaction] Waiting for transaction to be sealed...');
    const txResult = await waitForTransaction(res, 120000, 2000);
    console.log('[migrationTransaction] ===== TRANSACTION RESULT =====');
    console.log(`[migrationTransaction] Status: ${txResult.status} (4=sealed, 5=expired)`);
    console.log(`[migrationTransaction] Status Code: ${txResult.statusCode}`);
    if (txResult.errorMessage) {
      console.log(`[migrationTransaction] Error Message: ${txResult.errorMessage}`);
    }
    console.log(`[migrationTransaction] Events count: ${txResult.events?.length || 0}`);

    // Parse EVM.TransactionExecuted events to show which transfers succeeded/failed
    const evmEvents =
      txResult.events?.filter((e) => e.type.includes('EVM.TransactionExecuted')) || [];
    if (evmEvents.length > 0) {
      console.log('[migrationTransaction] ===== EVM TRANSFER RESULTS =====');
      // Use the addresses from the transaction data to match with events
      // Events are in the same order as the addresses array
      const transactionAddresses = trxs.addresses || [];
      console.log(`[migrationTransaction] Total EVM events: ${evmEvents.length}`);
      console.log(
        `[migrationTransaction] Total transaction addresses: ${transactionAddresses.length}`
      );
      console.log(`[migrationTransaction] Receiver address: ${receiver}`);

      // Debug: Log all events first to see their error codes
      console.log('[migrationTransaction] Raw EVM events (for debugging):');
      evmEvents.forEach((event, idx) => {
        const data = event.data as any;
        const errorCode = data?.errorCode;
        console.log(
          `  Event [${idx + 1}]: errorCode=${JSON.stringify(errorCode)} (type: ${typeof errorCode}), isZero=${errorCode === 0 || errorCode === '0'}`
        );
      });

      evmEvents.forEach((event, idx) => {
        const data = event.data as any;
        const errorCode = data?.errorCode;
        const errorMessage = data?.errorMessage || '';

        // Use the address from the transaction data (events are in the same order)
        const contractAddr = transactionAddresses[idx] || 'unknown';
        const originalAmount =
          assets.erc20?.[idx]?.amount ||
          assets.erc721?.[idx - (assets.erc20?.length || 0)]?.id ||
          'N/A';
        const isNFT = idx >= (assets.erc20?.length || 0);

        // Check success: errorCode should be 0 (number) or "0" (string)
        // Also handle null/undefined as failure
        const isSuccess = errorCode === 0 || errorCode === '0';
        const status = isSuccess ? '✅ SUCCESS' : '❌ FAILED';
        console.log(
          `  [${idx + 1}] ${status} - ${isNFT ? 'NFT' : 'ERC20'} Contract: ${contractAddr}`
        );
        if (!isNFT) {
          console.log(`      Amount: ${originalAmount}`);
        } else {
          console.log(`      Token ID: ${originalAmount}`);
        }
        console.log(`      Receiver: ${receiver}`);
        console.log(
          `      ⚠️  NOTE: Actual COA address is from signer's Flow account /storage/evm`
        );
        console.log(
          `      ⚠️  Sender param (${sender}) may differ from actual COA executing transfers`
        );
        if (!isSuccess) {
          console.log(`      Error Code: ${errorCode}`);
          console.log(`      Error Message: ${errorMessage}`);
          // Common causes of "execution reverted":
          if (errorMessage.includes('execution reverted')) {
            console.log(`      ⚠️  Possible causes:`);
            console.log(
              `         - COA address mismatch: tokens in different COA than signer's Flow account`
            );
            console.log(`         - Insufficient balance in COA EVM account`);
            console.log(`         - Token contract paused or restricted`);
            console.log(`         - Receiver address blacklisted or invalid`);
            console.log(`         - Amount exceeds token contract limits`);
            if (errorMessage.includes('arithmetic')) {
              console.log(
                `         - ⚠️  ARITHMETIC ERROR: Amount calculation issue in token contract`
              );
            }
          }
        } else {
          console.log(`      Gas Used: ${data?.gasConsumed || 'N/A'}`);
        }
      });
      console.log('[migrationTransaction] ===== END EVM TRANSFER RESULTS =====');
    }

    if (txResult.events && txResult.events.length > 0) {
      console.log('[migrationTransaction] All transaction events:');
      txResult.events.forEach((event, idx) => {
        console.log(`  [${idx + 1}] Type: ${event.type}`);
        console.log(`      Transaction ID: ${event.transactionId}`);
        console.log(`      Transaction Index: ${event.transactionIndex}`);
        if (event.type.includes('EVM.TransactionExecuted')) {
          const data = event.data as any;
          console.log(`      Error Code: ${data?.errorCode || 'N/A'}`);
          console.log(`      Error Message: ${data?.errorMessage || 'N/A'}`);
        } else {
          console.log(`      Data:`, JSON.stringify(event.data, null, 2));
        }
      });
    }
    console.log('[migrationTransaction] ===== END TRANSACTION RESULT =====');
  } catch (error) {
    console.error('[migrationTransaction] Error waiting for transaction:', error);
  }

  return res;
};
