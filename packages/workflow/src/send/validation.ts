import type { SendPayload } from './types';
import { isNFTIdentifier, isVaultIdentifier } from './utils';

/**
 * Validates Flow blockchain addresses (0x + 16 hex characters)
 * @param address - Address to validate
 * @returns true if valid Flow address format
 */
export const validateFlowAddress = (address: string): boolean => {
  const flowAddressRegex = /^0x[a-fA-F0-9]{16}$/;
  return flowAddressRegex.test(address);
};

/**
 * Validates EVM addresses (0x + 40 hex characters)
 * @param address - Address to validate
 * @returns true if valid EVM address format
 */
export const validateEvmAddress = (address: string): boolean => {
  const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return evmAddressRegex.test(address);
};

/**
 * Validates token-specific payload requirements
 * @param payload - SendPayload to validate
 * @throws Error if token amount is invalid or decimal is missing
 */
export const validateTokenPayload = (payload: SendPayload): void => {
  if (payload.flowIdentifier && !isVaultIdentifier(payload.flowIdentifier)) {
    throw new Error('invalid send token identifier');
  }
  if (Number(payload.amount) <= 0) {
    throw new Error('invalid send token transaction payload');
  }
  if (!payload.decimal) {
    throw new Error('invalid send token transaction payload');
  }
};

/**
 * Validates NFT-specific payload requirements
 * @param payload - SendPayload to validate
 * @throws Error if no NFT IDs are provided
 */
export const validateNftPayload = (payload: SendPayload): void => {
  if (payload.flowIdentifier && !isNFTIdentifier(payload.flowIdentifier)) {
    throw new Error('invalid send nft identifier');
  }
  if (payload.ids.length === 0) {
    throw new Error('invalid send nft transaction payload');
  }
};
/**
 * Validates the complete send transaction payload
 * Performs comprehensive validation including address formats, required fields,
 * and asset-specific requirements
 * @param payload - SendPayload to validate
 * @returns true if payload is valid
 * @throws Error with descriptive message if validation fails
 */
export const isValidSendTransactionPayload = (payload: SendPayload): boolean => {
  const { type, assetType, proposer, receiver, flowIdentifier = '', sender } = payload;

  // Validate proposer address format (must be Flow address)
  if (!validateFlowAddress(proposer)) {
    throw new Error('invalid proposer address');
  }

  // Validate all required fields are present
  if (!proposer || !receiver || !sender || !type || !assetType) {
    throw new Error('invalid send transaction payload');
  }

  // Validate asset-specific requirements
  if (type === 'token') {
    validateTokenPayload(payload);
  }

  if (type === 'nft') {
    validateNftPayload(payload);
  }

  // TODO: send nft from evm to flow, tokenContractAddr is not required, handle by bridge use flowIdentifier
  // if (assetType === 'evm') {
  //   // Skip validation if Flow token (tokenContractAddr can be null/undefined)
  //   if (!isFlowToken(flowIdentifier) && !validateEvmAddress(tokenContractAddr)) {
  //     throw new Error('invalid send evm transaction payload - invalid contract address');
  //   }
  // }

  return true;
};
