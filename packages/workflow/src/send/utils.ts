import { Interface } from '@ethersproject/abi';
import type { BigNumberish } from '@ethersproject/bignumber';
import { arrayify, hexlify } from '@ethersproject/bytes';
import { keccak256 } from '@ethersproject/keccak256';
import { JsonRpcProvider } from '@ethersproject/providers';
import { serialize, type UnsignedTransaction } from '@ethersproject/transactions';
import { parseUnits } from '@ethersproject/units';
import { logger } from '@onflow/frw-utils';

import type { SendPayload, TransferExecutionHelpers } from './types';

/**
 * Default gas limits for different transaction types
 */
export const GAS_LIMITS = {
  EVM_DEFAULT: 16_777_216,
  CADENCE_DEFAULT: 9999,
} as const;

/**
 * Flow token contract addresses for different networks
 */
const FLOW_TOKEN_VAULT = {
  mainnet: 'A.1654653399040a61.FlowToken.Vault',
  testnet: 'A.7e60df042a9c0868.FlowToken.Vault',
} as const;

/**
 * Checks if a flow identifier is for the Flow token
 * @param flowIdentifier - The flow resource identifier to check
 * @returns True if the identifier is for Flow token, false otherwise
 */
export const isFlowToken = (flowIdentifier: string): boolean => {
  return Object.values(FLOW_TOKEN_VAULT).includes(flowIdentifier as any);
};

export const isVaultIdentifier = (flowIdentifier: string): boolean => {
  const vaultRegex = /^A\.[0-9a-fA-F]{16}\.[a-zA-Z0-9_]+\.(Vault)$/;
  return vaultRegex.test(flowIdentifier);
};

export const isNFTIdentifier = (flowIdentifier: string): boolean => {
  const nftRegex = /^A\.[0-9a-fA-F]{16}\.[a-zA-Z0-9_]+\.(NFT)$/;
  return nftRegex.test(flowIdentifier);
};

export const isCollectionIdentifier = (flowIdentifier: string): boolean => {
  const collectionRegex = /^A\.[0-9a-fA-F]{16}\.[a-zA-Z0-9_]+\.(Collection)$/;
  return collectionRegex.test(flowIdentifier);
};

export const isFlowIdentifier = (flowIdentifier: string): boolean => {
  return (
    isVaultIdentifier(flowIdentifier) ||
    isNFTIdentifier(flowIdentifier) ||
    isCollectionIdentifier(flowIdentifier)
  );
};

/**
 * Gets the Flow token address for a specific network
 * @param network - The network ('mainnet' or 'testnet')
 * @returns The Flow token address for the specified network
 */
export const getFlowTokenVault = (network: 'mainnet' | 'testnet'): string => {
  return FLOW_TOKEN_VAULT[network];
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
    logger.warn('Failed to convert amount to UFix64', error);
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
export const encodeEvmContractCallData = (
  payload: SendPayload,
  returnHex: boolean = false
): number[] | string | string[] => {
  const { type, amount = '', receiver, decimal, ids, sender, coaAddr } = payload;
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
    const iface = new Interface(abi);

    // Encode function call data
    callData = iface.encodeFunctionData('transfer', [receiver, valueBig]);
  } else {
    // NFT transfer (ERC721 or ERC1155)
    if (ids.length === 1) {
      if (amount === '' || Number(amount) === 0) {
        // ERC721 NFT transfer (no amount parameter)
        const tokenId = ids[0];

        // ERC721 transferFrom function ABI
        const abi = ['function safeTransferFrom(address from, address to, uint256 tokenId)'];
        const iface = new Interface(abi);

        // Encode function call data
        callData = iface.encodeFunctionData('safeTransferFrom', [sender, receiver, tokenId]);
      } else {
        // ERC1155 NFT transfer (with amount parameter)
        const tokenId = ids[0];
        const nftAmount = Number(amount);

        // ERC1155 safeTransferFrom function ABI
        const abi = [
          'function safeTransferFrom(address from, address to, uint256 tokenId, uint256 amount, bytes data)',
        ];
        const iface = new Interface(abi);
        callData = iface.encodeFunctionData('safeTransferFrom', [
          sender,
          receiver,
          tokenId,
          nftAmount,
          '0x', // Empty data parameter
        ]);
      }
    } else {
      // batch nft
      const datas: string[] = [];
      for (const tokenId of ids) {
        const abi = ['function safeTransferFrom(address from, address to, uint256 tokenId)'];
        const iface = new Interface(abi);

        // Encode function call data
        callData = iface.encodeFunctionData('safeTransferFrom', [sender, receiver, tokenId]);
        datas.push(callData);
      }
      if (returnHex) {
        return datas;
      }
    }
  }
  if (returnHex) {
    return callData;
  }
  // Convert hex string to byte array
  const hexString = callData.slice(2); // Remove '0x' prefix
  const dataArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    dataArray[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  const regularArray = Array.from(dataArray);

  return regularArray;
};

export const convertHexToByteArray = (hexString: string): number[] => {
  if (hexString.startsWith('0x')) {
    hexString = hexString.slice(2);
  }
  const dataArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    dataArray[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  const regularArray = Array.from(dataArray);

  return regularArray;
};

type SupportedEvmNetwork = 'mainnet' | 'testnet';

const FLOW_EVM_CHAIN_IDS: Record<SupportedEvmNetwork, number> = {
  mainnet: 747,
  testnet: 545,
};

const FLOW_EVM_RPC_ENDPOINTS: Record<SupportedEvmNetwork, string> = {
  mainnet: 'https://mainnet.evm.nodes.onflow.org',
  testnet: 'https://testnet.evm.nodes.onflow.org',
};

const resolveNetworkKey = (network?: string): SupportedEvmNetwork => {
  if (!network) return 'mainnet';
  const normalized = network.toLowerCase();
  return normalized.includes('test') ? 'testnet' : 'mainnet';
};

const resolveChainId = (helpers?: TransferExecutionHelpers): number => {
  return FLOW_EVM_CHAIN_IDS[resolveNetworkKey(helpers?.network)];
};

const resolveRpcUrl = (helpers?: TransferExecutionHelpers): string => {
  return FLOW_EVM_RPC_ENDPOINTS[resolveNetworkKey(helpers?.network)];
};

const providerCache = new Map<string, JsonRpcProvider>();

const getRpcProvider = (helpers?: TransferExecutionHelpers): JsonRpcProvider => {
  const rpcUrl = resolveRpcUrl(helpers);
  let provider = providerCache.get(rpcUrl);
  if (!provider) {
    provider = new JsonRpcProvider(rpcUrl);
    providerCache.set(rpcUrl, provider);
  }
  return provider;
};

const getNonce = async (address: string, helpers?: TransferExecutionHelpers): Promise<number> => {
  const provider = getRpcProvider(helpers);
  return await provider.getTransactionCount(address);
};

export interface LegacyTransactionRequest {
  from: string;
  to: string;
  data?: string;
  value?: BigNumberish;
  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
}

export const signLegacyEvmTransaction = async (
  tx: LegacyTransactionRequest,
  helpers?: TransferExecutionHelpers,
  nonceSteper?: number
): Promise<string> => {
  if (!helpers?.ethSign) {
    throw new Error('ethSign helper is required for EVM transaction signing');
  }

  if (!tx.from || !tx.to) {
    throw new Error('EVM transaction requires both from and to addresses');
  }

  const [nonce, chainId] = await Promise.all([
    getNonce(tx.from, helpers),
    Promise.resolve(resolveChainId(helpers)),
  ]);

  const gasLimit = tx.gasLimit ?? GAS_LIMITS.EVM_DEFAULT;
  const gasPrice = tx.gasPrice ?? helpers?.gasPrice ?? 0;

  const unsignedTx: UnsignedTransaction = {
    type: 0,
    chainId,
    nonce: nonceSteper && nonceSteper > 0 ? nonce + nonceSteper : nonce,
    gasPrice,
    gasLimit,
    to: tx.to,
    value: tx.value ?? 0,
    data: tx.data ?? '0x',
  };

  const serializedUnsigned = serialize(unsignedTx);
  const digest = arrayify(keccak256(serializedUnsigned));
  const signatureBytes = await helpers.ethSign(digest);
  const signatureHex = hexlify(signatureBytes);

  return serialize(unsignedTx, signatureHex);
};
