import { describe, it, expect } from 'vitest';

import { convertToUFix64, safeConvertToUFix64 } from '../src/send/utils';

describe('Amount Formatting Tests', () => {
  describe('convertToUFix64', () => {
    it('should format integer numbers to 8 decimal places', () => {
      expect(convertToUFix64(5)).toBe('5.00000000');
      expect(convertToUFix64(0)).toBe('0.00000000');
      expect(convertToUFix64(123)).toBe('123.00000000');
    });

    it('should format decimal numbers to exactly 8 decimal places', () => {
      expect(convertToUFix64(5.123)).toBe('5.12300000');
      expect(convertToUFix64(0.1)).toBe('0.10000000');
      expect(convertToUFix64(123.456789)).toBe('123.45678900');
    });

    it('should format string numbers to 8 decimal places', () => {
      expect(convertToUFix64('5')).toBe('5.00000000');
      expect(convertToUFix64('5.123')).toBe('5.12300000');
      expect(convertToUFix64('0.000001')).toBe('0.00000100');
    });

    it('should handle numbers with more than 8 decimal places by rounding', () => {
      expect(convertToUFix64(5.123456789)).toBe('5.12345679');
      expect(convertToUFix64('5.123456789')).toBe('5.12345679');
    });

    it('should throw error for invalid inputs', () => {
      expect(() => convertToUFix64('invalid')).toThrow('Invalid number for UFix64 conversion');
      expect(() => convertToUFix64('abc123')).toThrow('Invalid number for UFix64 conversion');
      expect(() => convertToUFix64('')).toThrow('Invalid number for UFix64 conversion');
    });
  });

  describe('safeConvertToUFix64', () => {
    it('should format valid numbers to 8 decimal places', () => {
      expect(safeConvertToUFix64(5)).toBe('5.00000000');
      expect(safeConvertToUFix64('5.123')).toBe('5.12300000');
      expect(safeConvertToUFix64(0.000001)).toBe('0.00000100');
    });

    it('should return default value for invalid inputs', () => {
      expect(safeConvertToUFix64('invalid')).toBe('0.00000000');
      expect(safeConvertToUFix64('abc123')).toBe('0.00000000');
      expect(safeConvertToUFix64('')).toBe('0.00000000');
    });

    it('should return custom default value for invalid inputs', () => {
      expect(safeConvertToUFix64('invalid', '1.00000000')).toBe('1.00000000');
      expect(safeConvertToUFix64('abc123', '99.99999999')).toBe('99.99999999');
    });

    it('should handle edge cases', () => {
      expect(safeConvertToUFix64(0)).toBe('0.00000000');
      expect(safeConvertToUFix64('0')).toBe('0.00000000');
      expect(safeConvertToUFix64('0.0')).toBe('0.00000000');
    });
  });
});
