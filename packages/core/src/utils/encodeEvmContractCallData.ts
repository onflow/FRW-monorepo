import BN from 'bignumber.js';
import { ethers, parseUnits } from 'ethers';

import { type NftTransactionState, type TransactionState } from '@onflow/frw-shared/types';
/**
 * Encodes EVM contract call data for token and NFT transfers
 * Supports ERC20, ERC721, and ERC1155 standards
 * @param payload - SendPayload containing transfer details
 * @returns Array of bytes representing the encoded function call
 * @throws Error if receiver address is invalid
 */
export const encodeEvmContractCallDataForToken = (payload: TransactionState): string => {
  const { amount = '', toAddress, tokenInfo } = payload;
  const to = toAddress.toLowerCase().replace(/^0x/, '');
  if (to.length !== 40) throw new Error('Invalid Ethereum address');
  let callData = '0x';

  // ERC20 token transfer
  const value = BN(amount).multipliedBy(BN(10).pow(tokenInfo.decimals));
  // Convert value with proper decimal handling
  const valueBig = parseUnits(value.toString(), tokenInfo.decimals);
  // ERC20 transfer function ABI
  const abi = ['function transfer(address to, uint256 value)'];
  const iface = new ethers.Interface(abi);

  // Encode function call data
  callData = iface.encodeFunctionData('transfer', [to, valueBig]);

  return callData;
};

export const encodeEvmContractCallDataForNft = (payload: NftTransactionState): string => {
  const { amount = '', toAddress, ids, fromAddress } = payload;
  const to = toAddress.toLowerCase().replace(/^0x/, '');
  if (to.length !== 40) throw new Error('Invalid Ethereum address');
  let callData = '0x';

  // NFT transfer (ERC721 or ERC1155)
  if (ids.length === 1) {
    if (amount === '') {
      // ERC721 NFT transfer (no amount parameter)
      const tokenId = ids[0];

      // ERC721 transferFrom function ABI
      const abi = ['function safeTransferFrom(address from, address to, uint256 tokenId)'];
      const iface = new ethers.Interface(abi);

      // Encode function call data
      callData = iface.encodeFunctionData('transferFrom', [fromAddress, to, tokenId]);
    } else {
      // ERC1155 NFT transfer (with amount parameter)
      const tokenId = ids[0];

      // ERC1155 safeTransferFrom function ABI
      const abi = [
        'function safeTransferFrom(address from, address to, uint256 tokenId, uint256 amount, bytes data)',
      ];
      const iface = new ethers.Interface(abi);
      callData = iface.encodeFunctionData('safeTransferFrom', [
        fromAddress,
        to,
        tokenId,
        amount,
        '0x', // Empty data parameter
      ]);
    }
  }

  return callData;
};
