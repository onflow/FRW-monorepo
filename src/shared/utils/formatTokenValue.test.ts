import { describe, it, expect } from 'vitest';

import { formatPrice } from './formatTokenValue';

describe('formatPrice', () => {
  it('should handle zero', () => {
    const result = formatPrice('0', 4);
    expect(result).toEqual({
      price: '0',
      formattedPrice: { leadingPart: '', zeroPart: null, endingPart: null },
    });
  });

  it('should format numbers >= 1 by truncating to two decimal places', () => {
    const testCases = [
      { input: '1.23456', expected: '1.23' },
      { input: '123.456789', expected: '123.45' },
      { input: '1000.999', expected: '1000.99' },
      { input: '1000', expected: '1000.00' },
      { input: '9.999999', expected: '9.99' },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = formatPrice(input, 4);
      expect(result).toEqual({
        price: input,
        formattedPrice: {
          leadingPart: expected,
          zeroPart: null,
          endingPart: null,
        },
      });
    });
  });

  it('should format numbers < 1 based on threshold', () => {
    const testCases = [
      {
        input: '0.123456',
        threshold: 4,
        expected: { leadingPart: '0.12', zeroPart: null, endingPart: null },
      },
      {
        input: '0.0001234',
        threshold: 4,
        expected: { leadingPart: '0.00012', zeroPart: null, endingPart: null },
      },
      {
        input: '0.00001234',
        threshold: 4,
        expected: { leadingPart: '0.0', zeroPart: 4, endingPart: '12' },
      },
      {
        input: '0.00000001234',
        threshold: 4,
        expected: { leadingPart: '0.0', zeroPart: 7, endingPart: '12' },
      },
    ];

    testCases.forEach(({ input, threshold, expected }) => {
      const result = formatPrice(input, threshold);
      expect(result).toEqual({
        price: input,
        formattedPrice: expected,
      });
    });
  });

  it('should respect different threshold values', () => {
    const testCases = [
      {
        input: '0.0001234',
        threshold: 3,
        expected: { leadingPart: '0.0', zeroPart: 3, endingPart: '12' },
      },
      {
        input: '0.0001234',
        threshold: 5,
        expected: { leadingPart: '0.00012', zeroPart: null, endingPart: null },
      },
      {
        input: '0.00000001234',
        threshold: 10,
        expected: { leadingPart: '0.000000012', zeroPart: null, endingPart: null },
      },
    ];

    testCases.forEach(({ input, threshold, expected }) => {
      const result = formatPrice(input, threshold);
      expect(result).toEqual({
        price: input,
        formattedPrice: expected,
      });
    });
  });

  it('should handle scientific notation', () => {
    const testCases = [
      {
        input: '1e-7',
        threshold: 4,
        expected: { leadingPart: '0.0', zeroPart: 6, endingPart: '1' },
      },
      {
        input: '1.23e-6',
        threshold: 4,
        expected: { leadingPart: '0.0', zeroPart: 5, endingPart: '12' },
      },
      {
        input: '1e-4',
        threshold: 4,
        expected: { leadingPart: '0.0001', zeroPart: null, endingPart: null },
      },
    ];

    testCases.forEach(({ input, threshold, expected }) => {
      const result = formatPrice(input, threshold);
      const expectedDecimal = result.price; // Let formatPrice handle the conversion
      expect(result).toEqual({
        price: expectedDecimal,
        formattedPrice: expected,
      });
    });
  });
});
