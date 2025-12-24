import { Interface } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import type { TransactionDatas, MigrationAssetsData } from '@onflow/frw-types';
import { isValidEthereumAddress } from '@onflow/frw-utils';
import { validateEvmAddress } from '@onflow/frw-workflow';

export const convertHexToArr = (callData: string): number[] => {
  const hexString = callData.slice(2); // Remove '0x' prefix
  const dataArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    dataArray[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }
  const regularArray = Array.from(dataArray);

  return regularArray;
};

export const encodeContractCallData = (
  type: string,
  receiver: string,
  amount: string | number,
  sender: string,
  id?: string
): string => {
  let callData = '0x';

  if (type === 'erc20') {
    const abi = ['function transfer(address to, uint256 value)'];
    const iface = new Interface(abi);
    // Convert amount to BigNumber to handle large numbers correctly
    // Amount is already in the smallest unit (wei-like), so we use it directly
    let valueBig: BigNumber;
    const amountStr = typeof amount === 'string' ? amount : amount.toString();

    // Validate and convert amount string
    if (!amountStr || amountStr === '0' || amountStr === '') {
      throw new Error(`Invalid amount for ERC20 transfer: ${amountStr}`);
    }

    try {
      // Remove any whitespace and ensure it's a valid number string
      const cleanAmount = amountStr.trim();
      valueBig = BigNumber.from(cleanAmount);

      // Verify it's not zero
      if (valueBig.isZero()) {
        throw new Error(`Amount is zero: ${cleanAmount}`);
      }

      console.log(
        `[encodeContractCallData] ERC20 encoding - Amount string: ${amountStr}, BigNumber: ${valueBig.toString()}, Hex: ${valueBig.toHexString()}`
      );
    } catch (error) {
      console.error(`[encodeContractCallData] ❌ Failed to convert amount to BigNumber:`, {
        amount,
        amountStr,
        error,
      });
      throw new Error(`Failed to convert amount to BigNumber: ${amountStr} - ${error}`);
    }

    callData = iface.encodeFunctionData('transfer', [receiver, valueBig]);

    // Verify the encoding by decoding it back
    try {
      const decoded = iface.decodeFunctionData('transfer', callData);
      console.log(
        `[encodeContractCallData] ✅ Verification - Decoded amount: ${decoded.value.toString()}, Original: ${amount}`
      );
      if (decoded.value.toString() !== amount) {
        console.error(
          `[encodeContractCallData] ❌ ERROR - Amount mismatch! Original: ${amount}, Decoded: ${decoded.value.toString()}`
        );
      }
    } catch (error) {
      console.error(`[encodeContractCallData] ❌ Failed to verify encoding:`, error);
    }
  } else if (type === 'erc721') {
    const abi = ['function safeTransferFrom(address from, address to, uint256 tokenId)'];
    const iface = new Interface(abi);

    // Encode function call data
    callData = iface.encodeFunctionData('safeTransferFrom', [sender, receiver, id]);
  } else if (type === 'erc1155') {
    const abi = [
      'function safeTransferFrom(address from, address to, uint256 tokenId, uint256 amount, bytes data)',
    ];
    const iface = new Interface(abi);
    callData = iface.encodeFunctionData('safeTransferFrom', [
      sender,
      receiver,
      id,
      amount,
      '0x', // Empty data parameter
    ]);
  }
  return callData;
};

export const convertAssetsToCalldata = (
  assets: MigrationAssetsData,
  sender: string,
  receiver: string
): TransactionDatas => {
  if (!isValidEthereumAddress(receiver)) {
    throw new Error('Invalid receiver address');
  }

  const { erc20 = [], erc721 = [], erc1155 = [] } = assets;

  // Log all FTs being processed - VERY VISIBLE
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('[convertAssetsToCalldata] ===== PROCESSING FUNGIBLE TOKENS =====');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`[convertAssetsToCalldata] Total ERC20/FT tokens received: ${erc20.length}`);
  if (erc20.length > 0) {
    console.log('[convertAssetsToCalldata] All FT tokens being converted:');
    erc20.forEach((token, index) => {
      const isFlow = token.address === '0x0000000000000000000000000000000000000000';
      console.log(`  [${index + 1}] FT Token:`);
      console.log(`      Address: ${token.address}`);
      console.log(`      Amount: ${token.amount}`);
      console.log(`      Is FLOW: ${isFlow}`);
      console.log(`      Amount validation: ${Number(token.amount) > 0 ? 'VALID' : 'INVALID'}`);
    });
  } else {
    console.log('[convertAssetsToCalldata] ⚠️ WARNING: No ERC20/FT tokens to process!');
  }

  const addresses: string[] = [];
  const values: string[] = [];
  const calldatas: string[] = []; // call data strings

  const datas: number[][] = []; // call datas arr

  let processedCount = 0;
  let skippedCount = 0;
  const skippedTokens: Array<{ address: string; amount: string; reason: string }> = [];

  for (const asset of erc20) {
    const { address, amount } = asset;

    if (!validateEvmAddress(address)) {
      skippedCount++;
      skippedTokens.push({ address, amount, reason: 'Invalid EVM address' });
      console.warn(`[convertAssetsToCalldata] ⚠️ Skipping FT token - Invalid EVM address:`, {
        address,
        amount,
      });
      continue;
    }
    if (Number(amount) <= 0) {
      skippedCount++;
      skippedTokens.push({ address, amount, reason: 'Invalid amount (<= 0)' });
      console.warn(`[convertAssetsToCalldata] ⚠️ Skipping FT token - Invalid amount:`, {
        address,
        amount,
      });
      continue;
    }

    processedCount++;
    console.log(`[convertAssetsToCalldata] Processing FT ${processedCount}/${erc20.length}:`, {
      address,
      amount,
      isFlow: address === '0x0000000000000000000000000000000000000000',
    });

    // Flow token todo as gas fee token, need remain the
    if (address === '0x0000000000000000000000000000000000000000') {
      calldatas.push('0x');
      addresses.push(receiver);
      values.push(amount);
      console.log(`[convertAssetsToCalldata] FLOW token added - Value: ${amount}`);
    } else {
      // Log before encoding to verify amount
      console.log(
        `[convertAssetsToCalldata] About to encode ERC20 - Address: ${address}, Amount: ${amount}, Amount type: ${typeof amount}`
      );
      const callData = encodeContractCallData('erc20', receiver, amount, sender);
      calldatas.push(callData);
      values.push('0.0');
      addresses.push(address);
      console.log(
        `[convertAssetsToCalldata] ERC20 token added - Address: ${address}, Amount: ${amount}, Calldata: ${callData.substring(0, 20)}..., Calldata length: ${callData.length}`
      );
    }
  }

  // Log summary
  console.log('[convertAssetsToCalldata] ===== FT PROCESSING SUMMARY =====');
  console.log(`[convertAssetsToCalldata] Total received: ${erc20.length}`);
  console.log(`[convertAssetsToCalldata] Successfully processed: ${processedCount}`);
  console.log(`[convertAssetsToCalldata] Skipped: ${skippedCount}`);
  if (skippedTokens.length > 0) {
    console.log('[convertAssetsToCalldata] Skipped tokens:');
    skippedTokens.forEach((token, idx) => {
      console.log(`  [${idx + 1}] ${token.address}: ${token.amount} - Reason: ${token.reason}`);
    });
  }
  console.log(`[convertAssetsToCalldata] Final transaction count: ${addresses.length}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('[convertAssetsToCalldata] ===== END FT PROCESSING =====');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  for (const asset of erc721) {
    const { address, id } = asset;
    if (!validateEvmAddress(address)) {
      throw new Error('Invalid EVM address');
    }
    addresses.push(address);
    values.push('0.0');
    calldatas.push(encodeContractCallData('erc721', receiver, 0, sender, id));
  }

  for (const asset of erc1155) {
    const { address, id, amount } = asset;
    if (!validateEvmAddress(asset.address)) {
      throw new Error('Invalid erc1155 address');
    }
    if (Number(amount) <= 0) {
      throw new Error('Invalid erc1155 amount');
    }
    addresses.push(address);
    values.push('0.0');
    calldatas.push(encodeContractCallData('erc1155', receiver, Number(amount), sender, id));
  }

  // Verify all ERC20 calldata before converting
  console.log('[convertAssetsToCalldata] ===== VERIFYING ALL ERC20 CALLDATA =====');
  const abi = ['function transfer(address to, uint256 value)'];
  const iface = new Interface(abi);

  let erc20Index = 0;
  for (let i = 0; i < erc20.length; i++) {
    const token = erc20[i];
    if (token.address !== '0x0000000000000000000000000000000000000000') {
      const calldata = calldatas[erc20Index];
      try {
        const decoded = iface.decodeFunctionData('transfer', calldata);
        console.log(`[convertAssetsToCalldata] ERC20 ${erc20Index + 1} Verification:`);
        console.log(`  Address: ${token.address}`);
        console.log(`  Original amount: ${token.amount}`);
        console.log(`  Decoded amount: ${decoded.value.toString()}`);
        console.log(`  Decoded receiver: ${decoded.to}`);
        console.log(`  Calldata: ${calldata}`);
        if (decoded.value.toString() !== token.amount) {
          console.error(
            `  ❌ MISMATCH! Original: ${token.amount}, Decoded: ${decoded.value.toString()}`
          );
        } else {
          console.log(`  ✅ Amount matches!`);
        }
      } catch (error) {
        console.error(
          `[convertAssetsToCalldata] ❌ Failed to decode calldata for ${token.address}:`,
          error
        );
        console.error(`  Calldata: ${calldata}`);
      }
      erc20Index++;
    }
  }
  console.log('[convertAssetsToCalldata] ===== END VERIFICATION =====');

  // convert data to arr
  console.log('[convertAssetsToCalldata] ===== CONVERTING CALLDATA TO BYTE ARRAYS =====');
  for (let i = 0; i < calldatas.length; i++) {
    const hexCalldata = calldatas[i];
    const byteArray = convertHexToArr(hexCalldata);
    datas.push(byteArray);

    // Verify ERC20 calldata after conversion
    if (i < erc20.length && erc20[i].address !== '0x0000000000000000000000000000000000000000') {
      // Convert back to hex to verify
      const reconstructedHex =
        '0x' + byteArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      try {
        const decoded = iface.decodeFunctionData('transfer', reconstructedHex);
        console.log(`[convertAssetsToCalldata] Post-conversion verification ${i + 1}:`);
        console.log(`  Original hex: ${hexCalldata.substring(0, 50)}...`);
        console.log(`  Reconstructed hex: ${reconstructedHex.substring(0, 50)}...`);
        console.log(
          `  Match: ${hexCalldata.toLowerCase() === reconstructedHex.toLowerCase() ? '✅' : '❌'}`
        );
        console.log(`  Decoded amount: ${decoded.value.toString()}`);
        console.log(`  Original amount: ${erc20[i].amount}`);
        if (decoded.value.toString() !== erc20[i].amount) {
          console.error(`  ❌ AMOUNT MISMATCH AFTER CONVERSION!`);
        }
      } catch (error) {
        console.error(`[convertAssetsToCalldata] ❌ Failed to verify after conversion:`, error);
      }
    }
  }
  console.log('[convertAssetsToCalldata] ===== END BYTE ARRAY CONVERSION =====');

  return {
    addresses,
    values,
    datas,
  };
};
