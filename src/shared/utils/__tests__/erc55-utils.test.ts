import { describe, it, expect } from 'vitest';

import { toChecksumAddress } from '../erc55-utils';

describe('toChecksumAddress', () => {
  it('should handle all official EIP-55 test cases', () => {
    const testCases = [
      // All caps
      {
        input: '0x52908400098527886E0F7030069857D2E4169EE7',
        expected: '0x52908400098527886E0F7030069857D2E4169EE7',
      },
      {
        input: '0x8617E340B3D01FA5F11F306F4090FD50E238070D',
        expected: '0x8617E340B3D01FA5F11F306F4090FD50E238070D',
      },
      // All Lower
      {
        input: '0xde709f2102306220921060314715629080e2fb77',
        expected: '0xde709f2102306220921060314715629080e2fb77',
      },
      {
        input: '0x27b1fdb04752bbc536007a920d24acb045561c26',
        expected: '0x27b1fdb04752bbc536007a920d24acb045561c26',
      },
      // Normal
      {
        input: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        expected: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      },
      {
        input: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
        expected: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
      },
      {
        input: '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
        expected: '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
      },
      {
        input: '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
        expected: '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
      },
    ];

    testCases.forEach(({ input, expected }) => {
      // Test both with the original input and lowercase input
      expect(toChecksumAddress(input)).toBe(expected);
      expect(toChecksumAddress(input.toLowerCase())).toBe(expected);
    });
  });

  it('should handle Flow COA addresses', () => {
    const testCases = [
      // All lowercase input
      {
        input: '0x000000000000000000000002aaaaaaaaaaaaaaaa',
        expected: '0x000000000000000000000002AaAaAAaAAaAAaaaa',
      },
      // Mixed case input
      {
        input: '0x000000000000000000000002aAaAaAaAaAaAaAaA',
        expected: '0x000000000000000000000002AaAaAAaAAaAAaaaa',
      },
      // All uppercase input
      {
        input: '0x000000000000000000000002AAAAAAAAAAAAAAAA',
        expected: '0x000000000000000000000002AaAaAAaAAaAAaaaa',
      },
      // With numbers
      {
        input: '0x000000000000000000000002a1b2c3d4e5f6789a',
        expected: '0x000000000000000000000002a1b2c3D4e5f6789A',
      },
      // Mixed numbers and letters
      {
        input: '0x0000000000000000000000021234567890abcdef',
        expected: '0x0000000000000000000000021234567890ABCDEF',
      },
    ];

    testCases.forEach(({ input, expected }) => {
      // Test both with the original input and lowercase input
      expect(toChecksumAddress(input)).toBe(expected);
      expect(toChecksumAddress(input.toLowerCase())).toBe(expected);
    });
  });

  it('should handle addresses with and without 0x prefix', () => {
    const address = '5aaeb6053f3e94c9b9a09f33669435e7ef1beaed';
    const expectedChecksum = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';

    expect(toChecksumAddress(address)).toBe(expectedChecksum);
    expect(toChecksumAddress(`0x${address}`)).toBe(expectedChecksum);
  });

  it('should reject invalid addresses', () => {
    const invalidAddresses = [
      // Regular Flow addresses (not EVM format)
      '0x1234567890',
      '0x01',
      // Invalid lengths
      '0x1234',
      '0x' + '0'.repeat(39),
      '0x' + '0'.repeat(41),
      // Invalid characters
      '0xg234567890123456789012345678901234567890',
      '0xabcdefghijklmnopqrstuvwxyz1234567890abcd',
      // Empty/invalid input
      '',
      '0x',
      'not an address',
      '12345',
    ];

    const expectedError =
      'Invalid EVM address format. Expected 40 hexadecimal characters with optional 0x prefix.';
    invalidAddresses.forEach((address) => {
      expect(() => toChecksumAddress(address)).toThrow(expectedError);
    });
  });
});
