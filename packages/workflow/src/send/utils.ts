import { ethers, parseUnits } from 'ethers';

import type { SendPayload } from './types';

/**
 * Default gas limits for different transaction types
 */
export const GAS_LIMITS = {
  EVM_DEFAULT: 30_000_000,
  CADENCE_DEFAULT: 9999,
} as const;

/**
 * Flow token contract addresses for different networks
 */
const FLOW_TOKEN_ADDRESSES = {
  mainnet: 'A.1654653399040a61.FlowToken',
  testnet: 'A.7e60df042a9c0868.FlowToken',
} as const;

/**
 * Checks if a flow identifier is for the Flow token
 * @param flowIdentifier - The flow resource identifier to check
 * @returns True if the identifier is for Flow token, false otherwise
 */
export const isFlowToken = (flowIdentifier: string): boolean => {
  return Object.values(FLOW_TOKEN_ADDRESSES).includes(flowIdentifier as any);
};

/**
 * Gets the Flow token address for a specific network
 * @param network - The network ('mainnet' or 'testnet')
 * @returns The Flow token address for the specified network
 */
export const getFlowTokenAddress = (network: 'mainnet' | 'testnet'): string => {
  return FLOW_TOKEN_ADDRESSES[network];
};

/**
 * Converts an amount to a validated UFix64 string for Flow blockchain transactions
 * UFix64 requires exactly one decimal point and at most 8 decimal places
 * @param amount - The amount as number or string
 * @returns Validated UFix64 string value
 * @throws Error if the amount doesn't meet UFix64 requirements
 */
export const convertToUFix64 = (amount: number | string): string => {
  // Convert to number first
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Check if it's a valid number
  if (isNaN(numAmount)) {
    throw new Error('Invalid number for UFix64 conversion');
  }

  // Use toFixed(8) to ensure exactly 8 decimal places
  return numAmount.toFixed(8);
};

/**
 * Safely converts an amount to UFix64, returning a default value if conversion fails
 * @param amount - The amount as number or string
 * @param defaultValue - Default value to return if conversion fails (default: "0.00000000")
 * @returns Validated UFix64 string value or default value
 */
export const safeConvertToUFix64 = (
  amount: number | string,
  defaultValue: string = '0.00000000'
): string => {
  try {
    return convertToUFix64(amount);
  } catch (error) {
    console.warn('Failed to convert amount to UFix64:', error);
    return defaultValue;
  }
};

/**
 * Encodes EVM contract call data for token and NFT transfers
 * Supports ERC20, ERC721, and ERC1155 standards
 * @param payload - SendPayload containing transfer details
 * @returns Array of bytes representing the encoded function call
 * @throws Error if receiver address is invalid
 */
export const encodeEvmContractCallData = (payload: SendPayload): number[] => {
  const { type, amount = '', receiver, decimal, ids, sender } = payload;
  // const to = receiver.toLowerCase().replace(/^0x/, '');
  if (receiver.length !== 42) throw new Error('Invalid Ethereum address');
  let callData = '0x';

  if (type === 'token') {
    // ERC20 token transfer
    const value = Number(amount);
    // Convert value with proper decimal handling
    const valueBig = parseUnits(value.toString(), decimal);
    // ERC20 transfer function ABI
    const abi = ['function transfer(address to, uint256 value)'];
    const iface = new ethers.Interface(abi);

    // Encode function call data
    callData = iface.encodeFunctionData('transfer', [receiver, valueBig]);
  } else {
    // NFT transfer (ERC721 or ERC1155)
    if (ids.length === 1) {
      if (amount === '') {
        // ERC721 NFT transfer (no amount parameter)
        const tokenId = ids[0];

        // ERC721 transferFrom function ABI
        const abi = ['function safeTransferFrom(address from, address to, uint256 tokenId)'];
        const iface = new ethers.Interface(abi);

        // Encode function call data
        callData = iface.encodeFunctionData('safeTransferFrom', [sender, receiver, tokenId]);
      } else {
        // ERC1155 NFT transfer (with amount parameter)
        const tokenId = ids[0];

        // ERC1155 safeTransferFrom function ABI
        const abi = [
          'function safeTransferFrom(address from, address to, uint256 tokenId, uint256 amount, bytes data)',
        ];
        const iface = new ethers.Interface(abi);
        callData = iface.encodeFunctionData('safeTransferFrom', [
          sender,
          receiver,
          tokenId,
          amount,
          '0x', // Empty data parameter
        ]);
      }
    }
  }

  // Convert hex string to byte array
  const dataBuffer = Buffer.from(callData.slice(2), 'hex');
  const dataArray = Uint8Array.from(dataBuffer);
  const regularArray = Array.from(dataArray);

  return regularArray;
};
