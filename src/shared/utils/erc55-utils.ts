// From Vitalik Buterin <vitalik.buterin@ethereum.org>, Alex Van de Sande <avsa@ethereum.org>, "ERC-55: Mixed-case checksum address encoding," Ethereum Improvement Proposals, no. 55, January 2016. [Online serial]. Available: https://eips.ethereum.org/EIPS/eip-55.

import ethUtil from 'ethereumjs-util';

const ERROR_MESSAGE =
  'Invalid EVM address format. Expected 40 hexadecimal characters with optional 0x prefix.';

/**
 * This is a utility function to convert an Ethereum address to a checksum address.
 * @param address - The address to convert.
 * @returns The checksum address.
 * @throws Error if the address is not a valid format
 */
export const toChecksumAddress = (address: string) => {
  if (!address || typeof address !== 'string') {
    throw new Error(ERROR_MESSAGE);
  }

  // Remove 0x prefix if present
  const cleanAddress = address.replace('0x', '').toLowerCase();

  // Validate the address format (40 hex chars)
  const addressRegex = /^[0-9a-f]{40}$/;
  if (!addressRegex.test(cleanAddress)) {
    throw new Error(ERROR_MESSAGE);
  }

  // Create a hash of the address using keccak256
  // Note: We use the address as ASCII string input to match the spec
  const hash = ethUtil.keccak256(Buffer.from(cleanAddress, 'ascii')).toString('hex');

  let ret = '0x';

  // For each character in the address
  for (let i = 0; i < cleanAddress.length; i++) {
    const char = cleanAddress[i];
    // If the character is a letter (a-f) we apply checksumming
    ret += parseInt(hash[i], 16) >= 8 ? char.toUpperCase() : char;
  }

  return ret;
};
